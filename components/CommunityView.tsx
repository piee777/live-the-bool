import React, { useState, useRef, useEffect } from 'react';
import { User, Suggestion, LeaderboardUser, DebateTopic, CommunityStats } from '../types';
import { Leaderboard } from './Leaderboard';

interface PublicMessage {
    id: string;
    text: string;
    author: {
        id: string;
        name: string;
        avatar_url?: string;
    };
    timestamp: number;
    reactions?: Record<string, string[]>; // e.g. { '❤️': ['user-id-1'] }
}

const MOCK_MESSAGES: Record<string, PublicMessage[]> = {
    'general': [
        { id: 'm0', text: 'هذه رسالة من الأمس.', author: { id: 'user-2', name: 'أرسطو', avatar_url: `https://i.pravatar.cc/150?u=user2` }, timestamp: Date.now() - 86400000 },
        { id: 'm1', text: 'أهلاً بالجميع! رواية "الغريب" فتحت عيني على مفاهيم لم أفكر بها من قبل.', author: { id: 'user-2', name: 'أرسطو', avatar_url: `https://i.pravatar.cc/150?u=user2` }, timestamp: Date.now() - 60000 * 5, reactions: {'❤️': ['user-4']} },
        { id: 'm2', text: 'أتفق معك يا أرسطو. فكرة العبثية التي طرحها كامو صادمة ومنطقية في نفس الوقت.', author: { id: 'user-4', name: 'سيمون', avatar_url: `https://i.pravatar.cc/150?u=user4` }, timestamp: Date.now() - 60000 * 4 },
        { id: 'm3', text: 'هل يعتقد أحدكم أن ميرسو كان يستحق ما حدث له في النهاية؟', author: { id: 'user-5', name: 'سارتر', avatar_url: `https://i.pravatar.cc/150?u=user5` }, timestamp: Date.now() - 60000 * 2, reactions: {'🤔': ['user-2', 'user-4']} },
    ]
};

type CommunityTab = 'chat' | 'debates' | 'leaderboard' | 'suggestions' | 'stats';
type SuggestionFilter = 'popular' | 'newest' | 'mine';

