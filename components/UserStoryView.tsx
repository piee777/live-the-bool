import React from 'react';
import { UserBook, UserChapter } from '../types';
import { Typewriter } from './Typewriter';

interface UserStoryViewProps {
  book: UserBook;
  currentChapterId: string;
  onChoiceSelect: (nextChapterId: string) => void;
  onExit: () => void;
}

const ChoiceButton: React.FC<{ text: string; onClick: () => void; }> = ({ text, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="relative w-full flex items-center justify-center gap-3 p-4 text-md font-bold font-arabic text-white bg-white/5 hover:bg-white/10 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 transition-all duration-300 transform hover:-translate-y-1"
        >
            <div className="relative z-10 flex items-center gap-3">
                <span>{text}</span>
            </div>
        </button>
    );
};


export const UserStoryView: React.FC<UserStoryViewProps> = ({ book, currentChapterId, onChoiceSelect, onExit }) => {
  const currentChapter = book.chapters.find(c => c.id === currentChapterId);

  if (!currentChapter) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold font-arabic text-red-500">خطأ في القصة</h2>
        <p className="text-brand-text-medium font-arabic mt-2">الفصل المحدد غير موجود. ربما تم حذفه أو أن هناك خطأ في الرابط.</p>
        <button onClick={onExit} className="mt-6 p-3 bg-brand-crimson hover:opacity-90 rounded-lg text-white font-bold transition-colors font-arabic">العودة إلى المكتبة</button>
      </div>
    );
  }

  const hasChoices = currentChapter.choices && currentChapter.choices.length > 0;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-end p-4 sm:p-6 overflow-hidden bg-brand-bg-dark">
        <div className="absolute top-4 right-4 z-20">
             <button onClick={onExit} className="flex items-center gap-2 text-amber-500 font-bold hover:text-amber-400 transition-colors p-2 rounded-lg hover:bg-white/5">
                <span className="font-arabic">الخروج من القصة</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
        
        <div className="relative z-10 w-full max-w-3xl flex flex-col gap-6 animate-fade-in-up">
            
            <div className="relative bg-brand-surface-dark p-6 rounded-2xl shadow-2xl border border-white/10">
                <Typewriter text={currentChapter.content} speed={25} className="text-brand-text-light text-lg italic leading-relaxed font-arabic text-center" />
            </div>

            {hasChoices ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentChapter.choices!.map((choice, index) => {
                        const destinationExists = book.chapters.some(c => c.id === choice.destinationChapterId);
                        if (!destinationExists || !choice.text) return null;
                        return (
                           <ChoiceButton key={index} text={choice.text} onClick={() => onChoiceSelect(choice.destinationChapterId)} />
                        )
                    })}
                </div>
            ) : (
                <div className="text-center p-4">
                    <p className="font-arabic text-brand-text-medium">النهاية.</p>
                </div>
            )}
        </div>
    </div>
  );
};
