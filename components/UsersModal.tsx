import React from 'react';
import { User } from '../types';

// Copied from ProfileView, can be extracted to a shared component later if needed
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

// Copied from ProfileView and adapted
const getTitleIcon = (title: string): string => {
    if (title.includes('المطور')) return '💻';
    if (title.includes('الفيلسوف')) return '🧠';
    if (title.includes('القرار')) return '🎯';
    if (title.includes('العبثي')) return '🌀';
    if (title.includes('قارئ')) return '📖';
    return '👤';
};

// Define a type for the users passed to the modal
interface ModalUser {
    id: string;
    name: string;
    avatar_url?: string;
    title: string;
}

interface UsersModalProps {
    isOpen: boolean;
    onClose: () => void;
    users: ModalUser[];
    currentUser: User; // To highlight the current user
}

export const UsersModal: React.FC<UsersModalProps> = ({ isOpen, onClose, users, currentUser }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div 
                className="bg-brand-surface-dark/95 w-full max-w-md rounded-2xl shadow-2xl border border-white/10 flex flex-col max-h-[80vh]" 
                onClick={e => e.stopPropagation()}
            >
                <h3 className="text-xl font-bold font-arabic text-center text-amber-500 p-4 border-b border-white/10 flex-shrink-0">
                    أبرز المستخدمين
                </h3>
                <div className="overflow-y-auto p-4 flex-grow">
                    <div className="space-y-3">
                        {users.map(featuredUser => {
                            const isCurrentUser = featuredUser.id === currentUser.id;
                            return (
                                <div 
                                    key={featuredUser.id} 
                                    className={`flex items-center p-3 gap-4 rounded-xl transition-all duration-300 border ${
                                        isCurrentUser 
                                        ? 'bg-amber-900/20 border-amber-500/50 scale-105 shadow-lg' 
                                        : 'bg-brand-surface-dark/50 border-white/10 opacity-50 blur-sm'
                                    }`}
                                >
                                    <div className="w-12 h-12 rounded-full bg-gradient-bronze-warm flex items-center justify-center font-bold text-xl text-white border-2 border-white/20 flex-shrink-0 overflow-hidden">
                                        {featuredUser.avatar_url ? (
                                            <img src={featuredUser.avatar_url} alt={featuredUser.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span>{featuredUser.name.charAt(0)}</span>
                                        )}
                                    </div>
                                    <div className="flex-grow text-right">
                                        <p className="font-bold text-lg font-arabic text-brand-text-light flex items-center">
                                            {featuredUser.name}
                                            {featuredUser.name === 'bensadel' && <VerifiedBadge className="w-4 h-4" />}
                                        </p>
                                        <p className="text-sm text-amber-400 font-arabic flex items-center gap-2">
                                            <span className="text-base">{getTitleIcon(featuredUser.title)}</span>
                                            {featuredUser.title}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};