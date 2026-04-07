import { useState, useEffect, useCallback } from 'react';
import { getDb } from '../lib/db';
import { SyncEngine } from '../services/sync.engine';

export function useSyncStatus() {
  const [queueCount, setQueueCount] = useState(0);

  const checkQueue = useCallback(async () => {
    const db = await getDb();
    if (!db) return;
    
    const q = await db.select<any[]>("SELECT COUNT(*) as count FROM sync_queue");
    const n = await db.select<any[]>("SELECT COUNT(*) as count FROM notes WHERE syncStatus != 'SYNCED' AND syncStatus != 'FAILED'");
    
    setQueueCount((q[0]?.count || 0) + (n[0]?.count || 0));
  }, []);

  useEffect(() => {
    checkQueue();
    const interval = setInterval(checkQueue, 5000);
    return () => clearInterval(interval);
  }, [checkQueue]);

  const triggerSync = async () => {
    await SyncEngine.processQueue();
    await checkQueue();
  };

  return { queueCount, isSyncing: queueCount > 0, triggerSync, checkQueue };
}
