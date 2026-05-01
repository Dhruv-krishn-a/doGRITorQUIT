//apps/desktop/src/features/auth/hooks/useAuth.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { setAccessToken, setApiBaseUrl } from '@gritorquit/study-core';
import { setHabitsAccessToken, setHabitsApiBaseUrl } from '@gritorquit/habits-core';
import { setAccessToken as setDashboardAccessToken, setApiBaseUrl as setDashboardApiBaseUrl } from '@gritorquit/dashboard-core';
import { saveOfflineLease, getDb } from '../../../lib/db';
import { API_BASE_URL, buildApiUrl } from '../../../config/env';
import { invoke } from '@tauri-apps/api/core';
import { useQueryClient } from '@tanstack/react-query';

export type SessionUser = {
  id: string;
  email?: string | null;
  user_metadata?: {
    full_name?: string | null;
    avatar_url?: string | null;
  };
};

export type Session = {
  access_token: string;
  user: SessionUser;
};

class AuthService extends EventTarget {
  getSession(): Session | null {
    const raw = localStorage.getItem('auth_session');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  setSession(session: Session | null) {
    if (session) {
      localStorage.setItem('auth_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('auth_session');
    }
    this.dispatchEvent(new Event('auth-change'));
  }

  logout() {
    this.setSession(null);
  }
}

export const authService = new AuthService();

export function useAuth() {
  const [user, setUser] = useState<SessionUser | null>(() => authService.getSession()?.user ?? null);
  const [session, setSession] = useState<Session | null>(() => authService.getSession());
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  const offlineTokenFetchRef = useRef({
    inFlight: false,
    lastAttemptMs: 0,
  });

  const fetchOfflineToken = useCallback(async (currentSession: Session) => {
    const now = Date.now();
    if (offlineTokenFetchRef.current.inFlight) return;
    if (now - offlineTokenFetchRef.current.lastAttemptMs < 30_000) return;

    offlineTokenFetchRef.current.inFlight = true;
    offlineTokenFetchRef.current.lastAttemptMs = now;

    try {
      let deviceId;
      try {
        deviceId = await invoke<string>('get_device_id');
      } catch (err) {
        console.warn("Failed to get hardware device ID from Tauri, falling back to static:", err);
        deviceId = "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4"; // Fallback only if Tauri command fails
      }

      const res = await fetch(buildApiUrl('/auth/offline-token'), {
        headers: {
          'Authorization': `Bearer ${currentSession.access_token}`,
          'x-device-id': deviceId,
        }
      });
      if (res.ok) {
        const { token } = await res.json();
        await saveOfflineLease(token);
      }
    } catch (e) {
      console.warn("Failed to fetch offline token:", e);
    } finally {
      offlineTokenFetchRef.current.inFlight = false;
    }
  }, []);

  const syncState = useCallback(async () => {
    const currentSession = authService.getSession();
    
    setSession(prev => {
      if (prev?.access_token === currentSession?.access_token && 
          prev?.user?.id === currentSession?.user?.id) {
        return prev;
      }
      
      if (!currentSession && prev) {
        // Security Cleanup
        invoke('clear_entitlements_cache').catch(() => {});
        queryClient.resetQueries();
        queryClient.clear();
        
        // Clear offline lease in SQLite on logout
        getDb().then(db => {
          db?.execute("DELETE FROM offline_lease").catch(() => {});
        });
      }

      return currentSession;
    });

    // Run all side-effects and other state setters OUTSIDE the updater function
    setUser(currentSession?.user ?? null);
    setAccessToken(currentSession?.access_token ?? null);
    setHabitsAccessToken(currentSession?.access_token ?? null);
    setDashboardAccessToken(currentSession?.access_token ?? null);
      
    if (currentSession) {
      fetchOfflineToken(currentSession);
      invoke('fetch_entitlements', { 
        baseUrl: API_BASE_URL, 
        token: currentSession.access_token 
      }).catch(() => {});
    }

    setLoading(false);
  }, [fetchOfflineToken, queryClient]);

  useEffect(() => {
    setApiBaseUrl(API_BASE_URL);
    setHabitsApiBaseUrl(API_BASE_URL);
    setDashboardApiBaseUrl(API_BASE_URL);

    syncState();

    const handleAuthChange = () => {
      syncState();
    };

    authService.addEventListener('auth-change', handleAuthChange);
    return () => authService.removeEventListener('auth-change', handleAuthChange);
  }, [syncState]);

  // Periodic offline token refresh (every hour) while online
  useEffect(() => {
    if (!session) return;
    
    const interval = setInterval(() => {
      if (navigator.onLine) fetchOfflineToken(session);
    }, 3600000);

    const handleOnline = () => {
      fetchOfflineToken(session);
    };

    window.addEventListener('online', handleOnline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
    };
  }, [session, fetchOfflineToken]);

  return { user, session, loading };
}
