import { Message, Role, StoryChoice, DiaryEntry, Interruption } from '../types';

// This function parses the raw text from the AI and constructs a structured Message object.
const parseAIResponse = (text: string): Message => {
    let content = text;
    
    let role = Role.CHARACTER;
    const narrationMatch = content.match(/\[NARRATION\]([\s\S]*?)(?=\[(?:CHOICE|IMPACT|FLASHBACK|DIARY_ENTRY|SECRET_ACHIEVEMENT|INTERRUPTION|INVENTORY_ADD|INVENTORY_REMOVE|PROGRESS)\]|$)/);
    if (narrationMatch) {
        role = Role.NARRATOR;
        content = narrationMatch[0]; 
    }

    const extract = (tagName: string, isBlock = false): string | null => {
        const regex = isBlock
            ? new RegExp(`\\[${tagName}\\]([\\s\\S]*?)\\[/${tagName}\\]`, 'm')
            : new RegExp(`\\[${tagName}:([^\\]]+)\\]`, 'm');
        const match = content.match(regex);
        if (match && match[1]) {
            content = content.replace(regex, '').trim();
            return match[1].trim();
        }
        return null;
    };

    const flashback = extract('FLASHBACK', true);
    const diaryRaw = extract('DIARY_ENTRY', true);
    const interruptionRaw = extract('INTERRUPTION', true);
    const secretAchievement = extract('SECRET_ACHIEVEMENT');
    const impact = extract('IMPACT');
    const inventoryAdd = extract('INVENTORY_ADD');
    const inventoryRemove = extract('INVENTORY_REMOVE');
    const progressRaw = extract('PROGRESS');

    const choices: StoryChoice[] = [];
    const choiceBlockMatch = content.match(/\[CHOICE\]\s*([\s\S]*)/);
    if (choiceBlockMatch) {
        const choiceLines = choiceBlockMatch[1].trim().split('\n');
        choiceLines.forEach(line => {
            const trimmedLine = line.trim();
            if (!trimmedLine) return;
            const parts = trimmedLine.split('::');
            const text = (parts[1] || parts[0]).trim();
            const icon = parts.length > 1 ? parts[0].trim() : undefined;
            choices.push({ text, icon });
        });
        content = content.replace(choiceBlockMatch[0], '').trim();
    }
    
    let displayContent = content.replace(/\[NARRATION\]/, '').trim();

    const message: Message = {
        content: displayContent,
        role,
    };

    if (choices.length > 0) message.choices = choices;
    if (flashback) message.flashback = flashback;
    if (secretAchievement) message.secretAchievement = secretAchievement;
    if (impact) message.impact = impact;
    if (inventoryAdd) message.inventoryAdd = inventoryAdd;
    if (inventoryRemove) message.inventoryRemove = inventoryRemove;

    if (progressRaw) {
      const increment = parseInt(progressRaw, 10);
      if (!isNaN(increment)) {
          message.progressIncrement = increment;
      }
    }

    if (diaryRaw) {
        const [character, diaryContent] = diaryRaw.split(':');
        if (character && diaryContent) {
            message.diaryEntry = { character: character.trim(), content: diaryContent.trim() };
        }
    }
    if (interruptionRaw) {
        const [characterName, interruptionContent] = interruptionRaw.split(':');
        if (characterName && interruptionContent) {
            message.interruption = { characterName: characterName.trim(), content: interruptionContent.trim() };
        }
    }
    
    return message;
};

export const getCharacterResponse = async (
  systemInstruction: string,
  history: Message[]
): Promise<Message> => {
  try {
    const response = await fetch('/.netlify/functions/get-ai-response', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemInstruction, history }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        const errorData = JSON.parse(errorText || '{}');
        console.error('Error from AI service:', response.status, errorData);
        return {
            role: Role.SYSTEM,
            content: `حدث خطأ في خدمة الذكاء الاصطناعي: ${errorData.error || response.statusText}`,
        };
    }

    const responseText = await response.text();
    if (!responseText.trim()) {
        return { role: Role.SYSTEM, content: "تلقت الخدمة ردًا فارغًا. حاول مرة أخرى." };
    }

    return parseAIResponse(responseText);

  } catch (error) {
    console.error('Network or parsing error:', error);
    return {
      role: Role.SYSTEM,
      content: "لا يمكن الوصول إلى خدمة الذكاء الاصطناعي. يرجى التحقق من اتصالك بالإنترنت.",
    };
  }
};