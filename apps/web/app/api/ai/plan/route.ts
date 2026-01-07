import { NextResponse } from "next/server";
// ✅ FIX 1: Import from the consolidated auth file
import { getServerUser } from "@/lib/auth";
import { billing, ai } from "@domain"; 

export async function POST(req: Request) {
  try {
    // ✅ FIX 1b: Get the full user object, then extract ID
    const user = await getServerUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = user.id;

    // 1. Check Entitlements
    const allowed = await billing.canUseAIGenerationForUser(userId);
    if (!allowed) {
      return NextResponse.json({ 
        error: "Free limit reached. You have used your free AI generation. Please upgrade." 
      }, { status: 403 });
    }
    
    // 2. Get Input
    const body = await req.json();
    const prompt = (body?.prompt || body?.text || "").trim();
    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    // 3. Call AI Service
    const result = await ai.generatePlanFromPrompt(prompt);

    // 4. Record Usage
    await billing.incrementAIUsage(userId);

    return NextResponse.json(result);
  } catch (err) {
    // ✅ FIX 2: Remove 'any' and handle unknown error type safely
    console.error("[/api/ai/plan] error:", err);
    
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}