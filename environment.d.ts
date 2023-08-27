declare global {
    namespace NodeJS {
      interface ProcessEnv {
        OPENAI_API_KEY: string;
        NODE_ENV: 'development' | 'production';
        PORT?: string;
        PWD?: string;
        // Add other variables as needed
      }
    }
  }
  
  // Export an empty object to ensure this file is treated as a module
  export {};
