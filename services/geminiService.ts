import { GoogleGenAI } from '@google/genai';
import { Message, Role } from '../types';

// As per instructions, process.env.API_KEY is assumed to be pre-configured and available.
// The AI client is initialized once when the module is loaded.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const parseGeminiResponse = (responseText: string, isStoryMode: boolean): Message => {
  const message: Message = {
    role: isStoryMode ? Role.NARRATOR : Role.CHARACTER,
    content: responseText, 
  };

  if (isStoryMode) {
    const narrationMatch = responseText.match(/\[NARRATION\]([\s\S]*?)(?=\[PROGRESS:|\[CHOICE\]|\[EFFECT\]|\[RELATIONSHIP_CHANGE\]|$)/);
    message.content = narrationMatch ? narrationMatch[1].trim() : "حدث خطأ في السرد. حاول مرة أخرى.";

    const progressMatch = responseText.match(/\[PROGRESS:(\d+)\]/);
    if (progressMatch) message.progressIncrement = parseInt(progressMatch[1], 10);

    const choicesMatch = responseText.match(/\[CHOICE\]([\s\S]*?)(?=\[|$)/);
    if (choicesMatch) {
      message.choices = choicesMatch[1].trim().split('\n').map(line => {
        const parts = line.split('::');
        return {
          icon: parts.length > 1 ? parts[0].trim() : undefined,
          text: (parts.length > 1 ? parts[1] : parts[0]).trim(),
        };
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

    const diaryMatch = responseText.match(/\[DIARY_ENTRY:([^:]+):([\s\S]*?)\[\/DIARY_ENTRY\]/);
    if (diaryMatch) {
      message.diaryEntry = { character: diaryMatch[1].trim(), content: diaryMatch[2].trim() };
    }

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

    const relationshipMatch = responseText.match(/\[RELATIONSHIP_CHANGE:([^:]+):([^:]+):(-?\d+)\]/);
    if (relationshipMatch) {
        message.relationshipChange = {
            characterName: relationshipMatch[1].trim(),
            status: relationshipMatch[2].trim(),
            change: parseInt(relationshipMatch[3], 10),
        };
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

  const geminiHistory = history
    .filter(msg => msg.role === Role.USER || msg.role === Role.CHARACTER || msg.role === Role.NARRATOR)
    .map(msg => ({
      role: msg.role === Role.USER ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: geminiHistory,
        config: {
            systemInstruction: systemInstruction,
        }
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
      content: "حدث خطأ أثناء التواصل مع الذكاء الاصطناعي. يرجى المحاولة مرة أخرى.",
    };
  }
};

export const getConceptExplanation = async (concept: string): Promise<string> => {
    const systemInstruction = `أنت مساعد خبير في الفلسفة. مهمتك هي شرح المفاهيم الفلسفية المعقدة بلغة عربية بسيطة وواضحة جداً، كما لو كنت تشرحها لشخص لم يسمع بها من قبل. اجعل الشرح موجزًا (٣-٤ جمل) وسهل الفهم.`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: `اشرح لي مفهوم "${concept}"` }] }],
            config: {
                systemInstruction: systemInstruction,
            }
        });
        const responseText = response.text;
        if (!responseText) {
            return "لم أتمكن من إيجاد شرح لهذا المفهوم حاليًا.";
        }
        return responseText.trim();
    } catch (error) {
        console.error("Gemini API Error (Concept Explanation):", error);
        return "حدث خطأ أثناء محاولة شرح المفهوم. يرجى المحاولة مرة أخرى.";
    }
};