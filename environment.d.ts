declare global {
    namespace NodeJS {
      interface ProcessEnv {
        OPENAI_API_KEY: string;
        PINATA_GATEWAY_TOKEN: string;
        PINATA_API_KEY: string;
        PINATA_SECRET_API_KEY: string;
        VITE_RECAPTCHA_SITE_KEY: string;
        COINGECKO_API_KEY: string;
        VITE_ETHERSCAN_API: string;
        // Add other variables as needed
      }
    }
  }
  
  // Export an empty object to ensure this file is treated as a module
  export {};
