import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../auth/hooks/useAuth';
import { api } from '../../../services/api';
import { getDb } from '../../../lib/db';
import { format, subDays, eachDayOfInterval, differenceInDays } from 'date-fns';

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

      // Try Local SQLite first
      try {
        const db = await getDb();
        if (db) {
          const endDate = options.endDate || new Date();
          const startDate = options.startDate || subDays(endDate, 7);
          
          const days = eachDayOfInterval({ start: startDate, end: endDate });
          const dailyStats = days.map(d => ({
            dateStr: format(d, 'yyyy-MM-dd'),
            day: format(d, 'EEE'),
            focusMinutes: 0,
            completed: 0,
            total: 0
          }));

          const studyUnits = await db.select<any[]>(`SELECT status, secondsSpent, updatedAt FROM study_units WHERE updatedAt >= $1 AND updatedAt <= $2`, [startDate.toISOString(), endDate.toISOString()]);
          const habitLogs = await db.select<any[]>(`SELECT date, completed FROM habit_logs WHERE date >= $1 AND date <= $2`, [format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd')]);
          
          for (const stat of dailyStats) {
            const unitMatch = studyUnits.filter(u => u.updatedAt.startsWith(stat.dateStr));
            stat.focusMinutes = Math.round(unitMatch.reduce((sum, u) => sum + (u.secondsSpent || 0), 0) / 60);
            const unitCompleted = unitMatch.filter(u => u.status === 'COMPLETED').length;
            
            const habitMatch = habitLogs.filter(h => h.date === stat.dateStr);
            const habitCompleted = habitMatch.filter(h => h.completed === 1).length;
            
            stat.completed = unitCompleted + habitCompleted;
            // Simplistic total based on units edited that day + total habits mapped to that day
            stat.total = unitMatch.length + habitMatch.length;
          }

          const allHabits = await db.select<any[]>(`SELECT id, title FROM habits WHERE active = 1`);
          const totalDays = differenceInDays(endDate, startDate) + 1;
          const habitStats = allHabits.map(h => {
            const logs = habitLogs.filter(l => l.habitId === h.id);
            const completedDays = logs.filter(l => l.completed === 1).length;
            const rate = Math.round((completedDays / totalDays) * 100);
            return { name: h.title, rate };
          });

          const completedHabits = habitLogs.filter(l => l.completed === 1).length;
          const completedUnits = studyUnits.filter(u => u.status === 'COMPLETED').length;
          const completedNotes = (await db.select<any[]>(`SELECT id FROM notes WHERE createdAt >= $1 AND createdAt <= $2`, [startDate.toISOString(), endDate.toISOString()])).length;
          
          const taskDistribution = [
            { name: 'Habits Done', value: completedHabits },
            { name: 'Study Units', value: completedUnits },
            { name: 'Notes Created', value: completedNotes }
          ].filter(t => t.value > 0);

          return { dailyStats, habitStats, taskDistribution };
        }
      } catch (e) {
        console.warn("Failed to fetch local analytics, falling back to network", e);
      }

      // Fallback to Network API
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
