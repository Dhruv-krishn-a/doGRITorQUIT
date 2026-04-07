/// <reference types="nativewind/types" />

// Add this to fix 'process' errors and get autocomplete!
declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_API_URL?: string;
    // Add other keys here if needed
    [key: string]: string | undefined;
  }
}
