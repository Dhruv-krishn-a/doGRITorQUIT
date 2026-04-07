import { HabitsOfflineStorage, HabitData, Habit, HabitLog, DailyNote } from "@gritorquit/habits-core";
import { getDb, queueAction } from "./db";

export const sqliteHabitsBridge: HabitsOfflineStorage = {
  isOffline: () => !navigator.onLine,

  getHabitData: async (start: string, end: string) => {
    const db = await getDb();
    if (!db) return { habits: [], logs: [], notes: [] } as HabitData;
    
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
    if (!db) return;
    
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

  saveHabitLog: async (log: HabitLog) => {
    const db = await getDb();
    if (!db) return;
    await db.execute(
      "INSERT OR REPLACE INTO habit_logs (id, habitId, date, completed, updatedAt) VALUES (?, ?, ?, ?, ?)",
      [log.id, log.habitId, log.date, log.completed ? 1 : 0, new Date().toISOString()]
    );
  },

  deleteHabitLog: async (habitId: string, date: string) => {
    const db = await getDb();
    if (!db) return;
    // We delete by habitId and date to be safe, regardless of the log ID
    await db.execute(
      "DELETE FROM habit_logs WHERE habitId = ? AND date = ?",
      [habitId, date]
    );
  },

  saveDailyNote: async (note: DailyNote) => {
    const db = await getDb();
    if (!db) return;
    await db.execute(
      "INSERT OR REPLACE INTO daily_notes (id, date, content, updatedAt) VALUES (?, ?, ?, ?)",
      [note.id, note.date, note.content, new Date().toISOString()]
    );
  },

  queueAction: async (action: string, payload: any) => {
    await queueAction(action, payload);
  }
};
