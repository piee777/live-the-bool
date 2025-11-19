import React, { useState, useRef } from 'react';
import { User } from '../types';
import { supabase } from '../services/supabaseService';

interface LoginScreenProps {
    onLoginSuccess: (user: User) => void;
}

const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });

const hashPassword = async (password: string): Promise<string> => {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                setError("حجم الصورة كبير جدًا. الرجاء اختيار صورة أصغر من 2 ميجابايت.");
                return;
            }
            setError('');
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleLoginOrSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = name.trim();
        if (!trimmedName || !password.trim()) {
            setError('الرجاء إدخال الاسم وكلمة المرور.');
            return;
        }
        setIsLoading(true);
        setError('');

        try {
            const hashedPassword = await hashPassword(password);

            // 1. Check if user exists
            const { data: existingUser, error: fetchError } = await supabase
                .from('profiles')
                .select('*')
                .eq('name', trimmedName)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') {
                 throw fetchError;
            }

            if (existingUser) {
                // Login
                if (existingUser.password_hash === hashedPassword) {
                    onLoginSuccess(existingUser);
                } else {
                    setError('كلمة المرور غير صحيحة.');
                }
            } else {
                // Signup
                if (!avatarFile) {
                    setError('الصورة الشخصية مطلوبة لإنشاء حساب جديد.');
                    setIsLoading(false);
                    return;
                }
                
                const avatar_url = await fileToBase64(avatarFile);
                
                const { data: newUser, error: createError } = await supabase
                    .from('profiles')
                    .insert({
                        name: trimmedName,
                        password_hash: hashedPassword,
                        avatar_url
                    })
                    .select('*')
                    .single();
                
                if (createError) throw createError;
                
                if (newUser) {
                    onLoginSuccess(newUser);
                }
            }
        } catch (error: any) {
            console.error("Error during login/signup:", error);
            setError(error.message || "حدث خطأ غير متوقع.");
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
                <p className="text-brand-text-medium font-arabic mt-2">أدخل اسمك للمتابعة أو لإنشاء حساب جديد.</p>

                <form onSubmit={handleLoginOrSignup} className="mt-8 space-y-4">
                    <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
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

                    <div className="space-y-4">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="اكتب اسمك هنا..."
                            className="w-full p-4 bg-brand-surface-dark border-2 border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 transition-all text-brand-text-light placeholder-brand-text-dark font-arabic text-center text-lg"
                            disabled={isLoading}
                            maxLength={20}
                        />
                         <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="كلمة المرور"
                            className="w-full p-4 bg-brand-surface-dark border-2 border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 transition-all text-brand-text-light placeholder-brand-text-dark font-arabic text-center text-lg"
                            disabled={isLoading}
                        />
                    </div>
                    
                    {error && <p className="text-red-400 font-arabic text-sm mt-2">{error}</p>}

                    <button
                        type="submit"
                        className="w-full p-4 font-bold font-arabic text-lg bg-gradient-crimson-amber text-white rounded-lg shadow-lg hover:shadow-glow-amber transition-all disabled:opacity-50 disabled:cursor-wait mt-6"
                        disabled={isLoading || !name.trim() || !password.trim()}
                    >
                        {isLoading ? 'جاري التحقق...' : 'متابعة'}
                    </button>
                </form>
            </div>
        </div>
    );
};