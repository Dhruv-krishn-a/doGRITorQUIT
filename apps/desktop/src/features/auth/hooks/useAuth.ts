//apps/desktop/src/features/auth/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set API Base URL
    (window as any).VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      (window as any).SUPABASE_SESSION_TOKEN = session?.access_token;
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      (window as any).SUPABASE_SESSION_TOKEN = session?.access_token;
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, session, loading };
}
