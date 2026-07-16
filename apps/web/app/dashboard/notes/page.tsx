"use client";

import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import {
  Plus, Search, Trash2,
  Loader2, Youtube,
  Briefcase, GraduationCap, StickyNote,
  Calendar, BookOpen, PenLine, Target,
  Wifi, WifiOff, RefreshCw, LayoutGrid, List as ListIcon,
  AlignLeft, ArrowUpDown, ChevronRight, Clock, Clock3
  } from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { api } from '../../../utils/api';
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

type SortOption = 'MODIFIED' | 'CREATED' | 'ALPHA';
type DisplayMode = 'GRID' | 'LIST' | 'COMPACT';

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
      className="group relative bg-[var(--bg-card)]/40 border border-[var(--border-color)] rounded-[2rem] p-6 hover:bg-[var(--bg-card)]/80 transition-all cursor-pointer flex flex-col h-full min-h-[200px]"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
          {getIcon()}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-2 text-[var(--text-secondary)] hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <h3 className="text-lg font-black text-[var(--text-primary)] italic uppercase tracking-tight mb-2 line-clamp-2 leading-tight">
        {note.title || "Untitled Note"}
      </h3>

      {sourceTitle && (
        <div className="flex items-center gap-2 mb-4 opacity-60">
          <Target size={10} className="text-[var(--accent-color)]" />
          <span className="text-[9px] font-bold text-[var(--text-secondary)] truncate uppercase tracking-widest">
            {sourceTitle}
          </span>
        </div>
      )}

      <div className="flex items-center gap-3 mt-auto pt-4 border-t border-[var(--border-color)]/50">
        <div className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-1">
          <Clock size={10} />
          {new Date(note.updatedAt).toLocaleDateString()}
        </div>
        <div className="ml-auto flex items-center gap-2">
            <span className={`text-[8px] font-black uppercase tracking-widest ${isPending ? 'text-amber-500' : 'text-[var(--text-secondary)] opacity-40'}`}>
                {note.category}
            </span>
        </div>
      </div>
    </motion.div>
  );
};

const NoteCompactItem = ({ note, onClick, onDelete }: { note: Note | LocalNote, onClick: () => void, onDelete: () => void }) => (
    <motion.div 
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClick}
        className="group flex items-center gap-4 py-3 border-b border-[var(--border-color)]/30 hover:bg-[var(--bg-secondary)]/50 transition-all cursor-pointer px-2"
    >
        <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color)]" />
        <span className="flex-1 text-sm font-bold text-[var(--text-primary)] uppercase italic tracking-tighter truncate">
            {note.title || "Untitled Note"}
        </span>
        <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] opacity-30 group-hover:opacity-100 transition-opacity">
            {new Date(note.updatedAt).toLocaleDateString()} // {note.category}
        </span>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-500">
            <Trash2 size={12} />
        </button>
    </motion.div>
);

const NoteListItem = ({ note, onClick, onDelete }: { note: Note | LocalNote, onClick: () => void, onDelete: () => void }) => (
    <motion.div 
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={onClick}
      className="group flex items-center gap-6 p-5 bg-[var(--bg-card)]/30 hover:bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl transition-all cursor-pointer select-none"
    >
      <div className="p-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] shrink-0">
        <StickyNote size={14} className="text-[var(--accent-color)]" />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-base font-black text-[var(--text-primary)] uppercase tracking-tight truncate">
          {note.title || "Untitled Note"}
        </h3>
        <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest opacity-40">
           LAST MODIFIED {new Date(note.updatedAt).toLocaleString()} // {note.category}
        </p>
      </div>

      <button 
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="p-2 text-[var(--text-secondary)] hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
      >
        <Trash2 size={16} />
      </button>
    </motion.div>
);

