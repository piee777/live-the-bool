declare namespace NodeJS {
  interface ProcessEnv {
    readonly API_KEY: string;
    readonly GEMINI_API_KEY: string;
    readonly NODE_ENV: 'development' | 'production' | 'test';
  }
}
