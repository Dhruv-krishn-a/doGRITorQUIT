// apps/web/app/api/ai/plan/route.ts
import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth";
import { ai, plans, billing } from "@domain"; 

export const maxDuration = 60; 
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const canGenerate = await billing.canUseAIGenerationForUser(user.id);
    if (!canGenerate) {
      return NextResponse.json({ 
        error: "Limit Reached. Please upgrade your plan or wait for the next cycle." 
      }, { status: 403 });
    }

    const enhancedPrompt = `
      Create a detailed plan for: "${prompt}".
      Return ONLY a raw JSON array of objects. Do not include markdown formatting (like \`\`\`json).
      Each object must have these keys: "task title", "description", "date" (YYYY-MM-DD), "priority" (High/Medium/Low), "estimated minutes", "tags" (comma separated string), "subtasks" (comma separated string).
      Ensure the plan covers a realistic timeframe starting from tomorrow.
    `;

    const aiResponse = await ai.generatePlanFromPrompt(enhancedPrompt);
    const rawText = aiResponse.text;

    let tasksData;
    try {
      const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      tasksData = JSON.parse(cleanJson);
      
      if (!Array.isArray(tasksData)) throw new Error("AI did not return an array");
    } catch (parseError) {
      console.error("AI JSON Parse Error:", parseError, "\nRaw Text:", rawText);
      return NextResponse.json({ 
        error: "Failed to process AI response. Please try again (Credit not used)." 
      }, { status: 500 });
    }

    const newPlan = await plans.importPlanJson(
      user.id, 
      `AI Plan: ${prompt.slice(0, 20)}...`, 
      tasksData, 
      new Date()
    );

    await billing.incrementAIUsage(user.id);

    return NextResponse.json({ success: true, planId: newPlan.id });

  } catch (error) {
    console.error("[AI Plan Gen] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}