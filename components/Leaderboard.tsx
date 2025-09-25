import React from 'react';
import { LeaderboardUser, User } from '../types';

interface LeaderboardProps {
  users: LeaderboardUser[];
  currentUser: User;
}

const getRankGlow = (rank: number) => {
    switch (rank) {
      case 1: return 'shadow-yellow-400/40 border-yellow-400';
      case 2: return 'shadow-slate-300/40 border-slate-300';
      case 3: return 'shadow-amber-600/40 border-amber-600';
      default: return 'shadow-transparent border-slate-700/50';
    }
};

const getRankIcon = (rank: number) => {
    const iconBaseClass = "text-5xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]";
    switch (rank) {
        case 1: return <span className={iconBaseClass} style={{textShadow: '0 0 10px #facc15'}}>🥇</span>;
        case 2: return <span className={iconBaseClass} style={{textShadow: '0 0 10px #e2e8f0'}}>🥈</span>;
        case 3: return <span className={iconBaseClass} style={{textShadow: '0 0 10px #f59e0b'}}>🥉</span>;
        default: return <span className="font-mono text-slate-400 text-3xl font-bold">{rank}</span>;
    }
};

const LeaderboardCard: React.FC<{ user: LeaderboardUser; isCurrentUser: boolean }> = ({ user, isCurrentUser }) => {
    return (
        <div className={`flex-shrink-0 w-64 h-80 rounded-3xl p-6 flex flex-col items-center justify-around text-center transition-all duration-300 snap-center
            bg-gradient-to-b from-brand-surface-dark/80 to-brand-surface-dark/50 border ${isCurrentUser ? 'border-amber-500 shadow-lg shadow-amber-500/10' : getRankGlow(user.rank)}`}>
            
            <div className="relative w-28 h-28">
                <div className={`absolute inset-0 rounded-full ${getRankGlow(user.rank)} animate-pulse-slow`} style={{ animationDuration: '3s' }}></div>
                <div className="absolute inset-1.5 rounded-full overflow-hidden border-2 border-brand-bg-dark">
                   {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-brand-bg-dark flex items-center justify-center">
                            <span className="font-bold text-4xl text-brand-text-medium">{user.name.charAt(0)}</span>
                        </div>
                    )}
                </div>
            </div>

            <div>
                {getRankIcon(user.rank)}
            </div>

            <div>
              <p className="font-bold text-xl text-brand-text-light font-arabic truncate w-48">{user.name}</p>
              <p className="font-bold text-4xl text-amber-400 font-mono tracking-tighter mt-1">{user.score.toLocaleString()}</p>
            </div>
        </div>
    );
};

export const Leaderboard: React.FC<LeaderboardProps> = ({ users, currentUser }) => {
  const sortedUsers = [...users].sort((a, b) => a.rank - b.rank);

  return (
    <div className="w-full h-full flex items-center py-8">
      <div className="w-full flex gap-6 overflow-x-auto snap-x snap-mandatory px-6 py-4 scrollbar-hide">
        {sortedUsers.map((user) => (
            <LeaderboardCard
              key={user.id}
              user={user}
              isCurrentUser={user.id === currentUser.id}
            />
        ))}
      </div>
    </div>
  );
};