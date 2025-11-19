import { Message, Role, StoryChoice, Discovery } from '../types';

// The parse function remains on the client-side as it only deals with text formatting.
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

// Generic function to call our Netlify backend
const callApiFunction = async (endpoint: string, payload: object): Promise<any> => {
  try {
    const response = await fetch(`/.netlify/functions/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error(`Error calling Netlify function ${endpoint}:`, error);
    throw error; // Re-throw to be caught by the calling function
  }
};


export const getCharacterResponse = async (
  systemInstruction: string,
  history: Message[]
): Promise<Message> => {
  const isStoryMode = systemInstruction.includes('أنت سيد السرد');

  try {
    const payload = {
      type: 'chat',
      systemInstruction,
      history,
    };
    
    // The response from our function is the raw Gemini response
    const geminiResponse = await callApiFunction('get-ai-response', payload);

    const responseText = geminiResponse.text;
    if (!responseText) {
      return { role: Role.SYSTEM, content: "لم يتمكن الذكاء الاصطناعي من إنشاء رد. قد يكون المحتوى غير آمن." };
    }

    return parseGeminiResponse(responseText, isStoryMode);

  } catch (error: any) {
    console.error("Netlify Function Error (getCharacterResponse):", error);
    return {
      role: Role.SYSTEM,
      content: "حدث خطأ أثناء التواصل مع الخادم. يرجى المحاولة مرة أخرى.",
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

    try {
       const payload = {
         type: 'analysis',
         discoveries,
         characterPersona,
       };

       const geminiResponse = await callApiFunction('get-ai-response', payload);

       return geminiResponse.text || "لا أستطيع تجميع أفكاري الآن... دعنا نواصل القصة أولاً.";

    } catch (error: any) {
        console.error("Netlify Function Error (getBehavioralAnalysis):", error);
        return "حدث خطأ أثناء تحليل أفعالك. يرجى المحاولة مرة أخرى.";
    }
};
