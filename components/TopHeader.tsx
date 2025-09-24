

import React from 'react';
import { ThemeToggle } from './ThemeToggle';
import { User } from '../types';
import { EnergyIndicator } from './EnergyIndicator';

interface TopHeaderProps {
  user: User;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  globalProgress: number;
  energy: number;
  maxEnergy: number;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ user, theme, onThemeToggle, globalProgress, energy, maxEnergy }) => (
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
            <div className="flex items-center gap-4">
                <EnergyIndicator current={energy} max={maxEnergy} />
                <ThemeToggle theme={theme} onToggle={onThemeToggle} />
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