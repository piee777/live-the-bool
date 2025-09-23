
import React from 'react';
import { ThemeToggle } from './ThemeToggle';
import { User } from '../types';

interface TopHeaderProps {
  user: User;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  globalProgress: number;
  onLogout: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ user, theme, onThemeToggle, globalProgress, onLogout }) => (
    <header className="flex-shrink-0 w-full p-4 flex flex-col gap-4 text-brand-text-light">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-brand-surface-dark border-2 border-white/20 flex items-center justify-center overflow-hidden">
                    {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                        <span className="font-bold text-lg text-brand-text-medium">{user.name.charAt(0).toUpperCase()}</span>
                    )}
                 </div>
                 <div>
                    <h1 className="text-xl font-bold font-arabic">أهلاً، {user.name}</h1>
                 </div>
            </div>
            <div className="flex items-center gap-2">
                <ThemeToggle theme={theme} onToggle={onThemeToggle} />
                <button 
                    onClick={onLogout}
                    className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                    aria-label="تسجيل الخروج"
                    title="تسجيل الخروج"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                </button>
            </div>
        </div>
        <div>
            <p className="text-sm font-medium text-brand-text-medium mb-1 font-arabic">التقدم الإجمالي</p>
            <div className="w-full bg-brand-surface-dark rounded-full h-2.5">
                <div 
                    className="bg-gradient-crimson-amber h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${globalProgress}%` }}
                ></div>
            </div>
        </div>
    </header>
);