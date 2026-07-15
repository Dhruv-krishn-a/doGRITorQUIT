import { useState, useEffect, useCallback } from 'react';
import { database } from '../db';
import Note from '../db/models/Note';
import { Q } from '@nozbe/watermelondb';
import { useAuth } from '../context/AuthContext';

export function useNotes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = useCallback(async (search: string = '') => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const conditions: any[] = [Q.where('user_id', user.id)];
      
      if (search) {
        conditions.push(Q.or(
          Q.where('title', Q.like(`%${search}%`)),
          Q.where('content', Q.like(`%${search}%`))
        ));
      }

      const query = database.get<Note>('notes').query(
        ...conditions,
        Q.sortBy('updated_at', Q.desc)
      );

      const allNotes = await query.fetch();
      setNotes(allNotes);
    } catch (error) {
      console.error("Failed to fetch notes:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchNotes();
    const subscription = database.get('notes').changes.subscribe(() => fetchNotes());
    return () => subscription.unsubscribe();
  }, [fetchNotes]);

  const addNote = async (title: string, category: string = 'GENERAL') => {
    if (!user?.id) throw new Error("Auth required");
    return await database.write(async () => {
      return await database.get<Note>('notes').create(note => {
        note.title = title;
        note.content = '';
        note.category = category;
        note.userId = user.id;
      });
    });
  };

  return {
    notes,
    loading,
    fetchNotes,
    addNote
  };
}
