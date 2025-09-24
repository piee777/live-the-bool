import React, { useState } from 'react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (apiKey: string) => void;
  error?: string | null;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSubmit, error }) => {
  const [key, setKey] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      onSubmit(key.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-brand-surface-dark/90 w-full max-w-lg rounded-2xl shadow-2xl border border-white/10 p-6" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <h3 className="text-xl font-bold font-arabic text-center text-amber-500 mb-4">مفتاح Gemini API مطلوب</h3>
          <p className="text-brand-text-medium font-arabic mb-4 text-center">
            لتفعيل ميزات الذكاء الاصطناعي، يرجى إدخال مفتاح Google AI Studio API الخاص بك.
          </p>
          <div className="bg-amber-950/50 border border-amber-700/50 text-amber-300 text-sm rounded-lg p-3 mb-4 font-arabic">
            <strong className="font-bold">تحذير أمني:</strong> لا تشارك هذا المفتاح أبدًا. استخدامه في المتصفح أقل أمانًا من استخدامه في الخادم. يوصى باستخدام مفتاح مخصص لهذا التطبيق فقط.
          </div>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="أدخل مفتاح API هنا..."
            className="w-full p-3 bg-brand-bg-dark border-2 border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 font-arabic text-lg text-center"
            autoFocus
          />
          {error && <p className="text-red-400 font-arabic text-sm text-center mt-3">{error}</p>}
          <div className="flex gap-4 mt-6">
            <button type="button" onClick={onClose} className="flex-1 font-arabic py-3 px-4 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
              إلغاء
            </button>
            <button type="submit" className="flex-1 font-arabic bg-gradient-crimson-amber text-white py-3 px-6 rounded-lg shadow-lg hover:shadow-glow-amber transition-all">
              حفظ وبدء المحادثة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};