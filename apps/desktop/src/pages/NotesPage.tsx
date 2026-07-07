import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import {
  Plus, Search, Trash2, 
  Loader2, Youtube, 
  Briefcase, GraduationCap, StickyNote,
  Calendar, BookOpen, PenLine, Target,
  Wifi, WifiOff, RefreshCw, LayoutGrid, List as ListIcon,
  AlignLeft, ArrowUpDown, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Note, NoteCategory } from "@gritorquit/notes-ui-web";
import { invoke } from "@tauri-apps/api/core";
import { api } from '../services/api';
import { clearQueuedCentralNoteSaves, getDb, queueAction } from '../lib/db';
import { SyncEngine } from '../services/sync.engine';
import { useNotes } from '../features/notes/hooks/useNotes';
import { useQueryClient } from '@tanstack/react-query';

// --- COMPONENTS ---
const LazyNoteEditor = lazy(() =>
  import("@gritorquit/notes-ui-web").then((mod) => ({ default: mod.NoteEditor }))
);

type SortOption = 'MODIFIED' | 'CREATED' | 'ALPHA';
type DisplayMode = 'GRID' | 'LIST' | 'COMPACT';

const NoteCard = React.memo(({ note, onClick, onDelete }: { note: Note, onClick: () => void, onDelete: () => void }) => {
  const getIcon = () => {
    switch (note.category) {
      case NoteCategory.YOUTUBE: return <Youtube size={16} className="text-[var(--accent-color)]" />;
      case NoteCategory.PROJECT: return <Briefcase size={16} className="text-[var(--accent-color)]" />;
      case NoteCategory.COURSE: return <GraduationCap size={16} className="text-[var(--accent-color)]" />;
      default: return <StickyNote size={16} className="text-[var(--accent-color)]" />;
    }
  };

  const sourceTitle = note.metadata?.sourceTitle || note.metadata?.trackTitle;
  const isOfflinePending = (note as any).syncStatus === 'PENDING';

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative bg-[var(--bg-card)]/40 border border-[var(--border-color)] rounded-[2rem] p-6 hover:bg-[var(--bg-card)]/80 transition-all cursor-pointer flex flex-col h-full min-h-[200px]"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)]`}>
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
          <span className="text-[9px] font-bold text-[var(--text-secondary)] truncate uppercase tracking-widest text-left">
            {sourceTitle}
          </span>
        </div>
      )}
      
      <div className="flex items-center gap-3 mt-auto pt-4 border-t border-[var(--border-color)]/50">
        <div className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-1 text-left">
          <Clock size={10} />
          {new Date(note.updatedAt).toLocaleDateString()}
        </div>
        <div className="ml-auto">
            <span className={`text-[8px] font-black uppercase tracking-widest ${isOfflinePending ? 'text-amber-500' : 'text-[var(--text-secondary)] opacity-40'} text-right`}>
                {isOfflinePending ? 'Sync Pending' : note.category}
            </span>
        </div>
      </div>
    </motion.div>
  );
});

const NoteCompactItem = ({ note, onClick, onDelete }: { note: Note, onClick: () => void, onDelete: () => void }) => (
    <motion.div 
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClick}
        className="group flex items-center gap-4 py-3 border-b border-[var(--border-color)]/30 hover:bg-[var(--bg-secondary)]/50 transition-all cursor-pointer px-2"
    >
        <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color)]" />
        <span className="flex-1 text-sm font-bold text-[var(--text-primary)] uppercase italic tracking-tighter truncate text-left">
            {note.title || "Untitled Note"}
        </span>
        <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] opacity-30 group-hover:opacity-100 transition-opacity text-right">
            {new Date(note.updatedAt).toLocaleDateString()} // {note.category}
        </span>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-500">
            <Trash2 size={12} />
        </button>
    </motion.div>
);

const NoteListItem = React.memo(({ note, onClick, onDelete }: { note: Note, onClick: () => void, onDelete: () => void }) => (
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

      <div className="flex-1 min-w-0 text-left">
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
));

