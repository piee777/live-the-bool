import React, { useState } from 'react';
import { DiaryEntry } from '../types';

interface JournalViewProps {
  diaryEntries: DiaryEntry[];
  personalNotes: string;
  onUpdateNotes: (notes: string) => void;
}

type JournalTab = 'diaries' | 'notes';

export const JournalView: React.FC<JournalViewProps> = ({ diaryEntries, personalNotes, onUpdateNotes }) => {
  const [activeTab, setActiveTab] = useState<JournalTab>('diaries');

  const TabButton: React.FC<{ label: string; tab: JournalTab }> = ({ label, tab }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex-1 p-3 text-center font-bold font-arabic transition-colors duration-300 rounded-t-lg ${
        activeTab === tab
          ? 'bg-brand-surface-dark text-brand-text-light'
          : 'bg-brand-bg-dark text-brand-text-medium hover:bg-stone-800'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="p-4 sm:p-6 w-full h-full flex flex-col overflow-y-auto animate-fade-in">
      <h2 className="text-3xl text-center font-bold text-slate-100 font-arabic mb-6">المذكرات</h2>
      
      <div className="flex border-b border-stone-700 mb-6">
        <TabButton label="مذكرات الشخصيات" tab="diaries" />
        <TabButton label="ملاحظاتي الخاصة" tab="notes" />
      </div>

      <div className="flex-1 bg-brand-surface-dark p-4 rounded-b-lg">
        {activeTab === 'diaries' && (
          <div className="space-y-4 animate-fade-in">
            {diaryEntries.length > 0 ? (
              diaryEntries.slice().reverse().map((entry, index) => (
                <div key={index} className="bg-stone-800/50 p-4 rounded-lg border border-white/10 transition-all hover:border-amber-500/50">
                  <p className="font-bold text-amber-500 font-arabic mb-2">مذكرة {entry.character}:</p>
                  <p className="text-brand-text-light whitespace-pre-wrap font-arabic leading-relaxed">{entry.content}</p>
                </div>
              ))
            ) : (
              <div className="text-center text-brand-text-medium p-8">
                <p className="font-arabic text-lg">لم تكتشف أي مذكرات بعد.</p>
                <p className="font-arabic mt-2">استمر في القصة لكشف الأسرار المخبأة بين السطور.</p>
              </div>
            )}
          </div>
        )}
        {activeTab === 'notes' && (
          <div className="animate-fade-in h-full flex flex-col">
             <p className="font-arabic text-brand-text-medium mb-4">استخدم هذه المساحة لتدوين أفكارك، نظرياتك، أو أي شيء يلفت انتباهك أثناء رحلتك في القصة.</p>
            <textarea
              value={personalNotes}
              onChange={(e) => onUpdateNotes(e.target.value)}
              placeholder="اكتب أفكارك وتوقعاتك هنا..."
              className="w-full flex-1 p-4 bg-brand-bg-dark border-2 border-stone-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 transition-all text-brand-text-light placeholder-brand-text-dark font-arabic text-lg"
            />
          </div>
        )}
      </div>
    </div>
  );
};
