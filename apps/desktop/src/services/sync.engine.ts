import { getDb, clearQueuedCentralNoteSaves } from "../lib/db";
import { studyApi } from "@gritorquit/study-core";
import { habitsApi } from "@gritorquit/habits-core";
import { api } from "./api";
import { toast } from "sonner";
import { invoke } from "@tauri-apps/api/core";

export class SyncEngine {
  private static isSyncing = false;
  private static dbLock = Promise.resolve(); // Sequential DB write queue

  private static async safeDbExecute(query: string, params: any[]) {
    // Ensure only one DB write happens at a time to prevent SQLite Busy errors
    this.dbLock = this.dbLock.then(async () => {
      const db = await getDb();
      if (db) await db.execute(query, params);
    });
    return this.dbLock;
  }

  static async processQueue(options: { silent?: boolean } = {}) {
    if (this.isSyncing || !navigator.onLine) {
      return { processed: 0, synced: 0, remaining: 0, failed: false };
    }
    
    const db = await getDb();
    if (!db) return { processed: 0, synced: 0, remaining: 0, failed: false };

    const queue = await db.select<any[]>("SELECT * FROM sync_queue WHERE retries < 3 ORDER BY id ASC");
    const localPendingNotes = await db.select<any[]>("SELECT * FROM notes WHERE syncStatus != 'SYNCED' AND syncStatus != 'FAILED' ORDER BY updatedAt ASC");
    
    if (queue.length === 0 && localPendingNotes.length === 0) {
      return { processed: 0, synced: 0, remaining: 0, failed: false };
    }

    this.isSyncing = true;
    let syncedCount = 0;
    let failed = false;

    // Refresh entitlements on every major sync cycle to check for plan updates
    invoke('clear_entitlements_cache').catch(() => {});

    const runInParallel = async (tasks: (() => Promise<void>)[], concurrency = 3) => {
      for (let i = 0; i < tasks.length; i += concurrency) {
        const chunk = tasks.slice(i, i + concurrency);
        await Promise.all(chunk.map(task => task().catch(e => {
          console.error("Sync Task Failed:", e);
          failed = true;
        })));
      }
    };

    // 1. Process sync_queue
    if (queue.length > 0) {
      const tasks = queue.map(item => async () => {
        try {
          const payload = JSON.parse(item.payload);
          const queuedAt = payload.queuedAt;
          let skip = false;

          if (['UPDATE_UNIT', 'LOG_PROGRESS', 'MOVE_UNIT', 'SAVE_NOTES'].includes(item.action)) {
            const remote = await studyApi.getUnit(payload.unitId).catch(() => null);
            if (remote?.unit?.updatedAt && queuedAt && new Date(remote.unit.updatedAt).getTime() > new Date(queuedAt).getTime()) skip = true;
          }

          if (!skip) {
            switch (item.action) {
              case 'MOVE_UNIT': await studyApi.moveUnit(payload.unitId, payload.toStatus, payload.newIndex ?? payload.positionIndex ?? 0); break;
              case 'LOG_PROGRESS': await studyApi.logProgress(payload.unitId, { secondsSpent: payload.secondsSpent || 0, watchPercentage: payload.watchPercentage || 0 }); break;
              case 'UPDATE_UNIT': await studyApi.updateUnit(payload.unitId, payload.updates); break;
              case 'SAVE_NOTES':
                await studyApi.saveNotes(payload.unitId, payload.notes);
                await this.safeDbExecute(`UPDATE study_units SET notes = ?, updatedAt = ? WHERE id = ?`,
                  [typeof payload.notes === 'string' ? payload.notes : JSON.stringify(payload.notes), new Date().toISOString(), payload.unitId]);
                break;
              case 'TOGGLE_HABIT': await habitsApi.toggleHabitLog(payload.habitId, payload.date, payload.completed); break;
              case 'SAVE_NOTE': await habitsApi.saveDailyNote(payload.date, payload.content); break;
              case 'CREATE_HABIT': await habitsApi.createHabit(payload); break;
              case 'DELETE_HABIT': await habitsApi.deleteHabit(payload.habitId).catch(err => { if (err.message?.includes('404')) return; throw err; }); break;
              case 'SAVE_CENTRAL_NOTE':
                if (payload.isNew) {
                  const remote = await api.post('/notes', payload.data);
                  await this.safeDbExecute("DELETE FROM notes WHERE id = ?", [payload.localId]);
                  await this.safeDbExecute(`INSERT OR REPLACE INTO notes (id, title, content, category, metadata, createdAt, updatedAt, syncStatus) VALUES (?, ?, ?, ?, ?, ?, ?, 'SYNCED')`,
                    [remote.id, remote.title, JSON.stringify(remote.content), remote.category, JSON.stringify(remote.metadata), String(remote.createdAt), String(remote.updatedAt)]);
                } else {
                  const remote = await api.patch(`/notes/${payload.remoteId || payload.id}`, payload.data);
                  await this.safeDbExecute(`INSERT OR REPLACE INTO notes (id, title, content, category, metadata, createdAt, updatedAt, syncStatus) VALUES (?, ?, ?, ?, ?, ?, ?, 'SYNCED')`,
                    [remote.id, remote.title, JSON.stringify(remote.content), remote.category, JSON.stringify(remote.metadata), String(remote.createdAt), String(remote.updatedAt)]);
                }
                break;
              case 'DELETE_CENTRAL_NOTE': await api.delete(`/notes/${payload.id}`).catch(err => { if (err.message?.includes('404')) return; throw err; }); break;
            }
          }
          await this.safeDbExecute("DELETE FROM sync_queue WHERE id = ?", [item.id]);
          syncedCount++;
        } catch (e) {
          const currentRetries = item.retries || 0;
          if (currentRetries >= 2) {
            await this.safeDbExecute("DELETE FROM sync_queue WHERE id = ?", [item.id]);
            toast.error("Cloud save failed for some items.");
          } else {
            await this.safeDbExecute("UPDATE sync_queue SET retries = ? WHERE id = ?", [currentRetries + 1, item.id]);
          }
          throw e;
        }
      });
      await runInParallel(tasks);
    }

    // 2. Process Central Notes
    if (localPendingNotes.length > 0) {
      const remoteNotes = await api.get('/notes').catch(() => []);
      const remoteById = new Map((Array.isArray(remoteNotes) ? remoteNotes : []).map((n: any) => [n.id, n]));

      const noteTasks = localPendingNotes.map(row => async () => {
        try {
          if (row.syncStatus === 'DELETED') {
            if (!row.id.startsWith('local-') && remoteById.has(row.id)) await api.delete(`/notes/${row.id}`).catch(err => { if (err.message?.includes('404')) return; throw err; });
            await this.safeDbExecute("DELETE FROM notes WHERE id = ?", [row.id]);
            syncedCount++;
            return;
          }

          const remote = remoteById.get(row.id);
          if (remote && new Date(remote.updatedAt).getTime() > new Date(row.updatedAt).getTime()) {
            await this.safeDbExecute(`INSERT OR REPLACE INTO notes (id, title, content, category, metadata, createdAt, updatedAt, syncStatus) VALUES (?, ?, ?, ?, ?, ?, ?, 'SYNCED')`,
              [remote.id, remote.title, JSON.stringify(remote.content), remote.category, JSON.stringify(remote.metadata), String(remote.createdAt), String(remote.updatedAt)]);
            return;
          }

          const payload = { title: row.title, content: JSON.parse(row.content || 'null'), category: row.category, metadata: JSON.parse(row.metadata || '{}') };
          const savedRemote = row.id.startsWith('local-') ? await api.post('/notes', payload) : await api.patch(`/notes/${row.id}`, payload);
          
          if (row.id.startsWith('local-')) await this.safeDbExecute("DELETE FROM notes WHERE id = ?", [row.id]);
          await this.safeDbExecute(`INSERT OR REPLACE INTO notes (id, title, content, category, metadata, createdAt, updatedAt, syncStatus) VALUES (?, ?, ?, ?, ?, ?, ?, 'SYNCED')`,
            [savedRemote.id, savedRemote.title, JSON.stringify(savedRemote.content), savedRemote.category, JSON.stringify(savedRemote.metadata), String(savedRemote.createdAt), String(savedRemote.updatedAt)]);
          
          await clearQueuedCentralNoteSaves([row.id, savedRemote.id]);
          syncedCount++;
        } catch (e) {
          await this.safeDbExecute("UPDATE notes SET syncStatus = 'FAILED' WHERE id = ?", [row.id]);
          throw e;
        }
      });
      await runInParallel(noteTasks);
    }

    this.isSyncing = false;
    if (syncedCount > 0 && !options.silent) toast.success(`Synced ${syncedCount} changes`);
    
    // After pushing changes, pull fresh data to stay in sync
    this.pullSync().catch(console.warn);

    return { processed: queue.length, synced: syncedCount, remaining: 0, failed };
  }

