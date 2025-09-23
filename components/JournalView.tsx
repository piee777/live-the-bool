import React, { useState } from 'react';
import { DiaryEntry, TimelineEvent } from '../types';

interface JournalViewProps {
  diaryEntries: DiaryEntry[];
  personalNotes: string;
  onUpdateNotes: (notes: string) => void;
  timeline: TimelineEvent[];
  savedQuotes: string[];
}

type JournalTab = 'diaries' | 'notes' | 'quotes' | 'timeline';

export const JournalView: React.FC<JournalViewProps> = ({ diaryEntries, personalNotes, onUpdateNotes, timeline, savedQuotes }) => {
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

  const TimelineNode: React.FC<{ event: TimelineEvent; type: 'narration' | 'choice' }> = ({ event, type }) => {
    const isNarration = type === 'narration';
    const justify = isNarration ? 'justify-start' : 'justify-end';
    const textAlign = isNarration ? 'text-right pr-8' : 'text-left pl-8';

    return (
        <div className={`flex items-center w-full ${justify}`}>
            <div className={`w-1/2 ${textAlign}`}>
                <div className="inline-block p-3 rounded-xl shadow-lg bg-stone-800/50">
                    <p className="text-sm font-arabic text-brand-text-light">{event.content}</p>
                </div>
            </div>
        </div>
    );
  };


  return (
    <div className="p-4 sm:p-6 w-full h-full flex flex-col overflow-y-auto animate-fade-in">
      <h2 className="text-3xl text-center font-bold text-slate-100 font-arabic mb-6">السجل</h2>
      
      <div className="flex border-b border-stone-700 mb-6">
        <TabButton label="المذكرات" tab="diaries" />
        <TabButton label="ملاحظاتي" tab="notes" />
        <TabButton label="اقتباساتي" tab="quotes" />
        <TabButton label="الخط الزمني" tab="timeline" />
      </div>

      <div className="flex-1">
        {activeTab === 'diaries' && (
          <div className="space-y-4 animate-fade-in bg-brand-surface-dark p-4 rounded-b-lg">
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
          <div className="animate-fade-in h-full flex flex-col bg-brand-surface-dark p-4 rounded-b-lg">
             <p className="font-arabic text-brand-text-medium mb-4">استخدم هذه المساحة لتدوين أفكارك، نظرياتك، أو أي شيء يلفت انتباهك أثناء رحلتك في القصة.</p>
            <textarea
              value={personalNotes}
              onChange={(e) => onUpdateNotes(e.target.value)}
              placeholder="اكتب أفكارك وتوقعاتك هنا..."
              className="w-full flex-1 p-4 bg-brand-bg-dark border-2 border-stone-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 transition-all text-brand-text-light placeholder-brand-text-dark font-arabic text-lg"
            />
          </div>
        )}
        {activeTab === 'quotes' && (
            <div className="space-y-4 animate-fade-in bg-brand-surface-dark p-4 rounded-b-lg">
                {savedQuotes.length > 0 ? (
                savedQuotes.slice().reverse().map((quote, index) => (
                    <div key={index} className="bg-stone-800/50 p-4 rounded-lg border border-white/10 italic">
                        <p className="text-brand-text-light whitespace-pre-wrap font-arabic leading-relaxed">"{quote}"</p>
                    </div>
                ))
                ) : (
                <div className="text-center text-brand-text-medium p-8">
                    <p className="font-arabic text-lg">لم تحفظ أي اقتباسات بعد.</p>
                    <p className="font-arabic mt-2">انقر على أيقونة 🔖 في نافذة القصة لحفظ مقاطعك المفضلة.</p>
                </div>
                )}
            </div>
        )}
        {activeTab === 'timeline' && (
            <div className="relative w-full max-w-xl mx-auto animate-fade-in p-4">
                <div className="absolute top-0 left-1/2 -ml-0.5 w-1 h-full bg-stone-700"></div>
                <div className="space-y-12">
                {timeline.length > 0 ? (
                    timeline.map((event, index) => (
                        <div key={index} className="relative">
                            <div className="absolute top-1/2 -mt-5 left-1/2 -ml-5 w-10 h-10 rounded-full flex items-center justify-center text-2xl shadow-md z-10 bg-brand-bronze">
                                {event.type === 'narration' ? '📖' : '💬'}
                            </div>
                            <TimelineNode event={event} type={event.type} />
                        </div>
                    ))
                ) : (
                    <div className="text-center text-brand-text-medium p-8">
                        <p className="font-arabic text-lg">ابدأ قصة لتسجيل أحداثها هنا.</p>
                    </div>
                )}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};