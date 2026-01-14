// apps/web/app/api/ai/plan/route.ts
import { NextResponse } from "next/server";
import { ai, billing, auth } from "@domain"; // ✅ Centralized imports

export const maxDuration = 60; 
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // 1. Authenticate (using Domain Auth)
    const user = await auth.getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt } = await req.json();

    // -----------------------------------------------------------
    // 2. CHECK LIMITS (Centralized Domain Logic)
    // -----------------------------------------------------------
    // This checks Custom Override -> Plan Limit -> Free Limit automatically
    const canGenerate = await billing.canUseAIGenerationForUser(user.id);

    if (!canGenerate) {
      // Optional: Fetch stats just for the error message
      const stats = await billing.getAIUsageStats(user.id);
      return NextResponse.json({ 
        error: "Limit Reached", 
        message: `You have used ${stats.used}/${stats.limit} credits. Please upgrade to continue.` 
      }, { status: 403 });
    }

    // -----------------------------------------------------------
    // 3. GENERATE PLAN
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
    // 4. INCREMENT USAGE
    // -----------------------------------------------------------
    // Only increment if generation was successful
    await billing.incrementAIUsage(user.id);

    return NextResponse.json({ success: true, data: tasksData });

  } catch (error) {
    console.error("[AI Plan Gen] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}