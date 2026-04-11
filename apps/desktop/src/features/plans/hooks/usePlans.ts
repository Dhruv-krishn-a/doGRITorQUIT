import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { buildApiUrl } from '../../../config/env';

export function usePlans() {
  const { user, session } = useAuth();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    if (!user || !session) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(buildApiUrl('/plans'), {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `API Error: ${res.status}`);
      }

      const data = await res.json();
      const normalizedPlans = Array.isArray(data)
        ? data
        : Array.isArray(data?.plans)
          ? data.plans
          : Array.isArray(data?.data?.plans)
            ? data.data.plans
            : [];
      setPlans(normalizedPlans);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, session]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  return { plans, loading, error, refreshPlans: fetchPlans };
}
