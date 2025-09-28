import React, { useState } from 'react';
import { Suggestion, User } from '../types';

interface SuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestions: Suggestion[];
  userVotes: Record<string, boolean>;
  onAddSuggestion: (text: string) => void;
  onVote: (suggestionId: string) => void;
  currentUser: User;
}

export const SuggestionsModal: React.FC<SuggestionsModalProps> = ({ isOpen, onClose, suggestions, userVotes, onAddSuggestion, onVote }) => {
  const [newSuggestionText, setNewSuggestionText] = useState('');

  if (!isOpen) return null;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSuggestionText.trim()) {
        onAddSuggestion(newSuggestionText.trim());
        setNewSuggestionText('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-brand-surface-dark/95 w-full max-w-2xl rounded-2xl shadow-2xl border border-white/10 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-bold font-arabic text-center text-amber-500 p-6 flex-shrink-0">الاقتراحات والتحسينات</h3>
        
        {/* Suggestions List */}
        <div className="overflow-y-auto px-6 space-y-4 flex-grow">
          {suggestions.sort((a,b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes)).map(suggestion => (
            <div key={suggestion.id} className="flex items-start gap-4 p-4 bg-brand-bg-dark rounded-lg">
              <button 
                onClick={() => onVote(suggestion.id)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${userVotes[suggestion.id] ? 'bg-amber-500 text-white' : 'bg-brand-surface-dark hover:bg-stone-700'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                <span className="font-bold font-mono text-sm">{suggestion.upvotes - suggestion.downvotes}</span>
              </button>
              <div className="flex-1">
                <p className="text-brand-text-light font-arabic">{suggestion.text}</p>
                <p className="text-xs text-brand-text-dark font-arabic mt-1">اقترحه: {suggestion.authorName}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Add Suggestion Form */}
        <form onSubmit={handleSubmit} className="p-6 border-t border-white/10 flex-shrink-0">
          <textarea
            value={newSuggestionText}
            onChange={(e) => setNewSuggestionText(e.target.value)}
            placeholder="اكتب فكرتك أو اقتراحك هنا..."
            className="w-full p-3 bg-brand-bg-dark border-2 border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 font-arabic mb-4"
            rows={3}
          />
          <button type="submit" className="w-full font-arabic bg-gradient-crimson-amber text-white py-3 px-6 rounded-lg shadow-lg hover:shadow-glow-amber transition-all disabled:opacity-50" disabled={!newSuggestionText.trim()}>
            أضف اقتراحك
          </button>
        </form>

      </div>
    </div>
  );
};
