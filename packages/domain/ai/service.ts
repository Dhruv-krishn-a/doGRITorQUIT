// packages/domain/ai/service.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generatePlanFromPrompt(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in environment variables");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: { maxOutputTokens: 8000, temperature: 0.7 },
  });

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return { 
      text: response.text(), 
      raw: response 
    };
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate content");
  }
}