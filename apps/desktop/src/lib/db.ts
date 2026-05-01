import Database from "@tauri-apps/plugin-sql";
import { prepareOfflineLease } from "./native-security";

let db: Database | null = null;
const isTauri = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

export async function getDb() {
  if (!isTauri) return null;
  if (db) return db;
  try {
    db = await Database.load("sqlite:gritorquit.db");
    
    // Initialize Schema
    await db.execute(`
      CREATE TABLE IF NOT EXISTS study_tracks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL,
        status TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS study_units (
        id TEXT PRIMARY KEY,
        trackId TEXT NOT NULL,
        title TEXT NOT NULL,
        status TEXT NOT NULL,
        secondsSpent INTEGER DEFAULT 0,
        notes TEXT,
        metadata TEXT,
        playlistIndex INTEGER,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY(trackId) REFERENCES study_tracks(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,
        payload TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS offline_lease (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        token TEXT NOT NULL,
        expiresAt INTEGER NOT NULL,
        lastOnlineAt INTEGER NOT NULL,
        lastOnlineMonotonicMs INTEGER NOT NULL DEFAULT 0,
        lastSafeSystemTime INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS habits (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        icon TEXT,
        color TEXT,
        "order" INTEGER DEFAULT 0,
        active INTEGER DEFAULT 1,
        updatedAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS habit_logs (
        id TEXT PRIMARY KEY,
        habitId TEXT NOT NULL,
        date TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY(habitId) REFERENCES habits(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS daily_notes (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        content TEXT,
        updatedAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS today_settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        focusMode INTEGER DEFAULT 0,
        missionActive INTEGER DEFAULT 0,
        currentItemId TEXT,
        currentItemType TEXT,
        taskOrder TEXT,
        lastUpdated TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        title TEXT,
        content TEXT,
        category TEXT DEFAULT 'GENERAL',
        metadata TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        syncStatus TEXT DEFAULT 'SYNCED'
      );

      CREATE TABLE IF NOT EXISTS sync_log (
        id TEXT PRIMARY KEY,
        lastPulledAt TEXT NOT NULL
      );
    `);

    // Migrations
    try {
      const tableInfo = await db.select<any[]>("PRAGMA table_info(sync_queue)");
      const hasRetries = tableInfo.some(col => col.name === 'retries');
      if (!hasRetries) {
        await db.execute("ALTER TABLE sync_queue ADD COLUMN retries INTEGER DEFAULT 0");
      }
    } catch (e) {
      console.warn("Migration failed: sync_queue.retries", e);
    }

    return db;
  } catch (e) {
    console.warn("Native database initialization failed:", e);
    return null;
  }
}

export async function queueAction(action: string, payload: any) {
  const sqlite = await getDb();
  if (!sqlite) return;

  const payloadStr = JSON.stringify({
    ...payload,
    queuedAt: new Date().toISOString()
  });

  await sqlite.execute(
    "INSERT INTO sync_queue (action, payload, createdAt) VALUES (?, ?, ?)",
    [action, payloadStr, new Date().toISOString()]
  );
}

export async function saveOfflineLease(token: string) {
  const sqlite = await getDb();
  if (!sqlite) return;

  const prepared = await prepareOfflineLease(token);
  if (!prepared) return;

  await sqlite.execute(
    "INSERT OR REPLACE INTO offline_lease (id, token, expiresAt, lastOnlineAt, lastOnlineMonotonicMs, lastSafeSystemTime) VALUES (1, ?, ?, ?, ?, ?)",
    [
      token, 
      prepared.expiresAt, 
      Date.now(), 
      prepared.lastOnlineMonotonicMs,
      prepared.lastSafeSystemTime
    ]
  );
}

export async function getOfflineLease() {
  const sqlite = await getDb();
  if (!sqlite) return null;

  const results = await sqlite.select<any[]>("SELECT * FROM offline_lease WHERE id = 1");
  return results.length > 0 ? results[0] : null;
}

export async function updateLastSafeSystemTime(time: number) {
  const sqlite = await getDb();
  if (!sqlite) return;
  await sqlite.execute("UPDATE offline_lease SET lastSafeSystemTime = ? WHERE id = 1", [time]);
}

export async function clearQueuedCentralNoteSaves(noteIds: string[]) {
  const sqlite = await getDb();
  if (!sqlite || noteIds.length === 0) return;
  await sqlite.execute("DELETE FROM sync_queue WHERE action = 'SAVE_CENTRAL_NOTE' AND payload LIKE ?", 
    ['%' + noteIds[0] + '%']);
}
