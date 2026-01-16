
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMusicLicense = async (trackTitle: string, artistName: string, buyerName: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gere um contrato de licença de uso musical profissional (em português de Angola) para a obra intitulada "${trackTitle}" produzida por "${artistName}". O comprador é "${buyerName}". O contrato deve incluir: concessão de direitos, limitações de uso comercial, duração vitalícia e validade jurídica. Seja formal e use termos jurídicos apropriados para o mercado musical.`,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating license:", error);
    return "Falha ao gerar o documento de licença automatizado. Entre em contacto com o suporte.";
  }
};
