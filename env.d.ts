// Augment the NodeJS namespace to define environment variables
// This avoids conflict with the global 'process' variable declared by @types/node
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
    VITE_SUPABASE_URL: string;
    VITE_SUPABASE_ANON_KEY: string;
    [key: string]: string | undefined;
  }
}