const TABS: { id: CommunityTab, label: string, icon: React.ReactNode }[] = [
    { id: 'chat', label: 'نقاش حر', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V7a2 2 0 012-2h2.586a1 1 0 01.707.293l1.414 1.414a1 1 0 00.707.293H17z" /></svg> },
    { id: 'debates', label: 'مناظرات', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
    { id: 'leaderboard', label: 'المتصدّرون', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>},
    { id: 'suggestions', label: 'اقتراحات', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg> },
    { id: 'stats', label: 'إحصائيات', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /></svg> },
];


interface CommunityViewProps {
    currentUser: User;
    leaderboardUsers: LeaderboardUser[];
    suggestions: Suggestion[];
    userVotes: Record<string, 'up' | 'down'>;
    onAddSuggestion: (text: string) => void;
    onVote: (suggestionId: string, voteType: 'up' | 'down') => void;
    debateTopics: DebateTopic[];
    communityStats: CommunityStats;
}

export const CommunityView: React.FC<CommunityViewProps> = (props) => {
  const { currentUser, leaderboardUsers, suggestions, userVotes, onAddSuggestion, onVote, debateTopics, communityStats } = props;
  const [activeTab, setActiveTab] = useState<CommunityTab>('chat');

  const renderContent = () => {
    switch(activeTab) {
        case 'chat': return <ChatRoom currentUser={currentUser} />;
        case 'debates': return <DebatesRoom debates={debateTopics} />;
        case 'leaderboard': return <Leaderboard users={leaderboardUsers} currentUser={currentUser} />;
        case 'suggestions': return <SuggestionsRoom suggestions={suggestions} userVotes={userVotes} onVote={onVote} onAddSuggestion={onAddSuggestion} currentUser={currentUser} />;
        case 'stats': return <StatsRoom stats={communityStats} />;
        default: return null;
    }
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden animate-fade-in bg-brand-bg-dark">
        <div className="relative flex-shrink-0 flex justify-around border-b border-white/10 bg-brand-surface-dark/50 backdrop-blur-sm">
            {TABS.map(tab => (
                 <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`relative flex-1 p-4 font-bold font-arabic transition-colors text-xs sm:text-sm flex items-center justify-center gap-2 z-10 ${activeTab === tab.id ? 'text-amber-400' : 'text-brand-text-medium hover:text-white'}`}>
                    {tab.icon}
                    <span>{tab.label}</span>
                    {activeTab === tab.id && <div className="absolute bottom-0 h-1 w-full bg-brand-amber rounded-t-full shadow-[0_0_10px_theme(colors.amber.500)]"></div>}
                </button>
            ))}
        </div>
        <div className="flex-1 overflow-y-auto">
           {renderContent()}
        </div>
    </div>
  );
};

// --- Sub-components for each tab ---

const DateSeparator: React.FC<{ date: Date }> = ({ date }) => {
    const formatter = new Intl.DateTimeFormat('ar', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    return (
        <div className="flex items-center gap-4 my-4">
            <div className="flex-grow h-px bg-stone-700"></div>
            <span className="text-stone-400 text-xs font-bold font-arabic">{formatter.format(date)}</span>
            <div className="flex-grow h-px bg-stone-700"></div>
        </div>
    );
};
const ChatBubble: React.FC<{ message: PublicMessage; isCurrentUser: boolean; onReact: (msgId: string, emoji: string) => void; currentUser: User; }> = ({ message, isCurrentUser, onReact, currentUser }) => {
    const [showReactions, setShowReactions] = useState(false);
    const availableReactions = ['❤️', '😂', '👍', '🤔', '📌'];
    
    return (
        <div className={`group flex items-start gap-3 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`} onMouseEnter={() => setShowReactions(true)} onMouseLeave={() => setShowReactions(false)}>
            <div className="w-10 h-10 rounded-full bg-brand-surface-dark border-2 border-white/20 flex items-center justify-center overflow-hidden flex-shrink-0 self-end">
                {message.author.avatar_url ? <img src={message.author.avatar_url} alt={message.author.name} className="w-full h-full object-cover" /> : <span className="font-bold text-white">{message.author.name.charAt(0)}</span>}
            </div>
            <div className="relative">
                <div className={`p-3 px-4 rounded-2xl max-w-sm shadow-md text-white relative ${isCurrentUser ? 'bg-gradient-crimson-amber rounded-br-lg' : 'bg-brand-surface-dark text-brand-text-light rounded-bl-lg'}`}>
                    {!isCurrentUser && <p className="font-bold text-sm text-amber-400 font-arabic mb-1">{message.author.name}</p>}
                    <p className="font-arabic leading-relaxed whitespace-pre-wrap break-words">{message.text}</p>
                </div>
                {message.reactions && Object.keys(message.reactions).length > 0 && (
                     <div className="flex gap-1 mt-1 px-1">
                        {Object.entries(message.reactions).map(([emoji, users]) => (
                            <div key={emoji} className="bg-stone-800/50 rounded-full px-2 py-0.5 text-xs flex items-center gap-1">
                                <span>{emoji}</span>
                                <span className="text-white/80">{(users as string[]).length}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className={`transition-opacity duration-200 self-center ${showReactions ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                <div className="flex items-center gap-1 bg-stone-800 p-1 rounded-full shadow-lg border border-white/10">
                   {availableReactions.map(emoji => (
                       <button key={emoji} onClick={() => onReact(message.id, emoji)} className="p-1 rounded-full hover:bg-stone-700 transition-colors text-lg transform hover:scale-125">
                           {emoji}
                       </button>
                   ))}
                </div>
            </div>
        </div>
    );
};
const ChatRoom: React.FC<{ currentUser: User }> = ({ currentUser }) => {
    const [messages, setMessages] = useState<PublicMessage[]>(MOCK_MESSAGES.general);
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    useEffect(scrollToBottom, [messages]);
  
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim()) return;
        const newMessage: PublicMessage = { id: `msg-${Date.now()}`, text: inputText, author: currentUser, timestamp: Date.now() };
        setMessages(prev => ([...prev, newMessage]));
        setInputText('');
    };

    const handleReact = (msgId: string, emoji: string) => {
        setMessages(prevMessages => prevMessages.map(msg => {
            if (msg.id !== msgId) return msg;
            const reactions = { ...(msg.reactions || {}) };
            if (!reactions[emoji]) reactions[emoji] = [];
            const userIndex = reactions[emoji].indexOf(currentUser.id);
            if (userIndex > -1) {
                reactions[emoji].splice(userIndex, 1);
                if(reactions[emoji].length === 0) delete reactions[emoji];
            } else {
                reactions[emoji].push(currentUser.id);
            }
            return { ...msg, reactions };
        }));
    };
    
    const messagesWithSeparators: (PublicMessage | { type: 'separator', date: Date })[] = [];
    let lastDate: string | null = null;
    messages.forEach(msg => {
        const msgDate = new Date(msg.timestamp).toDateString();
        if (msgDate !== lastDate) {
            messagesWithSeparators.push({ type: 'separator', date: new Date(msg.timestamp) });
            lastDate = msgDate;
        }
        messagesWithSeparators.push(msg);
    });
  
    return (
      <div className="flex-1 flex flex-col h-full bg-brand-bg-dark">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesWithSeparators.map((item, index) => {
                  if ('type' in item && item.type === 'separator') {
                      return <DateSeparator key={`sep-${index}`} date={item.date} />;
                  }
                  const msg = item as PublicMessage;
                  return (
                      <ChatBubble 
                          key={msg.id} 
                          message={msg} 
                          isCurrentUser={msg.author.id === currentUser.id} 
                          onReact={handleReact}
                          currentUser={currentUser}
                      />
                  );
              })}
               <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSendMessage} className="flex-shrink-0 p-4 bg-brand-surface-dark/80 backdrop-blur-sm border-t border-white/10 flex items-center gap-3">
               <input type="text" value={inputText} onChange={e => setInputText(e.target.value)} placeholder="اكتب رسالتك هنا..." className="flex-1 p-3 px-5 bg-brand-bg-dark border-2 border-slate-700 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-600 transition-all text-brand-text-light placeholder-brand-text-dark font-arabic" />
               <button type="submit" className="bg-gradient-crimson-amber text-white rounded-full p-3 hover:shadow-glow-amber disabled:opacity-50 transition-all transform hover:scale-110 shadow-lg" disabled={!inputText.trim()}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform -rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
               </button>
          </form>
      </div>
    );
};

const SuggestionsRoom: React.FC<Omit<CommunityViewProps, 'leaderboardUsers' | 'debateTopics' | 'communityStats'>> = (props) => {
    const { suggestions, userVotes, onVote, onAddSuggestion, currentUser } = props;
    const [newSuggestionText, setNewSuggestionText] = useState('');
    const [filter, setFilter] = useState<SuggestionFilter>('popular');
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (newSuggestionText.trim()) {
          onAddSuggestion(newSuggestionText.trim());
          setNewSuggestionText('');
      }
    };

    const filteredSuggestions = [...suggestions].sort((a, b) => {
        if (filter === 'popular') return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
        if (filter === 'newest') return parseInt(b.id.split('-')[1]) - parseInt(a.id.split('-')[1]);
        return 0;
    }).filter(s => filter !== 'mine' || s.authorId === currentUser.id);

    return (
        <div className="p-4 sm:p-6 w-full h-full overflow-y-auto bg-brand-bg-dark">
            <div className="max-w-3xl mx-auto space-y-4">
            <form onSubmit={handleSubmit} className="p-4 bg-brand-surface-dark rounded-xl border border-white/10">
                <textarea
                    value={newSuggestionText}
                    onChange={(e) => setNewSuggestionText(e.target.value)}
                    placeholder="لديك فكرة لتحسين التطبيق؟ شاركها هنا..."
                    className="w-full p-3 bg-brand-bg-dark border-2 border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 font-arabic mb-3"
                    rows={2}
                />
                <button type="submit" className="w-full font-arabic bg-gradient-crimson-amber text-white py-2 px-6 rounded-lg shadow-lg hover:shadow-glow-amber transition-all disabled:opacity-50" disabled={!newSuggestionText.trim()}>
                    أضف اقتراحك
                </button>
            </form>

            <div className="flex items-center justify-center gap-2 p-2 bg-brand-surface-dark/50 rounded-full border border-white/10">
                {(['popular', 'newest', 'mine'] as SuggestionFilter[]).map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 text-sm font-bold font-arabic rounded-full transition-colors ${filter === f ? 'bg-brand-amber text-white' : 'text-brand-text-medium hover:bg-brand-surface-dark'}`}>
                        {f === 'popular' ? 'الأكثر تصويتاً' : f === 'newest' ? 'الأحدث' : 'اقتراحاتي'}
                    </button>
                ))}
            </div>

            {filteredSuggestions.map(s => {
                const userVote = userVotes[s.id];
                return (
                    <div key={s.id} className="p-5 bg-brand-surface-dark rounded-xl border border-white/10 transition-colors hover:border-amber-500/50">
                        <p className="text-brand-text-light font-arabic text-lg mb-4">{s.text}</p>
                        <div className="flex justify-between items-center">
                            <p className="text-xs text-brand-text-dark font-arabic">اقترحه: {s.authorName}</p>
                            <div className="flex items-center gap-3">
                                <button onClick={() => onVote(s.id, 'up')} className={`flex items-center gap-1.5 p-1.5 px-3 rounded-full transition-colors text-sm ${userVote === 'up' ? 'bg-brand-amber/20 text-brand-amber' : 'bg-stone-800 text-brand-text-medium hover:bg-stone-700'}`}>
                                    <span role="img">👍</span> {s.upvotes}
                                </button>
                                <button onClick={() => onVote(s.id, 'down')} className={`flex items-center gap-1.5 p-1.5 px-3 rounded-full transition-colors text-sm ${userVote === 'down' ? 'bg-brand-crimson/20 text-red-400' : 'bg-stone-800 text-brand-text-medium hover:bg-stone-700'}`}>
                                    <span role="img">👎</span> {s.downvotes}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
            </div>
        </div>
    )
}

const DebatesRoom: React.FC<{ debates: DebateTopic[] }> = ({ debates }) => {
    const [votes, setVotes] = useState<Record<string, 'A' | 'B' | null>>({'debate-1': null});

    const handleVote = (debateId: string, side: 'A' | 'B') => {
        setVotes(prev => ({ ...prev, [debateId]: prev[debateId] === side ? null : side }));
    };

    return (
        <div className="p-4 sm:p-6 w-full h-full overflow-y-auto bg-brand-bg-dark">
            {debates.map(debate => {
                const totalVotes = debate.sides.sideA.votes + debate.sides.sideB.votes;
                const sideAPercentage = totalVotes > 0 ? (debate.sides.sideA.votes / totalVotes) * 100 : 50;
                const sideBPercentage = 100 - sideAPercentage;

                return (
                    <div key={debate.id} className="max-w-4xl mx-auto bg-brand-surface-dark p-6 rounded-2xl border border-white/10">
                        <h3 className="text-2xl font-bold font-arabic text-center text-amber-400 mb-6">{debate.title}</h3>
                        <div className="relative flex justify-center items-stretch gap-4 md:gap-6">
                            {/* Side A */}
                            <div className="flex-1 flex flex-col gap-3 text-center">
                                <h4 className="font-bold text-xl font-arabic text-brand-text-light">{debate.sides.sideA.title}</h4>
                                <p className="text-sm text-brand-text-medium font-arabic flex-grow">{debate.sides.sideA.argument}</p>
                                <button onClick={() => handleVote(debate.id, 'A')} className={`w-full p-3 rounded-lg font-bold transition-all ${votes[debate.id] === 'A' ? 'bg-brand-amber text-white shadow-glow-amber' : 'bg-stone-700 hover:bg-stone-600'}`}>صوّت</button>
                            </div>
                            {/* Divider & Vote Count */}
                            <div className="flex flex-col items-center justify-center gap-2 w-16">
                                <span className="font-mono text-xl font-bold text-brand-text-light">{debate.sides.sideA.votes}</span>
                                <div className="w-1 h-16 bg-stone-700 rounded-full"></div>
                                <span className="font-mono text-xl font-bold text-brand-text-light">{debate.sides.sideB.votes}</span>
                            </div>
                            {/* Side B */}
                             <div className="flex-1 flex flex-col gap-3 text-center">
                                <h4 className="font-bold text-xl font-arabic text-brand-text-light">{debate.sides.sideB.title}</h4>
                                <p className="text-sm text-brand-text-medium font-arabic flex-grow">{debate.sides.sideB.argument}</p>
                                <button onClick={() => handleVote(debate.id, 'B')} className={`w-full p-3 rounded-lg font-bold transition-all ${votes[debate.id] === 'B' ? 'bg-brand-crimson text-white shadow-glow-amber' : 'bg-stone-700 hover:bg-stone-600'}`}>صوّت</button>
                            </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full flex h-3 rounded-full overflow-hidden mt-6 bg-stone-700">
                            <div className="bg-brand-amber transition-all duration-500" style={{width: `${sideAPercentage}%`}}></div>
                            <div className="bg-brand-crimson transition-all duration-500" style={{width: `${sideBPercentage}%`}}></div>
                        </div>
                    </div>
                )
            })}
        </div>
    );
};

const StatsRoom: React.FC<{ stats: CommunityStats }> = ({ stats }) => {
    const maxReadCount = Math.max(...stats.mostReadNovels.map(n => n.readCount));
    
    return (
        <div className="p-4 sm:p-6 w-full h-full overflow-y-auto bg-brand-bg-dark">
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Most Read Novels */}
                <div className="bg-brand-surface-dark p-6 rounded-2xl border border-white/10">
                    <h3 className="text-xl font-bold font-arabic text-center text-amber-400 mb-4">الروايات الأكثر قراءة</h3>
                    <div className="space-y-3">
                        {stats.mostReadNovels.map(novel => (
                             <div key={novel.title} className="text-sm">
                                <div className="flex justify-between mb-1 font-mono">
                                    <span className="font-arabic font-bold text-brand-text-light">{novel.title}</span>
                                    <span className="text-brand-text-medium">{novel.readCount.toLocaleString()}</span>
                                </div>
                                <div className="w-full bg-stone-700 rounded-full h-2.5">
                                    <div className="bg-gradient-to-r from-brand-amber to-brand-bronze h-2.5 rounded-full" style={{width: `${(novel.readCount / maxReadCount) * 100}%`}}></div>
                                </div>
                             </div>
                        ))}
                    </div>
                </div>
                {/* Key Decision */}
                <div className="bg-brand-surface-dark p-6 rounded-2xl border border-white/10">
                    <h3 className="text-xl font-bold font-arabic text-center text-amber-400 mb-2">أبرز قرارات المجتمع</h3>
                    <p className="text-center text-brand-text-medium font-arabic mb-6">"{stats.keyDecision.question}"</p>
                    <div className="relative w-48 h-48 mx-auto">
                        <svg viewBox="0 0 36 36" className="w-full h-full">
                            <path className="text-brand-crimson/50" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                            <path className="text-brand-amber"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeDasharray={`${stats.keyDecision.optionA.percentage}, 100`}
                                transform="rotate(-90 18 18)"
                            />
                        </svg>
                         <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                            <span className="font-mono text-4xl font-bold text-brand-amber">{stats.keyDecision.optionA.percentage}%</span>
                             <span className="font-arabic text-sm text-brand-amber -mt-1">{stats.keyDecision.optionA.text}</span>
                        </div>
                    </div>
                    <div className="flex justify-around mt-4 text-center">
                        <div>
                            <p className="font-bold font-arabic text-brand-amber">{stats.keyDecision.optionA.text}</p>
                            <p className="font-mono text-2xl font-bold text-brand-amber">{stats.keyDecision.optionA.percentage}%</p>
                        </div>
                        <div>
                            <p className="font-bold font-arabic text-brand-crimson">{stats.keyDecision.optionB.text}</p>
                            <p className="font-mono text-2xl font-bold text-brand-crimson">{stats.keyDecision.optionB.percentage}%</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};