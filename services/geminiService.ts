
import { GoogleGenAI, Type } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // Corrected initialization: Always use process.env.API_KEY directly in the config object.
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  /**
   * Scrapes real poster and backdrop URLs using Google Search grounding.
   * NOTE: The guideline specifies that response.text from a googleSearch tool call
   * may not be in JSON format and should not be parsed as such.
   */
  async scrapeMediaAssets(fileName: string) {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Search for the official, high-resolution movie/TV poster URL and backdrop image URL for the content mentioned in this filename: "${fileName}". 
        Describe the movie/show including:
        - Cleaned title
        - Release year
        - Direct link to a high-quality poster (from TMDB, IMDb, or similar)
        - Direct link to a wide backdrop image
        - Genre/Category
        - Short 1-sentence summary.`,
        config: {
          tools: [{ googleSearch: {} }],
        }
      });
      
      // Extract grounding metadata chunks for compliance (must list URLs on the app)
      const grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      // Following guidelines: do not attempt to parse it as JSON when using googleSearch.
      // We return the raw text for the UI to render or further process without grounding tools.
      const text = response.text || '';
      
      return { text, grounding };
    } catch (error) {
      console.error("Gemini Scrape Error:", error);
      return null;
    }
  }

  async getEnhancedMetadata(title: string) {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Provide deep metadata for the film/show "${title}". Include a summary, cast (including their character roles), why it's worth watching (criticsTake), and a list of 5 similar movie/show titles (recommendations).`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              cast: { 
                type: Type.ARRAY, 
                items: { 
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    role: { type: Type.STRING }
                  },
                  required: ["name", "role"]
                } 
              },
              criticsTake: { type: Type.STRING },
              recommendations: { 
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "A list of titles of similar movies or TV shows."
              }
            },
            required: ["summary", "cast", "criticsTake", "recommendations"]
          }
        }
      });
      
      // Access the .text property directly (property, not a method)
      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error("Gemini Error:", error);
      return null;
    }
  }
}

export const gemini = new GeminiService();
