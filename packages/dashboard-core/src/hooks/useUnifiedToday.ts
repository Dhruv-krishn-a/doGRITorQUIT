// packages/study-core/src/hooks/useUnifiedToday.ts
import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '../lib/apiClient';

export function useUnifiedToday() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchToday = useCallback(async () => {
    setLoading(true);
    try {
      const result = await apiClient<any>('/api/today/unified');
      setData(result);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchToday();
  }, [fetchToday]);

  return { data, loading, error, refresh: fetchToday };
}
