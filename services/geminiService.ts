import { GoogleGenAI, GenerateContentResponse, Content } from "@google/genai";
import { Character, DiaryEntry, Message, Role, StoryChoice, Interruption } from '../types';

let ai: GoogleGenAI | null = null;
let initializationError: string | null = null;

// Self-initialize on module load
try {
  // Safely access the API key and ensure it exists before initializing.
  const apiKey = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : undefined;
  if (!apiKey) {
    throw new Error("API_KEY is not defined in the environment.");
  }
  // FIX: Pass apiKey as a named parameter.
  ai = new GoogleGenAI({ apiKey });
} catch (error) {
  console.error("Gemini AI initialization failed:", error);
  // This message will be shown to the user in the chat interface.
  initializationError = "خطأ في الإعداد: مفتاح API للذكاء الاصطناعي غير متوفر أو غير صالح. لا يمكن استخدام ميزات الذكاء الاصطناعي.";
  ai = null;
}


// Maps our internal Role enum to the roles expected by the Gemini API.
const roleToGeminiRole = (role: Role): 'user' | 'model' => {
    // Both CHARACTER and NARRATOR messages are from the 'model'
    return role === Role.USER ? 'user' : 'model';
}

export const getCharacterResponse = async (
  systemInstruction: string,
  history: Message[]
): Promise<Message> => {
    // If the AI client failed to initialize, return the stored error message.
    if (!ai) {
      return {
          role: Role.SYSTEM,
          content: initializationError || "خطأ غير معروف في تهيئة الذكاء الاصطناعي.",
      };
    }
    
    // We filter out system messages as they are not part of the conversation flow.
    // We also slice the history to the last 10 messages to avoid an overly long context,
    // which can cause the model to fail after many interactions.
    const relevantHistory = history
        .filter(msg => msg.role === Role.USER || msg.role === Role.CHARACTER || msg.role === Role.NARRATOR)
        .slice(-10);

    const contents: Content[] = relevantHistory.map(msg => ({
        role: roleToGeminiRole(msg.role),
        parts: [{ text: msg.content }],
    }));

    const maxRetries = 3;
    let delay = 2000; // Start with a 2-second delay

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const response: GenerateContentResponse = await ai!.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: contents,
                config: {
                    systemInstruction: systemInstruction,
                    temperature: 0.85,
                    topP: 0.9,
                },
            });

            let responseText = response.text.trim();
            let interruption: Interruption | undefined = undefined;

            // Extract Interruption first, as it can appear in both modes
            const interruptionMatch = responseText.match(/\[INTERRUPTION:([^:]+):([\s\S]*?)\[\/INTERRUPTION\]\]/);
            if (interruptionMatch) {
                interruption = { characterName: interruptionMatch[1].trim(), content: interruptionMatch[2].trim() };
                responseText = responseText.replace(interruptionMatch[0], '').trim();
            }

            // Check if it's a story mode response by looking for our main tag
            const isStoryMode = responseText.startsWith('[NARRATION]');

            if (isStoryMode) {
                let narration = '';
                let progressIncrement = 0;
                let choices: StoryChoice[] | undefined = undefined;
                let flashback: string | undefined = undefined;
                let secretAchievement: string | undefined = undefined;
                let diaryEntry: DiaryEntry | undefined = undefined;
                let impact: string | undefined = undefined;
                let inventoryAdd: string | undefined = undefined;
                let inventoryRemove: string | undefined = undefined;

                // Extract impact
                const impactMatch = responseText.match(/\[IMPACT:([^\]]+)\]/);
                if (impactMatch) {
                    impact = impactMatch[1].trim();
                    responseText = responseText.replace(impactMatch[0], '').trim();
                }

                // Extract inventory add
                const inventoryAddMatch = responseText.match(/\[INVENTORY_ADD:([^\]]+)\]/);
                if (inventoryAddMatch) {
                    inventoryAdd = inventoryAddMatch[1].trim();
                    responseText = responseText.replace(inventoryAddMatch[0], '').trim();
                }
                
                // Extract inventory remove
                const inventoryRemoveMatch = responseText.match(/\[INVENTORY_REMOVE:([^\]]+)\]/);
                if (inventoryRemoveMatch) {
                    inventoryRemove = inventoryRemoveMatch[1].trim();
                    responseText = responseText.replace(inventoryRemoveMatch[0], '').trim();
                }

                // Extract flashback
                const flashbackMatch = responseText.match(/\[FLASHBACK\]([\s\S]*?)\[\/FLASHBACK\]/);
                if (flashbackMatch) {
                    flashback = flashbackMatch[1].trim();
                    responseText = responseText.replace(flashbackMatch[0], '');
                }
                
                // Extract diary entry
                const diaryMatch = responseText.match(/\[DIARY_ENTRY:([^:]+):([\s\S]*?)\[\/DIARY_ENTRY\]\]/);
                if (diaryMatch) {
                    diaryEntry = { character: diaryMatch[1].trim(), content: diaryMatch[2].trim() };
                    responseText = responseText.replace(diaryMatch[0], '');
                }
                
                // Extract secret achievement
                const achievementMatch = responseText.match(/\[SECRET_ACHIEVEMENT:([^\]]+)\]/);
                if (achievementMatch) {
                    secretAchievement = achievementMatch[1].trim();
                    responseText = responseText.replace(achievementMatch[0], '');
                }

                // Extract narration, which is between [NARRATION] and the next tag or end of string
                const narrationMatch = responseText.match(/\[NARRATION\]([\s\S]*?)(\[PROGRESS:|\[CHOICE]|$)/);
                narration = narrationMatch ? narrationMatch[1].trim() : '';

                // Extract progress value
                const progressMatch = responseText.match(/\[PROGRESS:(\d+)\]/);
                progressIncrement = progressMatch ? parseInt(progressMatch[1], 10) : 0;

                // Extract choices
                const choiceMatch = responseText.match(/\[CHOICE\]([\s\S]*)/);
                if (choiceMatch && choiceMatch[1]) {
                    choices = choiceMatch[1]
                        .trim()
                        .split('\n')
                        .map((line): StoryChoice | null => {
                            const timerRegex = /⏳(\d+)/;
                            const timerMatch = line.match(timerRegex);
                            const timer = timerMatch ? parseInt(timerMatch[1], 10) : undefined;
                            const cleanLine = line.replace(timerRegex, '').trim();
                            const parts = cleanLine.split('::').map(p => p.trim());
                            if (parts.length >= 2) return { icon: parts[0], text: parts.slice(1).join('::'), timer };
                            if (parts.length === 1 && parts[0]) return { text: parts[0], timer };
                            return null;
                        })
                        .filter((c): c is StoryChoice => c !== null);
                }

                const narratorMessage: Message = {
                    role: Role.NARRATOR,
                    content: narration,
                    choices: choices && choices.length > 0 ? choices : undefined,
                    flashback,
                    secretAchievement,
                    diaryEntry,
                    interruption,
                    impact,
                    inventoryAdd,
                    inventoryRemove,
                };

                if (progressIncrement > 0) {
                    narratorMessage.content += `[progress:${progressIncrement}]`;
                }

                return narratorMessage; // Success, exit loop and function
            }
            
            // If not a story mode response, return a standard character message.
            const characterMessage: Message = {
                role: Role.CHARACTER,
                content: responseText || "...",
                interruption,
            };

            return characterMessage; // Success, exit loop and function

        } catch (error) {
            const isRateLimitError = error instanceof Error && (error.message.includes('429') || error.message.includes('RESOURCE_EXHAUSTED'));

            if (isRateLimitError && attempt < maxRetries) {
                console.warn(`Attempt ${attempt + 1} failed due to rate limiting. Retrying in ${delay / 1000}s...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff
            } else {
                console.error(`Error getting response from Gemini API after ${attempt + 1} attempts:`, error);
                return {
                    role: Role.SYSTEM,
                    content: "عذرًا، حدث خطأ أثناء محاولة التواصل. قد يكون الخادم مشغولاً جدًا. يرجى المحاولة مرة أخرى لاحقًا.",
                };
            }
        }
    }
    
    // This should not be reached if the logic above is correct, but serves as a fallback.
    return {
        role: Role.SYSTEM,
        content: "عذرًا، فشلت جميع محاولات الاتصال. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.",
    };
};