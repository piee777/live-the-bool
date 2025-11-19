
import type { Handler, HandlerEvent } from "@netlify/functions";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const handler: Handler = async (event: HandlerEvent) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    if (!supabaseUrl || !supabaseServiceKey) {
        return { statusCode: 500, body: JSON.stringify({ error: 'Server configuration error.' }) };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { action, payload } = JSON.parse(event.body || '{}');

    try {
        let data, error;

        switch (action) {
            case 'save_story_state':
                // payload: { userId, bookId, state }
                ({ data, error } = await supabase.from('story_states').upsert({
                    user_id: payload.userId,
                    book_id: payload.bookId,
                    messages: payload.state.messages,
                    story_progress: payload.state.storyProgress,
                    inventory: payload.state.inventory,
                    discoveries: payload.state.discoveries,
                    updated_at: new Date().toISOString()
                }));
                break;

            case 'save_chat_history':
                // payload: { userId, characterId, messages }
                ({ data, error } = await supabase.from('chat_histories').upsert({
                    user_id: payload.userId,
                    character_id: payload.characterId,
                    messages: payload.messages,
                    updated_at: new Date().toISOString()
                }));
                break;

            case 'add_novel_suggestion':
                // payload: { title, author, userId }
                ({ data, error } = await supabase.from('novel_suggestions').insert({
                    title: payload.title,
                    author: payload.author,
                    user_id: payload.userId
                }));
                break;
            
            case 'add_discovery_post':
                 // payload: postData
                ({ data, error } = await supabase.from('discovery_posts').insert(payload).select('*, author:profiles!author_id(*)').single());
                break;
            
            case 'toggle_like':
                // payload: { postId, userId }
                // First check if exists
                const { data: existingLike } = await supabase
                    .from('discovery_post_likes')
                    .select('*')
                    .eq('post_id', payload.postId)
                    .eq('user_id', payload.userId)
                    .single();

                if (existingLike) {
                    ({ error } = await supabase.from('discovery_post_likes').delete().eq('post_id', payload.postId).eq('user_id', payload.userId));
                    data = { liked: false };
                } else {
                    ({ error } = await supabase.from('discovery_post_likes').insert({ post_id: payload.postId, user_id: payload.userId }));
                    data = { liked: true };
                }
                break;

            case 'add_reply':
                // payload: replyData
                ({ data, error } = await supabase.from('discovery_post_replies').insert(payload).select('*, author:profiles!author_id(*)').single());
                break;

            default:
                return { statusCode: 400, body: JSON.stringify({ error: 'Invalid action' }) };
        }

        if (error) throw error;

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, data }),
            headers: { 'Content-Type': 'application/json' }
        };

    } catch (error: any) {
        console.error("User Action Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message || "Database operation failed" }),
        };
    }
};

export { handler };
