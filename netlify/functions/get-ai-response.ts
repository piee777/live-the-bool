import { GoogleGenAI } from "@google/genai";
import type { Handler, HandlerEvent } from "@netlify/functions";

// Redefine types locally to avoid path issues in Netlify Functions
enum Role {
  USER = 'user',
  CHARACTER = 'character',
  SYSTEM = 'system',
  NARRATOR = 'narrator',
}

interface RequestMessage {
  role: Role;
  content: string;
}

type GeminiContent = {
  role: 'user' | 'model';
  parts: { text: string }[];
};

const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error('API_KEY environment variable not set.');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'AI service is not configured by the administrator.' }),
    };
  }

  try {
    const { systemInstruction, history } = JSON.parse(event.body || '{}');

    if (!systemInstruction || !history) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing systemInstruction or history.' }),
      };
    }
    
    const ai = new GoogleGenAI({ apiKey });

    const contents: GeminiContent[] = history.map((msg: RequestMessage) => ({
      role: (msg.role === Role.USER) ? 'user' : 'model',
      parts: [{ text: msg.content }],
    })).filter((c: GeminiContent) => c.parts[0].text.trim() !== '');

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config: {
            systemInstruction,
        }
    });

    return {
      statusCode: 200,
      body: response.text,
    };

  } catch (error: any) {
    console.error('Error calling Gemini API:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Failed to get response from AI service.' }),
    };
  }
};

export { handler };
