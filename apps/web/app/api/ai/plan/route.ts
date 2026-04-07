import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth-server";
import { ai } from "@gritorquit/domain";

export const maxDuration = 60; 
export const dynamic = 'force-dynamic';

function cleanAndParseJSON(text: string) {
  if (!text) return null;
  
  try {
    return JSON.parse(text);
  } catch {
    // Remove Markdown wrappers (```json ... ```)
    // ✅ FIX: Changed 'let' to 'const'
    const cleanText = text.replace(/```(?:json)?|```/g, "").trim();
    
    // Fallback: Try finding the outer braces
    const firstOpen = cleanText.indexOf('{');
    const lastClose = cleanText.lastIndexOf('}');
    
    if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
        try {
            return JSON.parse(cleanText.substring(firstOpen, lastClose + 1));
        } catch { /* ignore */ }
    }
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const user = await getServerUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    // 1. ROUTING CHECK: Which Key do we need?
    if (body.isSyllabusMode) {
        // Syllabus needs Groq
        // eslint-disable-next-line turbo/no-undeclared-env-vars
        if (!process.env.GROQ_API_KEY) {
            return NextResponse.json({ error: "Server Config: Missing GROQ Key" }, { status: 500 });
        }
    } else {
        // Details need OpenRouter (Mistral)
        // eslint-disable-next-line turbo/no-undeclared-env-vars
        if (!process.env.OPENROUTER_API_KEY) {
            return NextResponse.json({ error: "Server Config: Missing OpenRouter Key" }, { status: 500 });
        }
    }

    const aiResponse = await ai.generateStructuredPlan(
        body.messages, 
        body.batchConfig, 
        body.isSyllabusMode,
        body.isRegenerateModule,
        body.isRegenerateDay
    );
    
    if (!aiResponse || !aiResponse.text) {
        throw new Error("Empty response from AI");
    }

    const parsed = cleanAndParseJSON(aiResponse.text);

    if (!parsed) {
        console.error("❌ [API] JSON Parse Failed. Raw:", aiResponse.text.slice(0, 100));
        return NextResponse.json({ error: "AI response format error. Please try again." }, { status: 500 });
    }

    let resultData = null;
    let syllabusData = null;

    if (body.isRegenerateModule) resultData = parsed.module || parsed; 
    else if (body.isRegenerateDay) resultData = parsed.task || parsed;
    else if (body.isSyllabusMode) syllabusData = parsed.syllabus || parsed;
    else resultData = parsed.tasks || parsed.plans || (Array.isArray(parsed) ? parsed : []);

    return NextResponse.json({ 
        success: true, 
        planData: resultData,
        syllabusData: syllabusData
    });

  } catch (error) {
    console.error("❌ [API] Error:", error);
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}