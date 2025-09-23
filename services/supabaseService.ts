
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, StoryState, UserGeneratedBook } from '../types';

let supabase: SupabaseClient | null = null;
let initializationError: string | null = null;
let isSupabaseConfigured = false;

try {
    const supabaseUrl = "https://pttmavnhtlidqbbsiepf.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0dG1hdm5odGxpZHFiYnNpZXBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1ODk3MDUsImV4cCI6MjA3NDE2NTcwNX0.xVoauJqVjSbnUMpTPw4dxbhgOwDzLnfl8A19hTatLB4";

    supabase = createClient(supabaseUrl, supabaseKey);
    isSupabaseConfigured = true;
    initializationError = null;
} catch (error) {
    console.error("Supabase client initialization failed:", error);
    initializationError = "خطأ في الاتصال بقاعدة البيانات. لا يمكن حفظ أو استرداد البيانات.";
    supabase = null;
    isSupabaseConfigured = false;
}

export const getSupabaseInitializationError = (): string | null => initializationError;
export const getIsSupabaseConfigured = (): boolean => isSupabaseConfigured;

export const uploadAvatar = async (userId: string, file: File): Promise<string | null> => {
    if (!supabase) return null;
    const filePath = `public/${userId}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from('avatars').upload(filePath, file);
    if (error) {
        console.error('Error uploading avatar:', error);
        return null;
    }
    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    return data.publicUrl;
};

export const getUserByName = async (name: string): Promise<User | null> => {
    if (!supabase) return null;
    const { data, error } = await supabase.from('users').select('*').eq('name', name).single();
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error fetching user by name:', error);
    }
    return data;
};

export const createUser = async (name: string, avatar_url?: string): Promise<User | null> => {
    if (!supabase) return null;
    const { data, error } = await supabase.from('users').insert({ name, avatar_url, unlocked_achievements: [] }).select().single();
    if (error) {
        console.error('Error creating user:', error);
        return null;
    }
    return data;
};

export const loadInitialData = async (userId: string) => {
    if (!supabase) return null;
    
    const userPromise = supabase.from('users').select('*').eq('id', userId).single();
    const storyStatesPromise = supabase.from('story_states').select('book_id, state').eq('user_id', userId);
    const userBooksPromise = supabase.from('user_generated_books').select('*').eq('user_id', userId);
    
    const [userResult, storyStatesResult, userBooksResult] = await Promise.all([userPromise, storyStatesPromise, userBooksPromise]);

    if (userResult.error || !userResult.data) {
        console.error("Failed to load user data", userResult.error);
        return null;
    }

    const storyStatesMap: Record<string, StoryState> = {};
    if (storyStatesResult.data) {
        storyStatesResult.data.forEach(row => {
            storyStatesMap[row.book_id] = row.state as StoryState;
        });
    }

    return {
        user: userResult.data as User,
        storyStates: storyStatesMap,
        userBooks: (userBooksResult.data || []).map(b => ({...b, isUserGenerated: true})) as UserGeneratedBook[],
    };
};

export const upsertStoryState = async (userId: string, bookId: string, state: StoryState) => {
    if (!supabase) return;
    const { error } = await supabase.from('story_states').upsert({ user_id: userId, book_id: bookId, state }, { onConflict: 'user_id, book_id' });
    if (error) {
        console.error('Error saving story state:', error);
    }
};

export const saveUserGeneratedBook = async (userId: string, book: Omit<UserGeneratedBook, 'id' | 'user_id' | 'isUserGenerated'>): Promise<UserGeneratedBook | null> => {
    if (!supabase) return null;
    const bookToInsert = { ...book, user_id: userId };
    const { data, error } = await supabase.from('user_generated_books').insert(bookToInsert).select().single();
    if (error) {
        console.error('Error saving user generated book:', error);
        return null;
    }
    return data;
};

export const updateUser = async (userId: string, updates: Partial<Omit<User, 'id'>>) => {
    if (!supabase) return;
    const { error } = await supabase.from('users').update(updates).eq('id', userId);
    if (error) {
        console.error('Error updating user:', error);
    }
};