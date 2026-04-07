import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { LazyStore } from '@tauri-apps/plugin-store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 24 * 60 * 60 * 1000, // Keep in cache for 24h
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Custom Persister for Tauri Store
const store = new LazyStore('query_cache.json');

const tauriPersister = {
  persistClient: async (client: any) => {
    await store.set('cache', client);
    await store.save();
  },
  restoreClient: async () => {
    return await store.get<any>('cache');
  },
  removeClient: async () => {
    await store.delete('cache');
    await store.save();
  },
};

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ 
        persister: tauriPersister as any,
        maxAge: 24 * 60 * 60 * 1000, // 24h
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
