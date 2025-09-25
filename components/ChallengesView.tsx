import React, { useState } from 'react';
import { DailyChallenge, User } from '../types';

interface ChallengesViewProps {
  challenge: DailyChallenge;
  currentUser: User;
  onAnswerSubmit: (answer: string) => void;
  onVote: (answerId: string) => void;
}

export const ChallengesView: React.FC<ChallengesViewProps> = ({ challenge, currentUser, onAnswerSubmit, onVote }) => {
    const [answerText, setAnswerText] = useState('');
    const hasAnswered = challenge.answers.some(a => a.author.id === currentUser.id);
    const winner = challenge.answers.length > 0 ? challenge.answers.reduce((prev, current) => (prev.upvotes > current.upvotes) ? prev : current) : null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (answerText.trim() && !hasAnswered) {
            onAnswerSubmit(answerText);
            setAnswerText('');
        }
    };

    return (
        <div className="p-4 sm:p-6 w-full h-full overflow-y-auto animate-fade-in bg-brand-bg-dark">
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Daily Question Card */}
                <div className="relative bg-gradient-to-br from-amber-900 via-brand-surface-dark to-brand-surface-dark p-6 rounded-2xl border-2 border-amber-500/50 shadow-glow-amber text-center">
                    <div className="absolute top-4 right-4 text-amber-500/50">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h2 className="text-lg font-bold font-arabic text-amber-400 mb-2">سؤال اليوم</h2>
                    <p className="text-2xl font-bold font-arabic text-brand-text-light">{challenge.question}</p>
                </div>

                {/* Submit Answer Form */}
                {!hasAnswered && (
                     <form onSubmit={handleSubmit} className="p-4 bg-brand-surface-dark rounded-xl border border-white/10">
                        <textarea
                            value={answerText}
                            onChange={(e) => setAnswerText(e.target.value)}
                            placeholder="اكتب إجابتك هنا..."
                            className="w-full p-3 bg-brand-bg-dark border-2 border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 font-arabic mb-3"
                            rows={3}
                        />
                        <button type="submit" className="w-full font-arabic bg-gradient-crimson-amber text-white py-2.5 px-6 rounded-lg shadow-lg hover:shadow-glow-amber transition-all disabled:opacity-50" disabled={!answerText.trim()}>
                            قدّم إجابتك
                        </button>
                    </form>
                )}
                {hasAnswered && (
                    <div className="p-4 bg-green-900/30 border border-green-500/50 rounded-xl text-center font-arabic text-green-300">
                        شكراً لمشاركتك! يمكنك التصويت لإجابات الآخرين.
                    </div>
                )}
                
                {/* Answers List */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold font-arabic text-center text-brand-text-light">إجابات المجتمع</h3>
                    {challenge.answers.sort((a,b) => b.upvotes - a.upvotes).map(answer => {
                        const isWinner = winner && answer.id === winner.id;
                        return (
                            <div key={answer.id} className={`flex items-start gap-4 p-4 rounded-xl transition-all duration-300 ${isWinner ? 'bg-amber-900/50 border-2 border-amber-500' : 'bg-brand-surface-dark border border-white/10'}`}>
                                <div className="flex flex-col items-center gap-1">
                                    <button onClick={() => onVote(answer.id)} className="p-2 rounded-full text-brand-text-medium hover:bg-brand-amber hover:text-white transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
                                    </button>
                                    <span className={`font-mono font-bold text-lg ${isWinner ? 'text-amber-400' : 'text-brand-text-light'}`}>{answer.upvotes}</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-stone-700 overflow-hidden flex-shrink-0">
                                            {answer.author.avatar_url ? <img src={answer.author.avatar_url} alt={answer.author.name} className="w-full h-full object-cover"/> : <span className="font-bold text-white flex items-center justify-center h-full w-full">{answer.author.name.charAt(0)}</span>}
                                        </div>
                                        <p className="font-bold font-arabic text-brand-text-light">{answer.author.name}</p>
                                        {isWinner && <span className="text-xs font-bold text-amber-400">🏆 الإجابة الفائزة</span>}
                                    </div>
                                    <p className="font-arabic text-brand-text-medium leading-relaxed">{answer.text}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};
