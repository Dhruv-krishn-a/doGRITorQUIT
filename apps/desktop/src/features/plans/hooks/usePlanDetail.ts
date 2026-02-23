import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../auth/hooks/useAuth';

export function usePlanDetail(planId: string) {
  const { user } = useAuth();
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlan = useCallback(async () => {
    if (!user || !planId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*, tasks(*, subtasks(*))')
        .eq('id', planId)
        .eq('userId', user.id)
        .single();

      if (error) throw error;
      setPlan(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, planId]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  // Actions
  const createTask = async (taskData: any) => {
      const { data: task, error } = await supabase.from('tasks').insert({
          planId,
          userId: user?.id,
          title: taskData.title,
          description: taskData.description,
          estimatedMinutes: taskData.estimatedMinutes,
          priority: taskData.priority,
          date: taskData.date ? new Date(taskData.date).toISOString() : null,
          status: 'pending',
          completed: false
      }).select().single();

      if (error) throw error;

      if (taskData.subtasks && taskData.subtasks.length > 0) {
          const subtasksPayload = taskData.subtasks.map((st: string) => ({
              taskId: task.id,
              title: st,
              completed: false
          }));
          const { error: stError } = await supabase.from('subtasks').insert(subtasksPayload);
          if (stError) throw stError;
      }

      fetchPlan();
  };

  const updateTask = async (taskId: string, updates: any) => {
      // Filter out subtasks from updates if present, as they need separate handling
      const { subtasks, ...fields } = updates;
      
      const { error } = await supabase.from('tasks').update(fields).eq('id', taskId);
      if (error) throw error;
      fetchPlan();
  };

  const deleteTask = async (taskId: string) => {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) throw error;
      fetchPlan();
  };

  const toggleSubtask = async (subtaskId: string, completed: boolean) => {
      const { error } = await supabase.from('subtasks').update({ completed }).eq('id', subtaskId);
      if (error) throw error;
      // Optimistic update locally? For now fetch.
      fetchPlan(); 
  };
    
  const deleteSubtask = async (subtaskId: string) => {
        const { error } = await supabase.from('subtasks').delete().eq('id', subtaskId);
        if (error) throw error;
        fetchPlan();
  };

  const insertDay = async (date: string) => {
      alert("Shift Day is not yet supported in Desktop.");
  };

  const deleteDay = async (date: string) => {
       if (!confirm("Delete all tasks on this date?")) return;
       
       const start = new Date(date); start.setHours(0,0,0,0);
       const end = new Date(date); end.setHours(23,59,59,999);
       
       const { error } = await supabase.from('tasks').delete()
        .eq('planId', planId)
        .gte('date', start.toISOString())
        .lte('date', end.toISOString());
       
       if (error) throw error;
       fetchPlan();
  };

  return { plan, loading, error, actions: { createTask, updateTask, deleteTask, toggleSubtask, deleteSubtask, insertDay, deleteDay } };
}
