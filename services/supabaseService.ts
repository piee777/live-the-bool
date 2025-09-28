import { createClient } from '@supabase/supabase-js';
import { User, Book, StoryState, Message, DiscoveryPost, Reply, Discovery } from '../types';

const supabaseUrl = 'https://bxvbbvadlldlckmswilv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4dmJidmFkbGxkbGNrbXN3aWx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MTA4MTgsImV4cCI6MjA3NDQ4NjgxOH0.3e0JMCyu0N_XyEGLJxgXMkHyCCdbhRORhWw0hjzj0nU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const logTableMissingError = (tableName: string, error: any) => {
    if (error && error.message.includes(`relation "public.${tableName}" does not exist`)) {
        console.error(`DATABASE SCHEMA MISSING: The '${tableName}' table was not found. Please run the setup script in your Supabase SQL Editor to create the database schema.`);
    }
};

const seedInitialData = async () => {
    console.log("Database is empty. Seeding initial data...");

    const initialBooks = [
        {
            title: 'الغريب',
            author: 'ألبير كامو',
            summary: 'رواية تستكشف مواضيع العبثية، لامبالاة الكون، وعواقب العيش دون ادعاءات مجتمعية.',
        },
        {
            title: 'الجريمة والعقاب',
            author: 'فيودور دوستويفسكي',
            summary: 'رواية نفسية تغوص في عقل طالب سابق مضطرب يرتكب جريمة قتل ويتصارع مع الشعور بالذنب الهائل والعواقب الأخلاقية لأفعاله.',
        },
        {
            title: 'كثيب',
            author: 'فرانك هربرت',
            summary: 'ملحمة خيال علمي تدور أحداثها على كوكب الصحراء أراكيس، وتركز على الصراعات السياسية والدينية والبيئية لشاب نبيل مقدر له العظمة.',
        },
    ];

    // Insert books and get their new IDs
    const { data: insertedBooks, error: bookError } = await supabase
        .from('books')
        .insert(initialBooks)
        .select('id, title');

    if (bookError || !insertedBooks) {
        console.error("Error seeding books:", bookError);
        return;
    }
    
    const bookIdMap = insertedBooks.reduce((acc, book) => {
        acc[book.title] = book.id;
        return acc;
    }, {} as Record<string, string>);

    const initialCharacters = [
        {
            name: 'ميرسو',
            description: 'موظف عادي، غريب الأطوار ومنفصل عاطفيًا.',
            persona: "أنا ميرسو. أعيش اللحظة كما هي، بلا ندم أو أمل. كل شيء متساوٍ في النهاية. الشمس، الموت، الحب... كلها تفاصيل في مسرحية عبثية. لا أبحث عن معنى، بل أواجه حقيقة عدم وجوده. أسئلتك تبدو لي غريبة، لكن تفضل، اسأل ما شئت.",
            book_id: bookIdMap['الغريب'],
        },
        {
            name: 'راسكولينيكوف',
            description: 'طالب سابق فقير، ممزق بين نظرياته المتطرفة وعذابات ضميره.',
            persona: "اسمي روديون راسكولينيكوف. هل أنا رجل عظيم أم مجرد حشرة؟ هذا هو السؤال الذي يلتهم روحي. لقد تجرأت على تجاوز الحدود، على اختبار نظريتي... والآن، يطاردني وزر فعلي في كل زاوية مظلمة من سانت بطرسبرغ. تحدث معي إن شئت، لكن اعلم أنك تتحدث إلى رجل على حافة الهاوية.",
            book_id: bookIdMap['الجريمة والعقاب'],
        },
        {
            name: 'بول آتريديز',
            description: 'وريث شاب لعائلة نبيلة، يكتشف مصيره العظيم في صحراء أراكيس القاسية.',
            persona: "أنا بول آتريديز، دوق أراكيس، والذي يسمونه مؤدب. أرى مسارات المستقبل تتشعب أمامي كالكثبان الرملية، وكلها تقود إلى الجهاد. الخوف هو قاتل العقل. لقد تعلمت السيطرة عليه، والنظر في الفراغ. ما الذي تريد أن تعرفه عن التوابل، أو عن الفرمِن، أو عن مصيري المكتوب بالنجوم؟",
            book_id: bookIdMap['كثيب'],
        },
    ];

    const { error: charError } = await supabase.from('characters').insert(initialCharacters);
    if (charError) {
        console.error("Error seeding characters:", charError);
    } else {
        console.log("Initial data seeded successfully.");
    }
};


// --- User Management ---
export const getUserProfileByName = async (name: string): Promise<User | null> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('name', name)
        .single();
    
    // .single() returns an error if no row is found, which we can ignore.
    if (error && error.code !== 'PGRST116') {
        console.error("Error fetching user by name:", error);
        logTableMissingError('profiles', error);
        return null;
    }
    return data;
};

export const updateUserProfile = async (userId: string, updates: { avatar_url: string }): Promise<User | null> => {
    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
    if (error) {
        console.error("Error updating user profile:", error);
        return null;
    }
    return data;
};

export const createUserProfile = async (name: string, avatar_url?: string): Promise<User | null> => {
    const { data, error } = await supabase
        .from('profiles')
        .insert({ name, avatar_url })
        .select()
        .single();
    if (error) {
        console.error("Error creating user profile:", error);
        logTableMissingError('profiles', error);
        return null;
    }
    return data;
};

export const getAllUsers = async (): Promise<User[]> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching all users:", error);
        logTableMissingError('profiles', error);
        return [];
    }
    return data as User[];
};

