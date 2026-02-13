import Groq from "groq-sdk";
import OpenAI from "openai"; // Standard SDK works for OpenRouter
import { constructPlanningPrompt } from "./prompt-builder";

export interface AIPlanResponse {
  text: string;
  raw: any;
}

// --- CLIENT 1: GROQ (The Architect - Speed & Structure) ---
// Used for: Generating the 30-day Syllabus Outline
async function callGroq(prompt: string): Promise<AIPlanResponse> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not defined");

  const groq = new Groq({ apiKey });

  console.log("⚡ [Domain/AI] Calling Groq (Llama 3.1 8B Instant)...");
  
  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: "You are a precise JSON generator. Output ONLY valid JSON." },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" },
    temperature: 0.3, // Low temp for strict structure
    max_tokens: 8000,
  });

  return { 
    text: completion.choices[0]?.message?.content || "", 
    raw: completion 
  };
}

// --- CLIENT 2: OPENROUTER (The Professor - Deep Details) ---
// Used for: Generating detailed tasks, subtasks, and resources
async function callMistral(prompt: string): Promise<AIPlanResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not defined");

  const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: apiKey,
    defaultHeaders: {
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "Planner App",
    },
  });

  console.log("🧠 [Domain/AI] Calling OpenRouter (Mistral Small 3)...");

  const completion = await openai.chat.completions.create({
    // ✅ FIX: Using Mistral Small 3 (24B) via OpenRouter
    // This model is the perfect balance of intelligence and cost.
    model: "mistralai/mistral-small-24b-instruct-2501", 
    messages: [
      { role: "system", content: "You are an expert technical mentor. Output ONLY valid JSON. No markdown." },
      { role: "user", content: prompt }
    ],
    temperature: 0.7, 
    max_tokens: 8000, // Mistral supports up to 32k context, 8k output is safe
  });

  return { 
    text: completion.choices[0]?.message?.content || "", 
    raw: completion 
  };
}

// --- MAIN ROUTER ---
export async function generateStructuredPlan(
  messages: { role: string; content: string }[],
  batchConfig?: any,
  isSyllabusMode?: boolean,
  isRegenerateModule?: boolean,
  isRegenerateDay?: boolean
) {
  const fullPrompt = constructPlanningPrompt(
    messages, 
    batchConfig, 
    isSyllabusMode, 
    isRegenerateModule,
    isRegenerateDay
  );

  // ROUTING LOGIC:
  // 1. Syllabus (Structure) -> Groq (Fast)
  if (isSyllabusMode) {
    return callGroq(fullPrompt);
  }

  // 2. Tasks/Details/Regeneration -> Mistral Small 3 (Smart)
  return callMistral(fullPrompt);
}