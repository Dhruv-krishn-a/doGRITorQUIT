import { useParams } from 'react-router-dom';
import PlanDetail from '../../features/plans/components/PlanDetail';

export default function PlanDetailPage() {
  const { planId } = useParams();

  if (!planId) return <div>Invalid Plan ID</div>;

  return <PlanDetail planId={planId} />;
}
