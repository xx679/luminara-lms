
import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";
import { GEMINI_API_KEY } from '../constants'; // Assuming API_KEY is managed here for this example
import { GeminiInteractionType } from "../types";

// Ensure API_KEY is available (it should be set in the environment)
const effectiveApiKey = process.env.API_KEY || GEMINI_API_KEY;

if (!effectiveApiKey || effectiveApiKey === "YOUR_API_KEY_HERE") {
  console.warn("Gemini API key is not configured. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: effectiveApiKey });
const textModel = 'gemini-2.5-flash-preview-04-17';
// const imageModel = 'imagen-3.0-generate-002'; // For image generation tasks

const generatePrompt = (type: GeminiInteractionType, context: string): string => {
  switch (type) {
    case GeminiInteractionType.SUMMARIZE:
      return `Summarize the following text concisely for a learning context:\n\n---\n${context}\n---`;
    case GeminiInteractionType.EXPLAIN:
      return `Explain the core concepts in the following text in simple terms, as if to a beginner:\n\n---\n${context}\n---`;
    case GeminiInteractionType.ASK_QUESTION:
      return `Based on the following text, what is a good question a student might ask to deepen their understanding? Or, if the text is a question, provide a helpful hint or guidance.\n\n---\n${context}\n---`;
    default:
      return context;
  }
}

export const getGeminiTextResponse = async (
  interactionType: GeminiInteractionType,
  contextText: string,
  systemInstruction?: string
): Promise<string> => {
  if (!effectiveApiKey || effectiveApiKey === "YOUR_API_KEY_HERE") {
    return Promise.resolve("Gemini API key not configured. Mock response.");
  }
  
  const prompt = generatePrompt(interactionType, contextText);

  try {
    console.log(`Sending to Gemini (${textModel}):`, { prompt, systemInstruction });
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: textModel,
      contents: prompt,
      config: {
        ...(systemInstruction && { systemInstruction }),
        // Example: Disable thinking for low latency tasks if needed for this model
        // thinkingConfig: { thinkingBudget: 0 } 
      },
    });
    
    // Correct way to get text
    const textOutput = response.text;
    console.log("Gemini Raw Response Text:", textOutput);
    return textOutput;

  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    if (error.message && error.message.includes('API key not valid')) {
        return "Error: The API key is not valid. Please check your configuration.";
    }
    return `Error interacting with AI assistant: ${error.message || 'Unknown error'}`;
  }
};


export const getGeminiJsonResponse = async <T,>(
  prompt: string,
  systemInstruction?: string
): Promise<T | null> => {
  if (!effectiveApiKey || effectiveApiKey === "YOUR_API_KEY_HERE") {
    console.warn("Gemini API key not configured. Returning null.");
    return null;
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: textModel,
      contents: prompt,
      config: {
        ...(systemInstruction && { systemInstruction }),
        responseMimeType: "application/json",
      },
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    const parsedData = JSON.parse(jsonStr) as T;
    return parsedData;

  } catch (error) {
    console.error("Error calling Gemini API for JSON:", error);
    return null;
  }
};


export const analyzeImageWithText = async (
  base64Image: string, // Base64 encoded image string
  mimeType: string,    // e.g., 'image/png', 'image/jpeg'
  promptText: string,
  systemInstruction?: string
): Promise<string> => {
  if (!effectiveApiKey || effectiveApiKey === "YOUR_API_KEY_HERE") {
    return Promise.resolve("Gemini API key not configured. Mock response for image analysis.");
  }

  try {
    const imagePart: Part = {
      inlineData: {
        mimeType: mimeType,
        data: base64Image,
      },
    };
    const textPart: Part = {
      text: promptText,
    };

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: textModel, // Use a model that supports multimodal input, e.g. gemini-pro-vision or newer
      contents: { parts: [imagePart, textPart] },
      ...(systemInstruction && { config: { systemInstruction } }),
    });

    return response.text;
  } catch (error: any) {
    console.error("Error calling Gemini API for image analysis:", error);
    return `Error analyzing image: ${error.message || 'Unknown error'}`;
  }
};

// Placeholder for search grounding functionality
export const getGroundedResponse = async (query: string): Promise<{text: string, sources: any[]}> => {
  if (!effectiveApiKey || effectiveApiKey === "YOUR_API_KEY_HERE") {
    return Promise.resolve({text: "Gemini API key not configured. Mock grounded response.", sources: []});
  }
  try {
    const response = await ai.models.generateContent({
      model: textModel, // Ensure this model supports tools
      contents: query,
      config: {
        tools: [{googleSearch: {}}], // Critical: NO other configs like responseMimeType here
      },
    });
    
    const text = response.text;
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks.map((chunk: any) => ({
        uri: chunk.web?.uri || chunk.retrievedContext?.uri, // Adjust based on actual API response structure for groundingChunks
        title: chunk.web?.title || chunk.retrievedContext?.title,
    })).filter(source => source.uri);

    return { text, sources };

  } catch (error: any) {
    console.error("Error calling Gemini API with Google Search grounding:", error);
     if (error.message && error.message.includes('API key not valid')) {
        return { text: "Error: The API key is not valid. Please check your configuration.", sources: [] };
    }
    return { text: `Error with grounded search: ${error.message || 'Unknown error'}`, sources: [] };
  }
};
