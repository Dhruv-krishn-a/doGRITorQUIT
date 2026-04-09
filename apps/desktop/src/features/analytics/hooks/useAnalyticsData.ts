import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../auth/hooks/useAuth';
import { api } from '../../../services/api';

export interface AnalyticsOptions {
  startDate?: Date;
  endDate?: Date;
  category?: 'ALL' | 'YOUTUBE' | 'PLAN' | 'COURSE' | 'PROJECT';
}

export function useAnalyticsData(options: AnalyticsOptions = {}) {
  const { user, session } = useAuth();

  const query = useQuery({
    queryKey: ['analytics-data', user?.id, options.startDate?.toISOString(), options.endDate?.toISOString(), options.category],
    queryFn: async () => {
      if (!user || !session) return null;

      const params = new URLSearchParams();
      if (options.startDate) params.append('startDate', options.startDate.toISOString());
      if (options.endDate) params.append('endDate', options.endDate.toISOString());
      if (options.category) params.append('category', options.category);

      const queryString = params.toString();
      const endpoint = `/analytics${queryString ? `?${queryString}` : ''}`;
      
      return await api.get(endpoint);
    },
    enabled: !!user && !!session,
    staleTime: 5 * 60 * 1000, // Analytics data stale after 5 minutes
  });

  return { 
    data: query.data, 
    loading: query.isLoading, 
    error: query.error ? String(query.error) : null,
    refresh: query.refetch
  };
}
