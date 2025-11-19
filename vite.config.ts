import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Inject environment variables at build time
    'process.env.API_KEY': JSON.stringify(process.env.GEMINI_API_KEY),
    'process.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL),
    'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY),
    // Prevent crashes if process.env is accessed directly
    'process.env': process.env,
  },
})