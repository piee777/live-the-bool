
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // The API key is injected at build time from the environment variable.
    // Using GEMINI_API_KEY to match Netlify build environment variable.
    'process.env.API_KEY': JSON.stringify(process.env.GEMINI_API_KEY || ""),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || "development"),
  },
})
