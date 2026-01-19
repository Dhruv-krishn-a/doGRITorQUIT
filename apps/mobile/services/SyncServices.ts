import { database } from '../db';
import { synchronize, SyncDatabaseChangeSet } from '@nozbe/watermelondb/sync';
import { supabase } from '@/lib/supabase';

export async function performSync(userTier: 'FREE' | 'PRO') {
  
  // 1. THE GATEKEEPER CHECK
  if (userTier === 'FREE') {
    console.log("🔒 User is Free tier. Skipping Cloud Sync. Data is local only.");
    return { status: 'skipped', reason: 'upgrade_required' };
  }

  // 2. THE PRO SYNC (Only runs if Pro)
  await synchronize({
    database,
    // Explicitly type the arguments
    pullChanges: async ({ lastPulledAt, schemaVersion, migration }) => {
      console.log(`[Sync] Pulling changes since ${lastPulledAt}`);
      
      const { data, error } = await supabase.rpc('pull_changes', { 
        last_pulled_at: lastPulledAt 
      });
      
      if (error) throw new Error(error.message);
      
      // Ensure data matches WatermelonDB expectations
      return { 
        changes: data.changes as SyncDatabaseChangeSet, 
        timestamp: data.timestamp as number 
      };
    },
    pushChanges: async ({ changes, lastPulledAt }) => {
      console.log(`[Sync] Pushing changes...`);
      
      const { error } = await supabase.rpc('push_changes', { 
        changes 
      });
      
      if (error) throw new Error(error.message);
    },
  });

  return { status: 'success' };
}