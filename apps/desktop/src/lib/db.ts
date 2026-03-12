import Database from "@tauri-apps/plugin-sql";

let db: Database | null = null;

export async function getDb() {
  if (db) return db;
  db = await Database.load("sqlite:planner.db");
  
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
      lastOnlineAt INTEGER NOT NULL
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
  `);

  return db;
}

export async function saveOfflineLease(token: string, expiresAt: number) {
  const sqlite = await getDb();
  await sqlite.execute(
    "INSERT OR REPLACE INTO offline_lease (id, token, expiresAt, lastOnlineAt) VALUES (1, ?, ?, ?)",
    [token, expiresAt, Date.now()]
  );
}

export async function getOfflineLease() {
  const sqlite = await getDb();
  const rows = await sqlite.select<any[]>("SELECT * FROM offline_lease WHERE id = 1");
  return rows[0] || null;
}

export async function queueAction(action: string, payload: any) {
  const sqlite = await getDb();
  await sqlite.execute(
    "INSERT INTO sync_queue (action, payload, createdAt) VALUES (?, ?, ?)",
    [action, JSON.stringify(payload), new Date().toISOString()]
  );
}
