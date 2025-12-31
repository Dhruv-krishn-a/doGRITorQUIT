// packages/domain/ai/service.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generatePlanFromPrompt(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { maxOutputTokens: 4000, temperature: 0.7 },
  });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return { text: response.text(), raw: response };
}