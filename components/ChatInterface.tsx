import React, { useState, useRef, useEffect } from 'react';
import { Message, Role, Character, Interruption, User } from '../types';
import { Typewriter } from './Typewriter';

const sendSound = new Audio('data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAACAA==');
sendSound.volume = 0.5;

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  character: Character;
  onBack: () => void;
  currentUser: User | null;
}

const InterruptionBubble: React.FC<{ interruption: Interruption }> = ({ interruption }) => (
    <div className="mt-3 p-3 border-l-4 border-brand-crimson bg-black/20 rounded-r-lg animate-fade-in">
      <p className="font-bold text-amber-500 text-sm font-arabic">{interruption.characterName} يقاطع:</p>
      <p className="text-white/90 text-sm font-arabic italic">{interruption.content}</p>
    </div>
);

const ChatBubble: React.FC<{ message: Message, isLastMessage: boolean, isLoading: boolean, character: Character, user: User | null }> = ({ message, isLastMessage, isLoading, character, user }) => {
  const isUser = message.role === Role.USER;
  const isSystem = message.role === Role.SYSTEM;
  const isCharacter = message.role === Role.CHARACTER;
  
  if (isSystem) {
    return (
      <div className="text-center my-2">
        <span className="px-3 py-1 bg-red-900/50 text-red-300 text-xs rounded-full font-arabic">{message.content}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-end gap-3 my-3 animate-fade-in-up ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
       {!isUser && (
        <div className="w-9 h-9 rounded-full bg-gradient-bronze-warm flex items-center justify-center font-bold text-white self-start flex-shrink-0">
          {character.name.charAt(0)}
        </div>
      )}
      {isUser && user && (
         <div className="w-9 h-9 rounded-full bg-brand-surface-dark border-2 border-white/20 flex items-center justify-center overflow-hidden self-start flex-shrink-0">
            {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
            ) : (
                <span className="font-bold text-white">{user.name.charAt(0)}</span>
            )}
        </div>
      )}
      <div className={`w-auto max-w-sm md:max-w-md p-3 px-4 rounded-2xl shadow-md ${
          isUser
            ? 'bg-gradient-crimson-amber text-white rounded-br-lg'
            : 'bg-brand-surface-dark text-brand-text-light rounded-bl-lg'
        }`}>
          {(isCharacter && isLastMessage && !isLoading) ? (
              <Typewriter text={message.content} className="text-base leading-relaxed font-arabic break-words" />
          ) : (
            <p className="text-base leading-relaxed font-arabic break-words">{message.content}</p>
          )}
          {message.interruption && <InterruptionBubble interruption={message.interruption} />}
      </div>
    </div>
  );
};

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isLoading, character, onBack, currentUser }) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !isLoading && character) {
      onSendMessage(inputText);
      setInputText('');
      sendSound.play().catch(e => console.error("Error playing sound:", e));
    }
  };

  return (
     <div className="relative flex-1 flex flex-col h-full w-full max-w-4xl mx-auto bg-brand-bg-dark">
        <div className="relative z-10 flex-1 flex flex-col h-full">
            {/* Chat Header */}
            <header className="flex-shrink-0 flex items-center justify-between p-3 sm:p-4 border-b border-white/10">
                <button onClick={onBack} className="flex items-center gap-2 text-amber-500 font-bold p-2 rounded-lg hover:bg-white/5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
                <div className="text-center">
                    <h2 className="text-lg font-bold text-brand-text-light font-arabic">{character.name}</h2>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-bronze-warm flex items-center justify-center font-bold text-2xl text-white border-2 border-white/20">
                    {character.name.charAt(0)}
                </div>
            </header>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">
                {messages.map((msg, index) => {
                const isLastMessage = index === messages.length - 1;
                return(
                    <ChatBubble 
                    key={index}
                    message={msg} 
                    isLastMessage={isLastMessage} 
                    isLoading={isLoading}
                    character={character}
                    user={currentUser}
                    />
                )
                })}
                {isLoading && (
                <div className="flex items-end gap-3 my-3 flex-row">
                    <div className="w-9 h-9 rounded-full bg-gradient-bronze-warm flex items-center justify-center font-bold text-white self-start flex-shrink-0">
                        {character.name.charAt(0)}
                    </div>
                    <div className="w-auto p-3 px-4 rounded-2xl bg-brand-surface-dark shadow-md">
                        <div className="flex items-center space-x-2 space-x-reverse">
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                        </div>
                    </div>
                </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            
            {/* Input Area */}
            <div className="flex-shrink-0 p-4 bg-brand-surface-dark/80 backdrop-blur-sm border-t border-white/10">
                <form onSubmit={handleSend} className="flex items-center gap-3">
                 {currentUser && (
                    <div className="w-10 h-10 rounded-full bg-brand-surface-dark border-2 border-white/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {currentUser.avatar_url ? (
                            <img src={currentUser.avatar_url} alt={currentUser.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="font-bold text-white">{currentUser.name.charAt(0)}</span>
                        )}
                    </div>
                 )}
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="اكتب رسالتك..."
                    className="flex-1 p-3 px-5 bg-brand-bg-dark border-2 border-slate-700 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-600 transition-all text-brand-text-light placeholder-brand-text-dark font-arabic"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    className="bg-gradient-crimson-amber text-white rounded-full p-3 hover:shadow-glow-amber disabled:opacity-50 disabled:bg-slate-600 transition-all transform hover:scale-110 disabled:scale-100 shadow-lg"
                    disabled={isLoading || !inputText.trim()}
                    aria-label="Send message"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform -rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </button>
                </form>
            </div>
        </div>
    </div>
  );
};