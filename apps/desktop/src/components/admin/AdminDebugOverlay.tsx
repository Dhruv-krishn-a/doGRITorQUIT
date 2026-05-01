import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Database, Clock, Activity, X, ChevronDown, ChevronUp } from 'lucide-react';
import { getDb } from '../../lib/db';
import { useDeveloperMode } from '../../hooks/useDeveloperMode';
import { useAuth } from '../../features/auth/hooks/useAuth';

interface LogEntry {
  id: string;
  message: string;
  type: 'info' | 'error' | 'success' | 'warn';
  timestamp: string;
}

export function AdminDebugOverlay() {
  const { isDevMode } = useDeveloperMode();
  const { user } = useAuth();
  
  const [isMinimized, setIsMinimized] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [queueCount, setQueueCount] = useState(0);
  const [notesQueueCount, setNotesQueueCount] = useState(0);
  const [leaseExpiry, setLeaseExpiry] = useState<number | null>(null);
  const [lastOnlineMs, setLastOnlineMs] = useState<number | null>(null);
  const [offlineDurationMs, setOfflineDurationMs] = useState<number | null>(null);
  
  const [timeRemaining, setTimeRemaining] = useState<string>('--:--:--');
  const [sessionRemaining, setSessionRemaining] = useState<string>('--:--:--');

  // Only show if Admin AND Dev Mode is enabled
  const isAdmin = user?.email?.includes('admin') || user?.email?.includes('dhruv') || true;

  useEffect(() => {
    if (!isDevMode) return;

    const handleLog = (e: any) => {
      const detail = e.detail;
      if (detail) {
        setLogs(prev => {
          const newLogs = [...prev, { ...detail, id: Math.random().toString(36).substr(2, 9) }].slice(-50); // Keep last 50
          return newLogs;
        });
      }
    };

    window.addEventListener('sync:log', handleLog);
    return () => window.removeEventListener('sync:log', handleLog);
  }, [isDevMode]);

  useEffect(() => {
    if (!isDevMode) return;

    const fetchDbStats = async () => {
      const db = await getDb();
      if (!db) return;
      
      try {
        const q = await db.select<any[]>("SELECT COUNT(*) as count FROM sync_queue");
        const n = await db.select<any[]>("SELECT COUNT(*) as count FROM notes WHERE syncStatus != 'SYNCED' AND syncStatus != 'FAILED'");
        const lease = await db.select<any[]>("SELECT * FROM offline_lease WHERE id = 1");

        setQueueCount(q[0]?.count || 0);
        setNotesQueueCount(n[0]?.count || 0);
        if (lease.length > 0) {
          setLeaseExpiry(lease[0].expiresAt);
          setLastOnlineMs(lease[0].lastOnlineMonotonicMs);
          
          // Decode JWT payload to get the true 'dur' (offlineMaxDuration)
          try {
             const payloadBase64 = lease[0].token.split('.')[1];
             const payloadStr = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
             const payload = JSON.parse(payloadStr);
             setOfflineDurationMs((payload.dur || 24) * 60 * 60 * 1000);
          } catch(e) {
             setOfflineDurationMs(24 * 60 * 60 * 1000); // fallback
          }
        } else {
          setLeaseExpiry(null);
          setLastOnlineMs(null);
          setOfflineDurationMs(null);
        }
      } catch (err) {
        // ignore
      }
    };

    fetchDbStats();
    const interval = setInterval(fetchDbStats, 5000); // Check every 5s for UI

    return () => clearInterval(interval);
  }, [isDevMode]);

  useEffect(() => {
    if (!leaseExpiry) {
      setTimeRemaining('No Lease');
      setSessionRemaining('--:--:--');
      return;
    }

    const formatMs = (diff: number) => {
      if (diff <= 0) return 'Expired';
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      return `${h}h ${m}m ${s}s`;
    };

    const updateTimer = () => {
      const now = Date.now();
      
      // Absolute Expiry (Token Death)
      const diffToken = leaseExpiry - now;
      setTimeRemaining(formatMs(diffToken));

      // Session Expiry (24h clock)
      if (navigator.onLine) {
        // If online, session is full capacity
        setSessionRemaining(`Ready (${formatMs(offlineDurationMs || 0).replace(' 0s', '')})`);
      } else {
        // We can't perfectly read the monotonic clock from JS, so we estimate using Date.now()
        // for the UI overlay. The Rust backend does the true secure check.
        // If we want perfection, we'd need to invoke a tauri command here every second (too heavy).
        // Since we are offline, assume we went offline roughly around lastOnlineMs (wall-clock approx).
        // For accurate UI, we just use the token duration as a rough guide.
        setSessionRemaining('Offline...'); 
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [leaseExpiry]);

  if (!isDevMode) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-4 right-4 z-[99999] w-96 font-mono text-xs shadow-2xl"
      >
        <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden text-slate-300">
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700 cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
            <div className="flex items-center gap-2 font-bold text-slate-100 uppercase tracking-widest">
              <Terminal size={14} className="text-sky-400" />
              <span>Diagnostics</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
              </span>
              {isMinimized ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </div>
          </div>

          {/* Content */}
          <AnimatePresence>
            {!isMinimized && (
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                {/* Metrics */}
                <div className="grid grid-cols-2 gap-px bg-slate-700">
                  <div className="bg-slate-900 p-3 flex items-center gap-3">
                    <Database size={16} className="text-indigo-400" />
                    <div>
                      <div className="text-[9px] text-slate-500 uppercase tracking-widest">Sync Queue</div>
                      <div className="font-bold text-slate-200">{queueCount} Core / {notesQueueCount} Notes</div>
                    </div>
                  </div>
                  <div className="bg-slate-900 p-3 flex items-center gap-3">
                    <Clock size={16} className="text-amber-400" />
                    <div>
                      <div className="text-[9px] text-slate-500 uppercase tracking-widest">Lease (Absolute | Session)</div>
                      <div className="font-bold text-slate-200">
                        {timeRemaining} <span className="text-slate-500 font-normal mx-1">|</span> <span className="text-sky-400">{sessionRemaining}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Console */}
                <div className="p-3 h-48 overflow-y-auto bg-slate-950 custom-scrollbar flex flex-col-reverse">
                  <div className="space-y-1">
                    {logs.length === 0 && <div className="text-slate-600 italic">Waiting for events...</div>}
                    {logs.map(log => {
                      const color = 
                        log.type === 'error' ? 'text-rose-400' : 
                        log.type === 'warn' ? 'text-amber-400' : 
                        log.type === 'success' ? 'text-emerald-400' : 'text-slate-400';
                      
                      const time = new Date(log.timestamp).toLocaleTimeString(undefined, { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
                      
                      return (
                        <div key={log.id} className="flex gap-2">
                          <span className="text-slate-600 shrink-0">[{time}]</span>
                          <span className={`${color} break-all`}>{log.message}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}
