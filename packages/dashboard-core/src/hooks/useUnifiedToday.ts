// packages/dashboard-core/src/hooks/useUnifiedToday.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';

export function useUnifiedToday() {
  const query = useQuery({
    queryKey: ['tasks', 'unified-today'],
    queryFn: async () => {
      const result = await apiClient<any>('/api/today/unified');
      return result;
    },
    staleTime: 60 * 1000,
  });

  return { 
    data: query.data, 
    loading: query.isLoading, 
    error: query.error ? String(query.error) : null, 
    refresh: query.refetch 
  };
}
