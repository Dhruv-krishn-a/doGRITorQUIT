import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { invoke } from '@tauri-apps/api/core';
import { API_BASE_URL } from '../../../config/env';

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
        const baseUrl = API_BASE_URL;
        
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
        setEntitlements((prev: any) => prev || { 
          tier: 'Free', 
          features: {
            ACCESS_PLANS: true,
            ACCESS_HABITS: true,
            ACCESS_STUDY: true,
            MAX_PLANS: 1,
            AI_GEN_LIMIT: 5
          } 
        });
      } finally {
        setLoading(false);
      }
    }

    fetchEntitlementsData();
  }, [user, session]);

  return { entitlements, loading, error };
}
