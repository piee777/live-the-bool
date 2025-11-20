export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      API_KEY: string;
      GEMINI_API_KEY: string;
      NODE_ENV: 'development' | 'production' | 'test';
      [key: string]: string | undefined;
    }
  }
}
