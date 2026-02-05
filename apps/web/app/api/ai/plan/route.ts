import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth-server";
import { ai } from "@domain";

export const maxDuration = 60;


function cleanAndParseJSON(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch {
        // continue
      }
    }

    const firstOpen = text.indexOf('{');
    const lastClose = text.lastIndexOf('}');
    
    if (firstOpen !== -1 && lastClose !== -1) {
      try {
        const potentialJson = text.substring(firstOpen, lastClose + 1);
        return JSON.parse(potentialJson);
      } catch {
        // continue
      }
    }
    
    console.error("Failed to parse JSON. Raw text preview:", text.slice(0, 100));
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const user = await getServerUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    const aiResponse = await ai.generateStructuredPlan(
        body.messages, 
        body.batchConfig, 
        body.isSyllabusMode,
        body.isRegenerateModule,
        body.isRegenerateDay
    );
    
    const rawText = aiResponse.text;
    const parsed = cleanAndParseJSON(rawText);

    if (!parsed) {
        return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    let resultData = null;
    let syllabusData = null;

    if (body.isRegenerateModule) {
        resultData = parsed.module || parsed; 
        return NextResponse.json({ success: true, planData: resultData });
    }
    else if (body.isRegenerateDay) {
        resultData = parsed.task || parsed;
        return NextResponse.json({ success: true, planData: resultData });
    }
    else if (body.isSyllabusMode) {
        syllabusData = parsed.syllabus || parsed;
        return NextResponse.json({ success: true, syllabusData });
    } else {
        resultData = parsed.tasks || parsed.plans || parsed.schedule || (Array.isArray(parsed) ? parsed : []);
    }

    return NextResponse.json({ 
        success: true, 
        message: "Generated", 
        planData: resultData,
        syllabusData: syllabusData
    });

  } catch (error) {
    console.error("AI Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}