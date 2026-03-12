import { getDb } from "../lib/db";
import { studyApi } from "@planner/study-core";
import { habitsApi } from "@planner/habits-core";
import { toast } from "sonner";

export class SyncEngine {
  private static isSyncing = false;

  static async processQueue() {
    if (this.isSyncing || !navigator.onLine) return;
    
    const db = await getDb();
    const queue = await db.select<any[]>("SELECT * FROM sync_queue ORDER BY id ASC");
    
    if (queue.length === 0) return;

    this.isSyncing = true;
    console.log(`SyncEngine: Processing ${queue.length} items`);

    for (const item of queue) {
      try {
        const payload = JSON.parse(item.payload);
        let skipUpdate = false;
        
        // Conflict Resolution Strategy: Remote Wins if newer.
        // Fetch remote state to check for conflicts before applying updates.
        if (item.action === 'UPDATE_UNIT' || item.action === 'LOG_PROGRESS' || item.action === 'MOVE_UNIT') {
           try {
              const remoteResponse = await studyApi.getUnit(payload.unitId);
              const remoteUnit = remoteResponse?.unit;
              
              // If remote was updated after our local offline change was queued
              if (remoteUnit && remoteUnit.updatedAt && payload.queuedAt) {
                 const remoteTime = new Date(remoteUnit.updatedAt).getTime();
                 const localTime = new Date(payload.queuedAt).getTime();
                 if (remoteTime > localTime) {
                    console.log(`Conflict detected for Unit ${payload.unitId}. Remote is newer. Skipping local update.`);
                    skipUpdate = true;
                 }
              }
           } catch (err) {
              console.warn("Could not fetch remote unit for conflict resolution", err);
           }
        }

        if (!skipUpdate) {
          switch (item.action) {
            case 'MOVE_UNIT':
              await studyApi.moveUnit(payload.unitId, payload.toStatus, payload.newIndex);
              break;
            case 'LOG_PROGRESS':
              await studyApi.logProgress(payload.unitId, { 
                secondsSpent: payload.secondsSpent, 
                watchPercentage: payload.watchPercentage 
              });
              break;
            case 'UPDATE_UNIT':
              await studyApi.updateUnit(payload.unitId, payload.updates);
              break;
            case 'SAVE_NOTES':
              await studyApi.saveNotes(payload.unitId, payload.notes);
              break;
            case 'TOGGLE_HABIT':
              await habitsApi.toggleHabitLog(payload.habitId, payload.date, payload.completed);
              break;
            case 'SAVE_NOTE':
              await habitsApi.saveDailyNote(payload.date, payload.content);
              break;
            case 'CREATE_HABIT':
              await habitsApi.createHabit({ title: payload.title, icon: payload.icon, color: payload.color });
              break;
            case 'DELETE_HABIT':
              await habitsApi.deleteHabit(payload.habitId);
              break;
          }
        }

        // Delete from queue if successful or skipped due to conflict
        await db.execute("DELETE FROM sync_queue WHERE id = ?", [item.id]);
      } catch (e) {
        console.error("SyncEngine Error:", e);
      }
    }

    this.isSyncing = false;
    toast.success("Offline changes synced with server");
  }

  static start() {
    // Check every 30 seconds if online
    setInterval(() => this.processQueue(), 30000);
    
    // Also trigger on reconnect
    window.addEventListener('online', () => this.processQueue());
  }
}
