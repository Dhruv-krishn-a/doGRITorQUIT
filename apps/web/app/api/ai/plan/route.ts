// apps/web/app/api/ai/plan/route.ts
import { NextResponse } from "next/server";
import { getServerUserId } from "@/lib/authHelper";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { canUseAIGenerationForUser } from "@domain/billing/entitlements";

export async function POST(req: Request) {
  try {
    const userId = await getServerUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const allowed = await canUseAIGenerationForUser(userId);
    if (!allowed) {
      return NextResponse.json({ 
        error: "Free limit reached. You have used your 1 free AI generation. Please upgrade to Pro." 
      }, { status: 403 });
    }
    
    const body = await req.json();
    const prompt = (body?.prompt || body?.text || "").trim();
    if (!prompt) return NextResponse.json({ error: "Missing prompt" }, { status: 400 });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY not set on server");
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { maxOutputTokens: 4000, temperature: 0.7 },
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiText = response.text();

    return NextResponse.json({ text: aiText, raw: response });
  } catch (err: any) {
    console.error("[/api/ai/plan] error:", err);
    return NextResponse.json({ error: err?.message || "Internal Server Error" }, { status: 500 });
  }
}
