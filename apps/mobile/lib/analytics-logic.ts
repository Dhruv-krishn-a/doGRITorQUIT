import { database } from '../db';
import { Q } from '@nozbe/watermelondb';
import HabitLog from '../db/models/HabitLog';
import Task from '../db/models/Task';

export async function getWeeklyStats() {
  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
  startOfWeek.setHours(0,0,0,0);
  
  const startTime = startOfWeek.getTime();
  const endTime = Date.now();

  const [logs, tasks] = await Promise.all([
    database.get<HabitLog>('habit_logs').query(Q.where('date', Q.between(startTime, endTime))).fetch(),
    database.get<Task>('tasks').query(Q.where('date', Q.between(startTime, endTime))).fetch()
  ]);

  // Aggregate by day
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const completionData = days.map((day, index) => {
    const dayStart = new Date(startOfWeek);
    dayStart.setDate(dayStart.getDate() + index);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23,59,59,999);

    const dayTasks = tasks.filter(t => t.date && t.date >= dayStart.getTime() && t.date <= dayEnd.getTime());
    const doneTasks = dayTasks.filter(t => t.completed).length;
    
    return {
      day,
      count: dayTasks.length,
      completed: doneTasks,
      percentage: dayTasks.length > 0 ? (doneTasks / dayTasks.length) * 100 : 0
    };
  });

  return {
    completionData,
    totalCompleted: tasks.filter(t => t.completed).length,
    totalTasks: tasks.length,
    habitExecutionCount: logs.length
  };
}
