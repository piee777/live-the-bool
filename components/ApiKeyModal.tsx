import React, { useState } from 'react';

interface ApiKeyModalProps {
  onSave: (apiKey: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSave }) => {
  const [key, setKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      onSave(key.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-brand-surface-dark/90 w-full max-w-md rounded-2xl shadow-2xl border border-white/10 p-6 sm:p-8">
        <div className="text-center">
            <h2 className="text-2xl font-bold font-arabic text-amber-500">مطلوب مفتاح API</h2>
            <p className="mt-2 text-brand-text-medium font-arabic">
                لتفعيل ميزات الذكاء الاصطناعي، يرجى إدخال مفتاح Google Gemini API الخاص بك.
                <br />
                سيتم حفظه في متصفحك فقط ولن يتم إرساله لأي مكان آخر.
            </p>
             <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-sm text-amber-600 hover:underline font-arabic">
                احصل على مفتاح من Google AI Studio
            </a>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-brand-text-light font-arabic text-right mb-1">
              مفتاح Gemini API
            </label>
            <input
              id="apiKey"
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="أدخل مفتاحك هنا"
              className="w-full p-3 px-4 bg-brand-bg-dark border-2 border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 transition-all text-brand-text-light placeholder-brand-text-dark font-arabic"
              required
              autoComplete="off"
            />
          </div>
          <button
            type="submit"
            className="w-full p-3 bg-gradient-crimson-amber text-white rounded-lg font-bold hover:shadow-glow-amber disabled:opacity-50 transition-all shadow-lg font-arabic"
            disabled={!key.trim()}
          >
            حفظ و بدء الاستخدام
          </button>
        </form>
      </div>
    </div>
  );
};