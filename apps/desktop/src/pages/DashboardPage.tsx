import { useDashboardStats } from "../features/dashboard/hooks/useDashboardStats";
import DashboardUI from "../features/dashboard/components/DashboardUI";

export default function DashboardPage() {
  const { data, loading, error } = useDashboardStats();

  if (loading) {
    return (
      <div className="transform-gpu flex h-full w-full items-center justify-center">
         <div className="transform-gpu flex flex-col items-center gap-4 animate-pulse">
            <div className="transform-gpu w-12 h-12 bg-slate-200 rounded-xl" />
            <span className="transform-gpu text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Dashboard...</span>
         </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="transform-gpu flex h-full w-full items-center justify-center p-8">
        <div className="transform-gpu text-center space-y-4">
           <div className="transform-gpu text-rose-500 font-bold text-lg">Failed to load dashboard</div>
           <p className="transform-gpu text-slate-500 text-sm max-w-md">{error}</p>
           <button 
             onClick={() => window.location.reload()}
             className="transform-gpu px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800"
           >
             Retry
           </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="transform-gpu p-4 lg:p-8 max-w-7xl mx-auto w-full">
      <DashboardUI data={data} />
    </div>
  );
}