  static async pullSync() {
    if (!navigator.onLine) return;
    
    try {
      // 1. Sync Study Tracks
      const tracks = await studyApi.getTracks();
      if (Array.isArray(tracks)) {
        for (const track of tracks) {
          await this.safeDbExecute(
            `INSERT OR REPLACE INTO study_tracks (id, title, description, type, status, updatedAt) VALUES (?, ?, ?, ?, ?, ?)`,
            [track.id, track.title, track.description, track.type, track.status, track.updatedAt]
          );

          // 2. Sync Units for this track
          const fullTrack = await studyApi.getTrack(track.id);
          if (fullTrack?.track?.units && Array.isArray(fullTrack.track.units)) {
            for (const unit of fullTrack.track.units) {
              await this.safeDbExecute(
                `INSERT OR REPLACE INTO study_units (id, trackId, title, status, secondsSpent, notes, metadata, playlistIndex, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                  unit.id, 
                  track.id, 
                  unit.title, 
                  unit.status, 
                  unit.totalWatchedSeconds || 0, 
                  typeof unit.notes === 'string' ? unit.notes : JSON.stringify(unit.notes), 
                  typeof unit.metadata === 'string' ? unit.metadata : JSON.stringify(unit.metadata), 
                  unit.playlistIndex || 0, 
                  String(unit.updatedAt || new Date().toISOString())
                ]
              );
            }
          }
        }
      }
      console.info("Pull sync complete: Local database hydrated.");
    } catch (error) {
      console.warn("Pull sync failed:", error);
    }
  }

  static start() {
    setInterval(() => this.processQueue({ silent: true }), 30000);
    window.addEventListener('online', () => this.processQueue());
    
    // Initial pull sync on boot
    setTimeout(() => this.pullSync(), 2000);
  }
}
