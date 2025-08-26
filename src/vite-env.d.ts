declare module '*.css';

declare namespace NodeJS {
  interface ProcessEnv {
    readonly API_KEY: string;
  }
}
