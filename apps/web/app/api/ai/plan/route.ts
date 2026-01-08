// apps/web/app/api/ai/plan/route.ts
import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth";
import { billing, ai } from "@domain"; 

export async function POST(req: Request) {
  try {
    const user = await getServerUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = user.id;

    // Strict Check: This runs in Localhost AND Production
    const allowed = await billing.canUseAIGenerationForUser(userId);
    if (!allowed) {
      return NextResponse.json({ 
        error: "Free limit reached. You have used your free AI generation. Please upgrade." 
      }, { status: 403 });
    }
    
    const body = await req.json();
    const prompt = (body?.prompt || body?.text || "").trim();
    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const result = await ai.generatePlanFromPrompt(prompt);

    // Increment usage
    await billing.incrementAIUsage(userId);

    return NextResponse.json(result);
  } catch (err) {
    console.error("[/api/ai/plan] error:", err);
    
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}