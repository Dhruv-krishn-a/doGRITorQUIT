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

      try {
        if (navigator.onLine) {
          const endpoint = `/notes?category=${activeCategory === 'ALL' ? '' : activeCategory}`;
          const remoteData = await api.get(endpoint);
          
          if (Array.isArray(remoteData) && db) {
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
      } catch (error) {
        console.warn("Failed to fetch remote notes, falling back to local only", error);
      }

      // Always return latest from DB
      if (db) {
        let query = `SELECT * FROM notes WHERE syncStatus != 'DELETED'`;
        if (activeCategory !== 'ALL') query += ` AND category = '${activeCategory}'`;
        query += ` ORDER BY updatedAt DESC`;
        
        const localRows = await db.select<any[]>(query);
        notes = localRows.map(n => ({
          ...n,
          content: JSON.parse(n.content || 'null'),
          metadata: JSON.parse(n.metadata || '{}')
        }));
      }

      return notes;
    },
    staleTime: 30 * 1000,
  });
}
