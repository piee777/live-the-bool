import React from 'react';

type View = 'library' | 'chat' | 'story' | 'profile' | 'behaviorAnalysis' | 'chatsList' | 'discover';

interface BottomNavBarProps {
  currentView: View;
  setView: (view: View) => void;
  isStoryMode: boolean;
}

const NavButton: React.FC<{
  label: string;
  icon: React.ReactNode;
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


export const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentView, setView, isStoryMode }) => {
  const StoryNav = () => (
    <>
      <NavButton
        label="القصة"
        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M19.3,4.22A5.1,5.1,0,0,0,16.21,3H7.79A5.1,5.1,0,0,0,4.7,4.22L3.13,8.39a3.18,3.18,0,0,0,0,2.16L4.7,14.72A5.1,5.1,0,0,0,7.79,16H16.21a5.1,5.1,0,0,0,3.09-1.22l1.57-4.17a3.18,3.18,0,0,0,0-2.16Zm-2,5.29L15.73,13.7a3.12,3.12,0,0,1-1.89.75H10.16a3.12,3.12,0,0,1-1.89-.75L6.7,9.51a1.21,1.21,0,0,1,0-.81L8.27,4.92a3.12,3.12,0,0,1,1.89-.75h5.68a3.12,3.12,0,0,1,1.89.75l1.57,4.17A1.21,1.21,0,0,1,17.29,9.51Z"></path><path d="M12.92,21.58a1,1,0,0,0,1.41,0l5.44-5.44a1,1,0,0,0-1.42-1.41L13,19.09V13a1,1,0,0,0-2,0v6.09l-3.35-3.36a1,1,0,0,0-1.42,1.41Z"></path></svg>}
        isActive={currentView === 'story'}
        isDisabled={!isStoryMode}
        activeGradient="bg-gradient-crimson-amber"
        onClick={() => setView('story')}
      />
      <NavButton
        label="التحليل"
        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L8 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"></path></svg>}
        isActive={currentView === 'behaviorAnalysis'}
        isDisabled={!isStoryMode}
        activeGradient="bg-gradient-bronze-warm"
        onClick={() => setView('behaviorAnalysis')}
      />
    </>
  );

  const MainNav = () => (
    <>
      <NavButton
        label="اكتشف"
        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
        isActive={currentView === 'discover'}
        activeGradient="bg-gradient-bronze-warm"
        onClick={() => setView('discover')}
      />
      <NavButton
        label="المحادثات"
        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
        isActive={currentView === 'chatsList' || currentView === 'chat'}
        activeGradient="bg-gradient-crimson-amber"
        onClick={() => setView('chatsList')}
      />
    </>
  );

  return (
    <footer className="flex-shrink-0 w-full bg-brand-surface-dark/80 backdrop-blur-lg border-t border-white/10">
      <nav className="max-w-xl mx-auto flex justify-around items-center">
        <NavButton
          label="المكتبة"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M20 22H6c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h14v11l-4-2-4 2V4H6v16h14V14l-4-2-4 2v8z"></path></svg>}
          isActive={currentView === 'library'}
          activeGradient="bg-gradient-crimson-amber"
          onClick={() => setView('library')}
        />
        
        {isStoryMode ? <StoryNav /> : <MainNav />}

        <NavButton
          label="البروفايل"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path></svg>}
          isActive={currentView === 'profile'}
          activeGradient="bg-gradient-crimson-amber"
          onClick={() => setView('profile')}
        />
      </nav>
    </footer>
  );
};