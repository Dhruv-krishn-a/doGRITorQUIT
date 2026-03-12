// apps/desktop/src/config/env.ts

const isDev = import.meta.env.DEV;

// Primary Production URL
export const PRODUCTION_URL = 'https://dogritorquit.in';

// API Base URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (isDev ? 'http://localhost:3000' : PRODUCTION_URL);

// Web App URL (for external links like checkout)
export const WEB_URL = import.meta.env.VITE_WEB_URL || 
  (isDev ? 'http://localhost:3000' : PRODUCTION_URL);
