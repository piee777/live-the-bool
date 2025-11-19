import type { Handler, HandlerEvent } from "@netlify/functions";
import { createClient } from '@supabase/supabase-js';

// These should be set in your Netlify environment variables
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const handler: Handler = async (event: HandlerEvent) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    try {
        const { name, password, avatar_url } = JSON.parse(event.body || '{}');

        if (!name || !password) {
            return { statusCode: 400, body: JSON.stringify({ error: 'الاسم وكلمة المرور مطلوبان.' }) };
        }

        const hashedPassword = await hashPassword(password);

        // 1. Check if user exists
        const { data: existingUser, error: fetchError } = await supabase
            .from('profiles')
            .select('id, password_hash')
            .eq('name', name)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows found, which is fine for signup
            throw fetchError;
        }

        if (existingUser) { // LOGIN
            if (existingUser.password_hash !== hashedPassword) {
                return { statusCode: 401, body: JSON.stringify({ error: 'كلمة المرور غير صحيحة.' }) };
            }
            // Fetch full profile on successful login
            const { data: userProfile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', existingUser.id)
                .single();

            if (profileError) throw profileError;
            return { statusCode: 200, body: JSON.stringify({ user: userProfile }) };
            
        } else { // SIGNUP
            if (!avatar_url) {
                return { statusCode: 400, body: JSON.stringify({ error: 'الصورة الشخصية مطلوبة لإنشاء حساب جديد.' }) };
            }

            const { data: newUser, error: createError } = await supabase
                .from('profiles')
                .insert({ name, password_hash: hashedPassword, avatar_url })
                .select('*')
                .single();
            
            if (createError) {
                if (createError.message.includes('duplicate key')) {
                    return { statusCode: 409, body: JSON.stringify({ error: 'هذا الاسم مستخدم بالفعل.' }) };
                }
                throw createError;
            }

            return { statusCode: 201, body: JSON.stringify({ user: newUser }) };
        }

    } catch (error: any) {
        console.error("Auth function error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "حدث خطأ في الخادم. يرجى المحاولة مرة أخرى." }),
        };
    }
};

export { handler };
