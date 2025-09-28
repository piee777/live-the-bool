import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { Message, Role, StoryChoice, Discovery } from '../types';

// Memoize the AI client instance to avoid re-initialization.
let ai: GoogleGenAI | null = null;
// Flag to prevent repeated console errors if the key is missing.
let apiKeyMissingErrorLogged = false;

/**
 * Lazily initializes and returns the GoogleGenAI client.
 * This prevents the app from crashing on startup if the API key is not set.
 * @returns The GoogleGenAI instance or null if the API key is missing.
 */
function getAiClient(): GoogleGenAI | null {
  if (ai) {
    return ai;
  }
  
  if (apiKeyMissingErrorLogged) {
    return null;
  }

  // As per instructions, process.env.API_KEY is assumed to be pre-configured.
  const apiKey = process.env.API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'undefined') {
    if (!apiKeyMissingErrorLogged) {
      console.error(
        "Storify App Critical Error: GEMINI_API_KEY environment variable is not set correctly. " +
        "The application will load, but AI features will be disabled. " +
        "Please ensure the environment variable is configured in your Netlify deployment settings."
      );
      apiKeyMissingErrorLogged = true;
    }
    return null;
  }
  
  try {
    ai = new GoogleGenAI({ apiKey });
    return ai;
  } catch (error) {
    console.error("Failed to initialize GoogleGenAI. Please check if the API key is valid.", error);
    apiKeyMissingErrorLogged = true;
    return null;
  }
}

