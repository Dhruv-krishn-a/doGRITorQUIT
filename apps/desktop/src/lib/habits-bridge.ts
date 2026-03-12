import { HabitsOfflineStorage, HabitData, Habit, HabitLog, DailyNote } from "@planner/habits-core";
import { getDb, queueAction } from "./db";

export const sqliteHabitsBridge: HabitsOfflineStorage = {
  isOffline: () => !navigator.onLine,

  getHabitData: async (start: string, end: string) => {
    const db = await getDb();
    
    const habits = await db.select<any[]>("SELECT * FROM habits WHERE active = 1 ORDER BY \"order\" ASC");
    const logs = await db.select<any[]>("SELECT * FROM habit_logs WHERE date >= ? AND date <= ?", [start, end]);
    const notes = await db.select<any[]>("SELECT * FROM daily_notes WHERE date >= ? AND date <= ?", [start, end]);

    return {
      habits: habits.map(h => ({ ...h, active: !!h.active })),
      logs: logs.map(l => ({ ...l, completed: !!l.completed })),
      notes: notes.map(n => ({ ...n }))
    } as HabitData;
  },

  saveHabitData: async (data: HabitData) => {
    const db = await getDb();
    
    // Save habits
    for (const h of data.habits) {
      await db.execute(
        "INSERT OR REPLACE INTO habits (id, title, icon, color, \"order\", active, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [h.id, h.title, h.icon, h.color, h.order, h.active ? 1 : 0, new Date().toISOString()]
      );
    }

    // Save logs
    for (const l of data.logs) {
      await db.execute(
        "INSERT OR REPLACE INTO habit_logs (id, habitId, date, completed, updatedAt) VALUES (?, ?, ?, ?, ?)",
        [l.id, l.habitId, l.date, l.completed ? 1 : 0, new Date().toISOString()]
      );
    }

    // Save notes
    for (const n of data.notes) {
      await db.execute(
        "INSERT OR REPLACE INTO daily_notes (id, date, content, updatedAt) VALUES (?, ?, ?, ?)",
        [n.id, n.date, n.content, new Date().toISOString()]
      );
    }
  },

  queueAction: async (action: string, payload: any) => {
    await queueAction(action, payload);
  }
};
