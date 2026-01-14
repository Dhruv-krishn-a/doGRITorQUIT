import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth";
import { ai, billing } from "@domain"; 
import { getUserLimits } from "@/lib/user-limits"; // ✅ Import the helper

export const maxDuration = 60; 
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const user = await getServerUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { prompt } = await req.json();

    // -----------------------------------------------------------
    // 1. CHECK LIMITS
    // -----------------------------------------------------------
    // This now correctly checks CMS > Plan > Free
    const limits = await getUserLimits(user.id);

    // If NOT unlimited AND remaining is <= 0 -> Block
    if (!limits.isUnlimited && limits.remaining <= 0) {
      return NextResponse.json({ 
        error: "Limit Reached", 
        message: `You have used ${limits.usage}/${limits.limit} credits. Please upgrade to continue.` 
      }, { status: 403 });
    }

    // -----------------------------------------------------------
    // 2. GENERATE PLAN
    // -----------------------------------------------------------
    const enhancedPrompt = `
      You are a JSON-only API. 
      Create a plan for: "${prompt}".
      RULES:
      1. RETURN ONLY A RAW JSON ARRAY. NO MARKDOWN.
      2. Structure: [{"Day": 1, "Task Title": "...", "Description": "...", "Estimated Time (min)": 30}]
    `;

    const aiResponse = await ai.generatePlanFromPrompt(enhancedPrompt);
    const rawText = aiResponse.text;

    // Validate JSON
    let tasksData;
    try {
      const firstBracket = rawText.indexOf('[');
      const lastBracket = rawText.lastIndexOf(']');
      if (firstBracket === -1 || lastBracket === -1) throw new Error("No JSON array found");
      tasksData = JSON.parse(rawText.substring(firstBracket, lastBracket + 1));
    } catch (parseError) {
      console.error("AI Parse Error:", parseError);
      return NextResponse.json({ error: "AI response malformed" }, { status: 500 });
    }

    // -----------------------------------------------------------
    // 3. INCREMENT USAGE
    // -----------------------------------------------------------
    await billing.incrementAIUsage(user.id);

    return NextResponse.json({ success: true, data: tasksData });

  } catch (error) {
    console.error("[AI Plan Gen] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}