const parseGeminiResponse = (responseText: string, isStoryMode: boolean): Message => {
  const message: Message = {
    role: isStoryMode ? Role.NARRATOR : Role.CHARACTER,
    content: responseText,
  };

  if (isStoryMode) {
    const narrationMatch = responseText.match(/\[NARRATION\]([\s\S]*?)(?=\[|$)/);
    message.content = narrationMatch ? narrationMatch[1].trim() : "حدث خطأ في السرد. حاول مرة أخرى.";

    const progressMatch = responseText.match(/\[PROGRESS:(\d+)\]/);
    if (progressMatch) message.progressIncrement = parseInt(progressMatch[1], 10);

    const choicesMatch = responseText.match(/\[CHOICE\]([\s\S]*?)(?=\[|$)/);
    if (choicesMatch) {
      message.choices = choicesMatch[1].trim().split('\n').map(line => {
        const parts = line.split('::').map(p => p.trim());
        // Expects format: icon :: text :: category
        if (parts.length < 3) {
            return {
                icon: parts.length > 1 ? parts[0] : undefined,
                text: parts.length > 1 ? parts[1] : parts[0],
                category: 'pragmatic'
            } as StoryChoice;
        }
        const category = parts[2].toLowerCase();
        return {
          icon: parts[0],
          text: parts[1],
          category: (category === 'existential' || category === 'absurdist') ? category : 'pragmatic',
        } as StoryChoice;
      }).filter(c => c.text);
    }

    const inventoryAddMatch = responseText.match(/\[INVENTORY_ADD:(.+?)\]/);
    if (inventoryAddMatch) message.inventoryAdd = inventoryAddMatch[1].trim();

    const inventoryRemoveMatch = responseText.match(/\[INVENTORY_REMOVE:(.+?)\]/);
    if (inventoryRemoveMatch) message.inventoryRemove = inventoryRemoveMatch[1].trim();

    const impactMatch = responseText.match(/\[IMPACT:(.+?)\]/);
    if (impactMatch) message.impact = impactMatch[1].trim();

    const flashbackMatch = responseText.match(/\[FLASHBACK\]([\s\S]*?)\[\/FLASHBACK\]/);
    if (flashbackMatch) message.flashback = flashbackMatch[1].trim();

    const achievementMatch = responseText.match(/\[SECRET_ACHIEVEMENT:(.+?)\]/);
    if (achievementMatch) message.secretAchievement = achievementMatch[1].trim();

    const interruptionMatch = responseText.match(/\[INTERRUPTION:([^:]+):([\s\S]*?)\[\/INTERRUPTION\]/);
    if (interruptionMatch) {
      message.interruption = { characterName: interruptionMatch[1].trim(), content: interruptionMatch[2].trim() };
    }

    const effectMatch = responseText.match(/\[EFFECT:(\w+)\]/);
    if (effectMatch) {
        const effect = effectMatch[1].trim().toLowerCase();
        if (effect === 'shake' || effect === 'glow' || effect === 'whisper') {
          message.effect = effect;
        }
    }

    const fateRollMatch = responseText.match(/\[FATE_ROLL:([^\]]+)\]/);
    if (fateRollMatch) {
        message.fateRoll = fateRollMatch[1].trim();
        message.choices = [];
    }


  } else {
    const interruptionMatch = responseText.match(/\[INTERRUPTION:([^:]+):([\s\S]*?)\[\/INTERRUPTION\]/);
    if (interruptionMatch) {
        message.content = responseText.replace(interruptionMatch[0], '').trim();
        message.interruption = { characterName: interruptionMatch[1].trim(), content: interruptionMatch[2].trim() };
    } else {
        message.content = responseText.trim();
    }
  }

  return message;
};

export const getCharacterResponse = async (
  systemInstruction: string,
  history: Message[]
): Promise<Message> => {

  const aiClient = getAiClient();
  if (!aiClient) {
    return {
      role: Role.SYSTEM,
      content: "خطأ في الإعدادات: لم يتم العثور على مفتاح الواجهة البرمجية (API Key).",
    };
  }
  
  const isStoryMode = systemInstruction.includes('أنت سيد السرد');

  const geminiHistory = history
    .filter(msg => msg.role === Role.USER || msg.role === Role.CHARACTER || msg.role === Role.NARRATOR)
    .map(msg => ({
      role: msg.role === Role.USER ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));
    
  // FIX: The Gemini API requires conversation history to start with a 'user' role.
  // If our history starts with a 'model' message (e.g., the initial greeting from a character),
  // it causes an error. This removes the initial model message to ensure a valid request format.
  if (geminiHistory.length > 0 && geminiHistory[0].role === 'model') {
      geminiHistory.shift();
  }


  try {
    const response: GenerateContentResponse = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: geminiHistory,
        config: {
            systemInstruction: systemInstruction,
        },
    });
    
    const responseText = response.text;
    if (!responseText) {
        return { role: Role.SYSTEM, content: "لم يتمكن الذكاء الاصطناعي من إنشاء رد. قد يكون المحتوى غير آمن." };
    }

    return parseGeminiResponse(responseText, isStoryMode);

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    let userMessage = "حدث خطأ أثناء التواصل مع الذكاء الاصطناعي. يرجى المحاولة مرة أخرى.";

    // The API might be blocked, the key invalid, or the request malformed.
    // In a deployed environment like Netlify, the most common issue is the API key.
    if (error.message) {
      if (error.message.toLowerCase().includes('api key')) {
        userMessage = "خطأ في الإعدادات: مفتاح الواجهة البرمجية (API Key) غير صالح. يرجى التأكد من إعداده بشكل صحيح في بيئة النشر.";
      } else if (error.message.toLowerCase().includes('fetch') || error.message.toLowerCase().includes('network')) {
        userMessage = "حدث خطأ في الشبكة. يرجى التحقق من اتصالك بالإنترنت.";
      } else {
        // Generic but more helpful error for deployment issues.
        userMessage = "فشل الاتصال بالذكاء الاصطناعي. قد تكون هناك مشكلة في إعدادات الواجهة البرمجية (API Key) في بيئة النشر (Netlify). يرجى مراجعة الإعدادات.";
      }
    }
    
    return {
      role: Role.SYSTEM,
      content: userMessage,
    };
  }
};

export const getBehavioralAnalysis = async (
    discoveries: Discovery[],
    characterPersona: string
): Promise<string> => {
    const aiClient = getAiClient();
    if (!aiClient) {
        return "لا يمكن إجراء التحليل لأن مفتاح الواجهة البرمجية (API Key) غير متاح.";
    }

    if (discoveries.length === 0) {
        return "لم تتخذ قرارات كافية بعد ليتم تحليلها. استمر في القصة وسأشاركك أفكاري قريبًا.";
    }

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

    try {
        const response: GenerateContentResponse = await aiClient.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: 'حلل سلوكي.' }] }],
            config: {
                systemInstruction: systemInstruction,
            },
        });
        
        const responseText = response.text;
        return responseText || "لا أستطيع تجميع أفكاري الآن... دعنا نواصل القصة أولاً.";

    } catch (error: any) {
        console.error("Gemini API Error (Behavior Analysis):", error);
        if (error.message && error.message.toLowerCase().includes('api key')) {
            return "فشل التحليل. مفتاح الواجهة البرمجية (API Key) غير صالح أو غير متاح في بيئة النشر.";
        }
        return "حدث خطأ أثناء تحليل أفعالك. يرجى التحقق من إعدادات الواجهة البرمجية (API Key) في بيئة النشر (Netlify).";
    }
};