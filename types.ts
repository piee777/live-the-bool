export enum Role {
  USER = 'user',
  CHARACTER = 'character',
  SYSTEM = 'system',
  NARRATOR = 'narrator',
}

export interface StoryChoice {
  text: string;
  icon?: string; // e.g., an emoji '⚔️'
  timer?: number; // Optional timer in seconds for critical decisions
}

export interface DiaryEntry {
  character: string;
  content: string;
}

export interface Interruption {
  characterName: string;
  content: string;
}

export interface Message {
  role: Role;
  content: string;
  choices?: StoryChoice[];
  flashback?: string;
  secretAchievement?: string;
  diaryEntry?: DiaryEntry;
  interruption?: Interruption;
  impact?: string;
  inventoryAdd?: string;
  inventoryRemove?: string;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  persona: string;
}

export interface Book {
  id:string;
  title: string;
  author: string;
  summary: string;
  characters: Character[];
}