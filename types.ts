
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
  progressIncrement?: number;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  persona: string;
  // FIX: Added book_id to link a character to a book.
  book_id: string;
}

export interface Book {
  id:string;
  title: string;
  author: string;
  summary: string;
  characters: Character[];
  isUserGenerated?: false;
  isChallenge?: boolean;
}

export interface UserGeneratedBook {
  id: string;
  user_id?: string; // Kept for potential future use, but not primary for local
  title: string;
  author: string;
  summary: string; // User's short description
  initialPrompt: string; // Detailed prompt for the AI
  isUserGenerated: true;
}

export type AnyBook = Book | UserGeneratedBook;


export interface TimelineEvent {
  type: 'narration' | 'choice';
  content: string;
}

export interface StoryState {
    messages: Message[];
    storyProgress: number;
    storyDiary: DiaryEntry[];
    storyNotes: string;
    inventory: string[];
    timeline: TimelineEvent[];
    savedQuotes: string[];
}

export interface UserStoryChoice {
  text: string;
  destinationChapterId: string;
}

export interface UserChapter {
  id: string;
  content: string;
  choices?: UserStoryChoice[];
}

export interface UserBook {
  chapters: UserChapter[];
}

export interface User {
  id: string;
  name: string;
  avatar_url?: string;
  unlocked_achievements?: string[];
  global_progress?: number;
}

export interface LeaderboardUser extends User {
    rank: number;
    score: number;
}
