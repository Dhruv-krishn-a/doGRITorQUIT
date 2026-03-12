import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { invoke } from '@tauri-apps/api/core';

export function useEntitlements() {
  const { user, session } = useAuth();
  const [entitlements, setEntitlements] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !session) {
      setLoading(false);
      return;
    }

    async function fetchEntitlementsData() {
      try {
        setLoading(true);
        // Ensure we point to the production Vercel API if in production build
        const isDev = import.meta.env.DEV;
        const defaultUrl = isDev ? 'http://localhost:3000' : 'https://dhruv-planner.vercel.app';
        const baseUrl = import.meta.env.VITE_API_BASE_URL || defaultUrl;
        
        // Check if running inside Tauri context
        const isTauri = '__TAURI_INTERNALS__' in window;

        if (isTauri) {
          // Use Rust bridge for secure communication when running natively
          const data = await invoke('fetch_entitlements', { 
            baseUrl, 
            token: session?.access_token || ""
          });
          setEntitlements(data);
        } else {
          // Fallback to standard fetch when previewing in browser (localhost:1420)
          const res = await fetch(`${baseUrl}/api/entitlements`, {
            headers: {
              'Authorization': `Bearer ${session?.access_token || ""}`
            }
          });
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || `API Error: ${res.status}`);
          }
          const data = await res.json();
          setEntitlements(data);
        }
      } catch (err: any) {
        console.error("Entitlements Fetch Error:", err);
        setError(err.toString());
        // Fallback to basic plan on network error to prevent total lock
        setEntitlements((prev: any) => prev || { tier: 'Free', features: [] });
      } finally {
        setLoading(false);
      }
    }

    fetchEntitlementsData();
  }, [user, session]);

  return { entitlements, loading, error };
}
