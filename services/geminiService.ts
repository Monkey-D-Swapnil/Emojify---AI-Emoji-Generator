import { GoogleGenAI, Type } from "@google/genai";
import { GEMINI_API_KEY, IMAGE_MODEL_NAME, TEXT_MODEL_NAME, STYLES } from '../config';
import { EmojiStyle } from '../types';

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

/**
 * Generates an emoji image based on description, style, and optional reference image.
 */
export const generateEmojiImage = async (
  description: string, 
  style: EmojiStyle, 
  referenceImageBase64?: string
): Promise<string> => {
  try {
    const styleConfig = STYLES[style] || STYLES['3d'];
    const textPrompt = `${styleConfig.prefix}${description}${styleConfig.suffix}`;
    
    const parts: any[] = [];

    // If a reference image is provided, add it to the request parts
    if (referenceImageBase64) {
      // Remove data URL prefix if present to get raw base64
      const base64Data = referenceImageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
      const mimeType = referenceImageBase64.match(/^data:(image\/[a-zA-Z]+);base64,/)?.[1] || 'image/png';

      parts.push({
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      });
      
      // When editing/using reference, we guide the model to transform the input
      parts.push({ text: `Transform this image into a ${styleConfig.label} emoji. ${textPrompt}` });
    } else {
      parts.push({ text: textPrompt });
    }

    const response = await ai.models.generateContent({
      model: IMAGE_MODEL_NAME,
      contents: { parts },
      config: {
        imageConfig: {
            aspectRatio: "1:1"
        }
      }
    });

    if (response.candidates && response.candidates.length > 0) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64String = part.inlineData.data;
          return `data:${part.inlineData.mimeType};base64,${base64String}`;
        }
      }
    }
    
    throw new Error("The model did not return an image. Please try a different prompt.");
  } catch (error: any) {
    console.error("Error generating emoji image:", error);
    if (error.message?.includes('400')) {
      throw new Error("Invalid request. Please check your prompt or image and try again.");
    } else if (error.message?.includes('429')) {
      throw new Error("Too many requests. Please wait a moment before trying again.");
    } else if (error.message?.includes('SAFETY')) {
      throw new Error("The prompt triggered safety filters. Please try a different description.");
    }
    throw new Error("Failed to generate image. " + (error.message || "Unknown error."));
  }
};

/**
 * Generates a list of emoji combinations.
 */
export const generateEmojiCombos = async (description: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL_NAME,
      contents: `Generate 4 distinct, creative emoji combinations (using standard unicode emojis) that represent the following description: "${description}". Return JSON array of strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text);
    }
    return [];
  } catch (error) {
    console.error("Error generating emoji combos:", error);
    // Return empty array on error for combos so the main image can still show
    return [];
  }
};