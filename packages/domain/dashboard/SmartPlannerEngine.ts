export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface RoutineBlock {
  id: string;
  title: string;
  startMinutes: number; // 0 to 1439
  endMinutes: number;   // 0 to 1439
  icon?: string;
  metadata?: any;
}

export interface TaskInput {
  id: string;
  title: string;
  durationMinutes: number;
  priority: PriorityLevel;
  type: string; // e.g., 'TASK', 'HABIT', 'COURSE', 'YOUTUBE'
  isMustDo?: boolean;
  lockedStartMinutes?: number; 
  metadata?: any;
}

export interface ScheduledTask extends TaskInput {
  startTime: number; // 0 to 1439
  endTime: number;   // 0 to 1439
}

export interface PlannerResult {
  routine: RoutineBlock[];
  mustDo: ScheduledTask[];
  upNext: ScheduledTask[];
  overflow: TaskInput[];
  totalFreeMinutes: number;
  collisions: string[];
}

export class SmartPlannerEngine {
  /**
   * Parses a HH:MM string (24h or 12h without AM/PM suffix but in military format) to minutes.
   */
  static parseTime(timeStr: string): number {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  }

  /**
   * Formats total minutes (0-1439) into a readable 12h time string with AM/PM.
   */
  static formatTime(mins: number): { time: string, ampm: string } {
    const h = Math.floor(mins / 60) % 24;
    const m = mins % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    const displayM = m.toString().padStart(2, '0');
    return { time: `${displayH}:${displayM}`, ampm };
  }

  /**
   * Core generation algorithm for the daily timeline.
   */
  static generatePlan(routineBlocks: RoutineBlock[], tasks: TaskInput[], currentTimeMinutes?: number): PlannerResult {
    const normalizedBlocks: { title: string, s: number, e: number }[] = [];
    const collisions: string[] = [];
    
    // 1. Process Routine Blocks
    routineBlocks.forEach(b => {
      const s = b.startMinutes;
      const e = b.endMinutes;
      if (e < s) {
        normalizedBlocks.push({ title: b.title, s: 0, e });
        normalizedBlocks.push({ title: b.title, s, e: 1440 });
      } else {
        normalizedBlocks.push({ title: b.title, s, e });
      }
    });

    // 2. Process Must Do tasks (locked time)
    const mustDoTasks = tasks.filter(t => t.isMustDo && t.lockedStartMinutes !== undefined);
    const scheduledMustDo: ScheduledTask[] = [];
    
    mustDoTasks.forEach(t => {
      const s = t.lockedStartMinutes!;
      const e = (s + t.durationMinutes) % 1440; // can wrap
      scheduledMustDo.push({ ...t, startTime: s, endTime: e });
      
      if (e < s) {
        normalizedBlocks.push({ title: t.title, s: 0, e });
        normalizedBlocks.push({ title: t.title, s, e: 1440 });
      } else {
        normalizedBlocks.push({ title: t.title, s, e });
      }
    });

    // Sort all blocks and find collisions
    const sorted = normalizedBlocks.sort((a, b) => a.s - b.s);
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        if (sorted[i].e > sorted[j].s && sorted[i].s < sorted[j].e) {
          if (!collisions.includes(sorted[i].title)) collisions.push(sorted[i].title);
          if (!collisions.includes(sorted[j].title)) collisions.push(sorted[j].title);
        }
      }
    }

    // Merge blocks to find free windows
    const merged: { s: number, e: number }[] = [];
    if (sorted.length > 0) {
      let current = { s: sorted[0].s, e: sorted[0].e };
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i].s <= current.e) {
          current.e = Math.max(current.e, sorted[i].e);
        } else {
          merged.push(current);
          current = { s: sorted[i].s, e: sorted[i].e };
        }
      }
      merged.push(current);
    }

    const freeWindows: { s: number, e: number, d: number }[] = [];
    let lastEnd = 0;
    merged.forEach(b => {
      if (b.s > lastEnd) freeWindows.push({ s: lastEnd, e: b.s, d: b.s - lastEnd });
      lastEnd = b.e;
    });
    if (lastEnd < 1440) freeWindows.push({ s: lastEnd, e: 1440, d: 1440 - lastEnd });
    
    // If a currentTime is provided, clip past windows so we only schedule "Up Next" in the future.
    if (currentTimeMinutes !== undefined) {
      for (let i = 0; i < freeWindows.length; i++) {
        if (freeWindows[i].e <= currentTimeMinutes) {
          freeWindows[i].d = 0; // Invalid
        } else if (freeWindows[i].s < currentTimeMinutes) {
          freeWindows[i].s = currentTimeMinutes;
          freeWindows[i].d = freeWindows[i].e - currentTimeMinutes;
        }
      }
    }

    const totalFreeMinutes = freeWindows.reduce((acc, w) => acc + Math.max(0, w.d), 0);

    // 3. Process Up Next tasks
    const upNextTasks = tasks.filter(t => !t.isMustDo);
    // Sort by priority: URGENT > HIGH > MEDIUM > LOW
    const priorityWeight: Record<PriorityLevel, number> = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
    upNextTasks.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);

    const scheduledUpNext: ScheduledTask[] = [];
    const overflow: TaskInput[] = [];

    let currentWindowIdx = 0;
    let currentWindow = freeWindows.length > 0 ? { ...freeWindows[0] } : null;

    upNextTasks.forEach(task => {
      let placed = false;
      const buffer = priorityWeight[task.priority] >= 3 ? 10 : 5; // buffer based on priority
      const requiredTime = task.durationMinutes + buffer;

      while (currentWindow && !placed) {
        if (currentWindow.d >= task.durationMinutes) { // Need at least enough time for task
          scheduledUpNext.push({
            ...task,
            startTime: currentWindow.s,
            endTime: currentWindow.s + task.durationMinutes
          });
          currentWindow.s += requiredTime;
          currentWindow.d -= requiredTime;
          placed = true;
        } else {
          currentWindowIdx++;
          currentWindow = currentWindowIdx < freeWindows.length ? { ...freeWindows[currentWindowIdx] } : null;
        }
      }

      if (!placed) {
        overflow.push(task);
      }
    });

    return {
      routine: routineBlocks,
      mustDo: scheduledMustDo,
      upNext: scheduledUpNext,
      overflow,
      totalFreeMinutes,
      collisions
    };
  }
}
