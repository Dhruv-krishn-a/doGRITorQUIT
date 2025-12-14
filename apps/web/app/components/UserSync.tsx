// apps/web/app/components/UserSync.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '../../utils/supabase';

export default function UserSync() {
  const router = useRouter();
  const pathname = usePathname();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const syncUser = async () => {
      // Prevent too frequent syncs (min 30 seconds between syncs)
      if (lastSync && Date.now() - lastSync < 30000) {
        return;
      }

      setIsSyncing(true);
      setError(null);
      
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('UserSync: Session error:', sessionError);
          setError(sessionError.message);
          setIsSyncing(false);
          return;
        }
        
        if (!session?.user) {
          console.log('UserSync: No session found');
          setIsSyncing(false);
          return;
        }

        console.log('UserSync: Syncing user:', {
          userId: session.user.id,
          email: session.user.email
        });

        // Call the sync endpoint
        const response = await fetch('/api/auth/sync-user', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
        });
        
        console.log('UserSync: Response status:', response.status);
        
        if (!response.ok) {
          let errorText = 'Sync failed';
          try {
            const errorData = await response.json();
            errorText = errorData.error || errorData.details || `HTTP ${response.status}`;
          } catch {
            errorText = await response.text() || `HTTP ${response.status}`;
          }
          
          console.warn('UserSync: Sync failed:', errorText);
          setError(errorText);
          
          // If it's an authentication error, don't redirect (the dashboard layout will handle it)
          if (response.status === 401) {
            console.log('UserSync: Unauthorized');
          }
        } else {
          const result = await response.json();
          console.log('UserSync: Sync successful:', result);
          setLastSync(Date.now());
          setError(null);
        }
      } catch (error) {
        console.error('UserSync: Error:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setIsSyncing(false);
      }
    };

    // Only sync on dashboard pages
    if (pathname.startsWith('/dashboard')) {
      console.log('UserSync: Dashboard page detected, syncing...');
      syncUser();
    }

    // Also sync when auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('UserSync: Auth state changed:', event);
      
      if (event === 'SIGNED_IN' && session) {
        syncUser();
      }
      
      if (event === 'SIGNED_OUT') {
        console.log('UserSync: Signed out, resetting sync');
        setLastSync(null);
        setError(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, router, lastSync]);

  return (
    <>
      {isSyncing && (
        <div className="fixed top-4 right-4 z-50 bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
          Syncing user...
        </div>
      )}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-100 text-red-800 text-xs px-3 py-1 rounded-full">
          Sync error: {error}
        </div>
      )}
    </>
  );
}