export default function NotesPage() {
  const [view, setView] = useState<'LIST' | 'EDITOR'>('LIST');
  const [displayMode, setDisplayMode] = useState<DisplayMode>(() => (typeof window !== 'undefined' ? (localStorage.getItem('notes_display_mode') as any) || 'GRID' : 'GRID'));
  const [sortBy, setSortBy] = useState<SortOption>(() => (typeof window !== 'undefined' ? (localStorage.getItem('notes_sort_by') as any) || 'MODIFIED' : 'MODIFIED'));
  
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncingNotes, setIsSyncingNotes] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  const localNotes = useLiveQuery(() => db.notes.toArray(), []);

  useEffect(() => {
    if (localNotes) setLoading(false);
  }, [localNotes]);

  // We will move this down

  const handleDisplayModeChange = (mode: DisplayMode) => {
    setDisplayMode(mode);
    localStorage.setItem('notes_display_mode', mode);
  };

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
    localStorage.setItem('notes_sort_by', sort);
  };

  const putLocalNote = useCallback(async (note: LocalNote) => {
    await db.notes.put(note);
  }, []);

  const fetchNotes = useCallback(async () => {
    if (!navigator.onLine) {
        console.log("fetchNotes: offline");
        return;
    }
    try {
      console.log("fetchNotes: calling API...");
      const res = await api.get('/api/notes');
      console.log("fetchNotes: API returned", res);
      
      if (!Array.isArray(res)) {
          console.error("fetchNotes: API response is not an array!", res);
          return;
      }
      
      const localEntries = await db.notes.toArray();
      const localMap = new Map(localEntries.map(n => [n.id, n]));
      
      let syncedCount = 0;
      for (const remote of res) {
        const local = localMap.get(remote.id);
        if (!local || new Date(remote.updatedAt).getTime() > new Date(local.updatedAt).getTime()) {
          await putLocalNote(toLocalNote(remote));
          syncedCount++;
        }
      }
      console.log(`fetchNotes: Synced ${syncedCount} new/updated notes to IndexedDB.`);
    } catch (e) {
      console.error("Fetch failed", e);
    }
  }, [putLocalNote]);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    
    // Auto-sync on mount
    if (navigator.onLine) {
        fetchNotes().catch(console.error);
    }
    
    return () => {
        window.removeEventListener('online', handleStatus);
        window.removeEventListener('offline', handleStatus);
    };
  }, [fetchNotes]);

  const syncPendingNotes = useCallback(async () => {
    if (!navigator.onLine) return;
    const pending = await db.notes.where('syncStatus').equals('PENDING').toArray();
    for (const note of pending) {
      const isNew = note.id.startsWith('local-');
      try {
        const payload = {
          title: note.title,
          content: note.content,
          category: note.category,
          metadata: note.metadata,
        };
        const res = isNew 
            ? await api.post('/api/notes', payload)
            : await api.patch(`/api/notes/${note.id}`, payload);
        
        if (isNew) await db.notes.delete(note.id);
        await putLocalNote(toLocalNote(res, 'SYNCED'));
      } catch (e) { console.error(e); }
    }
  }, [putLocalNote]);

  const handleManualSync = async () => {
    setIsSyncingNotes(true);
    await syncPendingNotes();
    await fetchNotes();
    setIsSyncingNotes(false);
    toast.success("Neural link synchronized.");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Confirm permanent deletion of this neural record?")) return;
    try {
        if (!id.startsWith('local-')) {
            await api.delete(`/api/notes/${id}`);
        }
        await db.notes.delete(id);
        toast.success("Record purged.");
    } catch (e) { toast.error("Purge failed."); }
  };

  const handleSave = async (title: string, content: string) => {
    setIsSaving(true);
    try {
      const noteToSave = editingNote 
        ? { ...editingNote, title, content, updatedAt: new Date().toISOString() }
        : { 
            id: `local-${Date.now()}`, 
            title, 
            content, 
            category: activeCategory === 'ALL' ? 'GENERAL' : activeCategory,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

      await putLocalNote(toLocalNote(noteToSave as any, 'PENDING'));
      if (navigator.onLine) await syncPendingNotes();
      setView('LIST');
      setEditingNote(null);
      toast.success("Neural pattern saved.");
    } catch (e) {
      toast.error("Save protocol failed.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredNotes = useMemo(() => {
    if (!Array.isArray(localNotes)) return [];
    let result = localNotes.filter(n => isVisibleNote(n, activeCategory) && matchesNoteSearch(n, search));
    
    result.sort((a, b) => {
        if (sortBy === 'ALPHA') return (a.title || '').localeCompare(b.title || '');
        const dateA = new Date(sortBy === 'CREATED' ? a.createdAt : a.updatedAt).getTime();
        const dateB = new Date(sortBy === 'CREATED' ? b.createdAt : b.updatedAt).getTime();
        return dateB - dateA;
    });

    return result;
  }, [activeCategory, localNotes, search, sortBy]);

  const groupedNotes = useMemo(() => {
    if (sortBy === 'ALPHA') return [{ title: 'Neural Directory', notes: filteredNotes }];
    
    const today = new Date(); today.setHours(0,0,0,0);
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const thisWeek = new Date(today); thisWeek.setDate(today.getDate() - 7);

    const groups: { [key: string]: any[] } = {
        '01 // TODAY': [],
        '02 // YESTERDAY': [],
        '03 // THIS WEEK': [],
        '04 // ARCHIVE': []
    };

    filteredNotes.forEach(n => {
        const d = new Date(sortBy === 'CREATED' ? n.createdAt : n.updatedAt);
        if (d >= today) groups['01 // TODAY'].push(n);
        else if (d >= yesterday) groups['02 // YESTERDAY'].push(n);
        else if (d >= thisWeek) groups['03 // THIS WEEK'].push(n);
        else groups['04 // ARCHIVE'].push(n);
    });

    return Object.entries(groups)
        .filter(([_, ns]) => ns.length > 0)
        .map(([title, ns]) => ({ title, notes: ns }));
  }, [filteredNotes, sortBy]);

  return (
    <div className="h-full w-full flex flex-col bg-[var(--bg-primary)] overflow-hidden">
      <AnimatePresence mode="wait">
        {view === 'LIST' ? (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col h-full overflow-hidden"
          >
            {/* Redesigned Header HUD */}
            <div className="p-8 md:p-12 pb-0">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 mb-10">
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-[var(--accent-color)] text-[var(--bg-primary)] rounded-2xl shadow-2xl shadow-[var(--accent-color)]/20">
                                <BookOpen size={24} />
                            </div>
                            <h1 className="text-4xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter">Archive</h1>
                        </div>
                        <div className="flex items-center gap-3 ml-1">
                            <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.4em] opacity-40">Neural Registry v4.0</span>
                            <div className={`px-2 py-0.5 rounded-full border text-[7px] font-black uppercase tracking-widest ${isOnline ? 'border-emerald-500/20 text-emerald-500' : 'border-amber-500/20 text-amber-500'}`}>
                                {isOnline ? 'LINK ACTIVE' : 'BUFFER MODE'}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-3">
                        <div className="relative group w-full md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] opacity-40 group-focus-within:opacity-100 transition-opacity" size={16} />
                            <input 
                                type="text" 
                                placeholder="SCAN PATTERNS..." 
                                value={search} 
                                onChange={(e) => setSearch(e.target.value)} 
                                className="w-full pl-12 pr-6 py-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl text-[11px] font-black uppercase tracking-widest text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-color)]/50 transition-all" 
                            />
                        </div>

                        <div className="flex bg-[var(--bg-secondary)] border border-[var(--border-color)] p-1 rounded-2xl shrink-0">
                            {(['GRID', 'LIST', 'COMPACT'] as const).map(mode => (
                                <button 
                                    key={mode}
                                    onClick={() => handleDisplayModeChange(mode)}
                                    className={`px-4 py-2.5 rounded-xl transition-all ${displayMode === mode ? 'bg-[var(--bg-primary)] text-[var(--accent-color)] shadow-xl' : 'text-[var(--text-secondary)] opacity-40 hover:opacity-100'}`}
                                >
                                    {mode === 'GRID' ? <LayoutGrid size={16} /> : mode === 'LIST' ? <ListIcon size={16} /> : <AlignLeft size={16} />}
                                </button>
                            ))}
                        </div>

                        <button 
                            onClick={() => { setEditingNote(null); setView('EDITOR'); }}
                            className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] italic hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            <Plus size={18} />
                            INITIALIZE
                        </button>
                    </div>
                </div>

                {/* Shard Navigation */}
                <div className="flex flex-col md:flex-row items-center justify-between border-y border-[var(--border-color)] py-6 gap-6">
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-full">
                        {['ALL', 'PROJECT', 'STUDY', 'MEDIA', 'GENERAL', 'DUMPS'].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat === 'STUDY' ? 'COURSE' : cat === 'MEDIA' ? 'YOUTUBE' : cat)}
                                className={`px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap border ${
                                    (activeCategory === cat || (cat === 'STUDY' && activeCategory === 'COURSE') || (cat === 'MEDIA' && activeCategory === 'YOUTUBE'))
                                    ? 'bg-[var(--accent-color)] border-[var(--accent-color)] text-[var(--bg-primary)]'
                                    : 'bg-transparent text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--text-secondary)]'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                        <button 
                            onClick={handleManualSync}
                            disabled={isSyncingNotes}
                            className="flex items-center gap-2 text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest hover:text-[var(--accent-color)] transition-colors"
                        >
                            <RefreshCw size={12} className={isSyncingNotes ? 'animate-spin' : ''} />
                            SYNC SIGNAL
                        </button>
                        <div className="w-[1px] h-4 bg-[var(--border-color)]" />
                        <button 
                            onClick={() => {
                                const opts: SortOption[] = ['MODIFIED', 'CREATED', 'ALPHA'];
                                handleSortChange(opts[(opts.indexOf(sortBy) + 1) % opts.length]);
                            }}
                            className="flex items-center gap-2 text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest hover:text-[var(--accent-color)] transition-colors"
                        >
                            <ArrowUpDown size={12} />
                            SORT // {sortBy}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Neural Stream */}
            <div className="flex-1 overflow-y-auto p-8 md:p-12 pt-4 custom-scrollbar">
                {loading ? (
                    <div className="h-full flex items-center justify-center">
                        <Loader2 className="animate-spin text-[var(--accent-color)]" size={32} />
                    </div>
                ) : groupedNotes.length > 0 ? (
                    <div className="max-w-[1800px] mx-auto">
                        {groupedNotes.map(group => (
                            <div key={group.title} className="mb-16">
                                <div className="flex items-center gap-6 mb-10 sticky top-0 bg-[var(--bg-primary)]/80 backdrop-blur-md py-6 z-20 border-b border-[var(--border-color)]/10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color)] animate-pulse" />
                                        <span className="text-[12px] font-black text-[var(--text-primary)] uppercase tracking-[0.5em] italic whitespace-nowrap">{group.title}</span>
                                    </div>
                                    <div className="flex-1 h-[1px] bg-gradient-to-r from-[var(--border-color)] to-transparent opacity-20" />
                                    <div className="flex items-center gap-4">
                                        <span className="text-[9px] font-black text-[var(--text-secondary)] opacity-30 uppercase tracking-widest">{group.notes.length} UNIT(S) RECORDED</span>
                                        <ChevronRight size={12} className="text-[var(--text-secondary)] opacity-20" />
                                    </div>
                                </div>

                                {displayMode === 'GRID' && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-6">
                                        {group.notes.map(n => (
                                            <NoteCard key={n.id} note={n} onClick={() => { setEditingNote(n); setView('EDITOR'); }} onDelete={() => handleDelete(n.id)} />
                                        ))}
                                    </div>
                                )}

                                {displayMode === 'LIST' && (
                                    <div className="flex flex-col gap-3">
                                        {group.notes.map(n => (
                                            <NoteListItem key={n.id} note={n} onClick={() => { setEditingNote(n); setView('EDITOR'); }} onDelete={() => handleDelete(n.id)} />
                                        ))}
                                    </div>
                                )}

                                {displayMode === 'COMPACT' && (
                                    <div className="bg-[var(--bg-card)]/20 border border-[var(--border-color)] rounded-[2rem] p-4">
                                        {group.notes.map(n => (
                                            <NoteCompactItem key={n.id} note={n} onClick={() => { setEditingNote(n); setView('EDITOR'); }} onDelete={() => handleDelete(n.id)} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                        <StickyNote size={64} className="mb-6" />
                        <h3 className="text-xl font-black uppercase tracking-tight mb-2">No neural data synchronized</h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest">Adjust filters or initialize a new record</p>
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
