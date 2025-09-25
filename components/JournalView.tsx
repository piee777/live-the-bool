import React, { useState } from 'react';
import { DiaryEntry, MeditationEntry, Relationship, TimelineEvent } from '../types';

interface JournalViewProps {
  diaryEntries: DiaryEntry[];
  personalNotes: string;
  onUpdateNotes: (notes: string) => void;
  timeline: TimelineEvent[];
  savedQuotes: string[];
  meditationEntry: MeditationEntry;
  onUpdateMeditation: (answer: string) => void;
  stats: {
    storiesStarted: number;
    achievementsUnlocked: number;
    thinkingProfile: string;
  };
  relationships: Relationship[];
}

type JournalTab = 'diaries' | 'notes' | 'quotes' | 'map' | 'meditation' | 'stats' | 'characters';

export const JournalView: React.FC<JournalViewProps> = ({ diaryEntries, personalNotes, onUpdateNotes, timeline, savedQuotes, meditationEntry, onUpdateMeditation, stats, relationships }) => {
  const [activeTab, setActiveTab] = useState<JournalTab>('diaries');

  const TabButton: React.FC<{ label: string; tab: JournalTab }> = ({ label, tab }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex-1 p-3 text-sm sm:text-base text-center font-bold font-arabic transition-colors duration-300 rounded-t-lg ${
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
      <h2 className="text-3xl text-center font-bold text-slate-100 font-arabic mb-6">السجل</h2>
      
      <div className="flex flex-wrap border-b border-stone-700 mb-6">
        <TabButton label="المذكرات" tab="diaries" />
        <TabButton label="ملاحظاتي" tab="notes" />
        <TabButton label="الشخصيات" tab="characters" />
        <TabButton label="اقتباساتي" tab="quotes" />
        <TabButton label="الخريطة" tab="map" />
        <TabButton label="تأمل" tab="meditation" />
        <TabButton label="إحصائيات" tab="stats" />
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
        {activeTab === 'map' && (
            <div className="relative w-full max-w-xl mx-auto animate-fade-in p-4 bg-brand-surface-dark rounded-b-lg">
                <h3 className="text-xl font-bold font-arabic text-center mb-6 text-brand-text-light">خريطة رحلتك</h3>
                {timeline.length > 0 ? (
                    <>
                        <div className="absolute top-0 right-8 w-1 h-full bg-stone-700"></div>
                        <div className="space-y-8">
                            {timeline.slice().reverse().map((event, index) => (
                                <div key={index} className="relative flex items-center">
                                    <div className="absolute top-1/2 -mt-5 right-3 w-10 h-10 rounded-full flex items-center justify-center text-2xl shadow-md z-10 bg-brand-bronze">
                                        {event.type === 'narration' ? '📖' : '💬'}
                                    </div>
                                    <div className="mr-20 p-3 rounded-xl shadow-lg bg-stone-800/50 w-full">
                                        <p className="text-sm font-arabic text-brand-text-light">{event.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="text-center text-brand-text-medium p-8">
                        <p className="font-arabic text-lg">ابدأ قصة لرسم خريطتها هنا.</p>
                    </div>
                )}
            </div>
        )}
        {activeTab === 'meditation' && (
          <div className="animate-fade-in h-full flex flex-col bg-brand-surface-dark p-4 rounded-b-lg">
            <p className="font-arabic text-amber-400 text-lg mb-4 text-center italic">"{meditationEntry.question}"</p>
            <textarea
              value={meditationEntry.answer}
              onChange={(e) => onUpdateMeditation(e.target.value)}
              placeholder="اكتب تأملاتك هنا..."
              className="w-full flex-1 p-4 bg-brand-bg-dark border-2 border-stone-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 transition-all text-brand-text-light placeholder-brand-text-dark font-arabic text-lg"
            />
          </div>
        )}
        {activeTab === 'stats' && (
            <div className="animate-fade-in bg-brand-surface-dark p-4 rounded-b-lg space-y-4">
                <div className="text-center p-6 bg-stone-800/50 rounded-lg border border-white/10">
                    <p className="text-brand-text-medium font-arabic">نمط تفكيرك</p>
                    <p className="text-amber-400 font-bold text-2xl font-arabic">{stats.thinkingProfile}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-stone-800/50 rounded-lg border border-white/10">
                        <p className="text-brand-text-medium font-arabic">قصص بدأتها</p>
                        <p className="text-white font-bold text-3xl font-mono">{stats.storiesStarted}</p>
                    </div>
                    <div className="text-center p-4 bg-stone-800/50 rounded-lg border border-white/10">
                        <p className="text-brand-text-medium font-arabic">إنجازات حققتها</p>
                        <p className="text-white font-bold text-3xl font-mono">{stats.achievementsUnlocked}</p>
                    </div>
                </div>
            </div>
        )}
        {activeTab === 'characters' && (
            <div className="animate-fade-in bg-brand-surface-dark p-4 rounded-b-lg space-y-4">
                {relationships.length > 0 ? (
                    relationships.map((rel, index) => (
                        <div key={index} className="bg-stone-800/50 p-4 rounded-lg border border-white/10">
                            <div className="flex justify-between items-center mb-2">
                                <p className="font-bold text-lg text-brand-text-light font-arabic">{rel.characterName}</p>
                                <p className="font-semibold text-amber-400 font-arabic text-sm">{rel.status}</p>
                            </div>
                            <div className="w-full bg-brand-bg-dark rounded-full h-2.5">
                                <div 
                                    className="bg-gradient-crimson-amber h-2.5 rounded-full transition-all duration-500" 
                                    style={{ width: `${rel.level}%` }}
                                ></div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-brand-text-medium p-8">
                        <p className="font-arabic text-lg">لم تتفاعل مع أي شخصيات بعد.</p>
                        <p className="font-arabic mt-2">اختياراتك في القصة ستشكل علاقاتك بهم.</p>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};