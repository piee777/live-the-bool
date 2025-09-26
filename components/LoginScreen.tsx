import React, { useState, useRef } from 'react';
import { User } from '../types';
import * as supabase from '../services/supabaseService';

interface LoginScreenProps {
    onLoginSuccess: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
    const [name, setName] = useState('');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleCreateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('الرجاء إدخال اسم.');
            return;
        }
        setIsLoading(true);
        setError('');
        
        try {
            const newUser = await supabase.createUserProfile(name, avatarFile);
            if (newUser) {
                onLoginSuccess(newUser);
            } else {
                setError('حدث خطأ أثناء إنشاء ملفك الشخصي. حاول مرة أخرى.');
            }
        } catch (err) {
            setError('فشل الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-6 bg-brand-bg-dark animate-fade-in overflow-hidden">
             {/* Glowing effects */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-radial from-brand-amber/30 to-transparent rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl animate-pulse-slow"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-radial from-brand-crimson/30 to-transparent rounded-full translate-x-1/2 translate-y-1/2 blur-3xl animate-pulse-slow" style={{ animationDelay: '4s' }}></div>

            <div className="relative z-10 w-full max-w-sm text-center">
                <h1 className="text-4xl font-extrabold text-brand-text-light font-arabic">أهلاً بك في Storify</h1>
                <p className="text-brand-text-medium font-arabic mt-2">أنشئ ملفك الشخصي لتبدأ رحلتك في عالم الروايات.</p>

                <form onSubmit={handleCreateProfile} className="mt-8 space-y-6">
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleAvatarChange}
                        className="hidden"
                    />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="relative w-32 h-32 mx-auto rounded-full bg-brand-surface-dark border-2 border-slate-700 hover:border-amber-500 transition-all flex items-center justify-center group">
                        {avatarPreview ? (
                            <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover rounded-full"/>
                        ) : (
                            <svg xmlns="http://www.w.org/2000/svg" className="w-24 h-24 text-slate-700 group-hover:text-slate-500 transition-colors" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                        )}
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white font-bold font-arabic text-sm">تغيير</span>
                        </div>
                    </button>

                    <div>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="اكتب اسمك هنا..."
                            className="w-full p-4 bg-brand-surface-dark border-2 border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 transition-all text-brand-text-light placeholder-brand-text-dark font-arabic text-center text-lg"
                            disabled={isLoading}
                        />
                    </div>
                    
                    {error && <p className="text-red-400 font-arabic text-sm">{error}</p>}

                    <button
                        type="submit"
                        className="w-full p-4 font-bold font-arabic text-lg bg-gradient-crimson-amber text-white rounded-lg shadow-lg hover:shadow-glow-amber transition-all disabled:opacity-50 disabled:cursor-wait"
                        disabled={isLoading || !name.trim()}
                    >
                        {isLoading ? 'جاري الإنشاء...' : 'ابدأ المغامرة'}
                    </button>
                </form>
            </div>
        </div>
    );
};