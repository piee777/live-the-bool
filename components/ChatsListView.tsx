import React from 'react';
import { Message, Character, Book } from '../types';

interface ChatsListViewProps {
    chatHistories: Record<string, Message[]>;
    books: Book[];
    onCharacterSelect: (character: Character, book: Book) => void;
}

const TimeAgo: React.FC<{ timestamp: number }> = ({ timestamp }) => {
    const now = new Date();
    const messageDate = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - messageDate.getTime()) / 1000);

    if (diffInSeconds < 60) return <span className="font-arabic">الآن</span>;
    if (diffInSeconds < 3600) return <span className="font-arabic">{Math.floor(diffInSeconds / 60)}د</span>;
    if (diffInSeconds < 86400) return <span className="font-arabic">{Math.floor(diffInSeconds / 3600)}س</span>;
    
    return <span className="font-arabic">{messageDate.toLocaleDateString('ar', { month: 'short', day: 'numeric' })}</span>;
};

type Conversation = {
    character: Character;
    book: Book;
    lastMessage: Message;
};

export const ChatsListView: React.FC<ChatsListViewProps> = ({ chatHistories, books, onCharacterSelect }) => {
    
    const conversations = Object.entries(chatHistories)
        .map(([characterId, messages]) => {
            let character: Character | undefined;
            let book: Book | undefined;
            
            for (const b of books) {
                const found = b.characters.find((c: Character) => c.id === characterId);
                if (found) {
                    character = found;
                    book = b;
                    break;
                }
            }

            if (!character || !book || !Array.isArray(messages) || messages.length === 0) return null;
            
            const lastMessage = messages[messages.length - 1];
            return { character, book, lastMessage };
        })
        .filter((c): c is Conversation => c !== null)
        .sort((a, b) => (b.lastMessage.timestamp || 0) - (a.lastMessage.timestamp || 0));


    if (conversations.length === 0) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 text-brand-text-medium animate-fade-in">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                <h2 className="text-2xl font-bold font-arabic text-brand-text-light mt-4">لا توجد محادثات بعد</h2>
                <p className="font-arabic mt-2 max-w-sm">اذهب إلى المكتبة، اختر كتابًا، وابدأ الحديث مع إحدى شخصياته لبدء محادثة.</p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 w-full h-full overflow-y-auto animate-fade-in">
            <h2 className="text-3xl text-left font-bold font-arabic mb-6">المحادثات</h2>
            <div className="space-y-3">
                {conversations.map(({ character, book, lastMessage }) => (
                    <button 
                        key={character.id} 
                        onClick={() => onCharacterSelect(character, book)}
                        className="w-full flex items-center p-3 gap-4 bg-brand-surface-dark/50 hover:bg-brand-surface-dark rounded-xl transition-colors duration-200 border border-transparent hover:border-white/10"
                    >
                        <div className="w-14 h-14 rounded-full bg-gradient-bronze-warm flex items-center justify-center font-bold text-2xl text-white border-2 border-white/20 flex-shrink-0">
                            {character.name.charAt(0)}
                        </div>
                        <div className="flex-grow text-right overflow-hidden">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-lg font-arabic text-brand-text-light truncate">{character.name}</h3>
                                {lastMessage.timestamp && <p className="text-xs text-brand-text-dark font-mono flex-shrink-0"><TimeAgo timestamp={lastMessage.timestamp} /></p>}
                            </div>
                            <p className="text-sm text-brand-text-medium font-arabic truncate">{lastMessage.content}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};
