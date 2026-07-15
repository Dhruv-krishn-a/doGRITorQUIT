import { database } from '../db';
import { synchronize, SyncDatabaseChangeSet } from '@nozbe/watermelondb/sync';
import { getAccessToken, getApiBaseUrl } from '@/lib/nativeAuth';

let inFlightSync: Promise<void> | null = null;

function throwSyncError(payload: { error?: string; code?: string }, fallbackMessage: string): never {
  const err = new Error(payload.error ?? fallbackMessage) as Error & { code?: string };
  if (payload.code) {
    err.code = payload.code;
  }
  throw err;
}

async function runWatermelonSync(): Promise<void> {
  await synchronize({
    database,
    pullChanges: async ({ lastPulledAt }) => {
      console.log(`[Sync] Pulling changes since ${lastPulledAt}`);

      const token = await getAccessToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${getApiBaseUrl()}/api/sync?lastPulledAt=${lastPulledAt ?? 'null'}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string; code?: string };
        throwSyncError(payload, 'Sync pull failed');
      }

      const data = (await response.json()) as { changes: SyncDatabaseChangeSet; timestamp: number };
      console.log(`[Sync] Received changes:`, JSON.stringify(data.changes).substring(0, 500));

      return {
        changes: data.changes,
        timestamp: data.timestamp,
      };
    },
    pushChanges: async ({ changes, lastPulledAt }) => {
      console.log('[Sync] Pushing changes...');

      const token = await getAccessToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${getApiBaseUrl()}/api/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          changes,
          lastPulledAt
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string; code?: string };
        throwSyncError(payload, 'Sync push failed');
      }
    },
  });
}

export async function performSyncOnce(): Promise<void> {
  if (inFlightSync) {
    return inFlightSync;
  }

  inFlightSync = runWatermelonSync().finally(() => {
    inFlightSync = null;
  });

  return inFlightSync;
}

export async function performSync(userTier: 'FREE' | 'PRO') {
  
  // 1. THE GATEKEEPER CHECK
  if (userTier === 'FREE') {
    console.log("🔒 User is Free tier. Skipping Cloud Sync. Data is local only.");
    return { status: 'skipped', reason: 'upgrade_required' };
  }

  // 2. THE PRO SYNC (Only runs if Pro)
  await performSyncOnce();

  return { status: 'success' };
}
