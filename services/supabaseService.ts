
import { createClient } from '@supabase/supabase-js';
import { User, Book, StoryState, Message, DiscoveryPost, Reply, Discovery } from '../types';

// Use process.env strictly as defined in vite.config.ts for consistency.
// We default to empty strings if undefined to prevent crashes, but logs will warn if keys are missing.
const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("⚠️ Supabase Keys missing! App will load but DB calls will fail. Check .env or Netlify Settings.");
}

export const supabase = createClient(
    supabaseUrl || "https://placeholder.supabase.co", 
    supabaseAnonKey || "placeholder"
);

// --- Read Operations ---

export const getBooks = async (): Promise<Book[]> => {
    let { data, error } = await supabase.from('books').select(`*, characters (*)`);
    if (error) {
        console.error("Error fetching books:", error);
        return [];
    }
    return data as Book[];
};

export const getStoryStates = async (userId: string): Promise<Record<string, StoryState>> => {
    const { data, error } = await supabase.from('story_states').select('*').eq('user_id', userId);
    if (error) return {};
    
    return data.reduce((acc, state) => {
        acc[state.book_id] = {
            messages: (Array.isArray(state.messages) ? state.messages : []) as Message[],
            storyProgress: Number(state.story_progress || 0),
            inventory: (Array.isArray(state.inventory) ? state.inventory : []) as string[],
            discoveries: (Array.isArray(state.discoveries) ? state.discoveries : []) as Discovery[],
        };
        return acc;
    }, {} as Record<string, StoryState>);
};

export const getChatHistories = async (userId: string): Promise<Record<string, Message[]>> => {
    const { data, error } = await supabase.from('chat_histories').select('*').eq('user_id', userId);
    if (error) return {};
    
    return data.reduce((acc, chat) => {
        acc[chat.character_id] = (Array.isArray(chat.messages) ? chat.messages : []) as Message[];
        return acc;
    }, {} as Record<string, Message[]>);
};

export const getAllUsers = async (): Promise<User[]> => {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) return [];
    return data as User[];
};

export const getUserProfileById = async (id: string): Promise<User | null> => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
    if (error) return null;
    return data;
};

export const getDiscoveryPosts = async (): Promise<DiscoveryPost[]> => {
    const { data, error } = await supabase
        .from('discovery_posts')
        .select(`
            *,
            author:profiles!author_id(*),
            likes:discovery_post_likes(user_id),
            replies:discovery_post_replies(*, author:profiles!author_id(*))
        `)
        .order('created_at', { ascending: false });

    if (error) return [];

    return data.map(post => ({
        ...post,
        author: post.author || { id: 'unknown', name: 'مستخدم محذوف', avatar_url: '' },
        likes: post.likes.map((like: any) => like.user_id),
        replies: post.replies.map((reply: any) => ({
            ...reply,
            author: reply.author || { id: 'unknown', name: 'مستخدم محذوف', avatar_url: '' }
        })).sort((a: Reply, b: Reply) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    }));
};

// --- Write Operations (Direct Client-Side) ---

export const saveStoryState = async (userId: string, bookId: string, state: StoryState) => {
    // Direct DB write
    await supabase.from('story_states').upsert({
        user_id: userId,
        book_id: bookId,
        messages: state.messages,
        story_progress: state.storyProgress,
        inventory: state.inventory,
        discoveries: state.discoveries,
        updated_at: new Date().toISOString()
    });
};

export const saveChatHistory = async (userId: string, characterId: string, messages: Message[]) => {
    // Direct DB write
    await supabase.from('chat_histories').upsert({
        user_id: userId,
        character_id: characterId,
        messages: messages,
        updated_at: new Date().toISOString()
    });
};

export const addNovelSuggestion = async (suggestion: { title: string; author: string; user_id: string }): Promise<boolean> => {
    const { error } = await supabase.from('novel_suggestions').insert({
        title: suggestion.title,
        author: suggestion.author,
        user_id: suggestion.user_id
    });
    return !error;
};

export const addDiscoveryPost = async (postData: { author_id: string, type: 'discussion' | 'recommendation', title: string, content: string }): Promise<DiscoveryPost | null> => {
    const { data, error } = await supabase.from('discovery_posts').insert(postData).select('*, author:profiles!author_id(*)').single();
    if (error) return null;
    return {
        ...data,
        author: data.author || { id: 'unknown', name: 'مستخدم محذوف', avatar_url: '' },
        likes: [],
        replies: []
    };
};

export const togglePostLike = async (postId: string, userId: string): Promise<{ liked: boolean } | null> => {
    const { data: existingLike } = await supabase
        .from('discovery_post_likes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

    if (existingLike) {
        await supabase.from('discovery_post_likes').delete().eq('post_id', postId).eq('user_id', userId);
        return { liked: false };
    } else {
        await supabase.from('discovery_post_likes').insert({ post_id: postId, user_id: userId });
        return { liked: true };
    }
};

export const addPostReply = async (replyData: { post_id: string, author_id: string, content: string }): Promise<Reply | null> => {
    const { data, error } = await supabase.from('discovery_post_replies').insert(replyData).select('*, author:profiles!author_id(*)').single();
    if (error) return null;
     return {
        ...data,
        author: data.author || { id: 'unknown', name: 'مستخدم محذوف', avatar_url: '' },
    };
};

export const updateUserProfile = async (userId: string, updates: { avatar_url?: string; last_ip?: string; country?: string; }): Promise<User | null> => {
    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select('*')
        .single();
    if (error) return null;
    return data;
};
