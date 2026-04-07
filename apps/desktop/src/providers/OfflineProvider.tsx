import React, { createContext, useContext, useEffect, useState } from 'react';
import { getOfflineLease, updateLastSafeSystemTime } from '../lib/db';
import { verifyOfflineLease } from '../lib/native-security';
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
  const [isInitialized, setIsInitialized] = useState(false);
  const onlineTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      if (onlineTimerRef.current) clearTimeout(onlineTimerRef.current);
      setIsOnline(true);
    };

    const handleOffline = () => {
      // Debounce offline detection by 3 seconds to handle network "flickers"
      if (onlineTimerRef.current) clearTimeout(onlineTimerRef.current);
      onlineTimerRef.current = setTimeout(() => {
        setIsOnline(false);
      }, 3000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial and periodic lease check
    const checkLease = async () => {
      try {
        const lease = await getOfflineLease();
        
        if (!lease) {
          // No lease found - only invalidate if we are truly offline and after initialization
          if (isInitialized && !navigator.onLine) {
            setIsLeaseValid(false);
            setIsOfflineModeEnabled(false);
          }
          return;
        }

        const nativeValidation = await verifyOfflineLease(
          lease.token,
          Number(lease.lastOnlineMonotonicMs || 0),
          Number(lease.lastSafeSystemTime || 0)
        );

        if (nativeValidation) {
          // DEFINITIVE VALIDATION
          const wasPreviouslyValid = isLeaseValid;
          
          setIsOfflineModeEnabled(nativeValidation.isOfflineModeEnabled);
          setIsLeaseValid(nativeValidation.isValid);

          if (nativeValidation.isValid) {
            await updateLastSafeSystemTime(nativeValidation.currentSystemTime);
          } else if (!navigator.onLine) {
            // Definitively Invalid + Offline = Lockout UI
            if (nativeValidation.reason === 'OFFLINE_DURATION_EXCEEDED') {
              toast.error("Offline duration exceeded. Please connect to the internet.");
            } else if (nativeValidation.reason === 'CLOCK_TAMPERING_DETECTED') {
              toast.error("Security alert: System clock tampering detected.");
            }
          }
          return;
        }

        // Fallback for non-native environments or partial driver failures
        const now = Date.now();
        const isValid = lease.expiresAt > now;
        setIsOfflineModeEnabled(true);
        setIsLeaseValid(isValid);
      } catch (e) {
        // ERROR HANDLING: If it worked before, don't lock out the user just because a background check failed
        console.warn("Background lease check encountered an error:", e);
        if (!isInitialized) {
           setIsInitialized(true);
        }
      } finally {
        if (!isInitialized) setIsInitialized(true);
      }
    };

    // Run immediately and then every minute
    checkLease();
    const interval = setInterval(checkLease, 60000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (onlineTimerRef.current) clearTimeout(onlineTimerRef.current);
      clearInterval(interval);
    };
  }, [isInitialized]);

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
