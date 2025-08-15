import React from 'react';

type View = 'library' | 'chat' | 'story' | 'achievements' | 'journal';

interface BottomNavBarProps {
  currentView: View;
  setView: (view: View) => void;
  isChatActive: boolean;
  isStoryActive: boolean;
}

const NavButton: React.FC<{
  label: string;
  icon: JSX.Element;
  isActive: boolean;
  isDisabled?: boolean;
  activeGradient: string;
  onClick: () => void;
}> = ({ label, icon, isActive, isDisabled, activeGradient, onClick }) => {
  const activeClasses = "text-amber-500";
  const inactiveClasses = "text-brand-text-dark hover:text-brand-text-medium";
  const disabledClasses = "text-slate-600 cursor-not-allowed";

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`relative flex-1 flex flex-col items-center justify-center h-16 transition-colors duration-200 group focus:outline-none`}
      aria-label={label}
    >
      {isActive && <div className={`absolute top-0 h-1 w-10 rounded-b-full ${activeGradient}`}></div>}
      <div className={`transition-all ${isActive ? 'text-amber-500' : isDisabled ? disabledClasses : 'text-brand-text-dark group-hover:text-brand-text-medium'}`}>
        {icon}
      </div>
      <span className={`text-xs font-bold font-arabic mt-1 transition-colors ${isActive ? activeClasses : isDisabled ? disabledClasses : 'text-brand-text-dark group-hover:text-brand-text-medium'}`}>{label}</span>
    </button>
  );
};


export const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentView, setView, isChatActive, isStoryActive }) => {
  return (
    <footer className="flex-shrink-0 w-full bg-brand-surface-dark/80 backdrop-blur-lg border-t border-white/10">
      <nav className="max-w-md mx-auto flex justify-around items-center">
        <NavButton
          label="المكتبة"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
          isActive={currentView === 'library'}
          activeGradient="bg-gradient-crimson-amber"
          onClick={() => setView('library')}
        />
        <NavButton
          label="القصة"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>}
          isActive={currentView === 'story'}
          isDisabled={!isStoryActive}
          activeGradient="bg-gradient-crimson-amber"
          onClick={() => setView('story')}
        />
        <NavButton
            label="المذكرات"
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>}
            isActive={currentView === 'journal'}
            isDisabled={!isStoryActive}
            activeGradient="bg-gradient-bronze-warm"
            onClick={() => setView('journal')}
        />
        <NavButton
          label="المحادثة"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
          isActive={currentView === 'chat'}
          isDisabled={!isChatActive}
          activeGradient="bg-gradient-bronze-warm"
          onClick={() => setView('chat')}
        />
        <NavButton
          label="الإنجازات"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round"strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
          isActive={currentView === 'achievements'}
          activeGradient="bg-gradient-crimson-amber"
          onClick={() => setView('achievements')}
        />
      </nav>
    </footer>
  );
};
