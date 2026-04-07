"use client";

import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import {
  Plus, Search, Trash2,
  Loader2, Youtube,
  Briefcase, GraduationCap, StickyNote,
  Calendar, BookOpen, Target,
  Wifi, WifiOff, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Note,
  NoteCategory,
  db,
  LocalNote,
  isVisibleNote,
  matchesNoteSearch,
} from "@gritorquit/notes-ui-web";
import { useLiveQuery } from "dexie-react-hooks";

const LazyNoteEditor = lazy(() =>
  import("@gritorquit/notes-ui-web").then((mod) => ({ default: mod.NoteEditor }))
);

const toLocalNote = (note: Note, syncStatus: LocalNote["syncStatus"] = 'SYNCED'): LocalNote => ({
  ...note,
  createdAt: String(note.createdAt),
  updatedAt: String(note.updatedAt),
  syncStatus,
});

const NoteCard = ({ note, onClick, onDelete }: { note: Note | LocalNote, onClick: () => void, onDelete: () => void }) => {
  const getIcon = () => {
    switch (note.category) {
      case NoteCategory.YOUTUBE: return <Youtube size={16} className="text-sky-focus" />;
      case NoteCategory.PROJECT: return <Briefcase size={16} className="text-sky-focus" />;
      case NoteCategory.COURSE: return <GraduationCap size={16} className="text-sky-focus" />;
      default: return <StickyNote size={16} className="text-sky-focus" />;
    }
  };

  const sourceTitle = note.metadata?.sourceTitle || note.metadata?.trackTitle;
  const isPending = (note as LocalNote).syncStatus === 'PENDING';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      className="group relative bg-slate-surface/30 border border-slate-800 rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl hover:shadow-sky-500/5 transition-all cursor-pointer flex flex-col h-full min-h-[220px]"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 rounded-2xl bg-obsidian border border-slate-800 group-hover:border-sky-focus/30 transition-colors">
          {getIcon()}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-2 text-slate-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <h3 className="text-lg font-black text-white italic uppercase tracking-tight mb-2 line-clamp-2 group-hover:text-sky-focus transition-colors leading-tight">
        {note.title || "Untitled Note"}
      </h3>

      {sourceTitle && (
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1 bg-obsidian rounded text-slate-500 border border-slate-800">
            <Target size={10} />
          </div>
          <span className="text-[10px] font-bold text-slate-500 truncate uppercase tracking-widest">
            {sourceTitle}
          </span>
        </div>
      )}

      <div className="flex items-center gap-3 mt-auto pt-4 border-t border-slate-800">
        <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
          <Calendar size={10} />
          {new Date(note.updatedAt).toLocaleDateString()}
        </div>
        <div className="w-1 h-1 rounded-full bg-slate-800" />
        <div className={`text-[9px] font-bold uppercase tracking-widest ${isPending ? 'text-amber' : 'text-slate-600'}`}>
          {isPending ? 'Syncing...' : note.category}
        </div>
      </div>
    </motion.div>
  );
};

