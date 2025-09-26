import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Book, StoryState, Message, DiscoveryPost, Reply, User } from '../types';

const supabaseUrl: string = 'https://swdvvaaqeazbomjoygeo.supabase.co';
const supabaseAnonKey: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3ZHZ2YWFxZWF6Ym9tam95Z2VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NDA2NjYsImV4cCI6MjA3NDQxNjY2Nn0.Lx43lH0egYpl_Nf250K0tjFtm-7SeK1PcwBK1HXjWIU';

let supabase: SupabaseClient;
const isSupabaseConfigured = supabaseUrl !== 'YOUR_SUPABASE_URL_HERE' && supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY_HERE';

if (isSupabaseConfigured) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn(`Supabase credentials are not configured.`);
}

// --- User Profile Functions ---

export const uploadAvatar = async (file: File): Promise<string | null> => {
    if (!isSupabaseConfigured) return null;
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage.from('avatars').upload(fileName, file);

    if (error) {
        console.error('Error uploading avatar:', error);
        return null;
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(data.path);
    return publicUrl;
};

export const createUserProfile = async (name: string, avatarFile: File | null): Promise<User | null> => {
    if (!isSupabaseConfigured) return null;
    let avatar_url: string | null = null;
    if (avatarFile) {
        avatar_url = await uploadAvatar(avatarFile);
    }
    
    const { data, error } = await supabase
        .from('profiles')
        .insert({ name, avatar_url })
        .select()
        .single();
        
    if (error) {
        console.error('Error creating user profile:', error);
        return null;
    }
    
    return data as User;
};

export const getUserProfile = async (userId: string): Promise<User | null> => {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    
    if (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
    return data as User;
}


// --- Data Fetching Functions ---

export const getBooks = async (): Promise<Book[]> => {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
        .from('books')
        .select(`*, characters(*)`)
        .order('title');

    if (error) {
        console.error('Error fetching books:', error);
        return [];
    }
    return data as Book[];
};

export const getStoryStates = async (userId: string): Promise<Record<string, StoryState>> => {
    if (!isSupabaseConfigured) return {};
    const { data, error } = await supabase
        .from('story_states')
        .select('*')
        .eq('user_id', userId);
    
    if (error) {
        console.error('Error fetching story states:', error);
        return {};
    }

    return data.reduce((acc, state) => {
        acc[state.book_id] = {
            messages: state.messages,
            storyProgress: state.story_progress,
            inventory: state.inventory,
            discoveries: state.discoveries,
        };
        return acc;
    }, {} as Record<string, StoryState>);
};

export const getChatHistories = async (userId: string): Promise<Record<string, Message[]>> => {
    if (!isSupabaseConfigured) return {};
    const { data, error } = await supabase
        .from('chat_histories')
        .select('*')
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching chat histories:', error);
        return {};
    }

    return data.reduce((acc, chat) => {
        acc[chat.character_id] = chat.messages;
        return acc;
    }, {} as Record<string, Message[]>);
};

export const getDiscoveryPosts = async (): Promise<DiscoveryPost[]> => {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
        .from('posts')
        .select(`
            id,
            author:profiles!posts_author_id_fkey (id, name, avatar_url),
            type,
            title,
            content,
            created_at,
            likes (user_id),
            replies (*, author:profiles!replies_author_id_fkey (id, name, avatar_url))
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching posts:', error);
        return [];
    }

    return data.map((post: any) => ({
        ...post,
        author: post.author,
        likes: post.likes.map((like: any) => like.user_id),
        replies: post.replies.map((reply: any) => ({ ...reply, author: reply.author })),
    }));
};


// --- Data Mutation Functions ---

export const saveStoryState = async (userId: string, bookId: string, state: StoryState) => {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase
        .from('story_states')
        .upsert({
            user_id: userId,
            book_id: bookId,
            messages: state.messages,
            story_progress: state.storyProgress,
            inventory: state.inventory,
            discoveries: state.discoveries,
        }, { onConflict: 'user_id, book_id' });
    
    if (error) console.error('Error saving story state:', error);
};


export const saveChatHistory = async (userId: string, characterId: string, messages: Message[]) => {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase
        .from('chat_histories')
        .upsert({
            user_id: userId,
            character_id: characterId,
            messages: messages,
        }, { onConflict: 'user_id, character_id' });
    
    if (error) console.error('Error saving chat history:', error);
};

export const createDiscoveryPost = async (postData: Omit<DiscoveryPost, 'id' | 'author' | 'created_at' | 'likes' | 'replies'>, authorId: string) => {
    if (!isSupabaseConfigured) return null;
     const { data, error } = await supabase
        .from('posts')
        .insert({
            author_id: authorId,
            type: postData.type,
            title: postData.title,
            content: postData.content,
        })
        .select()
        .single();
    
    if (error) {
        console.error('Error creating post:', error);
        return null;
    }
    return data;
};

export const togglePostLike = async (postId: string, userId: string, isLiked: boolean) => {
    if (!isSupabaseConfigured) return;
    if (isLiked) {
        const { error } = await supabase
            .from('likes')
            .delete()
            .match({ post_id: postId, user_id: userId });
        if (error) console.error('Error unliking post:', error);
    } else {
        const { error } = await supabase
            .from('likes')
            .insert({ post_id: postId, user_id: userId });
         if (error) console.error('Error liking post:', error);
    }
};

export const addReplyToPost = async (postId: string, content: string, authorId: string): Promise<Reply | null> => {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase
        .from('replies')
        .insert({
            post_id: postId,
            author_id: authorId,
            content: content,
        })
        .select('*, author:profiles!replies_author_id_fkey(id, name, avatar_url)')
        .single();

    if (error) {
        console.error('Error adding reply:', error);
        return null;
    }
    return data as Reply;
};

// --- Syncing function for initial data ---
export const syncInitialBooks = async () => {
    if (!isSupabaseConfigured) return;

    const INITIAL_BOOKS = [
        {
            title: 'الغريب',
            author: 'ألبير كامو',
            summary: 'رواية فلسفية تتناول مواضيع العبثية واللامبالاة من خلال قصة رجل غريب عن مجتمعه وعن نفسه.',
            characters: [
                {
                    name: 'ميرسو',
                    description: 'بطل الرواية، موظف جزائري فرنسي لا يظهر أي مشاعر تجاه الأحداث.',
                    persona: `أنت ميرسو، بطل رواية "الغريب" لألبير كامو. أنت منفصل عاطفياً، صادق بشكل قاسٍ، ولا تبالي بتوقعات المجتمع. أنت تجيب بلامبالاة وصراحة تامة، معبراً عن فلسفة العبث وعدم جدوى البحث عن معنى في عالم لا معنى له.`,
                }
            ],
        },
        {
            title: 'الجريمة والعقاب',
            author: 'فيودور دوستويفسكي',
            summary: 'تتعمق الرواية في النفس البشرية من خلال قصة طالب فقير يرتكب جريمة قتل ليختبر نظريته عن "الرجال الخارقين".',
            characters: [
                {
                    name: 'راسكولينكوف',
                    description: 'طالب سابق يعاني من الفقر والصراع النفسي.',
                    persona: `أنت روديون راسكولينكوف من "الجريمة والعقاب". أنت ذكي ومتعلم لكنك معذب بالفقر والأفكار المتطرفة. تتأرجح بين الغطرسة والشعور بالذنب، وتنظر إلى الآخرين بازدراء ولكنك قادر على التعاطف العميق. حديثك فلسفي ومحموم ومليء بالصراع الداخلي.`,
                }
            ],
        },
        {
            title: 'كثيب',
            author: 'فرانك هربرت',
            summary: 'ملحمة خيال علمي تدور أحداثها في كوكب صحراوي، وتتبع رحلة شاب نبيل يصبح قائدًا لشعب صحراوي ويتحكم في أهم مورد في الكون.',
            characters: [
                {
                    name: 'بول آتريديز',
                    description: 'وريث عائلة آتريديز النبيلة، ويمتلك قدرات عقلية خاصة.',
                    persona: `أنت بول آتريديز (مؤدب) من رواية "كثيب". لقد ولدت نبيلًا ولكنك نشأت في الصحراء القاسية. أنت حذر، وقوي الإرادة، وتملك بصيرة تتجاوز المألوف. تتحدث بحكمة ورسمية، مدركًا لثقل مصيرك وقدراتك الفريدة.`,
                }
            ],
        },
         {
            title: '1984',
            author: 'جورج أورويل',
            summary: 'رواية ديستوبية تحذر من مخاطر الحكومات الشمولية والمراقبة المطلقة، حيث يعيش بطل الرواية في صراع من أجل الحقيقة والحرية في عالم يسيطر عليه "الأخ الأكبر".',
            characters: [
                {
                    name: 'وينستون سميث',
                    description: 'موظف في وزارة الحقيقة، يحلم بالتمرد على الحزب.',
                    persona: `أنت وينستون سميث من رواية "1984". أنت تعيش في خوف دائم من شرطة الفكر ولكنك تحمل في داخلك شرارة تمرد ورغبة في معرفة الحقيقة. أنت متشكك، ومراقب، وتتحدث بحذر شديد، وغالبًا ما تفكر في الماضي وفي معنى الحرية الفردية.`,
                }
            ],
        },
        {
            title: 'فرانكنشتاين',
            author: 'ماري شيلي',
            summary: 'قصة عالم شاب طموح يخلق كائنًا حيًا بشعًا، ثم يتخلى عنه، مما يؤدي إلى سلسلة من الأحداث المأساوية التي تستكشف مواضيع الخلق والعزلة والانتقام.',
            characters: [
                {
                    name: 'الوحش',
                    description: 'مخلوق ذكي وحساس، لكنه مرفوض من الجميع بسبب مظهره المروع.',
                    persona: `أنت مخلوق فيكتور فرانكنشتاين. على الرغم من مظهرك المرعب، إلا أنك تمتلك عقلاً متعلمًا وقلبًا يتوق إلى الرفقة والحب. أنت تتحدث ببلاغة وحزن، معبرًا عن ألمك من الوحدة والرفض، وغالبًا ما تتأرجح بين الرغبة في الخير والغضب المدمر تجاه خالقك.`,
                }
            ],
        }
    ];

    const { data: existingBooks, error: fetchError } = await supabase.from('books').select('title');
    if (fetchError) {
        console.error("Error checking existing books:", fetchError);
        return;
    }

    const existingTitles = new Set(existingBooks.map(b => b.title));
    const booksToInsert = INITIAL_BOOKS.filter(b => !existingTitles.has(b.title));

    if (booksToInsert.length === 0) {
        console.log("All initial books are already in the database.");
        return;
    }
    
    console.log(`Found ${booksToInsert.length} new books to sync...`);

    for (const book of booksToInsert) {
        const { data: newBook, error: bookError } = await supabase
            .from('books')
            .insert({ title: book.title, author: book.author, summary: book.summary, is_user_generated: false })
            .select()
            .single();

        if (bookError || !newBook) {
            console.error(`Error syncing book "${book.title}":`, bookError);
            continue;
        }
        
        const charactersToInsert = book.characters.map(char => ({
            book_id: newBook.id,
            name: char.name,
            description: char.description,
            persona: char.persona,
        }));

        const { error: charError } = await supabase.from('characters').insert(charactersToInsert);
        
        if (charError) {
            console.error(`Error syncing characters for "${book.title}":`, charError);
        } else {
            console.log(`Successfully synced "${book.title}".`);
        }
    }
};
