// packages/domain/ai/service.ts
import OpenAI from "openai";
// Import the strict type for the API response
import type { ChatCompletion } from "openai/resources/chat/completions";

// Define an interface for your return value to ensure consistency
export interface AIPlanResponse {
  text: string;
  raw: ChatCompletion;
}

export async function generatePlanFromPrompt(prompt: string): Promise<AIPlanResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const siteName = "Planner App";

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not defined in environment variables");
  }

  // Initialize OpenAI client pointing to OpenRouter
  const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: apiKey,
    defaultHeaders: {
      "HTTP-Referer": siteUrl,
      "X-Title": siteName,
    },
  });

  try {
    const completion = await openai.chat.completions.create({
      model: "mistralai/devstral-2512:free",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Strict null checks: content can be null in the OpenAI types
    const content = completion.choices[0]?.message?.content ?? "";

    return { 
      text: content, 
      raw: completion 
    };

  } catch (error: unknown) {
    // "unknown" is safer than "any" in TypeScript strict mode
    console.error("OpenRouter/Llama API Error:", error);
    
    let errorMessage = "Failed to generate content";
    
    // Type Guard to safely access the error message
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "object" && error !== null && "message" in error) {
        // Handle cases where error might be an API object but not an Error instance
        errorMessage = String((error as { message: unknown }).message);
    }
    
    throw new Error(errorMessage);
  }
}