// apps/web/app/api/ai/plan/route.ts
import { NextResponse } from "next/server";
import { getServerUserId } from "@/lib/authHelper";
import { billing, ai } from "@domain"; // Import Entitlements & AI service

export async function POST(req: Request) {
  try {
    const userId = await getServerUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 1. Check Entitlements (Domain)
    const allowed = await billing.canUseAIGenerationForUser(userId);
    if (!allowed) {
      return NextResponse.json({ error: "Free limit reached." }, { status: 403 });
    }
    
    // 2. Call AI Service (Domain)
    const body = await req.json();
    const prompt = (body?.prompt || body?.text || "").trim();
    const result = await ai.generatePlanFromPrompt(prompt);

    // 3. Record Usage (Domain)
    await billing.incrementAIUsage(userId);

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}