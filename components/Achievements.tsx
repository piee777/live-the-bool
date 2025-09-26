import React from 'react';

const LockIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v2" />
    </svg>
);
const BookIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
);
const PathIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 3v10a2 2 0 002 2h4a2 2 0 002-2V3M6 7h4m10 8v-4a2 2 0 00-2-2h-7" />
    </svg>
);
const SwirlIcon: React.FC = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c4.969 0 9-4.03 9-9 0-1.892-.586-3.64-1.575-5.04M3 12a9 9 0 011-4.04" />
    </svg>
);
const EyeIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);
const SunIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);
const DunesIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.941 17.059c-3.14-.054-5.14-1.554-7-3.554-1.86-2-3.86-3.5-7-3.5-3.14 0-5 1.5-7 3.5m14-7c-3.14 0-5-1.5-7-3.5-1.86-2-3.86-3.5-7-3.5-3.14 0-5 1.5-7 3.5" />
    </svg>
);
const ScalesIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m-6-14h12M4 7l8-4 8 4M4 7v10h16V7" />
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
  { id: "غامض", title: "إنجاز غامض", description: "استمر في الاستكشاف لكشف المزيد", icon: <LockIcon /> },
];

interface AchievementCardProps {
    achievement: typeof achievementsList[0];
    isAchieved: boolean;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, isAchieved }) => {
    // The last item is a placeholder for future unknown achievements
    const isPlaceholder = achievement.id === 'غامض';
    
    // Don't render the placeholder if it's not the only locked one left (conceptually)
    // For simplicity, we just render it always, but it will appear locked.
    // The user will see a grid of achieved and locked achievements.
    
    return (
        <div
            className={`flex flex-col items-center text-center p-3 rounded-xl transition-all duration-500 transform ${isAchieved && !isPlaceholder ? 'bg-brand-surface-dark border border-amber-500/30 shadow-[0_0_15px_rgba(252,211,77,0.2)] hover:-translate-y-1' : 'bg-stone-800/80 border border-transparent'}`}
            title={isAchieved && !isPlaceholder ? achievement.description : 'إنجاز مقفل'}
        >
            <div className={`rounded-full flex items-center justify-center w-16 h-16 mb-2 transition-colors duration-500 ${isAchieved && !isPlaceholder ? 'text-amber-400 bg-amber-900/40' : 'text-stone-500 bg-stone-700/50'}`}>
                <div className={`transition-opacity duration-500 ${isAchieved && !isPlaceholder ? 'opacity-100' : 'opacity-70'}`}>
                    {isAchieved && !isPlaceholder ? achievement.icon : <LockIcon />}
                </div>
            </div>
            <h3 className={`font-bold text-xs sm:text-sm font-arabic h-10 flex items-center justify-center transition-colors duration-500 ${isAchieved && !isPlaceholder ? 'text-brand-text-light' : 'text-stone-400'}`}>
                {isAchieved && !isPlaceholder ? achievement.title : 'إنجاز غامض'}
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
