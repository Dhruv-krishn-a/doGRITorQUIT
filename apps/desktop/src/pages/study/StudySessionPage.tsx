import { StudyView } from '../../features/study/views/StudyView';
import { StudyFeatureProvider } from '../../providers/StudyFeatureProvider';

export default function StudySessionPage() {
  return (
    <StudyFeatureProvider>
      <StudyView />
    </StudyFeatureProvider>
  );
}
