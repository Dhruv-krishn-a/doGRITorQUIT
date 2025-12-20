// apps/web/app/actions/checklist.ts
"use server";

// --- MOCK DATABASE ---
let HABITS = [
  { id: "1", title: "Workout", icon: "dumbbell", color: "text-rose-500" },
  { id: "2", title: "Read", icon: "bookopen", color: "text-blue-500" },
  { id: "3", title: "Code", icon: "zap", color: "text-amber-500" },
];

let LOGS: any[] = [];
let NOTES: any[] = [];

export async function getChecklistData(start: Date, end: Date) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 100));
  return { habits: HABITS, logs: LOGS, notes: NOTES };
}

export async function toggleHabit(habitId: string, date: Date, completed: boolean) {
  const dateStr = date.toISOString();
  LOGS = LOGS.filter((l) => !(l.habitId === habitId && new Date(l.date).toDateString() === date.toDateString()));
  
  if (completed) {
    LOGS.push({ id: Math.random().toString(), habitId, date: dateStr, completed: true });
  }
  return true;
}

export async function saveDailyNote(date: Date, content: string) {
  const dateStr = date.toISOString();
  NOTES = NOTES.filter((n) => new Date(n.date).toDateString() !== date.toDateString());
  if (content.trim()) {
    NOTES.push({ id: Math.random().toString(), date: dateStr, content });
  }
  return true;
}

export async function createHabit(habit: { title: string; icon: string; color: string }) {
  const newHabit = {
    id: Math.random().toString(), 
    ...habit
  };
  HABITS.push(newHabit);
  return newHabit;
}

export async function deleteHabit(habitId: string) {
  HABITS = HABITS.filter((h) => h.id !== habitId);
  LOGS = LOGS.filter((l) => l.habitId !== habitId);
  return true;
}

// New function to handle the "Reset" button
export async function resetProgress(start: Date, end: Date) {
  // Removes all logs within the date range
  LOGS = LOGS.filter(l => {
    const d = new Date(l.date);
    return d < start || d > end;
  });
  return true;
}