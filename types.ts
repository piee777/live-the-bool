

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
  created_at: string;
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
  created_at: string;
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

// FIX: Added missing UserGeneratedBook interface to resolve import error.
export interface UserGeneratedBook {
  id: string;
  user_id: string;
  title: string;
  author: string;
  summary: string;
  initialPrompt: string;
  isUserGenerated: true;
}

export interface User {
  id: string;
  name: string;
  avatar_url?: string;
  unlocked_achievements?: string[];
  global_progress?: number;
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
// FIX: Added missing type definitions for community features to resolve import errors.
export interface LeaderboardUser extends User {
  score: number;
  rank: number;
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

export interface DebateTopic {
  id: string;
  title: string;
  sides: {
    sideA: {
      title: string;
      argument: string;
      votes: number;
    };
    sideB: {
      title: string;
      argument: string;
      votes: number;
    };
  };
}

export interface CommunityStats {
  mostReadNovels: {
    title: string;
    readCount: number;
  }[];
  keyDecision: {
    question: string;
    optionA: {
      text: string;
      percentage: number;
    };
    optionB: {
      text: string;
      percentage: number;
    };
  };
}
