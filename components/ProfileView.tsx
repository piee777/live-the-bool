import React, { useState } from 'react';
import { User } from '../types';
import { AchievementsGrid } from './Achievements';
import { UsersModal } from './UsersModal';

const VerifiedBadge: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className={`${className} inline-block mr-2 text-sky-400`}
        aria-hidden="true"
    >
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

interface ProfileViewProps {
  user: User;
  allUsers: User[];
  stats: {
    storiesStarted: number;
    achievementsUnlocked: number;
  };
  unlockedAchievements: string[];
}

const getPersonalityData = (achievements: string[]) => {
    const weights = {
        'تأملي': 0, 'عملي': 0, 'متمرد': 0, 'وجودي': 0
    };
    if (achievements.includes('المفكر العبثي')) { weights['تأملي'] += 3; weights['وجودي'] += 2; }
    if (achievements.includes('صانع القرار')) weights['عملي'] += 3;
    if (achievements.includes('الفيلسوف الوجودي')) { weights['وجودي'] += 3; weights['تأملي'] += 1; }
    if (achievements.includes('رفيق المعاناة')) weights['تأملي'] += 2;

    // Max possible weights with base 1: contemplative: 7, pragmatic: 4, existential: 6, rebellious: 1
    // Divisors are kept the same to maintain the relative scale.
    return [
        { axis: 'تأملي', value: weights['تأملي'] / 7, color: '#d97706' }, // amber
        { axis: 'عملي', value: weights['عملي'] / 4, color: '#38bdf8' }, // blue
        { axis: 'وجودي', value: weights['وجودي'] / 6, color: '#818cf8' }, // purple
        { axis: 'متمرد', value: weights['متمرد'] / 1, color: '#991b1b' }, // crimson
    ];
};

const getThinkingProfileTitle = (achievements: string[]): string => {
    // Give priority to specific, high-level achievements for titles
    if (achievements.includes('الفيلسوف الوجودي')) return 'الفيلسوف الوجودي';
    if (achievements.includes('المفكر العبثي')) return 'المفكر العبثي';

    // If no specific title achievement, analyze personality trends
    const personalityData = getPersonalityData(achievements);
    if (achievements.length > 2 && personalityData.length > 0) { // Require some progress
        const mainTrait = [...personalityData].sort((a, b) => b.value - a.value)[0];
        // The value is normalized between 0 and 1. We need a clear dominant trait.
        if (mainTrait && mainTrait.value >= 0.7) { 
            switch (mainTrait.axis) {
                case 'وجودي': return 'المفكر الوجودي';
                case 'تأملي': return 'المتأمل العميق';
                case 'عملي': return 'الاستراتيجي العملي';
                case 'متمرد': return 'الروح المتمردة';
            }
        }
    }
    
    return 'قارئ'; // Default title for new users or those with balanced profiles
};


