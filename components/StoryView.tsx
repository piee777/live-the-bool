import React, { useState, useEffect } from 'react';
import { Message, StoryChoice, Interruption, Discovery } from '../types';
import { Typewriter } from './Typewriter';

interface StoryViewProps {
  message: Message;
  isLoading: boolean;
  onChoiceSelect: (choice: StoryChoice) => void;
  onOpenInventory: () => void;
  inventoryCount: number;
  onSaveQuote: (quote: string) => void;
  discoveries: Discovery[];
}

const CATEGORY_META: Record<Discovery['category'], { icon: string; label: string; color: string }> = {
    existential: { icon: '🧠', label: 'وجودي', color: 'text-brand-purple' },
    pragmatic: { icon: '🛠️', label: 'عملي', color: 'text-brand-blue' },
    absurdist: { icon: '🌀', label: 'عبثي', color: 'text-brand-crimson' },
};

const DiscoveriesModal: React.FC<{ discoveries: Discovery[]; onClose: () => void }> = ({ discoveries, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-brand-surface-dark/95 w-full max-w-lg rounded-2xl shadow-2xl border border-white/10 flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold font-arabic text-center text-amber-500 p-4 border-b border-white/10">قراراتي</h3>
                <div className="flex-grow overflow-y-auto p-4">
                    <div className="space-y-3">
                        {discoveries.length > 0 ? [...discoveries].reverse().map((d, i) => (
                            <div key={i} className="bg-brand-bg-dark/50 p-3 rounded-lg border border-white/10">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{CATEGORY_META[d.category].icon}</span>
                                    <p className="flex-grow font-arabic text-brand-text-light">{d.choiceText}</p>
                                </div>
                                <p className="text-xs text-amber-400 font-arabic mt-2 pr-10"><strong>التأثير:</strong> {d.outcome}</p>
                            </div>
                        )) : <p className="text-center text-brand-text-medium font-arabic p-8">لم تتخذ أي قرارات مؤثرة بعد.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Flashback: React.FC<{ content: string }> = ({ content }) => (
    <div className="w-full border-2 border-dashed border-amber-800/50 bg-amber-950/20 p-4 rounded-xl mb-4 animate-fade-in">
        <p className="text-brand-text-medium italic leading-relaxed font-arabic text-center">{content}</p>
    </div>
);

const InterruptionDisplay: React.FC<{ interruption: Interruption }> = ({ interruption }) => (
    <div className="mt-4 pt-4 border-t-2 border-dashed border-brand-crimson/50 animate-fade-in">
        <p className="font-bold text-amber-500 font-arabic text-center mb-2">{interruption.characterName} يقاطع الحديث فجأة:</p>
        <p className="text-brand-text-light text-base italic leading-relaxed font-arabic text-center">{interruption.content}</p>
    </div>
);

const ChoiceButton: React.FC<{ choice: StoryChoice; onClick: (choice: StoryChoice) => void; isLoading: boolean }> = ({ choice, onClick, isLoading }) => {
    const [timeLeft, setTimeLeft] = useState(choice.timer);
  
    useEffect(() => {
      if (choice.timer === undefined) return;
  
      setTimeLeft(choice.timer); // Reset timer when choice changes
  
      const intervalId = setInterval(() => {
        setTimeLeft(prev => {
          if (prev !== undefined && prev > 1) {
            return prev - 1;
          }
          clearInterval(intervalId);
          return 0;
        });
      }, 1000);
  
      return () => clearInterval(intervalId);
    }, [choice]);
  
    const progressPercentage = choice.timer ? ((timeLeft || 0) / choice.timer) * 100 : 0;
  
    return (
        <button
            onClick={() => onClick(choice)}
            disabled={isLoading}
            className="relative w-full flex items-center justify-center gap-3 p-4 text-md font-bold font-arabic text-white bg-white/5 hover:bg-white/10 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
        >
            {choice.timer !== undefined && (
                <div 
                    className="absolute top-0 left-0 h-full bg-brand-crimson/50 transition-all duration-1000 linear" 
                    style={{ width: `${progressPercentage}%` }}
                ></div>
            )}
            <div className="relative z-10 flex items-center gap-3">
                {choice.icon && <span className="text-2xl">{choice.icon}</span>}
                <span>{choice.text}</span>
                {choice.timer !== undefined && timeLeft !== undefined && timeLeft > 0 && (
                    <span className="font-mono text-sm opacity-80">({timeLeft}s)</span>
                )}
            </div>
        </button>
    );
};

export const StoryView: React.FC<StoryViewProps> = ({ message, isLoading, onChoiceSelect, onOpenInventory, inventoryCount, onSaveQuote, discoveries }) => {
  const hasChoices = message.choices && message.choices.length > 0;
  const [typingComplete, setTypingComplete] = useState(false);
  const [isDiscoveriesOpen, setIsDiscoveriesOpen] = useState(false);

  useEffect(() => {
    setTypingComplete(false);
  }, [message.content]);

  const narrationClassName = `text-brand-text-light text-lg italic leading-relaxed font-arabic text-center ${
    message.effect ? `effect-${message.effect}` : ''
  }`;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-end p-4 sm:p-6 overflow-hidden bg-brand-bg-dark">
        {isDiscoveriesOpen && <DiscoveriesModal discoveries={discoveries} onClose={() => setIsDiscoveriesOpen(false)} />}
        {/* Content Area */}
        <div className="relative z-10 w-full max-w-3xl flex flex-col gap-4 animate-fade-in-up">
            
            {message.flashback && <Flashback content={message.flashback} />}

            {/* Narration Box */}
            <div className="relative bg-brand-surface-dark p-6 rounded-2xl shadow-2xl border border-white/10">
                <button 
                    onClick={() => onSaveQuote(message.content)} 
                    className="absolute top-2 right-2 p-2 text-brand-text-dark hover:text-amber-400 transition-colors z-20"
                    aria-label="حفظ الاقتباس"
                    title="حفظ الاقتباس"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                    </svg>
                </button>
                {typingComplete ? (
                    <p className={narrationClassName}>{message.content}</p>
                ) : (
                    <Typewriter 
                        text={message.content} 
                        speed={25} 
                        className={narrationClassName} 
                        onComplete={() => setTypingComplete(true)} 
                    />
                )}


                {message.interruption && <InterruptionDisplay interruption={message.interruption} />}
            </div>

            {/* Choices */}
            {hasChoices && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {message.choices!.map((choice, index) => (
                       <ChoiceButton key={`${index}-${choice.text}`} choice={choice} onClick={onChoiceSelect} isLoading={isLoading} />
                    ))}
                </div>
            )}
             {/* Input Area */}
             <div className="mt-2">
                <form onSubmit={(e) => {
                    e.preventDefault();
                    const input = (e.currentTarget.elements.namedItem('story-input') as HTMLInputElement).value;
                    if(input.trim()) onChoiceSelect({ text: input, category: 'pragmatic' });
                    (e.currentTarget.elements.namedItem('story-input') as HTMLInputElement).value = '';
                }} className="flex items-center gap-3 w-full">
                    <button
                        type="button"
                        onClick={onOpenInventory}
                        className="relative bg-brand-surface-dark text-white rounded-full p-3 hover:bg-stone-700 disabled:opacity-50 transition-all transform hover:scale-110 shadow-lg"
                        aria-label="Open inventory"
                    >
                        <span role="img" aria-label="Backpack">🎒</span>
                        {inventoryCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-crimson text-xs font-bold">
                                {inventoryCount}
                            </span>
                        )}
                    </button>
                     <button
                        type="button"
                        onClick={() => setIsDiscoveriesOpen(true)}
                        className="relative bg-brand-surface-dark text-white rounded-full p-3 hover:bg-stone-700 disabled:opacity-50 transition-all transform hover:scale-110 shadow-lg"
                        aria-label="Open discoveries"
                    >
                        <span role="img" aria-label="Compass">🧭</span>
                    </button>
                    <input
                        name="story-input"
                        type="text"
                        placeholder="ماذا ستفعل؟"
                        className="flex-1 p-3 px-5 bg-brand-surface-dark border-2 border-slate-700 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-600 transition-all text-brand-text-light placeholder-brand-text-dark font-arabic"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        className="bg-gradient-crimson-amber text-white rounded-full p-3 hover:shadow-glow-amber disabled:opacity-50 disabled:bg-slate-600 transition-all transform hover:scale-110 disabled:scale-100 shadow-lg"
                        disabled={isLoading}
                        aria-label="Send action"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </form>
             </div>
        </div>
    </div>
  );
};
