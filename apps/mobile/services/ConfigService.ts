import * as SecureStore from 'expo-secure-store'; // or your preferred storage
import { getAccessToken } from '@/lib/nativeAuth';
import { config as appConfig } from '../config';

const API_URL = `${appConfig.apiUrl}/api/v1/mobile-config`;

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
      // 1. Get token to prove identity to Next.js
      const token = await getAccessToken();

      if (!token) {
        console.log("No session found. Returning Guest Config.");
        return null; // Handle guest logic in UI
      }

      // 2. Call your new API Route
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
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
