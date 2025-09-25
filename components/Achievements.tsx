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


export const AchievementsGrid: React.FC<{ unlockedAchievements: string[] }> = ({ unlockedAchievements }) => {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
      {achievementsList.map((ach, index) => {
        const isAchieved = unlockedAchievements.includes(ach.title);
        if (ach.icon === '🔒' && isAchieved) return null; // Don't show locked if achieved
        if (ach.icon === '🔒' && !isAchieved && index < achievementsList.length -1) return null; // Hide placeholder unless it's the last one

        return (
          <div 
            key={index} 
            className={`flex flex-col items-center text-center p-3 rounded-xl transition-all duration-300 transform ${isAchieved ? 'bg-brand-surface-dark border border-amber-500/30 shadow-[0_0_15px_rgba(252,211,77,0.2)]' : 'bg-stone-800 opacity-60'}`}
            title={ach.description}
          >
            <div className={`text-4xl rounded-full flex items-center justify-center w-16 h-16 mb-2 transition-colors ${isAchieved ? ach.color : 'bg-gray-600'}`}>
              <span className={isAchieved ? 'animate-fade-in' : ''}>{ach.icon}</span>
            </div>
            <h3 className={`font-bold text-xs sm:text-sm font-arabic h-10 flex items-center ${isAchieved ? 'text-brand-text-light' : 'text-stone-400'}`}>
              {ach.title}
            </h3>
          </div>
        );
      })}
    </div>
  );
};