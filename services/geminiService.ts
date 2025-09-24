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
    const narrationMatch = responseText.match(/\[NARRATION\]([\s\S]*?)(?=\[PROGRESS:|\[CHOICE\]|$)/);
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
