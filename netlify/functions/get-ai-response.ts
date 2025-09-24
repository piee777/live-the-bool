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

    // --- Start of robust history processing ---

    // 1. Filter out system messages and create a working copy.
    let processedHistory: Message[] = history.filter((msg: Message) => msg.role !== 'system');

    // 2. The conversation must start with a 'user' role. Drop any leading 'model' messages.
    while (processedHistory.length > 0 && processedHistory[0].role !== 'user') {
        processedHistory.shift();
    }
    
    // 3. Merge consecutive messages from the same role to ensure alternation.
    const finalHistory: Message[] = [];
    if (processedHistory.length > 0) {
        finalHistory.push({ ...processedHistory[0] }); // Push a copy
        for (let i = 1; i < processedHistory.length; i++) {
            const lastMessage = finalHistory[finalHistory.length - 1];
            const currentMessage = processedHistory[i];

            const isLastUser = lastMessage.role === 'user';
            const isCurrentUser = currentMessage.role === 'user';

            if (isLastUser === isCurrentUser) {
                // Roles are the same (e.g., user/user or model/model), merge content.
                lastMessage.content += `\n\n${currentMessage.content}`;
            } else {
                // Roles are different, push the new message.
                finalHistory.push({ ...currentMessage }); // Push a copy
            }
        }
    }

    // 4. Map to the format required by the Gemini API.
    const contents = finalHistory.map((msg: Message) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // 5. Ensure we have something to send after processing.
    if (contents.length === 0) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Valid conversational history could not be constructed from the provided messages.' }),
            headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" },
        };
    }
    
    // --- End of robust history processing ---

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