export default function NotesPage() {
  const [view, setView] = useState<'LIST' | 'EDITOR'>('LIST');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncingNotes, setIsSyncingNotes] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  const localNotes = useLiveQuery(() => db.notes.orderBy('updatedAt').reverse().toArray(), []);

  const putLocalNote = useCallback(async (note: LocalNote) => {
    await db.notes.put(note);
  }, []);

  const syncPendingNotes = useCallback(async () => {
    if (!navigator.onLine) return;

    const deletedNotes = await db.notes.where('syncStatus').equals('DELETED').toArray();
    for (const note of deletedNotes) {
      try {
        if (!note.id.startsWith('local-')) {
          const res = await fetch(`/api/notes/${note.id}`, { method: 'DELETE' });
          if (!res.ok && res.status !== 404) {
            throw new Error(`Delete failed with status ${res.status}`);
          }
        }
        await db.notes.delete(note.id);
      } catch (error) {
        console.warn('Failed to sync deleted note', note.id, error);
      }
    }

    const pendingNotes = await db.notes.where('syncStatus').equals('PENDING').toArray();
    for (const note of pendingNotes) {
      const isNew = note.id.startsWith('local-');
      try {
        const res = await fetch(isNew ? '/api/notes' : `/api/notes/${note.id}`, {
          method: isNew ? 'POST' : 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: note.title,
            content: note.content,
            category: note.category,
            metadata: note.metadata,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || `Sync failed with status ${res.status}`);
        }

        if (isNew && note.id !== data.id) {
          await db.notes.delete(note.id);
        }

        await putLocalNote(toLocalNote(data, 'SYNCED'));
      } catch (error) {
        console.warn('Failed to sync pending note', note.id, error);
      }
    }
  }, [putLocalNote]);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/notes?category=${activeCategory === 'ALL' ? '' : activeCategory}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        const localEntries = await db.notes.toArray();
        const localStatusById = new Map(localEntries.map((note) => [note.id, note.syncStatus]));

        await db.notes.bulkPut(
          data
            .filter((note) => {
              const status = localStatusById.get(note.id);
              return status !== 'PENDING' && status !== 'DELETED';
            })
            .map((note) => toLocalNote(note, 'SYNCED'))
        );
      }
    } catch {
      console.warn("API offline, using local cache");
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleStatusChange = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      if (online) {
        void syncPendingNotes();
        void fetchNotes();
      }
    };

    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);

    void syncPendingNotes();
    void fetchNotes();

    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, [fetchNotes, syncPendingNotes]);

  const handleSave = async (title: string, content: unknown, isAutoSave = false) => {
    if (!isAutoSave) setIsSaving(true);

    const now = new Date().toISOString();
    const currentId = editingNote?.id;
    const isUnsyncedDraft = currentId?.startsWith('local-') ?? false;
    const isNew = !currentId || isUnsyncedDraft;
    const localNoteId = currentId || `local-${Date.now()}`;
    const localNote: LocalNote = {
      id: localNoteId,
      userId: editingNote?.userId || 'current',
      title,
      content,
      category: editingNote?.category || NoteCategory.GENERAL,
      metadata: editingNote?.metadata || {},
      createdAt: editingNote?.createdAt?.toString() || now,
      updatedAt: now,
      syncStatus: 'PENDING',
    };

    await putLocalNote(localNote);

    try {
      if (navigator.onLine) {
        const res = await fetch(isNew ? '/api/notes' : `/api/notes/${currentId}`, {
          method: isNew ? 'POST' : 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            content,
            category: localNote.category,
            metadata: localNote.metadata,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || `Save failed with status ${res.status}`);
        }

        if (isNew && localNoteId !== data.id) {
          await db.notes.delete(localNoteId);
        }

        await putLocalNote(toLocalNote(data, 'SYNCED'));

        if (!isAutoSave) {
          toast.success(isNew ? "Note created!" : "Note updated!");
          setView('LIST');
          setEditingNote(null);
        } else {
          setEditingNote((previousNote) => (
            previousNote
              ? {
                  ...previousNote,
                  id: data.id,
                  userId: data.userId ?? previousNote.userId,
                  category: data.category ?? previousNote.category,
                  metadata: data.metadata ?? previousNote.metadata,
                  createdAt: data.createdAt ?? previousNote.createdAt,
                  updatedAt: data.updatedAt ?? previousNote.updatedAt,
                }
              : data
          ));
        }
        return;
      }
    } catch (error) {
      console.warn('Falling back to local note state', error);
    } finally {
      if (!isAutoSave) {
        setIsSaving(false);
      }
    }

    if (isNew) {
      setEditingNote(localNote);
    }

    if (!isAutoSave) {
      toast.info("Working offline. Note saved locally.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      if (id.startsWith('local-')) {
        await db.notes.delete(id);
        toast.success("Note deleted");
        return;
      }

      if (navigator.onLine) {
        const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
        if (!res.ok && res.status !== 404) {
          throw new Error(`Delete failed with status ${res.status}`);
        }
        await db.notes.delete(id);
        toast.success("Note deleted");
        return;
      }

      await db.notes.update(id, {
        syncStatus: 'DELETED',
        updatedAt: new Date().toISOString(),
      });
      toast.info("Delete queued until you're back online.");
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleManualSync = useCallback(async () => {
    if (!navigator.onLine) {
      toast.info("You're offline. Sync will run when you're back online.");
      return;
    }

    setIsSyncingNotes(true);
    try {
      const remoteNotes = await fetch('/api/notes').then(async (response) => {
        if (!response.ok) {
          throw new Error(`Fetch failed with status ${response.status}`);
        }
        return response.json();
      });
      const remoteById = new Map<string, Note>(
        (Array.isArray(remoteNotes) ? remoteNotes : []).map((note: Note) => [note.id, note])
      );
      const localEntries = await db.notes.toArray();

      for (const note of localEntries) {
        if (note.syncStatus === 'DELETED') {
          if (!note.id.startsWith('local-') && remoteById.has(note.id)) {
            const res = await fetch(`/api/notes/${note.id}`, { method: 'DELETE' });
            if (!res.ok && res.status !== 404) {
              throw new Error(`Delete failed with status ${res.status}`);
            }
          }
          await db.notes.delete(note.id);
          continue;
        }

        const remoteNote = remoteById.get(note.id);
        const shouldCreate = note.id.startsWith('local-') || !remoteNote;
        const shouldUpdate =
          !shouldCreate &&
          (
            note.syncStatus === 'PENDING' ||
            new Date(String(note.updatedAt)).getTime() > new Date(String(remoteNote.updatedAt)).getTime()
          );

        if (shouldCreate) {
          const res = await fetch('/api/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: note.title,
              content: note.content,
              category: note.category,
              metadata: note.metadata,
            }),
          });

          const data = await res.json();
          if (!res.ok) {
            throw new Error(data?.error || `Create failed with status ${res.status}`);
          }

          if (note.id !== data.id) {
            await db.notes.delete(note.id);
          }

          await putLocalNote(toLocalNote(data, 'SYNCED'));
          continue;
        }

        if (shouldUpdate) {
          const res = await fetch(`/api/notes/${note.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: note.title,
              content: note.content,
              category: note.category,
              metadata: note.metadata,
            }),
          });

          const data = await res.json();
          if (!res.ok) {
            throw new Error(data?.error || `Update failed with status ${res.status}`);
          }

          await putLocalNote(toLocalNote(data, 'SYNCED'));
        }
      }

      await syncPendingNotes();
      await fetchNotes();
      toast.success("Notes synced with server.");
    } catch (error) {
      console.error("Manual notes sync failed", error);
      toast.error("Notes sync failed.");
    } finally {
      setIsSyncingNotes(false);
    }
  }, [fetchNotes, syncPendingNotes, putLocalNote]);

  const filteredNotes = useMemo(() => {
    if (!Array.isArray(localNotes)) return [];

    return localNotes.filter((note) => (
      isVisibleNote(note, activeCategory) && matchesNoteSearch(note, search)
    ));
  }, [activeCategory, localNotes, search]);

  return (
    <div className={view === 'EDITOR' ? 'h-full w-full flex flex-col overflow-hidden bg-obsidian' : 'p-6 md:p-10 w-full mx-auto h-full flex flex-col overflow-y-auto custom-scrollbar bg-obsidian'}>
      <AnimatePresence mode="wait">
        {view === 'LIST' ? (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col"
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter flex items-center gap-4">
                  <div className="p-4 bg-slate-800 text-sky-focus rounded-[1.5rem] border border-slate-700 shadow-xl">
                    <BookOpen size={28} />
                  </div>
                  Archive
                </h1>
                <div className="flex items-center gap-4 mt-4 ml-1">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                    {filteredNotes.length} RECORDED THOUGHTS
                  </p>
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest ${isOnline ? 'bg-mint/10 border-mint/20 text-mint' : 'bg-amber/10 border-amber/20 text-amber'}`}>
                    {isOnline ? <Wifi size={10} /> : <WifiOff size={10} />}
                    {isOnline ? 'Neural Link Active' : 'Offline Buffer'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-focus transition-colors" size={18} />
                  <input
                    type="text"
                    placeholder="Search neural archive..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-12 pr-6 py-4 bg-obsidian border border-slate-800 rounded-2xl text-sm text-white focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-focus/50 transition-all w-64 shadow-sm"
                  />
                </div>
                <button
                  onClick={() => void handleManualSync()}
                  disabled={isSyncingNotes}
                  className="flex items-center gap-3 px-6 py-4 bg-slate-800 text-slate-400 border border-slate-700 rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest hover:text-white transition-all shadow-sm active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw size={16} className={isSyncingNotes ? 'animate-spin' : ''} />
                  {isSyncingNotes ? 'Syncing...' : 'Sync'}
                </button>
                <button
                  onClick={() => {
                    setEditingNote(null);
                    setView('EDITOR');
                  }}
                  className="flex items-center gap-3 px-8 py-4 bg-sky-focus text-obsidian rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all shadow-lg shadow-sky-500/20 active:scale-95"
                >
                  <Plus size={16} />
                  Initialize
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-10 overflow-x-auto no-scrollbar pb-2">
              {['ALL', 'YOUTUBE', 'COURSE', 'PROJECT', 'GENERAL'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                    activeCategory === cat
                      ? 'bg-sky-focus border-sky-focus text-obsidian shadow-lg shadow-sky-500/20'
                      : 'bg-slate-800 text-slate-500 border-slate-700 hover:border-slate-600 hover:text-slate-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex-1">
              {loading && (!localNotes || localNotes.length === 0) ? (
                <div className="h-full flex items-center justify-center min-h-[400px]">
                  <Loader2 className="animate-spin text-sky-focus" size={40} />
                </div>
              ) : filteredNotes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onClick={() => {
                        setEditingNote(note);
                        setView('EDITOR');
                      }}
                      onDelete={() => handleDelete(note.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-20 bg-slate-800/10 border border-dashed border-slate-800 rounded-[3rem]">
                  <div className="p-6 bg-slate-800 rounded-full text-slate-700 mb-6">
                    <StickyNote size={48} />
                  </div>
                  <h3 className="text-xl font-black text-slate-500 uppercase tracking-tight mb-2">No neural data found</h3>
                  <button onClick={() => setView('EDITOR')} className="text-sky-focus font-black text-[10px] uppercase tracking-widest hover:underline">
                    Initialize note →
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <Suspense fallback={<div className="h-full w-full flex items-center justify-center bg-obsidian"><Loader2 className="animate-spin text-sky-focus" size={28} /></div>}>
            <LazyNoteEditor
              key="editor"
              initialTitle={editingNote?.title || ""}
              initialContent={editingNote?.content || ""}
              isSaving={isSaving}
              isSyncing={isSyncingNotes}
              onSync={handleManualSync}
              onSave={handleSave}
              onBack={() => {
                setView('LIST');
                setEditingNote(null);
              }}
            />
          </Suspense>
        )}
      </AnimatePresence>
    </div>
  );
}
