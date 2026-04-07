import { NoteCategory } from "@prisma/client";

export { NoteCategory };

export interface Note {
  id: string;
  userId: string;
  title: string | null;
  content: unknown; // TipTap JSON
  category: NoteCategory;
  metadata: {
    unitId?: string;
    trackId?: string;
    source?: string;
    sourceTitle?: string;
    trackTitle?: string;
    link?: string;
    [key: string]: unknown;
  } | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}
