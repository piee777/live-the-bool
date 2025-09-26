import React from 'react';

// New, more elegant icons
const LockIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="11" width="14" height="10" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
);
const BookIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
);
const PathIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12a8 8 0 0 1 8-8 8 8 0 0 1 8 8" />
        <path d="M12 20V4" />
        <path d="m16 8-4 4-4-4" />
    </svg>
);
const SwirlIcon: React.FC = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);
const EyeIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);
const SunIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" /> <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" /> <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" /> <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" /> <path d="m19.07 4.93-1.41 1.41" />
    </svg>
);
const DunesIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3.5 17.5c4-3 8-3 12 0" />
        <path d="M20.5 17.5c-4-3-8-3-12 0" />
        <circle cx="15.5" cy="6.5" r="2" />
        <path d="M10 4.5a3 3 0 1 0-5 2.5" />
    </svg>
);
const ScalesIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="3" x2="12" y2="21"></line>
        <path d="M3 7l2.5 2.5c3.3-3.3 8.7-3.3 12 0L20 7"></path>
        <path d="M3 14l2.5 2.5c3.3-3.3 8.7-3.3 12 0L20 14"></path>
    </svg>
);

const achievementsList = [
  { id: "القارئ المبتدئ", title: "القارئ المبتدئ", description: "أكمل محادثتك الأولى", icon: <BookIcon /> },
  { id: "صانع القرار", title: "صانع القرار", description: "قم بأول اختيار مؤثر في قصة", icon: <PathIcon /> },
  { id: "المفكر العبثي", title: "المفكر العبثي", description: "عند إنهاء 'الغريب'", icon: <SwirlIcon /> },
  { id: "المراقب اليقظ", title: "المراقب اليقظ", description: "اكتشف سرًا مخفيًا", icon: <EyeIcon /> },
  { id: "الفيلسوف الوجودي", title: "الفيلسوف الوجودي", description: "ناقش العبثية مع ميرسو", icon: <SunIcon /> },
  { id: "مُحرك الكثبان", title: "مُحرك الكثبان", description: "تحدث مع شخصية من كوكب أراكيس", icon: <DunesIcon /> },
  { id: "رفيق المعاناة", title: "رفيق المعاناة", description: "استمع إلى عذابات راسكولنيكوف", icon: <ScalesIcon /> },
];

const AchievementCard: React.FC<{ achievement: typeof achievementsList[0]; isAchieved: boolean; }> = ({ achievement, isAchieved }) => {
    return (
        <div
            className={`flex flex-col items-center text-center p-3 rounded-xl transition-all duration-500 transform group ${
                isAchieved 
                ? 'bg-brand-surface-dark border border-amber-500/30 shadow-[0_0_15px_rgba(252,211,77,0.2)] hover:-translate-y-1' 
                : 'bg-stone-800/80 border border-transparent opacity-60'
            }`}
            title={isAchieved ? achievement.description : 'إنجاز مقفل'}
        >
            <div className={`relative rounded-full flex items-center justify-center w-16 h-16 mb-2 transition-colors duration-500 overflow-hidden ${
                isAchieved 
                ? 'text-amber-400 bg-amber-900/40' 
                : 'text-stone-500 bg-stone-700/50'
            }`}>
                 {/* Glowing effect for unlocked achievements */}
                {isAchieved && (
                    <div className="absolute inset-0 bg-gradient-to-t from-amber-500/20 to-transparent animate-pulse-slow rounded-full" style={{ animationDuration: '3s' }}></div>
                )}
                <div className="relative transition-opacity duration-500">
                    {isAchieved ? achievement.icon : <LockIcon />}
                </div>
            </div>
            <h3 className={`font-bold text-xs sm:text-sm font-arabic h-10 flex items-center justify-center transition-colors duration-500 ${
                isAchieved 
                ? 'text-brand-text-light' 
                : 'text-stone-400'
            }`}>
                {isAchieved ? achievement.title : 'إنجاز غامض'}
            </h3>
        </div>
    );
};

export const AchievementsGrid: React.FC<{ unlockedAchievements: string[] }> = ({ unlockedAchievements }) => {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
      {achievementsList.map((ach, index) => (
        <AchievementCard 
            key={index} 
            achievement={ach}
            isAchieved={unlockedAchievements.includes(ach.id)}
        />
      ))}
    </div>
  );
};
