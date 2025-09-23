
import React, { useState } from 'react';

interface LoginScreenProps {
    onLogin: (name: string, avatarFile: File | null) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const [name, setName] = useState('');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('يرجى إدخال اسمك للمتابعة.');
            return;
        }
        setError(null);
        setIsLoading(true);
        await onLogin(name, avatarFile);
        setIsLoading(false);
    };

    return (
        <main className="h-screen w-screen bg-brand-bg-dark text-brand-text-light flex items-center justify-center p-4 overflow-hidden">
            <div className="w-full max-w-sm mx-auto text-center animate-fade-in-up">
                <h1 className="text-5xl font-extrabold text-white">Storify</h1>
                <p className="font-arabic text-xl text-brand-text-medium mt-2 mb-8">أهلاً بك في عالم القصص التفاعلية</p>
                
                <div className="bg-brand-surface-dark p-6 sm:p-8 rounded-2xl shadow-2xl border border-white/10">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex flex-col items-center">
                            <label htmlFor="avatar-upload" className="cursor-pointer group">
                                <div className="w-24 h-24 rounded-full bg-brand-bg-dark border-4 border-dashed border-slate-600 group-hover:border-amber-500 transition-colors flex items-center justify-center overflow-hidden">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-500 group-hover:text-amber-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    )}
                                </div>
                            </label>
                            <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={isLoading} />
                            <p className="text-sm text-brand-text-dark mt-2 font-arabic">اختر صورة (اختياري)</p>
                        </div>

                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="أدخل اسمك هنا"
                            required
                            className="w-full p-3 bg-brand-bg-dark border-2 border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 transition-all text-brand-text-light placeholder-brand-text-dark font-arabic text-lg text-center"
                            disabled={isLoading}
                        />
                        
                        {error && <p className="text-red-400 font-arabic text-sm -mt-2">{error}</p>}
                        
                        <button
                            type="submit"
                            className="w-full bg-gradient-crimson-amber text-white py-3 px-6 rounded-lg shadow-lg hover:shadow-glow-amber transition-all transform hover:scale-105 disabled:opacity-50 disabled:scale-100 font-arabic font-bold text-lg flex items-center justify-center"
                            disabled={isLoading}
                        >
                           {isLoading ? (
                               <div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                           ) : (
                               "ابدأ المغامرة"
                           )}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
};