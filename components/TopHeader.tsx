import React from 'react';
import { ThemeToggle } from './ThemeToggle';

interface TopHeaderProps {
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  globalProgress: number;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ theme, onThemeToggle, globalProgress }) => (
    <header className="flex-shrink-0 w-full p-4 flex flex-col gap-4 text-brand-text-light">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-brand-surface-dark border-2 border-white/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-text-medium" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                 </div>
                 <div>
                    <h1 className="text-xl font-bold">Storify</h1>
                 </div>
            </div>
            <div className="flex items-center gap-2">
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