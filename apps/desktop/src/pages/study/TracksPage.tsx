//apps/desktop/src/pages/study/TracksPage.tsx
import { DesktopTracksView } from '../../features/study/views/DesktopTracksView';
import { useEntitlements } from '../../features/billing/hooks/useEntitlements';
import { FeatureLocked } from '../../components/FeatureLocked';

function TracksSkeleton() {
  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-10 animate-pulse">
      <div className="flex items-end justify-between">
        <div className="space-y-4">
          <div className="h-12 w-64 bg-slate-200 rounded-2xl" />
          <div className="h-4 w-48 bg-slate-100 rounded-lg" />
        </div>
        <div className="h-12 w-40 bg-slate-900/10 rounded-xl" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-64 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm" />
        ))}
      </div>
    </div>
  );
}

export default function TracksPage() {
  const { entitlements, loading } = useEntitlements();

  if (loading && !entitlements) {
    return <TracksSkeleton />;
  }

  // Check if they have the 'ACCESS_STUDY' feature
  const canViewStudy = entitlements?.features?.ACCESS_STUDY;

  if (!canViewStudy) {
    return <FeatureLocked title="Upgrade OS" description="Upgrade your plan to unlock the Study Hub and supercharge your learning." />;
  }

  return <DesktopTracksView />;
}
