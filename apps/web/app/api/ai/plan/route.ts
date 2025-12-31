import { NextResponse } from "next/server";
import { getServerUserId } from "@/lib/authHelper";
import { billing, ai } from "@domain"; // ✅ Import new domains

export async function POST(req: Request) {
  try {
    const userId = await getServerUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 1. Check Entitlements (Domain)
    const allowed = await billing.canUseAIGenerationForUser(userId);
    if (!allowed) {
      return NextResponse.json({ 
        error: "Free limit reached. You have used your free AI generation. Please upgrade." 
      }, { status: 403 });
    }
    
    // 2. Get Input
    const body = await req.json();
    const prompt = (body?.prompt || body?.text || "").trim();
    if (!prompt) return NextResponse.json({ error: "Missing prompt" }, { status: 400 });

    // 3. Call AI Service (Domain)
    const result = await ai.generatePlanFromPrompt(prompt);

    // 4. Record Usage (Domain)
    await billing.incrementAIUsage(userId);

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[/api/ai/plan] error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}