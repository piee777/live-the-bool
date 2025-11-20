import React, { useState } from 'react';
import { UserGeneratedBook } from '../types';

interface CreateNovelProps {
    onSave: (bookData: Omit<UserGeneratedBook, 'id' | 'isUserGenerated' | 'user_id' | 'initialPrompt'> & { initialPrompt: string }) => void;
    onCancel: () => void;
    userName: string;
}

export const AddNovel: React.FC<CreateNovelProps> = ({ onSave, onCancel, userName }) => {
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState(userName);
    const [summary, setSummary] = useState('');
    const [details, setDetails] = useState('');
    const [error, setError] = useState('');

    const handleSaveClick = () => {
        if (!title.trim() || !summary.trim()) {
            setError("يرجى ملء حقلي العنوان والفكرة العامة على الأقل.");
            return;
        }
        setError('');

        const finalAuthor = author.trim() || userName;

        const initialPrompt = `
عنوان الرواية: ${title}
الكاتب: ${finalAuthor}
الفكرة العامة: ${summary}
${details.trim() ? `شخصيات وأحداث أولية: ${details}` : ''}
أسلوب الكتابة المطلوب: حافظ على أسلوب أدبي متماسك وجذاب، مع بناء الأحداث بشكل منطقي وتصاعدي.
`;

        const newBookData = {
            title,
            author: finalAuthor,
            summary,
            initialPrompt: initialPrompt.trim(),
        };

        onSave(newBookData);
    };

    return (
        <div className="p-4 sm:p-6 w-full h-full overflow-y-auto animate-fade-in text-brand-text-light">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl text-center font-bold font-arabic">أنشئ روايتك</h2>
                    <div>
                        <button onClick={onCancel} className="font-arabic py-2 px-4 rounded-lg hover:bg-white/10 transition-colors">إلغاء</button>
                        <button onClick={handleSaveClick} className="font-arabic bg-gradient-crimson-amber text-white py-2 px-6 rounded-lg shadow-lg hover:shadow-glow-amber transition-all mr-2">ابدأ السرد</button>
                    </div>
                </div>

                <div className="space-y-6 bg-brand-surface-dark p-6 rounded-xl border border-white/10">
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="عنوان الرواية (مطلوب)" className="w-full p-3 bg-brand-bg-dark border-2 border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 font-arabic text-lg"/>
                    <input type="text" value={author} onChange={e => setAuthor(e.target.value)} placeholder="اسم الكاتب" className="w-full p-3 bg-brand-bg-dark border-2 border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 font-arabic"/>
                    <textarea value={summary} onChange={e => setSummary(e.target.value)} placeholder="وصف قصير أو فكرة عامة عن الرواية (مطلوب)" className="w-full p-3 bg-brand-bg-dark border-2 border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 font-arabic" rows={4}/>
                    <textarea value={details} onChange={e => setDetails(e.target.value)} placeholder="شخصيات رئيسية وأحداث أولية (اختياري)" className="w-full p-3 bg-brand-bg-dark border-2 border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 font-arabic" rows={4}/>
                    {error && <p className="text-red-400 font-arabic text-sm">{error}</p>}
                </div>
            </div>
        </div>
    );
};