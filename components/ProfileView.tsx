import React from 'react';
import { User, AnyBook } from '../types';
import { AchievementsGrid } from './Achievements';

interface ProfileViewProps {
  user: User;
  stats: {
    storiesStarted: number;
    achievementsUnlocked: number;
    thinkingProfile: string;
  };
  unlockedAchievements: string[];
  allBooks: AnyBook[];
  storyProgress: Record<string, number>;
}

const getPersonalityData = (achievements: string[]) => {
    const weights = {
        'تأملي': 1, 'عملي': 1, 'متمرد': 1, 'وجودي': 1
    };
    if (achievements.includes('المفكر العبثي')) { weights['تأملي'] += 3; weights['وجودي'] += 2; }
    if (achievements.includes('صانع القرار')) weights['عملي'] += 3;
    if (achievements.includes('الفيلسوف الوجودي')) { weights['وجودي'] += 3; weights['تأملي'] += 1; }
    if (achievements.includes('رفيق المعاناة')) weights['تأملي'] += 2;

    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    
    return [
        { axis: 'تأملي', value: weights['تأملي'] / 5, color: '#d97706' }, // amber
        { axis: 'عملي', value: weights['عملي'] / 5, color: '#38bdf8' }, // blue
        { axis: 'وجودي', value: weights['وجودي'] / 5, color: '#818cf8' }, // purple
        { axis: 'متمرد', value: weights['متمرد'] / 5, color: '#991b1b' }, // crimson
    ];
};

const RadarChart: React.FC<{ data: { axis: string; value: number; color: string }[] }> = ({ data }) => {
    const size = 200;
    const center = size / 2;
    const levels = 5;
    const radius = size * 0.4;
    const angleSlice = (Math.PI * 2) / data.length;

    const points = data.map((d, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const x = center + radius * Math.max(0, d.value) * Math.cos(angle);
        const y = center + radius * Math.max(0, d.value) * Math.sin(angle);
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Grid */}
            {[...Array(levels)].map((_, levelIndex) => (
                <polygon
                    key={levelIndex}
                    points={data.map((d, i) => {
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
            {data.map((d, i) => {
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
                const r = radius * 1.2;
                const x = center + r * Math.cos(angle);
                const y = center + r * Math.sin(angle);
                return <text key={i} x={x} y={y} fill="#a8a29e" fontSize="10" textAnchor="middle" dominantBaseline="middle" className="font-arabic">{d.axis}</text>
            })}
        </svg>
    );
};

export const ProfileView: React.FC<ProfileViewProps> = (props) => {
  const { user, stats, unlockedAchievements, allBooks, storyProgress } = props;
  const playedBooks = allBooks.filter(book => (storyProgress[book.id] || 0) > 0);
  const personalityData = getPersonalityData(unlockedAchievements);

  return (
    <div className="p-4 sm:p-6 w-full h-full overflow-y-auto animate-fade-in bg-brand-bg-dark">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* User Header */}
        <div className="relative flex flex-col items-center gap-4 text-center p-8 bg-brand-surface-dark/50 rounded-2xl overflow-hidden border border-white/10">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/az-subtle.png')] opacity-10"></div>
            <div className="relative w-28 h-28 rounded-full flex items-center justify-center shadow-lg
                         p-1 bg-gradient-to-tr from-brand-purple via-brand-crimson to-brand-amber animate-pulse-slow">
                <div className="w-full h-full rounded-full bg-brand-bg-dark p-1">
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
                <h2 className="text-3xl font-bold font-arabic">{user.name}</h2>
                <p className="text-amber-400 font-bold text-lg font-arabic mt-1">{stats.thinkingProfile}</p>
            </div>
        </div>

        {/* Personality Chart & Stats */}
        <div className="bg-brand-surface-dark p-4 sm:p-6 rounded-xl border border-white/10">
            <h3 className="text-xl font-bold font-arabic mb-4 text-center">تحليل الشخصية العام</h3>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                <div className="w-48 h-48 md:w-56 md:h-56 flex-shrink-0">
                    <RadarChart data={personalityData} />
                </div>
                <div className="w-full grid grid-cols-2 gap-3">
                    {personalityData.map(p => (
                        <div key={p.axis} className="flex items-center gap-2 bg-brand-bg-dark p-2 rounded-md border border-white/5">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }}></div>
                            <span className="font-arabic text-sm text-brand-text-medium">{p.axis}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
        
        {/* Story Progress */}
        <div>
          <h3 className="text-xl font-bold font-arabic mb-4 text-center">تقدمي في الروايات</h3>
          <div className="space-y-4">
            {playedBooks.length > 0 ? playedBooks.map(book => (
              <div key={book.id} className="bg-brand-surface-dark/50 p-4 rounded-lg border border-white/10">
                <div className="flex justify-between items-center mb-2">
                    <p className="font-bold text-brand-text-light font-arabic">{book.title}</p>
                    <p className="font-semibold text-amber-400 font-mono text-sm">{storyProgress[book.id]}%</p>
                </div>
                <div className="w-full bg-brand-bg-dark rounded-full h-2">
                    <div 
                        className="bg-gradient-crimson-amber h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${storyProgress[book.id]}%` }}
                    ></div>
                </div>
              </div>
            )) : (
              <p className="text-center text-brand-text-medium font-arabic p-4">لم تبدأ أي رواية بعد. اختر واحدة من المكتبة!</p>
            )}
          </div>
        </div>

        {/* Achievements */}
        <div className="pt-4">
             <h3 className="text-xl font-bold font-arabic mb-4 text-center">شارة الإنجازات</h3>
             <AchievementsGrid unlockedAchievements={unlockedAchievements} />
        </div>
      </div>
    </div>
  );
};