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
  onShowSchema: () => void;
}

const getPersonalityData = (achievements: string[]) => {
    const weights: Record<string, number> = {
        'تأملي': 0, 'عملي': 0, 'متمرد': 0, 'وجودي': 0
    };
    if (achievements.includes('المفكر العبثي')) { weights['تأملي'] += 3; weights['وجودي'] += 2; }
    if (achievements.includes('صانع القرار')) weights['عملي'] += 3;
    if (achievements.includes('القارئ المبتدئ')) weights['تأملي'] += 1;
    if (achievements.includes('المراقب اليقظ')) { weights['تأملي'] += 2; weights['عملي'] += 1; }
    if (achievements.includes('الفيلسوف الوجودي')) { weights['وجودي'] += 3; weights['متمرد'] += 1; }
    if (achievements.includes('مُحرك الكثبان')) { weights['متمرد'] += 2; weights['عملي'] += 2; }
    if (achievements.includes('رفيق المعاناة')) { weights['تأملي'] += 2; weights['وجودي'] += 1; }

    const maxTrait = Object.entries(weights).reduce((a, b) => a[1] > b[1] ? a : b);
    return maxTrait[1] > 0 ? maxTrait[0] : 'مستكشف جديد';
};

const getTitle = (personality: string) => {
    switch(personality) {
        case 'تأملي': return 'الفيلسوف الصامت';
        case 'عملي': return 'صانع القرار';
        case 'متمرد': return 'الثائر الحر';
        case 'وجودي': return 'الباحث عن المعنى';
        default: return 'المستكشف';
    }
};

export const ProfileView: React.FC<ProfileViewProps> = ({ user, allUsers, stats, unlockedAchievements, onShowSchema }) => {
    const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
    const personality = getPersonalityData(unlockedAchievements);
    const title = getTitle(personality);

    // Map all users to the ModalUser interface required by UsersModal
    const modalUsers = allUsers.map(u => ({
        id: u.id,
        name: u.name,
        avatar_url: u.avatar_url,
        title: u.id === user.id ? title : 'قارئ' // Simplified title logic for others for now
    }));

    return (
        <div className="p-4 sm:p-6 w-full h-full overflow-y-auto animate-fade-in bg-brand-bg-dark">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Profile Header */}
                <div className="bg-brand-surface-dark p-6 rounded-2xl border border-white/10 flex flex-col items-center text-center relative">
                     <div className="w-24 h-24 rounded-full bg-brand-bg-dark border-4 border-amber-500/50 flex items-center justify-center overflow-hidden mb-4 shadow-glow-amber">
                        {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="font-bold text-4xl text-brand-text-medium">{user.name.charAt(0)}</span>
                        )}
                     </div>
                     <h2 className="text-2xl font-bold font-arabic text-brand-text-light flex items-center gap-2">
                        {user.name}
                        {user.name === 'bensadel' && <VerifiedBadge />}
                     </h2>
                     <p className="text-amber-400 font-bold font-arabic mt-1">{title}</p>
                     <div className="flex gap-2 mt-4 text-sm text-brand-text-medium font-arabic">
                        <span>{user.country || 'موقع غير معروف'}</span>
                        <span>•</span>
                        <span>انضم حديثاً</span>
                     </div>
                     
                     <button 
                        onClick={() => setIsUsersModalOpen(true)}
                        className="absolute top-4 left-4 p-2 bg-stone-700 hover:bg-stone-600 rounded-full text-white transition-colors"
                        title="عرض المستخدمين"
                     >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                        </svg>
                     </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-brand-surface-dark p-4 rounded-xl border border-white/10 text-center">
                        <p className="text-brand-text-medium font-arabic text-sm mb-1">قصص بدأتها</p>
                        <p className="text-3xl font-bold text-white font-mono">{stats.storiesStarted}</p>
                    </div>
                    <div className="bg-brand-surface-dark p-4 rounded-xl border border-white/10 text-center">
                        <p className="text-brand-text-medium font-arabic text-sm mb-1">إنجازات</p>
                        <p className="text-3xl font-bold text-amber-400 font-mono">{stats.achievementsUnlocked}</p>
                    </div>
                </div>

                {/* Achievements */}
                <div className="bg-brand-surface-dark p-6 rounded-2xl border border-white/10">
                    <h3 className="text-xl font-bold font-arabic mb-4 text-brand-text-light">الإنجازات</h3>
                    <AchievementsGrid unlockedAchievements={unlockedAchievements} />
                </div>

                 {/* Schema Button (Dev only or hidden feature) */}
                 <div className="text-center pt-4">
                     <button onClick={onShowSchema} className="text-xs text-stone-500 hover:text-stone-400 font-mono underline">
                         View Database Schema
                     </button>
                 </div>
            </div>

            <UsersModal 
                isOpen={isUsersModalOpen} 
                onClose={() => setIsUsersModalOpen(false)} 
                users={modalUsers} 
                currentUser={user}
            />
        </div>
    );
};