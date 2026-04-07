import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../auth/hooks/useAuth';
import { invoke } from '@tauri-apps/api/core';
import { API_BASE_URL, buildApiUrl } from '../../../config/env';
import { LazyStore } from '@tauri-apps/plugin-store';

const store = new LazyStore('entitlements.json');

export function useEntitlements() {
  const { user, session } = useAuth();

  const query = useQuery({
    queryKey: ['entitlements', user?.id],
    queryFn: async () => {
      if (!user || !session) return null;

      // Check if running inside Tauri context
      const isTauri = '__TAURI_INTERNALS__' in window;

      let data;
      if (isTauri) {
        // Use Rust bridge for secure communication when running natively
        data = await invoke<any>('fetch_entitlements', { 
          baseUrl: API_BASE_URL, 
          token: session?.access_token || ""
        });
      } else {
        // Fallback to standard fetch when previewing in browser (localhost:1420)
        const res = await fetch(buildApiUrl('/entitlements'), {
          headers: {
            'Authorization': `Bearer ${session?.access_token || ""}`
          }
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `API Error: ${res.status}`);
        }
        data = await res.json();
      }

      if (data && isTauri) {
        await store.set('cache', data);
        await store.save();
      }
      return data;
    },
    enabled: !!user && !!session,
    placeholderData: (previousData) => previousData,
    staleTime: 24 * 60 * 60 * 1000, // Entitlements rarely change, cache for 24h
  });

  return { 
    entitlements: query.data || { 
      tier: 'Free', 
      features: {
        ACCESS_PLANS: true,
        ACCESS_HABITS: true,
        ACCESS_STUDY: true,
        MAX_PLANS: 1,
        AI_GEN_LIMIT: 5
      } 
    }, 
    loading: query.isLoading, 
    error: query.error ? String(query.error) : null 
  };
}
