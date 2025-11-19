import { GoogleGenAI } from "@google/genai";
import { Message, Role, StoryChoice, Discovery } from '../types';

// Initialize the client directly
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const parseGeminiResponse = (responseText: string, isStoryMode: boolean): Message => {
  const message: Message = {
    role: isStoryMode ? Role.NARRATOR : Role.CHARACTER,
    content: responseText,
  };

  if (isStoryMode) {
    const narrationMatch = responseText.match(/\[NARRATION\]([\s\S]*?)(?=\[|$)/);
    let content = "";

    if (narrationMatch && narrationMatch[1]) {
        content = narrationMatch[1].trim();
    } else {
        const firstTagIndex = responseText.search(/\[[A-Z_]+(?::[^\]]*)?\]/);
        if (firstTagIndex === -1) {
            content = responseText.trim();
        } else {
            content = responseText.substring(0, firstTagIndex).trim();
        }
    }
    
    const hasActionableTags = /\[CHOICE\]|\[FATE_ROLL:/.test(responseText);
    if (!content && responseText.trim() && !hasActionableTags) {
        message.content = "حدث خطأ في السرد. حاول مرة أخرى.";
    } else {
        message.content = content;
    }

    const progressMatch = responseText.match(/\[PROGRESS:(\d+)\]/);
    if (progressMatch) message.progressIncrement = parseInt(progressMatch[1], 10);

    const choicesMatch = responseText.match(/\[CHOICE\]([\s\S]*?)(?=\[|$)/);
    if (choicesMatch) {
      message.choices = choicesMatch[1].trim().split('\n').map(line => {
        const parts = line.split('::').map(p => p.trim());
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
  const isStoryMode = systemInstruction.includes('أنت سيد السرد');

  try {
    // Prepare history for Gemini
    const geminiHistory = history
      .filter(msg => msg.role === 'user' || msg.role === 'character' || msg.role === 'narrator')
      .map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

    // Ensure the conversation doesn't start with a model turn
    if (geminiHistory.length > 0 && geminiHistory[0].role === 'model') {
      geminiHistory.shift();
    }

    const response = await ai.models.generateContent({
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
    return {
      role: Role.SYSTEM,
      content: "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي. يرجى التحقق من مفتاح API أو المحاولة لاحقًا.",
    };
  }
};

export const getBehavioralAnalysis = async (
    discoveries: Discovery[],
    characterPersona: string
): Promise<string> => {
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
       const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: 'حلل سلوكي.' }] }],
        config: {
            systemInstruction: systemInstruction,
        },
      });

       return response.text || "لا أستطيع تجميع أفكاري الآن... دعنا نواصل القصة أولاً.";

    } catch (error: any) {
        console.error("Gemini Analysis Error:", error);
        return "حدث خطأ أثناء تحليل أفعالك. يرجى المحاولة مرة أخرى.";
    }
};