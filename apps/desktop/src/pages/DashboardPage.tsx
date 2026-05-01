import { useDashboardStats } from "../features/dashboard/hooks/useDashboardStats";
import DashboardUI from "../features/dashboard/components/DashboardUI";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { data, loading, error } = useDashboardStats();

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-6 animate-pulse">
          <div className="w-16 h-16 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center">
              <Loader2 size={32} className="text-[var(--accent-color)] animate-spin" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-secondary)]">Opening Data Stream...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8 bg-[var(--bg-card)]/30 border border-[var(--border-color)] rounded-[3rem]">
        <div className="text-center space-y-4">
           <div className="text-rose-500 font-bold text-lg uppercase italic tracking-tighter leading-none">Failed to load dashboard</div>
           <p className="text-[var(--text-secondary)] text-sm max-w-md uppercase font-bold tracking-widest opacity-60">System data-link failure. Verify neural connection.</p>
           <button 
             onClick={() => window.location.reload()}
             className="px-8 py-4 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:opacity-90 active:scale-95 transition-all shadow-xl"
           >
             Retry Sync
           </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // We remove the max-width and padding here as it's now handled by the parent InsightsPage
  return <DashboardUI data={data} />;
}
