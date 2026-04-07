import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../auth/hooks/useAuth';
import { buildApiUrl } from '../../../config/env';

export function useDashboardStats() {
  const { user, session } = useAuth();

  const query = useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async () => {
      if (!user || !session) return null;

      const res = await fetch(buildApiUrl('/dashboard'), {
        headers: {
          'Authorization': `Bearer ${session?.access_token || ""}`
        }
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `API Error: ${res.status}`);
      }

      const dashboardData = await res.json();
      
      return {
          user: {
              firstName: user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User',
              level: 1,
              xp: 0,
              nextLevelXp: 100
          },
          ...dashboardData,
          activityHeatmap: dashboardData.activityHeatmap || [],
          upcomingEvents: dashboardData.upcomingEvents || []
      };
    },
    enabled: !!user && !!session,
    staleTime: 60 * 1000, // Dashboard data stale after 1 minute
  });

  return { 
    data: query.data, 
    loading: query.isLoading, 
    error: query.error ? String(query.error) : null 
  };
}