export default function NotesPage() {
  const [view, setView] = useState<'LIST' | 'EDITOR'>('LIST');
  const [displayMode, setDisplayMode] = useState<DisplayMode>(() => (localStorage.getItem('desktop_notes_display_mode') as any) || 'GRID');
  const [sortBy, setSortBy] = useState<SortOption>(() => (localStorage.getItem('desktop_notes_sort_by') as any) || 'MODIFIED');
  
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const { data: notes = [], isLoading, refetch } = useNotes(activeCategory);
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  const handleDisplayModeChange = (mode: DisplayMode) => {
    setDisplayMode(mode);
    localStorage.setItem('desktop_notes_display_mode', mode);
  };

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
    localStorage.setItem('desktop_notes_sort_by', sort);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await SyncEngine.syncNotes();
      await refetch();
      toast.success("Desktop neural cache synchronized.");
    } catch (e) {
      toast.error("Sync protocol failed.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Purge this neural record permanently?")) return;
    try {
      await api.delete(`/api/notes/${id}`);
      await refetch();
      toast.success("Record purged.");
    } catch (e) {
      toast.error("Purge failed.");
    }
  };

  const handleSave = async (title: string, content: string) => {
    setIsSaving(true);
    try {
      const payload = {
        title,
        content,
        category: activeCategory === 'ALL' ? 'GENERAL' : activeCategory,
        metadata: editingNote?.metadata
      };

      if (editingNote) {
        await api.patch(`/api/notes/${editingNote.id}`, payload);
      } else {
        await api.post('/api/notes', payload);
      }
      
      await refetch();
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
    let result = notes.filter(n => {
        const catMatch = activeCategory === 'ALL' || n.category === activeCategory || 
                        (activeCategory === 'STUDY' && n.category === NoteCategory.COURSE) ||
                        (activeCategory === 'MEDIA' && n.category === NoteCategory.YOUTUBE);
        const searchMatch = !search || n.title?.toLowerCase().includes(search.toLowerCase()) || n.content?.toLowerCase().includes(search.toLowerCase());
        return catMatch && searchMatch;
    });

    result.sort((a, b) => {
        if (sortBy === 'ALPHA') return (a.title || '').localeCompare(b.title || '');
        const dateA = new Date(sortBy === 'CREATED' ? a.createdAt : a.updatedAt).getTime();
        const dateB = new Date(sortBy === 'CREATED' ? b.createdAt : b.updatedAt).getTime();
        return dateB - dateA;
    });

    return result;
  }, [notes, activeCategory, search, sortBy]);

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
            {/* Header Protocol */}
            <div className="p-8 md:p-12 pb-0">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 mb-10">
                    <div className="text-left">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-[var(--accent-color)] text-[var(--bg-primary)] rounded-2xl shadow-2xl shadow-[var(--accent-color)]/20">
                                <BookOpen size={24} />
                            </div>
                            <h1 className="text-4xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter">Archive</h1>
                        </div>
                        <div className="flex items-center gap-3 ml-1">
                            <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.4em] opacity-40">Desktop Kernel v4.2</span>
                            <div className={`px-2 py-0.5 rounded-full border text-[7px] font-black uppercase tracking-widest ${isOnline ? 'border-emerald-500/20 text-emerald-500' : 'border-amber-500/20 text-amber-500'}`}>
                                {isOnline ? 'NETWORK ACTIVE' : 'LOCAL BUFFER'}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-3">
                        <div className="relative group w-full md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] opacity-40 group-focus-within:opacity-100 transition-opacity" size={16} />
                            <input 
                                type="text" 
                                placeholder="SCAN NEURAL DATA..." 
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
                            className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] italic hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/10"
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
                            disabled={isSyncing}
                            className="flex items-center gap-2 text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest hover:text-[var(--accent-color)] transition-colors"
                        >
                            <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
                            SYNC CACHE
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

            {/* Main Streaming Window */}
            <div className="flex-1 overflow-y-auto p-8 md:p-12 pt-4 custom-scrollbar">
                {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                        <Loader2 className="animate-spin text-[var(--accent-color)]" size={32} />
                    </div>
                ) : groupedNotes.length > 0 ? (
                    <div className="max-w-[1800px] mx-auto">
                        {groupedNotes.map(group => (
                            <div key={group.title} className="mb-12">
                                <div className="flex items-center gap-4 mb-8 sticky top-0 bg-[var(--bg-primary)] py-4 z-10 text-left">
                                    <span className="text-[11px] font-black text-[var(--accent-color)] uppercase tracking-[0.4em] italic whitespace-nowrap">{group.title}</span>
                                    <div className="flex-1 h-[1px] bg-[var(--border-color)] opacity-20" />
                                    <span className="text-[9px] font-bold text-[var(--text-secondary)] opacity-30 uppercase tracking-widest">{group.notes.length} RECORDS</span>
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
                        <h3 className="text-xl font-black uppercase tracking-tight mb-2">Registry Buffer Empty</h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-center">Adjust filters or initialize a new record</p>
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
              onBack={() => {
                setView('LIST');
                setEditingNote(null);
              }}
              onSave={handleSave}
            />
          </Suspense>
        )}
      </AnimatePresence>
    </div>
  );
}
