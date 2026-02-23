import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';

export function useDashboardStats() {
  const { user, session } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !session) return;

    async function fetchStats() {
      try {
        setLoading(true);
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
        
        const res = await fetch(`${baseUrl}/api/dashboard`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `API Error: ${res.status}`);
        }

        const dashboardData = await res.json();
        
        // Enrich data if necessary, or assume API returns enriched structure
        // The API returns exactly what we need: stats, habits, todaysTasks, activePlan
        
        // Transform API data to match UI expectations if needed
        const enrichedData = {
            user: {
                firstName: user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'User',
                level: 1,
                xp: 0,
                nextLevelXp: 100
            },
            ...dashboardData,
            // Ensure arrays exist
            activityHeatmap: dashboardData.activityHeatmap || [],
            upcomingEvents: dashboardData.upcomingEvents || []
        };

        setData(enrichedData);
      } catch (err: any) {
        console.error("Dashboard Fetch Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [user, session]);

  return { data, loading, error };
}
