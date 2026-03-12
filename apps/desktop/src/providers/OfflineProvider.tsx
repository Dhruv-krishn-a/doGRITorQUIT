import React, { createContext, useContext, useEffect, useState } from 'react';
import { getOfflineLease, getDb } from '../lib/db';
import { toast } from 'sonner';

interface OfflineContextType {
  isOnline: boolean;
  isLeaseValid: boolean;
  isOfflineModeEnabled: boolean;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLeaseValid, setIsLeaseValid] = useState(true);
  const [isOfflineModeEnabled, setIsOfflineModeEnabled] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial and periodic lease check
    const checkLease = async () => {
      const lease = await getOfflineLease();
      if (!lease) {
        setIsLeaseValid(false);
        setIsOfflineModeEnabled(false);
        return;
      }

      const now = Date.now();
      const isValid = lease.expiresAt > now;
      
      // Decode token to get dur (max duration)
      try {
        const payload = JSON.parse(atob(lease.token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        setIsOfflineModeEnabled(true);
        
        // Also check if they've been offline for too long based on dur
        const offlineTimeMs = now - lease.lastOnlineAt;
        const maxOfflineMs = payload.dur * 60 * 60 * 1000;
        
        if (offlineTimeMs > maxOfflineMs) {
          setIsLeaseValid(false);
          if (!isOnline) {
            toast.error("Offline duration exceeded. Please connect to the internet.");
          }
        } else {
          setIsLeaseValid(isValid);
        }
      } catch (e) {
        setIsLeaseValid(false);
      }
    };

    checkLease();
    const interval = setInterval(checkLease, 60000); // Check every minute

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [isOnline]);

  return (
    <OfflineContext.Provider value={{ isOnline, isLeaseValid, isOfflineModeEnabled }}>
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
}
