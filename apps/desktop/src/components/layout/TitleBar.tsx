import React, { useState, useEffect } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { X, Minus, Square, Sparkles, WifiOff } from 'lucide-react';

const appWindow = getCurrentWindow();

export const TitleBar: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleMinimize = () => appWindow.minimize();
  const handleMaximize = () => appWindow.toggleMaximize();
  const handleClose = () => appWindow.close();

  return (
    <div 
      data-tauri-drag-region 
      onDoubleClick={handleMaximize}
      className="h-10 bg-[var(--bg-primary)] flex items-center justify-between px-4 border-b border-[var(--border-color)] select-none shrink-0"
    >
      <div className="flex items-center gap-4 pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[var(--bg-secondary)] rounded-lg flex items-center justify-center border border-[var(--border-color)]">
            <Sparkles size={12} className="text-[var(--accent-color)]" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-primary)] italic">
            grit.io          </span>
        </div>

        {!isOnline && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
            <WifiOff size={10} className="text-amber-500" />
            <span className="text-[8px] font-black uppercase tracking-widest text-amber-500">Neural Link Down</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={handleMinimize}
          className="p-2 text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] hover:text-[var(--text-primary)] rounded-lg transition-all"
          title="Minimize"
        >
          <Minus size={14} />
        </button>
        <button
          onClick={handleMaximize}
          className="p-2 text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] hover:text-[var(--text-primary)] rounded-lg transition-all"
          title="Maximize"
        >
          <Square size={12} />
        </button>
        <button
          onClick={handleClose}
          className="p-2 text-[var(--text-secondary)] hover:bg-rose-500/10 hover:text-rose-500 rounded-lg transition-all"
          title="Close"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

export default React.memo(TitleBar);
