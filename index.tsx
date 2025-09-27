import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// استدعاء المفتاح من متغير البيئة
const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!geminiKey) {
  console.warn("API key غير موجود. بعض الوظائف لن تعمل.");
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App geminiKey={geminiKey} />
  </React.StrictMode>
);
