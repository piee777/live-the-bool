import React from 'react';
import { LeaderboardUser, User } from '../types';

interface LeaderboardProps {
  users: LeaderboardUser[];
  currentUser: User;
}

const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'border-yellow-400 bg-yellow-400/10';
      case 2:
        return 'border-slate-400 bg-slate-400/10';
      case 3:
        return 'border-amber-600 bg-amber-600/10';
      default:
        return 'border-slate-700 bg-transparent';
    }
};

const getRankIcon = (rank: number) => {
    switch (rank) {
        case 1: return '🥇';
        case 2: return '🥈';
        case 3: return '🥉';
        default: return `#${rank}`;
    }
}


export const Leaderboard: React.FC<LeaderboardProps> = ({ users, currentUser }) => {
  return (
    <div className="p-4 sm:p-6 w-full h-full overflow-y-auto animate-fade-in">
      <h2 className="text-3xl text-center font-bold text-slate-100 font-arabic mb-8">لوحة المتصدرين</h2>
      <div className="max-w-2xl mx-auto space-y-3">
        {users.sort((a, b) => a.rank - b.rank).map((user) => {
          const isCurrentUser = user.id === currentUser.id;
          return (
            <div
              key={user.id}
              className={`flex items-center p-3 rounded-xl border-2 transition-all ${getRankColor(user.rank)} ${isCurrentUser ? 'bg-brand-surface-dark scale-105 shadow-lg' : 'bg-brand-surface-dark/50'}`}
            >
              <div className={`w-12 h-12 text-xl font-bold flex items-center justify-center rounded-lg ${getRankColor(user.rank)}`}>
                  {getRankIcon(user.rank)}
              </div>
              <div className="flex-grow mx-4">
                <p className="font-bold text-lg text-brand-text-light font-arabic">{user.name}</p>
              </div>
              <div className="text-right">
                 <p className="font-bold text-xl text-amber-400 font-mono">{user.score.toLocaleString()}</p>
                 <p className="text-xs text-brand-text-medium font-arabic">نقطة</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
