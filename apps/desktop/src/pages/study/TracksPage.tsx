//apps/desktop/src/pages/study/TracksPage.tsx
import { DesktopTracksView } from '../../features/study/views/DesktopTracksView';
import { useEntitlements } from '../../features/billing/hooks/useEntitlements';
import { FeatureLocked } from '../../components/FeatureLocked';

export default function TracksPage() {
  const { entitlements, loading } = useEntitlements();

  if (loading) {
    return (
      <div className="transform-gpu flex h-full w-full items-center justify-center">
         <div className="transform-gpu flex flex-col items-center gap-4 animate-pulse">
            <div className="transform-gpu w-12 h-12 bg-slate-200 rounded-xl" />
            <span className="transform-gpu text-xs font-bold text-slate-400 uppercase tracking-widest">Verifying Access...</span>
         </div>
      </div>
    );
  }

  // Check if they have the 'ACCESS_STUDY' feature
  const canViewStudy = entitlements?.features?.ACCESS_STUDY;

  if (!canViewStudy) {
    return <FeatureLocked title="Upgrade OS" description="Upgrade your plan to unlock the Study Hub and supercharge your learning." />;
  }

  return <DesktopTracksView />;
}
