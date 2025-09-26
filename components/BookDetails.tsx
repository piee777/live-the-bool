import React, { useState } from 'react';
import { Book, Character, StoryState, User } from '../types';

interface LibraryScreenProps {
  books: Book[];
  selectedBook: Book | null;
  storyStates: Record<string, StoryState>;
  onBookSelect: (book: Book) => void;
  onCharacterSelect: (character: Character) => void;
  onStartStory: (book: Book) => void;
  onBackToGrid: () => void;
  onSuggestNovel: (suggestionText: string) => Promise<void>;
  currentUser: User | null;
}

const SuggestionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (suggestion: string) => void;
  currentUser: User | null;
}> = ({ isOpen, onClose, onSubmit, currentUser }) => {
  const [suggestion, setSuggestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!suggestion.trim()) return;
    setIsSubmitting(true);
    await onSubmit(suggestion);
    setIsSubmitting(false);
    setSuggestion('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div 
        className={`relative w-full max-w-lg rounded-2xl p-0.5 bg-gradient-to-r from-brand-amber to-brand-crimson transition-all duration-300 ${isFocused ? 'shadow-[0_0_25px_rgba(255,111,97,0.4)]' : 'shadow-2xl'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-brand-surface-dark rounded-[15px] p-6 space-y-4">
          <button onClick={onClose} className="absolute top-3 right-3 text-brand-text-dark hover:text-white transition-colors z-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          
          <div className="flex items-start gap-4">
            {currentUser && (
              <div className="w-12 h-12 rounded-full bg-brand-bg-dark border-2 border-white/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                {currentUser.avatar_url ? (
                  <img src={currentUser.avatar_url} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-bold text-lg text-brand-text-medium">{currentUser.name.charAt(0)}</span>
                )}
              </div>
            )}
            <textarea
              value={suggestion}
              onChange={e => setSuggestion(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="اقترح تحسين للتطبيق، أو رواية جديدة تتمنى أن تضاف..."
              className="w-full h-24 p-0 bg-transparent resize-none focus:outline-none text-white placeholder-brand-text-dark font-arabic text-lg"
              rows={3}
              autoFocus
            />
          </div>

          <div className="pt-2">
            <button
              onClick={handleSubmit}
              disabled={!suggestion.trim() || isSubmitting}
              className="w-full p-3 font-bold font-arabic bg-gradient-suggest-orange text-white rounded-lg shadow-lg hover:shadow-glow-hot-orange transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'جاري الإرسال...' : 'إرسال الاقتراح'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BookCard: React.FC<{ book: Book; progress: number; hasStarted: boolean; onSelect: () => void }> = ({ book, progress, hasStarted, onSelect }) => {
  return (
    <button onClick={onSelect} className="w-full text-right group transition-transform duration-300 hover:-translate-y-2 aspect-[0.66]">
      <div className="w-full h-full flex flex-col rounded-2xl shadow-lg hover:shadow-2xl bg-brand-surface-dark border border-white/10 overflow-hidden">
        <div className="flex-grow flex flex-col items-center justify-center text-center p-6 bg-gradient-bronze-warm">
          <h3 className="text-2xl font-bold text-white font-arabic">{book.title}</h3>
          <p className="text-sm text-white/80 font-arabic mt-1">{book.author}</p>
        </div>
        <div className="p-4">
          {hasStarted ? (
            <>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div className="bg-gradient-crimson-amber h-2 rounded-full" style={{ width: `${progress}%` }}></div>
              </div>
              <p className="text-xs text-brand-text-medium mt-2 font-arabic">{progress}% مكتمل</p>
            </>
          ) : (
            <p className="text-xs text-brand-text-medium mt-2 font-arabic">ابدأ الآن</p>
          )}
        </div>
      </div>
    </button>
  );
};

const BookScreen: React.FC<{ book: Book; onCharacterSelect: (character: Character) => void; onStartStory: (book: Book) => void; onBack: () => void; hasProgress: boolean; }> = ({ book, onCharacterSelect, onStartStory, onBack, hasProgress }) => {
  const [showCharacters, setShowCharacters] = useState(false);

  return (
    <div className="w-full h-full p-4 sm:p-6 flex flex-col text-brand-text-light animate-fade-in">
      <div className="flex-shrink-0 mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-amber-500 font-bold hover:text-amber-400 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform rotate-180" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
          <span className="font-arabic">المكتبة</span>
        </button>
      </div>
      <div className="flex-grow overflow-y-auto space-y-8">
        <div className="text-center p-8 rounded-2xl bg-gradient-bronze-warm shadow-2xl">
          <h2 className="text-4xl font-extrabold font-arabic text-white">{book.title}</h2>
          <p className="text-xl text-white/80 font-arabic mt-2">{book.author}</p>
        </div>
        <p className="leading-relaxed font-arabic text-brand-text-medium text-center max-w-2xl mx-auto">{book.summary}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 max-w-2xl mx-auto">
            <button onClick={() => onStartStory(book)} className="group relative w-full flex flex-col items-center justify-center p-6 bg-gradient-crimson-amber text-white rounded-2xl shadow-lg hover:shadow-glow-amber transition-all transform hover:-translate-y-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                <span className="font-bold text-xl font-arabic">{hasProgress ? 'أكمل القصة' : 'ابدأ القصة'}</span>
            </button>
            <button onClick={() => setShowCharacters(true)} className="group relative w-full flex flex-col items-center justify-center p-6 bg-gradient-bronze-warm text-white rounded-2xl shadow-lg hover:shadow-glow-amber transition-all transform hover:-translate-y-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V7a2 2 0 012-2h2.586a1 1 0 01.707.293l1.414 1.414a1 1 0 00.707.293H17z" /></svg>
                <span className="font-bold text-xl font-arabic">تحدث مع الشخصيات</span>
            </button>
        </div>

        {showCharacters && (
          <div className="pt-6 animate-fade-in-up max-w-2xl mx-auto">
            <h3 className="text-xl text-center font-bold font-arabic mb-4">اختر شخصية للدرشة</h3>
            <div className="space-y-3">
              {book.characters.map(character => (
                <button key={character.id} onClick={() => onCharacterSelect(character)} className="w-full flex items-center p-4 bg-brand-surface-dark rounded-xl shadow-md hover:shadow-lg transition-all transform hover:scale-105 hover:bg-stone-700 border border-white/10">
                  <div className="w-12 h-12 rounded-full bg-gradient-bronze-warm flex items-center justify-center font-bold text-xl text-white mr-4">
                    {character.name.charAt(0)}
                  </div>
                  <div className="text-right flex-1">
                    <p className="font-bold text-lg font-arabic">{character.name}</p>
                    <p className="text-sm text-brand-text-medium font-arabic">{character.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const LibraryScreen: React.FC<LibraryScreenProps> = ({ books, selectedBook, storyStates, onBookSelect, onCharacterSelect, onStartStory, onBackToGrid, onSuggestNovel, currentUser }) => {
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);

  if (selectedBook) {
    const storyState = storyStates[selectedBook.id];
    const hasStarted = storyState && storyState.messages.length > 0;
    return <BookScreen book={selectedBook} onCharacterSelect={onCharacterSelect} onStartStory={onStartStory} onBack={onBackToGrid} hasProgress={hasStarted} />;
  }
  
  return (
    <div className="p-4 sm:p-6 w-full h-full overflow-y-auto animate-fade-in">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {books.map((book) => {
                const storyState = storyStates[book.id];
                const progress = storyState ? storyState.storyProgress : 0;
                const hasStarted = storyState && storyState.messages.length > 0;
                return <BookCard key={book.id} book={book} progress={progress} hasStarted={hasStarted} onSelect={() => onBookSelect(book)} />
            })}
        </div>
        
        <div className="mt-12 text-center flex flex-col items-center gap-3">
            <button
                onClick={() => setIsSuggestionModalOpen(true)}
                className="w-16 h-16 bg-gradient-crimson-amber text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-glow-amber transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg-dark focus:ring-amber-500"
                aria-label="اقترح تحسين أو رواية جديدة"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
            </button>
            <p className="font-arabic text-brand-text-medium">اقترح رواية أو تحسين</p>
        </div>

        <SuggestionModal 
            isOpen={isSuggestionModalOpen} 
            onClose={() => setIsSuggestionModalOpen(false)} 
            onSubmit={onSuggestNovel}
            currentUser={currentUser}
        />
    </div>
  );
};