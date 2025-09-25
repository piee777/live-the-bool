import React, { useState, useEffect } from 'react';

interface FateRollModalProps {
  challenge: string;
  onResult: (result: 'نجاح!' | 'فشل!') => void;
}

const Dice: React.FC = () => (
    <div className="w-24 h-24 bg-brand-text-light rounded-lg flex items-center justify-center animate-spin" style={{ animationDuration: '1.5s', animationIterationCount: 'infinite', animationTimingFunction: 'linear' }}>
        <span className="text-5xl text-brand-bg-dark">🎲</span>
    </div>
);

export const FateRollModal: React.FC<FateRollModalProps> = ({ challenge, onResult }) => {
    const [status, setStatus] = useState<'rolling' | 'success' | 'failure'>('rolling');
    const [resultText, setResultText] = useState('');

    useEffect(() => {
        const rollTimer = setTimeout(() => {
            const success = Math.random() > 0.5;
            if (success) {
                setStatus('success');
                setResultText('نجاح!');
            } else {
                setStatus('failure');
                setResultText('فشل!');
            }
        }, 2500); // Roll animation duration

        return () => clearTimeout(rollTimer);
    }, []);

    useEffect(() => {
        if (status === 'success' || status === 'failure') {
            const resultTimer = setTimeout(() => {
                onResult(resultText as 'نجاح!' | 'فشل!');
            }, 1500); // Show result for 1.5s
            return () => clearTimeout(resultTimer);
        }
    }, [status, onResult, resultText]);

    const getStatusStyles = () => {
        switch (status) {
            case 'success':
                return {
                    text: 'text-green-400',
                    content: <span className="text-8xl">✓</span>
                };
            case 'failure':
                return {
                    text: 'text-red-400',
                    content: <span className="text-8xl">✗</span>
                };
            default: // rolling
                return {
                    text: '',
                    content: <Dice />
                };
        }
    };
    
    const { text: statusTextColor, content: statusContent } = getStatusStyles();

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-brand-surface-dark/95 w-full max-w-md rounded-2xl shadow-2xl border border-white/10 p-8 text-center" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold font-arabic text-amber-500 mb-4">اختبار القدر</h3>
                <p className="text-brand-text-light font-arabic text-lg mb-8 min-h-[56px]">{challenge}</p>
                
                <div className="flex justify-center items-center h-40">
                    {status === 'rolling' ? (
                        statusContent
                    ) : (
                        <div className={`flex flex-col items-center animate-fade-in ${statusTextColor}`}>
                            {statusContent}
                            <p className="text-4xl font-bold font-arabic mt-4">{resultText}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};