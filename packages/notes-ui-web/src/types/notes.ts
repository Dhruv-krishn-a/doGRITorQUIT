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
  metadata: {
    unitId?: string;
    trackId?: string;
    source?: string;
    sourceTitle?: string;
    trackTitle?: string;
    link?: string;
    [key: string]: any;
  } | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}
