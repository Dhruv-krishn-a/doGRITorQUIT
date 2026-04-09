import { useQuery } from '@tanstack/react-query';
import { api } from '../../../services/api';
import { getDb } from '../../../lib/db';
import { Note } from '@gritorquit/notes-ui-web';

export function useNotes(activeCategory: string) {
  return useQuery({
    queryKey: ['notes', activeCategory],
    queryFn: async () => {
      const db = await getDb();
      let notes: Note[] = [];
      let remoteData: any[] | null = null;

      try {
        if (navigator.onLine) {
          const endpoint = `/notes?category=${activeCategory === 'ALL' ? '' : activeCategory}`;
          remoteData = await api.get(endpoint);
          
          if (Array.isArray(remoteData)) {
            // Backup to localStorage
            try {
              localStorage.setItem(`notes_backup_${activeCategory}`, JSON.stringify(remoteData));
            } catch (e) {}

            if (db) {
              // 1. Get all local synced IDs for this category
              let localQuery = "SELECT id FROM notes WHERE syncStatus = 'SYNCED'";
              if (activeCategory !== 'ALL') localQuery += ` AND category = '${activeCategory}'`;
              const localSyncedRows = await db.select<any[]>(localQuery);
              const localSyncedIds = new Set(localSyncedRows.map(r => r.id));
              
              // 2. Track which remote IDs we processed
              const remoteIds = new Set(remoteData.map(n => n.id));

              // 3. Upsert remote notes
              for (const n of remoteData) {
                await db.execute(
                  `INSERT OR REPLACE INTO notes (id, title, content, category, metadata, createdAt, updatedAt, syncStatus) VALUES (?, ?, ?, ?, ?, ?, ?, 'SYNCED')`,
                  [n.id, n.title, JSON.stringify(n.content), n.category, JSON.stringify(n.metadata || {}), n.createdAt, n.updatedAt]
                );
              }

              // 4. PURGE GHOST NOTES: Delete local synced notes that no longer exist on remote
              for (const localId of localSyncedIds) {
                if (!remoteIds.has(localId)) {
                  await db.execute("DELETE FROM notes WHERE id = ?", [localId]);
                }
              }
            }
          }
        }
      } catch (error) {
        console.warn("Failed to fetch remote notes, falling back to local only", error);
      }

      // Always return latest from DB, but fallback to remoteData if DB is empty and we just fetched
      if (db) {
        let query = `SELECT * FROM notes WHERE syncStatus != 'DELETED'`;
        if (activeCategory !== 'ALL') query += ` AND category = '${activeCategory}'`;
        query += ` ORDER BY updatedAt DESC`;
        
        const localRows = await db.select<any[]>(query);
        if (localRows.length > 0) {
          notes = localRows.map(n => ({
            ...n,
            content: typeof n.content === 'string' ? JSON.parse(n.content || 'null') : n.content,
            metadata: typeof n.metadata === 'string' ? JSON.parse(n.metadata || '{}') : n.metadata
          }));
        } else if (Array.isArray(remoteData) && remoteData.length > 0) {
          // If DB is empty but we have remote data, use it directly for this render
          notes = remoteData;
        }
      } else {
        // Fallback to localStorage or remoteData
        try {
           const stored = localStorage.getItem(`notes_backup_${activeCategory}`);
           if (stored) {
             notes = JSON.parse(stored);
           } else if (Array.isArray(remoteData)) {
             notes = remoteData;
           }
        } catch (e) {
          if (Array.isArray(remoteData)) notes = remoteData;
        }
      }

      return notes;
    },
    staleTime: 30 * 1000,
  });
}