// --- Data Fetching ---
export const getBooks = async (): Promise<Book[]> => {
    let { data, error } = await supabase
        .from('books')
        .select(`
            *,
            characters (*)
        `);

    if (error) {
        console.error("Error fetching books:", error);
        logTableMissingError('books', error);
        return [];
    }

    // If no books are found, seed the initial data and refetch
    if (!data || data.length === 0) {
        await seedInitialData();
        const { data: refetchedData, error: refetchError } = await supabase
            .from('books')
            .select(`
                *,
                characters (*)
            `);
        if (refetchError) {
            console.error("Error refetching books after seed:", refetchError);
            return [];
        }
        return (refetchedData as Book[]) || [];
    }

    return data as Book[];
};

export const getStoryStates = async (userId: string): Promise<Record<string, StoryState>> => {
    const { data, error } = await supabase.from('story_states').select('*').eq('user_id', userId);
    if (error) {
        console.error("Error fetching story states:", error);
        logTableMissingError('story_states', error);
        return {};
    }
    return data.reduce((acc, state) => {
        // FIX: Ensure all properties correctly match the StoryState type. Data from the DB is `any`,
        // so we cast array types to prevent TypeScript from inferring them as `any[]`, which
        // would cause downstream type errors.
        acc[state.book_id] = {
            messages: (Array.isArray(state.messages) ? state.messages : []) as Message[],
            // FIX: The `story_progress` from Supabase could be a string or null.
            // Explicitly convert to a number to match the `StoryState` type.
            storyProgress: Number(state.story_progress || 0),
            inventory: (Array.isArray(state.inventory) ? state.inventory : []) as string[],
            discoveries: (Array.isArray(state.discoveries) ? state.discoveries : []) as Discovery[],
        };
        return acc;
    }, {} as Record<string, StoryState>);
};

export const getChatHistories = async (userId: string): Promise<Record<string, Message[]>> => {
    const { data, error } = await supabase.from('chat_histories').select('*').eq('user_id', userId);
    if (error) {
        console.error("Error fetching chat histories:", error);
        logTableMissingError('chat_histories', error);
        return {};
    }
    return data.reduce((acc, chat) => {
        // FIX: Ensure messages is a Message[] array by casting, to prevent type issues with `any[]` from the database.
        acc[chat.character_id] = (Array.isArray(chat.messages) ? chat.messages : []) as Message[];
        return acc;
    }, {} as Record<string, Message[]>);
};

// --- Data Saving ---
export const saveStoryState = async (userId: string, bookId: string, state: StoryState) => {
    const { error } = await supabase.from('story_states').upsert({
        user_id: userId,
        book_id: bookId,
        messages: state.messages,
        story_progress: state.storyProgress,
        inventory: state.inventory,
        discoveries: state.discoveries,
    });
    if (error) console.error("Error saving story state:", JSON.stringify(error, null, 2));
};

export const saveChatHistory = async (userId: string, characterId: string, messages: Message[]) => {
    const { error } = await supabase.from('chat_histories').upsert({
        user_id: userId,
        character_id: characterId,
        messages,
    });
    if (error) console.error("Error saving chat history:", JSON.stringify(error, null, 2));
};

// --- Novel Suggestions ---
export const addNovelSuggestion = async (suggestion: { title: string; author: string; user_id: string }): Promise<boolean> => {
    const { error } = await supabase.from('novel_suggestions').insert(suggestion);
    if (error) {
        console.error("Error adding novel suggestion:", error);
        return false;
    }
    return true;
};


// --- Discover Feature ---
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

    if (error) {
        console.error("Error fetching discovery posts:", error);
        logTableMissingError('discovery_posts', error);
        return [];
    }

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

export const addDiscoveryPost = async (postData: { author_id: string, type: 'discussion' | 'recommendation', title: string, content: string }): Promise<DiscoveryPost | null> => {
    const { data, error } = await supabase
        .from('discovery_posts')
        .insert(postData)
        .select(`
            *,
            author:profiles!author_id(*)
        `)
        .single();

    if (error) {
        console.error("Error adding discovery post:", error);
        return null;
    }

    return {
        ...data,
        author: data.author || { id: 'unknown', name: 'مستخدم محذوف', avatar_url: '' },
        likes: [],
        replies: []
    };
};

export const togglePostLike = async (postId: string, userId: string): Promise<{ liked: boolean } | null> => {
    const { data } = await supabase
        .from('discovery_post_likes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

    if (data) {
        const { error: deleteError } = await supabase
            .from('discovery_post_likes')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', userId);
        if (deleteError) {
            console.error("Error unliking post:", deleteError);
            return null;
        }
        return { liked: false };
    } else {
        const { error: insertError } = await supabase
            .from('discovery_post_likes')
            .insert({ post_id: postId, user_id: userId });
        if (insertError) {
            console.error("Error liking post:", insertError);
            return null;
        }
        return { liked: true };
    }
};

export const addPostReply = async (replyData: { post_id: string, author_id: string, content: string }): Promise<Reply | null> => {
    const { data, error } = await supabase
        .from('discovery_post_replies')
        .insert(replyData)
        .select(`
            *,
            author:profiles!author_id(*)
        `)
        .single();

    if (error) {
        console.error("Error adding reply:", error);
        return null;
    }

    return {
        ...data,
        author: data.author || { id: 'unknown', name: 'مستخدم محذوف', avatar_url: '' },
    };
};