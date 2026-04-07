import Dexie, { type Table } from 'dexie';
import { Note } from '../types/notes'; // We need to export Note from here or import from web

export interface LocalNote extends Omit<Note, 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
  syncStatus: 'SYNCED' | 'PENDING' | 'DELETED';
}

export class NotesDatabase extends Dexie {
  notes!: Table<LocalNote>;

  constructor() {
    super('PlannerNotesDB');
    this.version(1).stores({
      notes: '++id, userId, category, syncStatus, updatedAt'
    });
  }
}

export const db = new NotesDatabase();
