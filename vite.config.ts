import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // The API key is injected at build time from the environment variable.
    'process.env.API_KEY': JSON.stringify(process.env.VITE_GEMINI_API_KEY),
  },
})
