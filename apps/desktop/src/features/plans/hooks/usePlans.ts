import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../auth/hooks/useAuth';
import { Plan } from '../components/PlanCard';

export function usePlans() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*, tasks(id, estimatedMinutes, completed, status)')
        .eq('userId', user.id)
        .eq('isArchived', false)
        .order('createdAt', { ascending: false });

      if (error) throw error;
      setPlans(data as any[]);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  return { plans, loading, error, refreshPlans: fetchPlans };
}
