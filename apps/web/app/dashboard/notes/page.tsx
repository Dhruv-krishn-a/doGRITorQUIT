"use client";

import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import {
  Plus, Search, Trash2,
  Loader2, Youtube,
  Briefcase, GraduationCap, StickyNote,
  Calendar, BookOpen, PenLine, Target,
  Wifi, WifiOff, RefreshCw, LayoutGrid, List as ListIcon
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
      case NoteCategory.YOUTUBE: return <Youtube size={16} className="text-[var(--accent-color)]" />;
      case NoteCategory.PROJECT: return <Briefcase size={16} className="text-[var(--accent-color)]" />;
      case NoteCategory.COURSE: return <GraduationCap size={16} className="text-[var(--accent-color)]" />;
      default: return <StickyNote size={16} className="text-[var(--accent-color)]" />;
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
      className="group relative bg-[var(--bg-card)]/40 border border-[var(--border-color)] rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl hover:shadow-[var(--accent-color)]/5 transition-all cursor-pointer flex flex-col h-full min-h-[220px]"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] group-hover:border-[var(--accent-color)]/30 transition-colors">
          {getIcon()}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-2 text-[var(--text-secondary)] hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <h3 className="text-lg font-black text-[var(--text-primary)] italic uppercase tracking-tight mb-2 line-clamp-2 group-hover:text-[var(--accent-color)] transition-colors leading-tight">
        {note.title || "Untitled Note"}
      </h3>

      {sourceTitle && (
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1 bg-[var(--bg-primary)] rounded text-[var(--text-secondary)] border border-[var(--border-color)]">
            <Target size={10} />
          </div>
          <span className="text-[10px] font-bold text-[var(--text-secondary)] truncate uppercase tracking-widest">
            {sourceTitle}
          </span>
        </div>
      )}

      <div className="flex items-center gap-3 mt-auto pt-4 border-t border-[var(--border-color)]">
        <div className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-1">
          <Calendar size={10} />
          {new Date(note.updatedAt).toLocaleDateString()}
        </div>
        <div className="w-1 h-1 rounded-full bg-[var(--border-color)]" />
        <div className={`text-[9px] font-bold uppercase tracking-widest ${isPending ? 'text-amber-500' : 'text-[var(--text-secondary)]'}`}>
          {isPending ? 'Syncing...' : note.category}
        </div>
      </div>
    </motion.div>
  );
};

