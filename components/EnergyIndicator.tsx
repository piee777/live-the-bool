import React from 'react';

interface EnergyIndicatorProps {
  current: number;
  max: number;
}

export const EnergyIndicator: React.FC<EnergyIndicatorProps> = ({ current, max }) => {
  return (
    <div className="flex items-center gap-1" title={`${current} طاقة متبقية`}>
        {[...Array(max)].map((_, i) => (
            <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-colors ${i < current ? 'text-amber-400' : 'text-slate-600'}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
        ))}
    </div>
  );
};