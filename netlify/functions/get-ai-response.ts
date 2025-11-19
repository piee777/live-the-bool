import type { Handler, HandlerEvent } from "@netlify/functions";
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { Message, Discovery } from '../../types';

// Initialize the Google AI client with the API key from environment variables
// This happens once per function invocation, and the instance is reused if the function is warm.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
      headers: { 'Content-Type': 'application/json' },
    };
  }

  if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY environment variable not set.");
      return {
          statusCode: 500,
          body: JSON.stringify({ error: "Internal Server Error: API key not configured." }),
          headers: { 'Content-Type': 'application/json' },
      };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { type } = body;

    let response: GenerateContentResponse;

    if (type === 'chat') {
      const { systemInstruction, history } = body as { systemInstruction: string; history: Message[] };

      const geminiHistory = history
        .filter(msg => msg.role === 'user' || msg.role === 'character' || msg.role === 'narrator')
        .map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        }));

      if (geminiHistory.length > 0 && geminiHistory[0].role === 'model') {
        geminiHistory.shift();
      }

      response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: geminiHistory,
        config: {
            systemInstruction: systemInstruction,
        },
      });

    } else if (type === 'analysis') {
      const { discoveries, characterPersona } = body as { discoveries: Discovery[], characterPersona: string };
      
      const discoveriesSummary = discoveries.map(d => `- (${d.category}): "${d.choiceText}"`).join('\n');
      const systemInstruction = `أنت الشخصية التي يتفاعل معها اللاعب. هويتك هي:
${characterPersona}
مهمتك هي كتابة تحليل شخصي ومباشر للاعب بناءً على قراراته. خاطب اللاعب مباشرة بصيغة "أنت".
هذه هي القرارات التي اتخذها اللاعب حتى الآن:
${discoveriesSummary}
بناءً على هذه القرارات، قم بما يلي:
1.  **قدم تحليلاً عميقًا:** تحدث عن نمط تفكيره (هل هو عملي، وجودي، عبثي؟).
2.  **عبّر عن رأيك:** كيف تشعر تجاه أفعاله؟ هل تتفق معها؟ هل تفاجئك؟
3.  **توقع المستقبل:** ما الذي تتوقعه منه بناءً على سلوكه؟
اكتب ردك كنص متدفق وطبيعي، كما لو كنت تتحدث معه وجهًا لوجه. اجعل التحليل شخصيًا ومؤثرًا.`;

      response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: 'حلل سلوكي.' }] }],
        config: {
            systemInstruction: systemInstruction,
        },
      });

    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid request type' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(response),
      headers: { 'Content-Type': 'application/json' },
    };

  } catch (error: any) {
    console.error("Error in get-ai-response function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "An error occurred while processing your request." }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
};

export { handler };
