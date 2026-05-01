import { useQuery } from '@tanstack/react-query';
import { getDb } from '../../../lib/db';
import { Note } from '@gritorquit/notes-ui-web';

export function useNotes(activeCategory: string) {
  return useQuery({
    queryKey: ['notes', activeCategory],
    queryFn: async () => {
      const db = await getDb();
      let notes: Note[] = [];

      if (db) {
        let query = `SELECT * FROM notes WHERE syncStatus != 'DELETED'`;
        if (activeCategory !== 'ALL') query += ` AND category = '${activeCategory}'`;
        query += ` ORDER BY updatedAt DESC`;
        
        const localRows = await db.select<any[]>(query);
        notes = localRows.map(n => ({
          ...n,
          content: typeof n.content === 'string' ? JSON.parse(n.content || 'null') : n.content,
          metadata: typeof n.metadata === 'string' ? JSON.parse(n.metadata || '{}') : n.metadata
        }));
      } else {
        // Fallback to localStorage only if DB is not available
        try {
           const stored = localStorage.getItem(`notes_backup_${activeCategory}`);
           if (stored) notes = JSON.parse(stored);
        } catch (e) {}
      }

      return notes;
    },
    staleTime: Infinity,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
