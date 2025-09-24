import React from 'react';

const achievementsList = [
  { title: "القارئ المبتدئ", description: "أكمل محادثتك الأولى", icon: "🔰", color: "bg-amber-600" },
  { title: "صانع القرار", description: "قم بأول اختيار مؤثر في قصة", icon: "🔀", color: "bg-amber-700" },
  { title: "المفكر العبثي", description: "عند إنهاء 'الغريب'", icon: "🧠", color: "bg-red-800" },
  { title: "المراقب اليقظ", description: "اكتشف سرًا مخفيًا", icon: "👁️", color: "bg-yellow-800" },
  { title: "الفيلسوف الوجودي", description: "ناقش العبثية مع ميرسو", icon: "☀️", color: "bg-red-800" },
  { title: "مُحرك الكثبان", description: "تحدث مع شخصية من كوكب أراكيس", icon: "🏜️", color: "bg-orange-700" },
  { title: "رفيق المعاناة", description: "استمع إلى عذابات راسكولنيكوف", icon: "⚖️", color: "bg-red-900" },
  { title: "قيد الإنجاز", description: "...", icon: "🔒", color: "bg-gray-400 dark:bg-gray-600" },
];

const AchievementNode: React.FC<{ ach: typeof achievementsList[0]; isAchieved: boolean; index: number }> = ({ ach, isAchieved, index }) => {
  const isEven = index % 2 === 0;
  return (
    <div className={`flex items-center w-full ${isEven ? 'justify-start' : 'justify-end'}`}>
        <div className={`w-1/2 ${isEven ? 'text-right pr-8' : 'text-left pl-8'}`}>
            <div className={`inline-block p-4 rounded-xl shadow-lg transition-all duration-300 ${isAchieved ? 'bg-stone-200 dark:bg-brand-surface-dark' : 'bg-stone-300 dark:bg-stone-800'}`}>
                <h3 className={`font-bold text-lg font-arabic ${isAchieved ? 'text-stone-800 dark:text-brand-text-light' : 'text-stone-500 dark:text-stone-400'}`}>{ach.title}</h3>
                <p className={`text-sm font-arabic ${isAchieved ? 'text-stone-500 dark:text-brand-text-medium' : 'text-stone-400 dark:text-stone-500'}`}>{ach.description}</p>
            </div>
        </div>
    </div>
  );
};

export const Achievements: React.FC<{ unlockedAchievements: string[] }> = ({ unlockedAchievements }) => {
  return (
    <div className="p-4 sm:p-6 w-full h-full overflow-y-auto animate-fade-in">
      <h2 className="text-3xl text-center font-bold text-slate-800 dark:text-slate-100 font-arabic mb-10">مسار الإنجازات</h2>
      <div className="relative w-full max-w-sm mx-auto">
        {/* The path line */}
        <div className="absolute top-0 left-1/2 -ml-0.5 w-1 h-full bg-stone-300 dark:bg-stone-700"></div>

        <div className="space-y-12">
            {achievementsList.map((ach, index) => {
                const isAchieved = unlockedAchievements.includes(ach.title) || (index === 0 && unlockedAchievements.length >= 0); // Mock first achievement
                return (
                <div key={index} className="relative">
                    <div className="absolute top-1/2 -mt-8 left-1/2 -ml-8 w-16 h-16 rounded-full flex items-center justify-center text-4xl shadow-md z-10 animate-fade-in-up"
                        style={{ animationDelay: `${index * 100}ms` }}>
                        <div className={`absolute inset-0 rounded-full transition-all duration-500 ${isAchieved ? ach.color : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                        <span className="relative z-10">{ach.icon}</span>
                    </div>
                    <AchievementNode ach={ach} isAchieved={isAchieved} index={index} />
                </div>
            )})}
        </div>
      </div>
    </div>
  );
};
