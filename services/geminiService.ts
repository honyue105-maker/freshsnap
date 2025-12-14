import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini Client
// IMPORTANT: The API key must be available in process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeImage = async (base64Image: string): Promise<any> => {
  try {
    const prompt = `
      Analyze this image to identify food, medicine, cosmetics, or household items for an inventory tracking app.
      
      For each distinct item found:
      1. Identify the specific name (e.g., "Greek Yogurt", "Ibuprofen").
      2. Detect the Expiration/Best By date. 
         - If a date is clearly visible in the image, use it.
         - If NO date is visible, you MUST estimate a reasonable expiration date based on the product type and its apparent condition (e.g., fresh produce might range from 3-14 days, opened milk 5-7 days).
      3. Categorize the item into: 'food', 'medicine', 'cosmetic', 'household', or 'other'.
      4. Provide a brief reasoning for the date (e.g., "Date visible on label" or "Estimated shelf life for fresh bananas").

      Return the data strictly in JSON format.
    `;

    // Removing the prefix data:image/...;base64, if present for the API call
    const base64Data = base64Image.includes('base64,') 
      ? base64Image.split('base64,')[1] 
      : base64Image;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Using Pro for complex reasoning
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Data
            }
          },
          {
            text: prompt
          }
        ]
      },
      config: {
        // High thinking budget for complex extraction and reasoning about freshness
        thinkingConfig: { 
          thinkingBudget: 32768 
        },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  expiryDate: { type: Type.STRING, description: "Format YYYY-MM-DD" },
                  category: { type: Type.STRING, enum: ['food', 'medicine', 'cosmetic', 'household', 'other'] },
                  reasoning: { type: Type.STRING },
                  confidence: { type: Type.NUMBER }
                },
                required: ['name', 'expiryDate', 'category', 'reasoning']
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text);

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw error;
  }
};