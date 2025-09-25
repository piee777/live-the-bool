

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
  category: 'existential' | 'pragmatic' | 'absurdist';
}

export interface Interruption {
  characterName: string;
  content: string;
}

export interface Message {
  role: Role;
  content: string;
  timestamp?: number;
  choices?: StoryChoice[];
  flashback?: string;
  secretAchievement?: string;
  interruption?: Interruption;
  impact?: string;
  inventoryAdd?: string;
  inventoryRemove?: string;
  progressIncrement?: number;
  effect?: 'shake' | 'glow' | 'whisper';
  fateRoll?: string;
}

export interface Reply {
  id: string;
  author: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  content: string;
  timestamp: number;
}

export interface DiscoveryPost {
  id: string;
  author: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  type: 'recommendation' | 'discussion';
  title: string;
  content: string;
  timestamp: number;
  likes: string[];
  replies: Reply[];
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


export interface Discovery {
  choiceText: string;
  category: 'existential' | 'pragmatic' | 'absurdist';
  outcome: string;
}

export interface StoryState {
    messages: Message[];
    storyProgress: number;
    inventory: string[];
    discoveries: Discovery[];
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

// FIX: Added missing community feature types to resolve import errors.
export interface LeaderboardUser {
  id: string;
  name: string;
  avatar_url?: string;
  rank: number;
  score: number;
}

export interface Suggestion {
  id: string;
  text: string;
  authorName: string;
  authorId: string;
  votes: number;
  upvotes: number;
  downvotes: number;
}

export interface DebateSide {
  title: string;
  argument: string;
  votes: number;
}

export interface DebateTopic {
  id: string;
  title: string;
  sides: {
    sideA: DebateSide;
    sideB: DebateSide;
  };
}

export interface NovelStat {
  title: string;
  readCount: number;
}

export interface DecisionOption {
  text: string;
  percentage: number;
}

export interface KeyDecision {
  question: string;
  optionA: DecisionOption;
  optionB: DecisionOption;
}

export interface CommunityStats {
  mostReadNovels: NovelStat[];
  keyDecision: KeyDecision;
}

// FIX: Added missing type definitions to resolve import errors.
export interface DiaryEntry {
  character: string;
  content: string;
}

export interface MeditationEntry {
  question: string;
  answer: string;
}

export interface Relationship {
  characterName: string;
  status: string;
  level: number;
}

export interface TimelineEvent {
  type: string;
  content: string;
}

export interface ChallengeAnswer {
    id: string;
    text: string;
    author: {
        id: string;
        name: string;
        avatar_url?: string;
    };
    upvotes: number;
}

export interface DailyChallenge {
    question: string;
    answers: ChallengeAnswer[];
}