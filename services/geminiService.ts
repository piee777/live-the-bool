import { Message, Role } from '../types';

export const getCharacterResponse = async (
  _systemInstruction: string,
  _history: Message[]
): Promise<Message> => {
  // Simulate network delay to feel responsive
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    role: Role.SYSTEM,
    content: "خدمة الذكاء الاصطناعي غير متصلة. تم تعطيل هذه الميزة لأنها تتطلب خادمًا.",
  };
};
