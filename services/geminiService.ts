import { GoogleGenAI, GenerateContentResponse, Content } from "@google/genai";
import { Character, DiaryEntry, Message, Role, StoryChoice, Interruption } from '../types';

// The API key is expected to be set in the environment variables.
// In a static deployment environment like GitHub Pages, this value might not be available,
// which would cause the application to crash.
// We handle this case gracefully by checking for the key and allowing the app to run in a degraded state.
let ai: GoogleGenAI | null = null;

// Using a try-catch block to prevent a crash if 'process' is not defined in the browser.
try {
  const apiKey = process.env.API_KEY;
  if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
  } else {
    console.warn("API_KEY environment variable not found. AI functionality will be disabled.");
  }
} catch (e) {
  console.error("Failed to access process.env. This is expected on a static hosting platform. AI functionality will be disabled.", e);
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
    // If the AI client failed to initialize, return a user-friendly error message.
    if (!ai) {
      return {
          role: Role.SYSTEM,
          content: "خطأ في الإعداد: مفتاح API للذكاء الاصطناعي غير متوفر. تأكد من أن متغير البيئة API_KEY تم إعداده بشكل صحيح في بيئة النشر.",
      };
    }
    
    // Convert our app's message history into the format Gemini API expects.
    // We filter out system messages as they are not part of the conversation flow.
    const contents: Content[] = history
        .filter(msg => msg.role === Role.USER || msg.role === Role.CHARACTER || msg.role === Role.NARRATOR)
        .map(msg => ({
            role: roleToGeminiRole(msg.role),
            parts: [{ text: msg.content }],
        }));

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
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

            return narratorMessage;
        }
        
        // If not a story mode response, return a standard character message.
        const characterMessage: Message = {
            role: Role.CHARACTER,
            content: responseText || "...",
            interruption,
        };

        return characterMessage;

    } catch (error) {
        console.error("Error getting response from Gemini API:", error);
        return {
            role: Role.SYSTEM,
            content: "عذرًا، حدث خطأ أثناء محاولة التواصل مع الشخصية. يرجى المحاولة مرة أخرى.",
        };
    }
};