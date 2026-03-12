import { OfflineStorage } from "@planner/study-core";
import { getDb, queueAction } from "./db";
import { Track, TrackData, Unit } from "@planner/study-core";

export const sqliteOfflineBridge: OfflineStorage = {
  isOffline: () => !navigator.onLine,

  getTracks: async () => {
    const db = await getDb();
    const rows = await db.select<any[]>("SELECT * FROM study_tracks ORDER BY updatedAt DESC");
    return rows.map((r: any) => ({
      ...r,
      totalTimeMinutes: r.totalTimeMinutes || 0,
      totalDurationMinutes: r.totalDurationMinutes || 0,
      progressPercentage: r.progressPercentage || 0,
      confidenceScore: r.confidenceScore || 0,
    })) as Track[];
  },

  getTrack: async (id: string) => {
    const db = await getDb();
    const tracks = await db.select<any[]>("SELECT * FROM study_tracks WHERE id = ?", [id]);
    if (tracks.length === 0) return null;

    const units = await db.select<any[]>("SELECT * FROM study_units WHERE trackId = ? ORDER BY updatedAt", [id]);
    
    return {
      track: {
        ...tracks[0],
        units: units.map((u: any) => ({
          ...u,
          notes: u.notes ? JSON.parse(u.notes) : null,
          metadata: u.metadata ? JSON.parse(u.metadata) : {}
        }))
      },
      stats: { 
        totalTimeSpent: units.reduce((acc: number, u: any) => acc + (u.secondsSpent || 0), 0) / 60 
      }
    } as any;
  },

  saveTracks: async (tracks: Track[]) => {
    const db = await getDb();
    for (const t of tracks) {
      await db.execute(
        "INSERT OR REPLACE INTO study_tracks (id, title, description, type, status, updatedAt) VALUES (?, ?, ?, ?, ?, ?)",
        [t.id, t.title, t.description, t.type, t.status, String(t.updatedAt || new Date().toISOString())]
      );
    }
  },

  saveTrack: async (data: TrackData) => {
    const db = await getDb();
    const t = data.track;
    await db.execute(
      "INSERT OR REPLACE INTO study_tracks (id, title, description, type, status, updatedAt) VALUES (?, ?, ?, ?, ?, ?)",
      [t.id, t.title, t.description, t.type, t.status, String(t.updatedAt || new Date().toISOString())]
    );

    for (const u of t.units) {
      await db.execute(
        "INSERT OR REPLACE INTO study_units (id, trackId, title, status, secondsSpent, notes, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [u.id, t.id, u.title, u.status, u.totalWatchedSeconds || 0, JSON.stringify(u.notes), String(u.updatedAt || new Date().toISOString())]
      );
    }
  },

  queueAction: async (action: string, payload: any) => {
    await queueAction(action, payload);
  }
};
