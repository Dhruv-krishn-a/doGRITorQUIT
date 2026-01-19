// apps/web/app/api/ai/plan/route.ts
import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth-server";
import { ai, billing } from "@domain";

export const maxDuration = 60;

interface ChatMessage {
  role: string;
  content: string;
}

const SYSTEM_PROMPT = `
ROLE: You are an Elite Technical Mentor and Strategic Planner.
GOAL: Build a highly detailed, actionable execution plan for the user.

CRITICAL PROTOCOL (FOLLOW STRICTLY):
1. **NO INSTANT GENERATION**: Do NOT generate the JSON plan in the first turn. You MUST ask 2-3 clarifying questions first (e.g., "What is your current experience level?", "How many hours per day can you commit?", "Do you have a specific deadline?").
2. **STAY ON TOPIC**: If the user asks for "System Design", do NOT include unrelated tech like React, CSS, or Frontend unless explicitly requested. Focus purely on the requested domain.
3. **GRANULARITY**: When you finally generate the plan, every task MUST have 3-5 specific "Subtasks" (e.g., "Read Chapter 4 of DDIA", "Implement a consistent hash ring").
4. **FORMAT**: Output the plan ONLY when the user says "Generate" or confirms the details.

OUTPUT JSON FORMAT:
\`\`\`json
[
  { 
    "Day": 1, 
    "Task Title": "Consistent Hashing", 
    "Description": "Deep dive into partitioning.", 
    "Estimated Time (min)": 90, 
    "Priority": "High",
    "Subtasks": [
       "Read Partitioning chapter in DDIA",
       "Watch SystemDesignInterview video on Consistent Hashing",
       "Implement a basic hash ring in Python/Java"
    ] 
  }
]
\`\`\`
`;

export async function POST(req: Request) {
  try {
    const user = await getServerUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 1. Single Source of Truth: Check AI Credits ONLY
    const canGenerate = await billing.canUseAIGenerationForUser(user.id);
    if (!canGenerate) {
      const stats = await billing.getAIUsageStats(user.id);
      return NextResponse.json({ 
        error: "Limit Reached", 
        message: `You have used ${stats.used}/${stats.limit} AI credits. Please upgrade.` 
      }, { status: 403 });
    }

    // 2. Parse History
    const body = await req.json();
    const messages: ChatMessage[] = body.messages || [];

    // 3. Construct Prompt with History
    const conversationHistory = messages
      .map(m => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n");

    const fullPrompt = `${SYSTEM_PROMPT}\n\n=== HISTORY ===\n${conversationHistory}\n\nASSISTANT:`;

    // 4. Call AI
    const aiResponse = await ai.generatePlanFromPrompt(fullPrompt);
    const rawText = aiResponse.text;

    // 5. Extract JSON (if present)
    let planData = null;
    try {
      const jsonMatch = rawText.match(/```json\n([\s\S]*?)\n```/) || rawText.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (jsonMatch) {
        const jsonString = jsonMatch[1] || jsonMatch[0];
        planData = JSON.parse(jsonString);
      }
    } catch { /* It's a chat response, not a plan yet */ }

    // 6. Charge Credit ONLY if plan was generated
    if (planData) {
        await billing.incrementAIUsage(user.id);
    }

    return NextResponse.json({ 
      success: true, 
      message: rawText, 
      planData: planData 
    });

  } catch (error) {
    console.error("[AI Chat] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}