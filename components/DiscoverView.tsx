import React, { useState } from 'react';
import { DiscoveryPost, User, Reply } from '../types';

interface DiscoverViewProps {
    posts: DiscoveryPost[];
    currentUser: User;
    onAddPost: (postData: Omit<DiscoveryPost, 'id' | 'author' | 'timestamp' | 'likes' | 'replies'>) => void;
    onLikePost: (postId: string) => void;
    onAddReply: (postId: string, replyText: string) => void;
}

const TimeAgo: React.FC<{ timestamp: number }> = ({ timestamp }) => {
    const now = Date.now();
    const seconds = Math.floor((now - timestamp) / 1000);

    if (seconds < 60) return <span className="font-arabic">الآن</span>;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return <span className="font-arabic">قبل {minutes} د</span>;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return <span className="font-arabic">قبل {hours} س</span>;
    const days = Math.floor(hours / 24);
    return <span className="font-arabic">قبل {days} ي</span>;
};

const PostCard: React.FC<{ 
    post: DiscoveryPost; 
    currentUser: User;
    onLike: (postId: string) => void;
    onAddReply: (postId: string, replyText: string) => void;
}> = ({ post, currentUser, onLike, onAddReply }) => {
    const [isRepliesOpen, setIsRepliesOpen] = useState(false);
    const [replyText, setReplyText] = useState('');
    
    const isLiked = post.likes.includes(currentUser.id);
    const isRecommendation = post.type === 'recommendation';

    const handleReplySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim()) return;
        onAddReply(post.id, replyText);
        setReplyText('');
    };
    
    const sortedReplies = [...post.replies].reverse();

    return (
        <div className={`w-full rounded-2xl border border-white/10 shadow-lg animate-fade-in-up transition-colors ${isRecommendation ? 'bg-gradient-to-br from-amber-800/40 to-amber-950/30' : 'bg-[#1A1A1A]'}`}>
            <div className="p-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-bg-dark border-2 border-white/20 flex items-center justify-center overflow-hidden">
                        {post.author.avatar_url ? (
                            <img src={post.author.avatar_url} alt={post.author.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="font-bold text-lg text-brand-text-medium">{post.author.name.charAt(0)}</span>
                        )}
                    </div>
                    <div>
                        <p className="font-bold font-arabic text-brand-text-light">{post.author.name}</p>
                        <p className="text-xs text-brand-text-dark font-mono"><TimeAgo timestamp={post.timestamp} /></p>
                    </div>
                </div>

                <div className="my-3">
                    <h3 className="font-bold font-arabic text-lg text-brand-text-light flex items-center break-words">
                        {isRecommendation && <span className="text-yellow-400 mr-2 text-lg">⭐</span>}
                        {post.title}
                    </h3>
                    <p className="text-brand-text-medium font-arabic mt-1 text-sm leading-relaxed line-clamp-2 break-words">{post.content}</p>
                </div>

                <div className="flex items-center gap-4 border-t border-white/10 pt-3">
                    <button onClick={() => onLike(post.id)} className={`flex items-center gap-1.5 font-bold text-sm transition-all ${isLiked ? 'text-brand-hot-orange' : 'text-brand-text-dark hover:text-white'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isLiked ? 'drop-shadow-[0_0_4px_theme(colors.brand-hot-orange)]' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" style={{ opacity: isLiked ? 1 : 0.4 }} />
                        </svg>
                        <span>{post.likes.length}</span>
                    </button>
                    <button onClick={() => setIsRepliesOpen(!isRepliesOpen)} className="flex items-center gap-1.5 font-bold text-sm text-brand-text-dark hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-70" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                        </svg>
                        <span>{post.replies.length}</span>
                    </button>
                </div>
            </div>

            {isRepliesOpen && (
                <div className="bg-brand-bg-dark/50 p-4 border-t border-white/10 space-y-4">
                    {sortedReplies.map(reply => (
                        <div key={reply.id} className="flex items-start gap-2 animate-fade-in">
                             <div className="w-8 h-8 rounded-full bg-brand-surface-dark border-2 border-white/20 flex items-center justify-center overflow-hidden flex-shrink-0 mt-1">
                                {reply.author.avatar_url ? <img src={reply.author.avatar_url} alt={reply.author.name} className="w-full h-full object-cover" /> : <span className="font-bold text-sm text-brand-text-medium">{reply.author.name.charAt(0)}</span>}
                            </div>
                            <div className="bg-brand-bg-dark p-2 px-3 rounded-lg flex-1">
                                <div className="flex items-baseline gap-2">
                                    <p className="font-bold text-sm font-arabic text-brand-text-light">{reply.author.name}</p>
                                    <p className="text-xs text-brand-text-dark font-mono"><TimeAgo timestamp={reply.timestamp}/></p>
                                </div>
                                <p className="text-sm font-arabic text-brand-text-medium mt-1 whitespace-pre-wrap break-words">{reply.content}</p>
                            </div>
                        </div>
                    ))}
                    <form onSubmit={handleReplySubmit} className="flex items-center gap-2 pt-2">
                        <div className="w-8 h-8 rounded-full bg-brand-surface-dark border-2 border-white/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                           {currentUser.avatar_url ? <img src={currentUser.avatar_url} alt={currentUser.name} className="w-full h-full object-cover" /> : <span className="font-bold text-sm text-brand-text-medium">{currentUser.name.charAt(0)}</span>}
                        </div>
                        <input value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="أضف ردًا..." className="flex-1 p-2 px-3 bg-brand-bg-dark border border-slate-700 rounded-full focus:outline-none focus:ring-1 focus:ring-amber-600 text-sm font-arabic text-white" />
                        <button type="submit" className="text-brand-hot-orange font-bold font-arabic text-sm px-3 disabled:opacity-50" disabled={!replyText.trim()}>إرسال</button>
                    </form>
                </div>
            )}
        </div>
    );
};

const CreatePostModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAddPost: (postData: Omit<DiscoveryPost, 'id' | 'author' | 'timestamp' | 'likes' | 'replies'>) => void;
    currentUser: User;
}> = ({ isOpen, onClose, onAddPost, currentUser }) => {
    const [content, setContent] = useState('');
    const [postType, setPostType] = useState<'discussion' | 'recommendation'>('discussion');
    const [isFocused, setIsFocused] = useState(false);
    const MAX_CHARS = 200;

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!content.trim()) return;
        const title = content.trim().split(/\s+/).slice(0, 5).join(' ');
        onAddPost({ title, content, type: postType });
        setContent('');
        setPostType('discussion');
        onClose();
    };
    
    const progress = (content.length / MAX_CHARS) * 100;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div 
                className={`relative w-full max-w-lg rounded-2xl p-0.5 bg-gradient-to-r from-brand-amber to-brand-crimson transition-all duration-300 ${isFocused ? 'shadow-[0_0_25px_rgba(255,111,97,0.4)]' : 'shadow-2xl'}`}
                onClick={e => e.stopPropagation()}
            >
                <div className="bg-[#1E1E1E] rounded-[15px] p-6 space-y-4">
                    <button onClick={onClose} className="absolute top-3 right-3 text-brand-text-dark hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                   
                   <div className="flex items-start gap-4">
                       <div className="w-12 h-12 rounded-full bg-brand-bg-dark border-2 border-white/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {currentUser.avatar_url ? (
                                <img src={currentUser.avatar_url} alt={currentUser.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="font-bold text-lg text-brand-text-medium">{currentUser.name.charAt(0)}</span>
                            )}
                        </div>
                        <textarea
                            value={content}
                            onChange={e => {
                                if (e.target.value.length <= MAX_CHARS) {
                                    setContent(e.target.value);
                                }
                            }}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder="✨ شارك فكرة او ترشيح..."
                            className="w-full h-24 p-0 bg-transparent resize-none focus:outline-none text-white placeholder-brand-text-dark font-arabic text-lg"
                            rows={3}
                            autoFocus
                        />
                   </div>

                    <div className="flex items-center justify-center gap-4">
                        <button onClick={() => setPostType('discussion')} className={`px-4 py-2 text-sm font-bold font-arabic rounded-full transition-all ${postType === 'discussion' ? 'bg-brand-amber text-white shadow-md' : 'bg-brand-bg-dark text-brand-text-medium hover:bg-brand-surface-dark'}`}>
                           💬 مناقشة
                        </button>
                        <button onClick={() => setPostType('recommendation')} className={`px-4 py-2 text-sm font-bold font-arabic rounded-full transition-all ${postType === 'recommendation' ? 'bg-brand-amber text-white shadow-md' : 'bg-brand-bg-dark text-brand-text-medium hover:bg-brand-surface-dark'}`}>
                           ⭐ ترشيح
                        </button>
                    </div>

                    <div className="flex items-center justify-between gap-4 pt-2 border-t border-white/10">
                        <div className="w-full bg-brand-bg-dark rounded-full h-1.5">
                            <div className="bg-gradient-to-r from-brand-amber to-brand-crimson h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                        </div>
                        <button 
                            onClick={handleSubmit}
                            className="w-14 h-14 rounded-full bg-brand-hot-orange text-white flex-shrink-0 flex items-center justify-center shadow-lg shadow-brand-hot-orange/40 hover:shadow-glow-hot-orange transition-all transform hover:scale-110 disabled:opacity-50 disabled:scale-100"
                            disabled={!content.trim()}
                        >
                            <span className="text-2xl drop-shadow-lg">✨</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


export const DiscoverView: React.FC<DiscoverViewProps> = ({ posts, currentUser, onAddPost, onLikePost, onAddReply }) => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    return (
        <div className="relative p-4 sm:p-6 w-full h-full overflow-y-auto animate-fade-in">
            <div className="max-w-xl mx-auto space-y-6 pb-24">
                <h2 className="text-3xl text-left font-bold font-arabic">اكتشف</h2>

                {posts.map(post => (
                    <PostCard key={post.id} post={post} currentUser={currentUser} onLike={onLikePost} onAddReply={onAddReply} />
                ))}
                {posts.length === 0 && (
                    <div className="text-center p-12 text-brand-text-medium border-2 border-dashed border-slate-700 rounded-xl">
                        <p className="font-arabic text-lg">لا توجد منشورات حتى الآن.</p>
                        <p className="font-arabic mt-1">كن أول من يشارك فكرة أو يرشح كتابًا!</p>
                    </div>
                )}
            </div>
            
            <CreatePostModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onAddPost={onAddPost}
                currentUser={currentUser}
            />

            <button
                onClick={() => setIsCreateModalOpen(true)}
                className="fixed bottom-24 right-6 bg-brand-hot-orange text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg shadow-brand-hot-orange/50 hover:shadow-glow-hot-orange focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg-dark focus:ring-brand-hot-orange transition-all transform hover:scale-110 z-30"
                aria-label="إضافة منشور جديد"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
            </button>
        </div>
    );
};
