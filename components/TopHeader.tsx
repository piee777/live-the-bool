import React from 'react';
import { User } from '../types';

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


interface TopHeaderProps {
  user: User;
  globalProgress: number;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ user, globalProgress }) => (
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
                    <h1 className="text-xl font-bold font-arabic flex items-center">
                        أهلاً، {user.name}
                        {user.name === 'bensadel' && <VerifiedBadge />}
                    </h1>
                 </div>
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