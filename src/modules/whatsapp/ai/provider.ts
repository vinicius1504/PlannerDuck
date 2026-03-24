import { GoogleGenAI } from "@google/genai";

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function callClassifier(prompt: string): Promise<string> {
  const response = await genai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      temperature: 0,
      maxOutputTokens: 256,
    },
  });

  return response.text ?? "{}";
}

export async function callFormatter(prompt: string): Promise<string> {
  const response = await genai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
    config: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  });

  return response.text ?? "";
}
