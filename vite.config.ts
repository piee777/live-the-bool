
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // The API key is injected at build time from the environment variable.
    // Priority: GEMINI_API_KEY (Netlify standard) -> API_KEY (Local fallback) -> Empty String
    'process.env.API_KEY': JSON.stringify(process.env.GEMINI_API_KEY || process.env.API_KEY || ""),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || "development"),
  },
})