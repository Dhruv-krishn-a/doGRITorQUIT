//apps/desktop/src/features/auth/hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import { setAccessToken, setApiBaseUrl } from '@planner/study-core';
import { setHabitsAccessToken, setHabitsApiBaseUrl } from '@planner/habits-core';
import { setAccessToken as setDashboardAccessToken, setApiBaseUrl as setDashboardApiBaseUrl } from '@planner/dashboard-core';
import { saveOfflineLease } from '../../../lib/db';
import { API_BASE_URL } from '../../../config/env';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOfflineToken = useCallback(async (currentSession: Session) => {
    try {
      const baseUrl = API_BASE_URL;

      const res = await fetch(`${baseUrl}/api/auth/offline-token`, {
        headers: { 'Authorization': `Bearer ${currentSession.access_token}` }
      });
      if (res.ok) {
        const { token } = await res.json();
        const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        await saveOfflineLease(token, payload.exp);
      }
    } catch (e) {
      console.warn("Failed to fetch offline token:", e);
    }
  }, []);

  useEffect(() => {
    const baseUrl = API_BASE_URL;

    setApiBaseUrl(baseUrl);
    setHabitsApiBaseUrl(baseUrl);
    setDashboardApiBaseUrl(baseUrl);

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setAccessToken(session?.access_token ?? null);
      setHabitsAccessToken(session?.access_token ?? null);
      setDashboardAccessToken(session?.access_token ?? null);
      if (session) fetchOfflineToken(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setAccessToken(session?.access_token ?? null);
      setHabitsAccessToken(session?.access_token ?? null);
      setDashboardAccessToken(session?.access_token ?? null);
      if (session) fetchOfflineToken(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchOfflineToken]);

  return { user, session, loading };
}
