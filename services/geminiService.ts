
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // A real app would handle this more gracefully.
  // For this environment, we assume API_KEY is set.
  console.warn("API_KEY is not set. Gemini features will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const summarizeText = async (text: string): Promise<string> => {
  if (!API_KEY) {
    return "Gemini API key not configured. Summary unavailable.";
  }
  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Summarize the following medical notes concisely for a quick overview. Focus on the main diagnosis, treatment, and patient status. Notes: "${text}"`,
    });

    return response.text || "Could not generate summary.";
  } catch (error) {
    console.error("Error summarizing text with Gemini:", error);
    if (error instanceof Error) {
        return `Error from Gemini: ${error.message}`;
    }
    return "An unknown error occurred while summarizing.";
  }
};
