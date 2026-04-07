import React from "react";
import { AlertCircle } from "lucide-react";
import { useOffline } from "../../providers/OfflineProvider";

interface OfflineGuardProps {
  children: React.ReactNode;
}

export function OfflineGuard({ children }: OfflineGuardProps) {
  const { isOnline, isLeaseValid } = useOffline();

  if (!isOnline && !isLeaseValid) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-8 text-center animate-fade-in">
        <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-rose-100/50">
          <AlertCircle size={40} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2 uppercase tracking-tighter">Offline Access Expired</h1>
        <p className="text-slate-500 max-w-md mb-8 font-medium">Your offline access duration has been exceeded or no valid lease was found. Please connect to the internet to re-validate your subscription.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-rose-600 transition-all active:scale-95 shadow-lg shadow-slate-200"
        >
          Check Connection
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
