import { OfflineStorage } from "@gritorquit/study-core";
import { getDb, queueAction } from "./db";
import { Track, TrackData, Unit } from "@gritorquit/study-core";

function safeParse(str: string | null | undefined, fallback: any = null) {
  if (!str) return fallback;
  if (typeof str !== 'string') return str;
  try {
    return JSON.parse(str);
  } catch (e) {
    console.warn("Failed to parse JSON:", str, e);
    return fallback;
  }
}

export const sqliteOfflineBridge: OfflineStorage = {
  isOffline: () => !navigator.onLine,

  getTracks: async () => {
    const db = await getDb();
    if (!db) return [];
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
    if (!db) return null;
    const tracks = await db.select<any[]>("SELECT * FROM study_tracks WHERE id = ?", [id]);
    if (tracks.length === 0) return null;

    const units = await db.select<any[]>("SELECT * FROM study_units WHERE trackId = ? ORDER BY updatedAt", [id]);
    
    return {
      track: {
        ...tracks[0],
        units: units.map((u: any) => ({
          ...u,
          notes: safeParse(u.notes),
          metadata: safeParse(u.metadata, {})
        }))
      },
      stats: { 
        totalTimeSpent: units.reduce((acc: number, u: any) => acc + (u.secondsSpent || 0), 0) / 60 
      }
    } as any;
  },

  saveTracks: async (tracks: Track[]) => {
    const db = await getDb();
    if (!db) return;
    for (const t of tracks) {
      await db.execute(
        "INSERT OR REPLACE INTO study_tracks (id, title, description, type, status, updatedAt) VALUES (?, ?, ?, ?, ?, ?)",
        [t.id, t.title, t.description, t.type, t.status, String(t.updatedAt || new Date().toISOString())]
      );
    }
  },

  saveTrack: async (data: TrackData) => {
    const db = await getDb();
    if (!db) return;
    const t = data.track;
    await db.execute(
      "INSERT OR REPLACE INTO study_tracks (id, title, description, type, status, updatedAt) VALUES (?, ?, ?, ?, ?, ?)",
      [t.id, t.title, t.description, t.type, t.status, String(t.updatedAt || new Date().toISOString())]
    );

    for (const u of t.units) {
      await db.execute(
        "INSERT OR REPLACE INTO study_units (id, trackId, title, status, secondsSpent, notes, metadata, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [u.id, t.id, u.title, u.status, u.totalWatchedSeconds || 0, JSON.stringify(u.notes), JSON.stringify(u.metadata || {}), String(u.updatedAt || new Date().toISOString())]
      );
    }
  },

  updateUnit: async (unitId: string, updates: any) => {
    const db = await getDb();
    if (!db) return;

    // We build the update query dynamically based on provided fields
    const fields = Object.keys(updates);
    if (fields.length === 0) return;

    const setClause = fields.map(f => `"${f}" = ?`).join(', ');
    const values = fields.map(f => {
      const val = updates[f];
      if (typeof val === 'object' && val !== null) return JSON.stringify(val);
      return val;
    });

    await db.execute(
      `UPDATE study_units SET ${setClause}, updatedAt = ? WHERE id = ?`,
      [...values, new Date().toISOString(), unitId]
    );
  },

  queueAction: async (action: string, payload: any) => {
    await queueAction(action, payload);
  }
};
