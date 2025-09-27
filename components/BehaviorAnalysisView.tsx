import React, { useMemo } from 'react';
import { Discovery, Character } from '../types';
import { Typewriter } from './Typewriter';

interface BehaviorAnalysisViewProps {
  discoveries: Discovery[];
  character: Character;
  analysisText: string | null;
  isLoading: boolean;
}

const RadarChart: React.FC<{ data: { axis: string; value: number; color: string }[] }> = ({ data }) => {
    const size = 250;
    const center = size / 2;
    const levels = 5;
    const radius = size * 0.4;
    const angleSlice = (Math.PI * 2) / data.length;

    const points = data.map((d, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const x = center + radius * Math.max(0, d.value) * Math.cos(angle);
        const y = center + radius * Math.max(0, d.value) * Math.sin(angle);
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Grid */}
            {[...Array(levels)].map((_, levelIndex) => (
                <polygon
                    key={levelIndex}
                    points={data.map((_, i) => {
                        const r = radius * ((levelIndex + 1) / levels);
                        const angle = angleSlice * i - Math.PI / 2;
                        return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#404040"
                    strokeWidth="0.5"
                />
            ))}
            {/* Axes */}
            {data.map((_, i) => {
                const angle = angleSlice * i - Math.PI / 2;
                const x = center + radius * Math.cos(angle);
                const y = center + radius * Math.sin(angle);
                return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="#404040" strokeWidth="0.5" />;
            })}
            {/* Data Polygon */}
            <polygon points={points} fill="rgba(217, 119, 6, 0.4)" stroke="#d97706" strokeWidth="2" />
             {/* Labels */}
             {data.map((d, i) => {
                const angle = angleSlice * i - Math.PI / 2;
                const r = radius * 1.2;
                const x = center + r * Math.cos(angle);
                const y = center + r * Math.sin(angle);
                return <text key={i} x={x} y={y} fill="#a8a29e" fontSize="12" textAnchor="middle" dominantBaseline="middle" className="font-arabic">{d.axis}</text>
            })}
        </svg>
    );
};

export const BehaviorAnalysisView: React.FC<BehaviorAnalysisViewProps> = ({ discoveries, character, analysisText, isLoading }) => {
    
    const analysisData = useMemo(() => {
        if (discoveries.length === 0) return [];
        const counts: Record<Discovery['category'], number> = { existential: 0, pragmatic: 0, absurdist: 0 };
        for (const discovery of discoveries) {
            counts[discovery.category] = (counts[discovery.category] || 0) + 1;
        }
        const total = discoveries.length;
        
        return [
            { axis: 'وجودي', value: counts['existential'] / total, color: '#818cf8' },
            { axis: 'عملي', value: counts['pragmatic'] / total, color: '#38bdf8' },
            { axis: 'عبثي', value: counts['absurdist'] / total, color: '#991b1b' },
        ];
    }, [discoveries]);

    return (
        <div className="p-4 sm:p-6 w-full h-full overflow-y-auto animate-fade-in bg-brand-bg-dark">
            <div className="max-w-3xl mx-auto space-y-8">
                <h2 className="text-3xl text-center font-bold text-slate-100 font-arabic">تحليل السلوك</h2>

                {/* Radar Chart */}
                <div className="bg-brand-surface-dark p-4 sm:p-6 rounded-xl border border-white/10">
                    <h3 className="text-xl font-bold font-arabic mb-4 text-center">أنماط قراراتك</h3>
                    <div className="flex items-center justify-center">
                        {discoveries.length > 0 ? (
                           <RadarChart data={analysisData} />
                        ) : (
                           <div className="h-[250px] flex items-center justify-center">
                             <p className="text-center text-brand-text-medium font-arabic">لا توجد بيانات كافية للتحليل بعد.</p>
                           </div>
                        )}
                    </div>
                </div>
                
                {/* Character's Analysis */}
                 <div className="bg-brand-surface-dark p-6 rounded-xl border border-white/10">
                    <h3 className="text-xl font-bold font-arabic mb-4 text-center">رأي {character.name}</h3>
                    <div className="min-h-[150px] flex items-center justify-center p-4 bg-brand-bg-dark/50 rounded-lg">
                        {isLoading && (
                            <div className="flex items-center space-x-2 space-x-reverse">
                                <div className="w-3 h-3 bg-slate-400 rounded-full animate-pulse"></div>
                                <div className="w-3 h-3 bg-slate-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                                <div className="w-3 h-3 bg-slate-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                            </div>
                        )}
                        {analysisText && !isLoading && (
                            <Typewriter 
                                text={analysisText} 
                                speed={20}
                                className="text-brand-text-light font-arabic text-lg italic leading-relaxed text-center" 
                            />
                        )}
                    </div>
                 </div>
            </div>
        </div>
    );
};