const RadarChart: React.FC<{ data: { axis: string; value: number; color: string }[] }> = ({ data }) => {
    const size = 240; // Increased SVG canvas size for padding
    const center = size / 2;
    const levels = 5;
    const radius = size * 0.35; // Approx 84px.
    const angleSlice = (Math.PI * 2) / data.length;

    const points = data.map((d, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const x = center + radius * Math.max(0, d.value) * Math.cos(angle);
        const y = center + radius * Math.max(0, d.value) * Math.sin(angle);
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg viewBox={`0 0 ${size} ${size}`}>
            {/* Grid */}
            {[...Array(levels)].map((_, levelIndex) => (
                <polygon
                    key={levelIndex}
                    points={data.map((_, i) => {
                        const r = radius * ((levelIndex + 1) / levels);
                        const angle = angleSlice * i - Math.PI / 2;
                        return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#404040"
                    strokeWidth="0.5"
                />
            ))}
            {/* Axes */}
            {data.map((_, i) => {
                const angle = angleSlice * i - Math.PI / 2;
                const x = center + radius * Math.cos(angle);
                const y = center + radius * Math.sin(angle);
                return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="#404040" strokeWidth="0.5" />;
            })}
            {/* Data Polygon */}
            <polygon points={points} fill="rgba(130, 130, 250, 0.4)" stroke="#818cf8" strokeWidth="2" />
             {/* Labels */}
             {data.map((d, i) => {
                const angle = angleSlice * i - Math.PI / 2;
                const labelRadius = radius + 10; // Position anchor point slightly outside the chart
                const x = center + labelRadius * Math.cos(angle);
                const y = center + labelRadius * Math.sin(angle);
                
                let textAnchor: "start" | "end" | "middle" = "middle";
                const cosAngle = Math.cos(angle);

                // cosAngle is ~0 for top/bottom, 1 for right, -1 for left
                if (cosAngle > 0.5) { // Right side
                    textAnchor = "start";
                } else if (cosAngle < -0.5) { // Left side
                    textAnchor = "end";
                }

                return <text key={i} x={x} y={y} fill="#a8a29e" fontSize="14" textAnchor={textAnchor} dominantBaseline="middle" className="font-arabic">{d.axis}</text>
            })}
        </svg>
    );
};

export const ProfileView: React.FC<ProfileViewProps> = (props) => {
  const { user, unlockedAchievements, allUsers } = props;
  const personalityData = getPersonalityData(unlockedAchievements);
  const thinkingProfileTitle = getThinkingProfileTitle(unlockedAchievements);
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);

  return (
    <div className="p-4 sm:p-6 w-full h-full overflow-y-auto animate-fade-in bg-brand-bg-dark">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* User Header */}
        <div className="relative flex flex-col items-center gap-4 text-center p-8 bg-brand-surface-dark/50 rounded-2xl overflow-hidden border border-white/10">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/az-subtle.png')] opacity-10"></div>
            <div className="relative w-28 h-28 rounded-full flex items-center justify-center shadow-lg
                         p-1 bg-gradient-to-tr from-amber-400 via-red-500 to-yellow-400">
                <div className="w-full h-full rounded-full bg-brand-bg-dark p-0.5">
                    {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover rounded-full" />
                    ) : (
                        <div className="w-full h-full bg-brand-surface-dark rounded-full flex items-center justify-center">
                            <span className="font-bold text-5xl text-brand-text-medium">{user.name.charAt(0).toUpperCase()}</span>
                        </div>
                    )}
                </div>
            </div>
            <div>
                <h2 className="text-3xl font-bold font-arabic flex items-center justify-center">
                    {user.name}
                    {user.name === 'bensadel' && <VerifiedBadge className="w-6 h-6" />}
                </h2>
                <p className="text-amber-400 font-bold text-lg font-arabic mt-1">{thinkingProfileTitle}</p>
                <p className="text-brand-text-medium text-xs font-arabic mt-2 max-w-xs mx-auto">
                    يتغير هذا اللقب بناءً على قراراتك في القصص وتحليل شخصيتك.
                </p>
            </div>
        </div>

        {/* Personality Chart & Stats */}
        <div className="bg-brand-surface-dark p-4 sm:p-6 rounded-xl border border-white/10">
            <h3 className="text-xl font-bold font-arabic mb-4 text-center">تحليل الشخصية العام</h3>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                <div className="w-full max-w-[250px] md:max-w-[300px] flex-shrink-0">
                    <RadarChart data={personalityData} />
                </div>
            </div>
        </div>

        {/* Community Section */}
        <div className="bg-brand-surface-dark p-4 sm:p-6 rounded-xl border border-white/10">
            <h3 className="text-xl font-bold font-arabic mb-4 text-center">المجتمع</h3>
            <button 
                onClick={() => setIsUsersModalOpen(true)}
                className="w-full p-4 bg-brand-bg-dark hover:bg-stone-800/50 rounded-lg text-brand-text-light font-arabic transition-colors flex justify-between items-center"
            >
                <span>تصفح أبرز المستخدمين</span>
                <span className="text-amber-500 font-mono">{allUsers.length}+</span>
            </button>
        </div>

        {/* Achievements */}
        <div className="pt-4">
             <h3 className="text-xl font-bold font-arabic mb-4 text-center">شارة الإنجازات</h3>
             <AchievementsGrid unlockedAchievements={unlockedAchievements} />
        </div>

        {/* About Storify Section */}
        <div className="pt-4 pb-4">
            <h3 className="text-xl font-bold font-arabic mb-4 text-center">عن Storify</h3>
            <div className="bg-brand-surface-dark p-6 rounded-xl border border-white/10 space-y-4 text-center">
                <p className="font-arabic text-brand-text-medium leading-relaxed">
                    Storify ليس مجرد تطبيق قراءة، بل هو دعوة لتعيش الروايات التي تحبها. هنا، يمكنك التحدث مع شخصياتك المفضلة، اتخاذ قرارات تؤثر في مسار القصة، ورؤية كيف تعكس اختياراتك شخصيتك الأدبية.
                </p>
                <p className="font-arabic text-brand-text-medium leading-relaxed">
                    <strong className="block text-amber-400 mb-1">كيف يعمل تحليل الشخصية؟</strong> 
                    المخطط الذي تراه ليس اختبارًا نفسيًا، بل هو مرآة إبداعية تعكس ميولك وقراراتك ضمن عوالم الروايات التي تتفاعل معها. كل إنجاز تحققه يساهم في تشكيل هذه الخريطة الفريدة لشخصيتك السردية.
                </p>
            </div>
        </div>

        {/* Contact Info */}
        <div className="text-center pt-2 pb-6 space-y-1">
            <p className="text-sm text-brand-text-dark font-arabic">
                للتواصل أو الإبلاغ عن مشكلة: 
                <a href="mailto:bensadelfy@gmail.com" className="font-medium text-amber-500 hover:text-amber-400 transition-colors underline decoration-dotted underline-offset-4 mr-1">
                    bensadelfy@gmail.com
                </a>
            </p>
            <p className="text-xs text-stone-600 font-mono">
                Storify v1.0.0 - Public Release
            </p>
        </div>

      </div>
      <UsersModal 
          isOpen={isUsersModalOpen}
          onClose={() => setIsUsersModalOpen(false)}
          users={allUsers.map(u => ({
              id: u.id,
              name: u.name,
              avatar_url: u.avatar_url,
              // FIX: Handle cases where unlocked_achievements might be null or undefined
              title: getThinkingProfileTitle(u.unlocked_achievements || []) 
          }))}
          currentUser={user}
      />
    </div>
  );
};