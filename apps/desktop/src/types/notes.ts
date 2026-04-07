export enum NoteCategory {
  YOUTUBE = "YOUTUBE",
  COURSE = "COURSE",
  PROJECT = "PROJECT",
  GENERAL = "GENERAL",
  OTHER = "OTHER",
}

export interface Note {
  id: string;
  userId: string;
  title: string | null;
  content: any; // TipTap JSON
  category: NoteCategory;
  metadata: any;
  createdAt: string;
  updatedAt: string;
}
