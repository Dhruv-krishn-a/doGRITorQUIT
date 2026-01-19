import * as SecureStore from 'expo-secure-store'; // or your preferred storage
import { supabase } from '@/lib/supabase'; // Your initialized Supabase client

const API_URL = "https://your-production-url.com/api/v1/config";

export interface AppConfig {
  isGuest: boolean;
  permissions: {
    canSync: boolean;
    maxTasks: number;
    localStorage: boolean;
  };
}

export const ConfigService = {
  /**
   * Fetches the feature flags & permissions for the current user.
   * Call this immediately after Login and on App Resume.
   */
  async fetchConfig(): Promise<AppConfig | null> {
    try {
      // 1. Get the current session token to prove identity to Next.js
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        console.log("No session found. Returning Guest Config.");
        return null; // Handle guest logic in UI
      }

      // 2. Call your new API Route
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, // If you use middleware, or just rely on cookies
          // Note: If using Supabase SSR cookies, standard fetch might need 'credentials: include'
          // But for API routes, Bearer token header is usually safer/easier for mobile.
          'Content-Type': 'application/json',
          'cookie': `sb-access-token=${token}` // Hack to pass Supabase auth to Next.js 'getServerUser'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch config');

      const config: AppConfig = await response.json();
      
      // 3. Persist this config locally so the app works offline next time
      await SecureStore.setItemAsync('app_config', JSON.stringify(config));

      return config;

    } catch (error) {
      console.error("Config fetch failed, falling back to cached config:", error);
      // 4. Fallback: Try to load last known good config (Offline Mode support)
      const cached = await SecureStore.getItemAsync('app_config');
      return cached ? JSON.parse(cached) : null;
    }
  }
};