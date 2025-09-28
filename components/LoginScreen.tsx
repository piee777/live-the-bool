import React, { useState, useRef } from 'react';
import { User } from '../types';
import { createUserProfile, getUserProfileByName, updateUserProfile } from '../services/supabaseService';

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
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
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
            // Fetch IP address first
            let userIp: string | undefined;
            try {
                const ipResponse = await fetch('/.netlify/functions/get-user-info');
                if (ipResponse.ok) {
                    const ipData = await ipResponse.json();
                    userIp = ipData.ip;
                }
            } catch (ipError) {
                console.warn("Could not fetch user IP:", ipError);
                // Continue without IP if it fails
            }

            const hashedPassword = await hashPassword(password);
            const existingUser = await getUserProfileByName(trimmedName);
            
            let avatar_url: string | undefined = undefined;
            if (avatarFile) {
                avatar_url = await fileToBase64(avatarFile);
            }

            if (existingUser) { // Login Flow
                if (existingUser.password_hash !== hashedPassword) {
                    setError("كلمة المرور غير صحيحة.");
                    setIsLoading(false);
                    return;
                }
                
                // Successful login, check for updates
                const updates: { avatar_url?: string; last_ip?: string } = {};
                if (avatar_url && avatar_url !== existingUser.avatar_url) {
                    updates.avatar_url = avatar_url;
                }
                if (userIp && userIp !== existingUser.last_ip) {
                    updates.last_ip = userIp;
                }

                if (Object.keys(updates).length > 0) {
                    const updatedUser = await updateUserProfile(existingUser.id, updates);
                    onLoginSuccess(updatedUser || existingUser);
                } else {
                    onLoginSuccess(existingUser);
                }

            } else { // Signup Flow
                if (!avatarFile) {
                    setError("صورة الملف الشخصي مطلوبة لإنشاء حساب جديد.");
                    setIsLoading(false);
                    return;
                }
                const newUser = await createUserProfile(trimmedName, hashedPassword, avatar_url, userIp);
                if (newUser) {
                    onLoginSuccess(newUser);
                } else {
                    setError("هذا الاسم مستخدم بالفعل أو حدث خطأ ما. حاول مرة أخرى.");
                    setIsLoading(false);
                }
            }

        } catch (error) {
            console.error("Error during login/signup:", error);
            setError("حدث خطأ غير متوقع.");
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
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-24 h-24 text-slate-700 group-hover:text-slate-500 transition-colors" viewBox="0 0 24 24" fill="currentColor">
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