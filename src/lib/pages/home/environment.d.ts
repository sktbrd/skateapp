declare global {
  namespace NodeJS {
    interface ProcessEnv {
      OPENAI_API_KEY: string;
      PINATA_API_KEY: string;
      PINATA_API_SECRET: string;
      // Add other variables as needed
    }
  }
}

// Export an empty object to ensure this file is treated as a module
export {};
