import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { buildApiUrl } from '../../../config/env';

export function usePlanDetail(planId: string) {
  const { user, session } = useAuth();
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlan = useCallback(async () => {
    if (!user || !session || !planId) return;
    setLoading(true);
    try {
      const res = await fetch(buildApiUrl(`/plans/${planId}`), {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `API Error: ${res.status}`);
      }

      const data = await res.json();
      setPlan(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, session, planId]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  // Actions
  const createTask = async (taskData: any) => {
      try {
        const res = await fetch(buildApiUrl('/tasks'), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            planId,
            title: taskData.title,
            description: taskData.description,
            estimatedMinutes: taskData.estimatedMinutes,
            priority: taskData.priority,
            date: taskData.date ? new Date(taskData.date).toISOString() : null,
            subtasks: taskData.subtasks || []
          })
        });
        if (!res.ok) throw new Error("Failed to create task");
      } catch (error) {
        console.error(error);
      }
      fetchPlan();
  };

  const updateTask = async (taskId: string, updates: any) => {
      // Filter out subtasks from updates if present, as they need separate handling
      const { subtasks, ...fields } = updates;
      
      try {
        const res = await fetch(buildApiUrl(`/tasks/${taskId}`), {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(fields)
        });
        if (!res.ok) throw new Error("Failed to update task");
      } catch (error) {
        console.error(error);
      }
      fetchPlan();
  };

  const deleteTask = async (taskId: string) => {
      try {
        const res = await fetch(buildApiUrl(`/tasks/${taskId}`), {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`
          }
        });
        if (!res.ok) throw new Error("Failed to delete task");
      } catch (error) {
        console.error(error);
      }
      fetchPlan();
  };

  const toggleSubtask = async (subtaskId: string, completed: boolean) => {
      try {
        const res = await fetch(buildApiUrl(`/subtasks/${subtaskId}`), {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ completed })
        });
        if (!res.ok) throw new Error("Failed to update subtask");
      } catch (error) {
        console.error(error);
      }
      // Optimistic update locally? For now fetch.
      fetchPlan(); 
  };
    
  const deleteSubtask = async (subtaskId: string) => {
      try {
        const res = await fetch(buildApiUrl(`/subtasks/${subtaskId}`), {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`
          }
        });
        if (!res.ok) throw new Error("Failed to delete subtask");
      } catch (error) {
        console.error(error);
      }
      fetchPlan();
  };

  const insertDay = async (date: string) => {
      try {
        const res = await fetch(buildApiUrl(`/plans/${planId}/days`), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ date })
        });
        if (!res.ok) throw new Error("Failed to insert day");
        fetchPlan();
      } catch (err) {
        console.error(err);
      }
  };

  const deleteDay = async (date: string) => {
       if (!confirm("Delete all tasks on this date?")) return;
       
       try {
        const res = await fetch(buildApiUrl(`/plans/${planId}/days?date=${date}`), {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`
          }
        });
        if (!res.ok) throw new Error("Failed to delete day");
        fetchPlan();
       } catch (err) {
         console.error(err);
       }
  };

  return { plan, loading, error, actions: { createTask, updateTask, deleteTask, toggleSubtask, deleteSubtask, insertDay, deleteDay } };
}
