// apps/web/app/api/ai/plan/route.ts
import { NextResponse } from "next/server";
import { getServerUserId } from "@/lib/authHelper";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { 
  canUseAIGenerationForUser, 
  incrementAIUsage,
  getMaxPlanDaysForUser // <--- Added this import
} from "@domain/billing/entitlements";

export async function POST(req: Request) {
  try {
    const userId = await getServerUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 1. Check AI Generation Count Limit
    const allowed = await canUseAIGenerationForUser(userId);
    if (!allowed) {
      return NextResponse.json({ 
        error: "Free limit reached. You have used your available AI generations. Please upgrade to Pro." 
      }, { status: 403 });
    }
    
    // 2. Get Max Plan Days allowed for this user
    const maxDays = await getMaxPlanDaysForUser(userId);

    const body = await req.json();
    const prompt = (body?.prompt || body?.text || "").trim();
    if (!prompt) return NextResponse.json({ error: "Missing prompt" }, { status: 400 });

    // 3. Simple heuristic: Check if user explicitly asked for too many days
    // e.g. "Create a 60 day plan"
    const dayRequestMatch = prompt.match(/(\d+)\s*(?:day|days)/i);
    if (dayRequestMatch) {
      const requestedDays = parseInt(dayRequestMatch[1]);
      if (requestedDays > maxDays) {
         return NextResponse.json({ 
          error: `Your current plan allows maximum ${maxDays} days. Please request a shorter duration or upgrade.` 
        }, { status: 400 });
      }
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY not set on server");
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    // 4. Inject Limits into System Prompt
    // We append specific instructions so the AI respects the limit
    const systemInstruction = `
      You are a planning assistant.
      CONSTRAINT: The user is limited to a maximum plan duration of ${maxDays} days.
      If the user asks for more, create a plan only up to Day ${maxDays} and append a note about the limit.
    `;

    const finalPrompt = `${systemInstruction}\n\nUser Request: ${prompt}`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { maxOutputTokens: 4000, temperature: 0.7 },
    });

    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    const aiText = response.text();

    // 5. Increment Usage (Note: We increment here for tracking, but the main enforcement is at Step 1)
    // Some implementations prefer to increment only upon saving the plan (in the import route),
    // but incrementing here prevents abuse of the generation API itself.
    // If you only want to count SAVED plans, remove this line and rely on import-json route.
    // However, usually API costs are incurred here, so incrementing here is safer.
    // await incrementAIUsage(userId); 
    // ^ COMMENTED OUT to avoid double counting if client calls import-json immediately after.
    // Ensure you rely on import-json to increment, OR increment here and handle import-json carefully.
    
    // Based on your previous request logic, we decided to increment in `import-json` (Step 5 of that file).
    // So we do NOT increment here to avoid double counting a single successful flow.

    return NextResponse.json({ text: aiText, raw: response });
  } catch (err: any) {
    console.error("[/api/ai/plan] error:", err);
    return NextResponse.json({ error: err?.message || "Internal Server Error" }, { status: 500 });
  }
}