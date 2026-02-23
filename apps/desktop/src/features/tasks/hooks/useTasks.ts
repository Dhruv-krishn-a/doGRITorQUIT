import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../auth/hooks/useAuth';
import { ExtendedTask } from '../components/TaskItem';

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<ExtendedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, subtasks(*)')
        .eq('userId', user.id)
        .neq('status', 'archived');

      if (error) throw error;
      setTasks(data as any[]);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const updateTask = async (taskId: string, updates: Partial<ExtendedTask>) => {
      // Optimistic update
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
      const { error } = await supabase.from('tasks').update(updates).eq('id', taskId);
      if (error) {
          console.error(error);
          fetchTasks(); // Revert
      }
  };

  const logTime = async (taskId: string, minutes: number) => {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      const newTime = (task.timeSpentMinutes || 0) + minutes;
      updateTask(taskId, { timeSpentMinutes: newTime });
  };

  const deleteTask = async (taskId: string) => {
      setTasks(prev => prev.filter(t => t.id !== taskId));
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) {
          console.error(error);
          fetchTasks();
      }
  };

  const toggleSubtask = async (subtaskId: string, completed: boolean) => {
      // Optimistic
      setTasks(prev => prev.map(t => ({
          ...t,
          subtasks: t.subtasks?.map(st => st.id === subtaskId ? { ...st, completed } : st)
      })));
      const { error } = await supabase.from('subtasks').update({ completed }).eq('id', subtaskId);
      if (error) {
          console.error(error);
          fetchTasks();
      }
  };

  return { tasks, loading, error, refreshTasks: fetchTasks, actions: { updateTask, logTime, deleteTask, toggleSubtask } };
}
