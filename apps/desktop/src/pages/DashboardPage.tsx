import { useDashboardStats } from "../features/dashboard/hooks/useDashboardStats";
import DashboardUI from "../features/dashboard/components/DashboardUI";

function DashboardSkeleton() {
  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto w-full space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-slate-200 rounded-lg" />
          <div className="h-4 w-32 bg-slate-100 rounded-lg" />
        </div>
        <div className="h-12 w-12 bg-slate-200 rounded-full" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-32 bg-white border border-slate-100 rounded-3xl p-6 space-y-3 shadow-sm">
            <div className="h-4 w-12 bg-slate-100 rounded" />
            <div className="h-8 w-24 bg-slate-200 rounded" />
          </div>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-64 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm" />
          <div className="h-96 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm" />
        </div>
        <div className="space-y-6">
          <div className="h-80 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm" />
          <div className="h-80 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data, loading, error } = useDashboardStats();

  if (loading && !data) {
    return <DashboardSkeleton />;
  }

  if (error && !data) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <div className="text-center space-y-4">
           <div className="text-rose-500 font-bold text-lg">Failed to load dashboard</div>
           <p className="text-slate-500 text-sm max-w-md">{error}</p>
           <button 
             onClick={() => window.location.reload()}
             className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800"
           >
             Retry
           </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto w-full">
      <DashboardUI data={data} />
    </div>
  );
}
