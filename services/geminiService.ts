
import { GoogleGenAI, Type } from "@google/genai";
import { CAR_PARTS } from '../constants';

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const carPartIds = CAR_PARTS.map(p => p.id);

export const getRepairSuggestion = async (description: string) => {
  if (!process.env.API_KEY) {
    throw new Error("API key is not configured.");
  }
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analisando a seguinte descrição de danos em um veículo, identifique as peças danificadas e sugira os serviços de reparo necessários. Descrição: "${description}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            damagedParts: {
              type: Type.ARRAY,
              description: "Uma lista de IDs de peças do carro que estão danificadas, baseadas na lista de peças válidas.",
              items: {
                type: Type.STRING,
                enum: carPartIds,
              },
            },
            suggestedServices: {
              type: Type.OBJECT,
              description: "Um objeto onde cada chave é um ID de peça danificada e o valor é uma lista de nomes de serviços sugeridos.",
              properties: {
                // This is a free-form object, so we don't define specific properties here.
                // The keys will be dynamic based on damagedParts.
              }
            }
          },
        },
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get suggestions from AI.");
  }
};