const NoteListItem = ({ note, onClick, onDelete }: { note: Note | LocalNote, onClick: () => void, onDelete: () => void }) => {
  const getIcon = () => {
    switch (note.category) {
      case NoteCategory.YOUTUBE: return <Youtube size={14} className="text-[var(--accent-color)]" />;
      case NoteCategory.PROJECT: return <Briefcase size={14} className="text-[var(--accent-color)]" />;
      case NoteCategory.COURSE: return <GraduationCap size={14} className="text-[var(--accent-color)]" />;
      default: return <StickyNote size={14} className="text-[var(--accent-color)]" />;
    }
  };

  const sourceTitle = note.metadata?.sourceTitle || note.metadata?.trackTitle;
  const isPending = (note as LocalNote).syncStatus === 'PENDING';

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={onClick}
      className="group flex items-center gap-6 p-4 bg-[var(--bg-card)]/30 hover:bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl transition-all cursor-pointer select-none shadow-sm hover:shadow-lg"
    >
      <div className="p-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] group-hover:border-[var(--accent-color)]/30 transition-colors shrink-0">
        {getIcon()}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-tight truncate group-hover:text-[var(--accent-color)] transition-colors">
          {note.title || "Untitled Note"}
        </h3>
        {sourceTitle && (
          <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest truncate mt-0.5 opacity-60">
            {sourceTitle}
          </p>
        )}
      </div>

      <div className="hidden md:flex flex-col items-end gap-1 px-4 border-l border-[var(--border-color)]/50 min-w-[120px]">
        <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${isPending ? 'text-amber-500' : 'text-[var(--text-secondary)]'}`}>
          {note.category}
        </span>
        <span className="text-[8px] font-bold text-[var(--text-secondary)] opacity-40 uppercase tracking-widest">
          {new Date(note.updatedAt).toLocaleDateString()}
        </span>
      </div>

      <button 
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="p-2 text-[var(--text-secondary)] hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
      >
        <Trash2 size={16} />
      </button>
    </motion.div>
  );
};

export default function NotesPage() {
  const [view, setView] = useState<'LIST' | 'EDITOR'>('LIST');
  const [displayMode, setDisplayMode] = useState<'GRID' | 'LIST'>(() => (typeof window !== 'undefined' ? (localStorage.getItem('notes_display_mode') as any) || 'GRID' : 'GRID'));
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
    <div className={view === 'EDITOR' ? 'h-full w-full flex flex-col overflow-hidden bg-[var(--bg-primary)]' : 'p-6 md:p-10 w-full mx-auto h-full flex flex-col overflow-y-auto custom-scrollbar bg-[var(--bg-primary)]'}>
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
                <h1 className="text-4xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter flex items-center gap-4">
                  <div className="p-4 bg-[var(--bg-secondary)] text-[var(--accent-color)] rounded-[1.5rem] border border-[var(--border-color)] shadow-xl">
                    <BookOpen size={28} />
                  </div>
                  Archive
                </h1>
                <div className="flex items-center gap-4 mt-4 ml-1">
                  <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em]">
                    {filteredNotes.length} RECORDED THOUGHTS
                  </p>
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest ${isOnline ? 'bg-mint/10 border-mint/20 text-mint' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'}`}>
                    {isOnline ? <Wifi size={10} /> : <WifiOff size={10} />}
                    {isOnline ? 'Smart Link Active' : 'Offline Buffer'}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 w-full">
                <div className="flex items-center gap-2 w-full">
                  <div className="relative group flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-[var(--accent-color)] transition-colors" size={18} />
                    <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-12 pr-6 py-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl text-sm text-[var(--text-primary)] focus:outline-none focus:ring-4 focus:ring-[var(--accent-color)]/10 focus:border-[var(--accent-color)]/50 transition-all w-full shadow-sm" />
                  </div>
                  
                  {/* View Switcher */}
                  <div className="flex bg-[var(--bg-secondary)] border border-[var(--border-color)] p-1 rounded-2xl shadow-inner shrink-0">
                    <button 
                      onClick={() => { setDisplayMode('GRID'); localStorage.setItem('notes_display_mode', 'GRID'); }}
                      className={`p-3 rounded-xl transition-all ${displayMode === 'GRID' ? 'bg-[var(--bg-primary)] text-[var(--accent-color)] shadow-md' : 'text-[var(--text-secondary)]'}`}
                      title="Grid View"
                    >
                      <LayoutGrid size={18} />
                    </button>
                    <button 
                      onClick={() => { setDisplayMode('LIST'); localStorage.setItem('notes_display_mode', 'LIST'); }}
                      className={`p-3 rounded-xl transition-all ${displayMode === 'LIST' ? 'bg-[var(--bg-primary)] text-[var(--accent-color)] shadow-md' : 'text-[var(--text-secondary)]'}`}
                      title="List View"
                    >
                      <ListIcon size={18} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full">
                  <button
                    onClick={() => void handleManualSync()}
                    disabled={isSyncingNotes}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-4 bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)] rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest hover:text-[var(--text-primary)] transition-all shadow-sm active:scale-95 disabled:opacity-50"
                  >
                    <RefreshCw size={14} className={isSyncingNotes ? 'animate-spin' : ''} />
                    <span>Sync</span>
                  </button>
                  <button onClick={() => { setEditingNote(null); setView('EDITOR'); }} className="flex-[2] flex items-center justify-center gap-2 px-6 py-4 bg-[var(--accent-color)] text-[var(--bg-primary)] rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-[var(--accent-color)]/20 active:scale-95">
                    <Plus size={16} /> 
                    <span>Initialize</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-10 overflow-x-auto no-scrollbar pb-2">
              {['ALL', 'YOUTUBE', 'COURSE', 'PROJECT', 'GENERAL'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                    activeCategory === cat
                      ? 'bg-[var(--accent-color)] border-[var(--accent-color)] text-[var(--bg-primary)] shadow-lg shadow-[var(--accent-color)]/20'
                      : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)]'
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
                displayMode === 'GRID' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {filteredNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        onClick={() => {
                          setEditingNote(note as Note);
                          setView('EDITOR');
                        }}
                        onDelete={() => handleDelete(note.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {filteredNotes.map((note) => (
                      <NoteListItem
                        key={note.id}
                        note={note}
                        onClick={() => {
                          setEditingNote(note as Note);
                          setView('EDITOR');
                        }}
                        onDelete={() => handleDelete(note.id)}
                      />
                    ))}
                  </div>
                )
              ) : (

                <div className="h-full flex flex-col items-center justify-center text-center p-20 bg-[var(--bg-secondary)]/30 border border-dashed border-[var(--border-color)] rounded-[3rem]">
                  <div className="p-6 bg-[var(--bg-secondary)] rounded-full text-[var(--text-secondary)] mb-6">
                    <StickyNote size={48} />
                  </div>
                  <h3 className="text-xl font-black text-[var(--text-secondary)] uppercase tracking-tight mb-2">No neural data found</h3>
                  <button onClick={() => setView('EDITOR')} className="text-[var(--accent-color)] font-black text-[10px] uppercase tracking-widest hover:underline">
                    Initialize note →
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <Suspense fallback={<div className="h-full w-full flex items-center justify-center bg-[var(--bg-primary)]"><Loader2 className="animate-spin text-[var(--accent-color)]" size={28} /></div>}>
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
