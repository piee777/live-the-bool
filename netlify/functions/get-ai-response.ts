import type { Handler, HandlerEvent } from "@netlify/functions";
import { GoogleGenAI } from '@google/genai';
import { Message, Discovery } from '../../types';

const handler: Handler = async (event: HandlerEvent) => {
  // 1. Log method to ensure function is reached
  console.log(`Function invoked with method: ${event.httpMethod}`);

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
      headers: { 'Content-Type': 'application/json' },
    };
  }

  // 2. Check API Key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
      console.error("CRITICAL: GEMINI_API_KEY is missing in environment variables.");
      return {
          statusCode: 500,
          body: JSON.stringify({ error: "Server configuration error: API Key missing." }),
          headers: { 'Content-Type': 'application/json' },
      };
  }

  try {
    // Initialize Client inside handler to avoid cold start issues with env vars
    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    const body = JSON.parse(event.body || '{}');
    const { type } = body;

    console.log(`Processing request type: ${type}`);

    let generatedText = "";

    if (type === 'chat') {
      const { systemInstruction, history } = body as { systemInstruction: string; history: Message[] };

      // Convert history to Gemini format
      const geminiHistory = history
        .filter(msg => msg.role === 'user' || msg.role === 'character' || msg.role === 'narrator')
        .map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        }));

      // Ensure the conversation doesn't start with a model turn (Gemini requirement)
      if (geminiHistory.length > 0 && geminiHistory[0].role === 'model') {
        geminiHistory.shift();
      }

      console.log("Sending request to Gemini model...");
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: geminiHistory,
        config: {
            systemInstruction: systemInstruction,
        },
      });
      
      generatedText = response.text || "";

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

      console.log("Sending analysis request to Gemini...");
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: 'حلل سلوكي.' }] }],
        config: {
            systemInstruction: systemInstruction,
        },
      });

      generatedText = response.text || "";

    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid request type' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    console.log("Gemini response received successfully.");

    return {
      statusCode: 200,
      // Only return the text to keep the payload light and avoid circular JSON errors
      body: JSON.stringify({ text: generatedText }),
      headers: { 'Content-Type': 'application/json' },
    };

  } catch (error: any) {
    console.error("Error in get-ai-response function:", error);
    
    // Return the specific error message to help debugging (remove this in production if you want to hide details)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `AI Service Error: ${error.message}` }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
};

export { handler };