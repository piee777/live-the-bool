import { GoogleGenAI } from "@google/genai";
import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

// Define the expected message structure from the frontend
interface Message {
  role: 'user' | 'character' | 'system' | 'narrator';
  content: string;
}

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Handle preflight CORS request for browser-based clients
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "",
    };
  }

  // Ensure it's a POST request
  if (event.httpMethod !== 'POST') {
    return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method Not Allowed' }),
        headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" },
    };
  }

  try {
    if (!event.body) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Request body is missing' }),
            headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" },
        };
    }
    
    const { systemInstruction, history } = JSON.parse(event.body);

    if (!process.env.API_KEY) {
      throw new Error("The API_KEY environment variable is not set in Netlify.");
    }

    if (!Array.isArray(history) || history.length === 0) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'History is required and must be a non-empty array' }),
            headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" },
        };
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Map frontend roles to Gemini roles ('user' or 'model')
    // Filter out system messages as they are not part of the conversational history for Gemini.
    const contents = history
      .filter((msg: Message) => msg.role !== 'system')
      .map((msg: Message) => {
        let role: 'user' | 'model';
        if (msg.role === 'user') {
          role = 'user';
        } else {
          role = 'model';
        }
        return {
          role: role,
          parts: [{ text: msg.content }],
        };
      });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    const text = response.text;

    return {
        statusCode: 200,
        body: JSON.stringify({ text }),
        headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" },
    };

  } catch (error) {
    console.error('Error in Netlify function:', error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to get response from AI service.', details: errorMessage }),
        headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" },
    };
  }
};

export { handler };
