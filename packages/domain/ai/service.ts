// packages/domain/ai/service.ts
import OpenAI from "openai";
import { constructPlanningPrompt } from "./prompt-builder";

export interface AIPlanResponse {
  text: string;
  raw: any;
}

export async function generatePlanFromPrompt(prompt: string, isJsonMode = false): Promise<AIPlanResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not defined");
  }

  const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: apiKey,
    defaultHeaders: {
      "HTTP-Referer": siteUrl,
      "X-Title": "Planner App",
    },
  });

  try {
    const completion = await openai.chat.completions.create({
      model: "meta-llama/llama-3.3-70b-instruct",
      messages: [
        { role: "system", content: "You are a precise JSON generator." }, 
        { role: "user", content: prompt }
      ],
      max_tokens: 4096,
      temperature: 0.7, 
      top_p: 0.9,
      response_format: isJsonMode ? { type: "json_object" } : undefined
    });

    const content = completion.choices[0]?.message?.content ?? "";
    return { text: content, raw: completion };

  } catch (error: any) {
    console.error("OpenRouter API Error:", error);
    throw new Error(error.message || "Failed to generate content");
  }
}

export async function generateStructuredPlan(
  messages: { role: string; content: string }[],
  batchConfig?: any,
  isSyllabusMode?: boolean,
  isRegenerateModule?: boolean,
  isRegenerateDay?: boolean // ✅ NEW PARAM
) {
  const fullPrompt = constructPlanningPrompt(
    messages, 
    batchConfig, 
    isSyllabusMode, 
    isRegenerateModule,
    isRegenerateDay
  );
  
  // Enable JSON mode for any structured request
  const isJson = !!batchConfig || !!isSyllabusMode || !!isRegenerateModule || !!isRegenerateDay;
  
  return generatePlanFromPrompt(fullPrompt, isJson);
}