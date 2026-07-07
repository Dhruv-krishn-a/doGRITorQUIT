import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import * as Haptics from 'expo-haptics';
import { performSyncOnce } from '../services/SyncServices';
import { database } from '../db';

type SyncStatus = 'IDLE' | 'SYNCING' | 'SUCCESS' | 'ERROR';

interface SyncContextType {
  status: SyncStatus;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  sync: () => Promise<void>;
  clearLocalData: () => Promise<void>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [status, setStatus] = useState<SyncStatus>('IDLE');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  const sync = useCallback(async () => {
    if (!user) return;
    
    setStatus('SYNCING');
    setIsSyncing(true);
    try {
      await performSyncOnce();

      setLastSyncedAt(new Date());
      setStatus('SUCCESS');
      
      // Reset to IDLE after 3 seconds
      setTimeout(() => setStatus('IDLE'), 3000);
    } catch (error) {
      const message =
        typeof error === 'object' && error && 'message' in error
          ? String((error as { message?: unknown }).message ?? '')
          : '';
      const code =
        typeof error === 'object' && error && 'code' in error
          ? String((error as { code?: unknown }).code ?? '')
          : '';

      if (code === 'PGRST202' || message.includes('pull_changes')) {
        console.warn(
          'Cloud sync RPC is not configured (pull_changes/push_changes missing). Mobile will stay local-only until backend sync functions are added.'
        );
        setStatus('IDLE');
        return;
      }

      if (code === 'SYNC_RPC_NOT_CONFIGURED') {
        console.warn(
          'Cloud sync RPC is not configured on backend. Mobile will stay local-only until sync migration is applied.'
        );
        setStatus('IDLE');
        return;
      }

      if (message === 'Network request failed' || message.includes('Failed to fetch') || message.includes('NetworkError')) {
        console.warn('[Sync] Network error during sync. Working in offline mode.');
        setStatus('IDLE');
        return;
      }

      console.error("Sync failed:", error);
      setStatus('ERROR');
    } finally {
      setIsSyncing(false);
    }
  }, [user]);

  const clearLocalData = useCallback(async () => {
    await database.unsafeResetDatabase();
    setLastSyncedAt(null);
    setStatus('IDLE');
  }, []);

  // Auto-sync on launch and when user changes
  useEffect(() => {
    if (user) {
      sync();
    }
  }, [user, sync]);

  return (
    <SyncContext.Provider value={{ status, isSyncing, lastSyncedAt, sync, clearLocalData }}>
      {children}
    </SyncContext.Provider>
  );
}

export const useSync = () => {
  const context = useContext(SyncContext);
  if (!context) throw new Error('useSync must be used within SyncProvider');
  return context;
};
