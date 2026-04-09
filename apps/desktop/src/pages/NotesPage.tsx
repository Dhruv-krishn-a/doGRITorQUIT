import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import {
  Plus, Search, Trash2, 
  Loader2, Youtube, 
  Briefcase, GraduationCap, StickyNote,
  Calendar, BookOpen, PenLine, Target,
  Wifi, WifiOff, RefreshCw
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

const NoteCard = ({ note, onClick, onDelete }: { note: Note, onClick: () => void, onDelete: () => void }) => {
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
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      className="group relative bg-[var(--bg-card)]/40 border border-[var(--border-color)] rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl hover:shadow-[var(--accent-color)]/5 transition-all cursor-pointer flex flex-col h-full min-h-[220px]"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] group-hover:border-[var(--accent-color)]/30 transition-colors`}>
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
        <div className={`text-[9px] font-bold uppercase tracking-widest ${isOfflinePending ? 'text-amber-500' : 'text-[var(--text-secondary)]'}`}>
          {isOfflinePending ? 'Sync Pending' : note.category}
        </div>
      </div>
    </motion.div>
  );
};

// --- MAIN PAGE ---

export default function NotesPage() {
  const [view, setView] = useState<'LIST' | 'EDITOR'>('LIST');
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncingNotes, setIsSyncingNotes] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  const queryClient = useQueryClient();
  const { data: notes = [], isLoading: loading } = useNotes(activeCategory);

  useEffect(() => {
    const handleStatusChange = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  const upsertLocalNote = async (note: any, syncStatus: 'SYNCED' | 'PENDING' | 'DELETED') => {
    const db = await getDb();
    if (db) {
      await db.execute(
        `INSERT OR REPLACE INTO notes (id, title, content, category, metadata, createdAt, updatedAt, syncStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [note.id, note.title, JSON.stringify(note.content), note.category, JSON.stringify(note.metadata || {}), note.createdAt, note.updatedAt, syncStatus]
      );
    }
    try {
      const activeCategory = note.category || 'ALL'; // Fallback logic
      const stored = localStorage.getItem(`notes_backup_${activeCategory}`);
      let notes = stored ? JSON.parse(stored) : [];
      const idx = notes.findIndex((n: any) => n.id === note.id);
      if (idx > -1) notes[idx] = note;
      else notes.unshift(note);
      localStorage.setItem(`notes_backup_${activeCategory}`, JSON.stringify(notes));
    } catch (e) {}
    queryClient.invalidateQueries({ queryKey: ['notes'] });
  };

  const handleManualSync = async () => {
    if (!navigator.onLine) {
      toast.info("You're offline. Sync will run when you're back online.");
      return;
    }
    setIsSyncingNotes(true);
    try {
      await SyncEngine.processQueue();
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    } catch (error) {
      toast.error("Notes sync failed.");
    } finally {
      setIsSyncingNotes(false);
    }
  };

  const handleSave = async (title: string, content: any, isAutoSave = false) => {
    if (!isAutoSave) setIsSaving(true);
    const now = new Date().toISOString();
    const currentId = editingNote?.id;
    const isNew = !currentId || currentId.startsWith('local-');
    const localNoteId = currentId || `local-${Date.now()}`;
    
    const basePayload = { 
      title, content, 
      category: editingNote?.category || NoteCategory.GENERAL,
      metadata: editingNote?.metadata || {}
    };

    await upsertLocalNote({
      id: localNoteId, title, content, 
      category: basePayload.category, metadata: basePayload.metadata,
      createdAt: editingNote?.createdAt?.toString() || now,
      updatedAt: now,
    }, 'PENDING');

    try {
      if (navigator.onLine) {
        const remoteNote = isNew ? await api.post('/notes', basePayload) : await api.patch(`/notes/${currentId}`, basePayload);
        if (isNew) {
          const db = await getDb();
          if (db) await db.execute(`DELETE FROM notes WHERE id = ?`, [localNoteId]);
        }
        await upsertLocalNote(remoteNote, 'SYNCED');
        await clearQueuedCentralNoteSaves([localNoteId, remoteNote.id]);

        if (!isAutoSave) {
          toast.success(isNew ? "Note created" : "Note updated");
          setView('LIST');
          setEditingNote(null);
        }
        return;
      }
    } catch (error) {
      console.warn("Direct sync failed, queued for later.");
    }

    if (!isAutoSave) {
      toast.success("Saved locally. Sync pending.");
      setView('LIST');
      setEditingNote(null);
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete note?")) return;
    const db = await getDb();
    if (db) {
      await db.execute("UPDATE notes SET syncStatus = 'DELETED', updatedAt = ? WHERE id = ?", [new Date().toISOString(), id]);
      await clearQueuedCentralNoteSaves([id]);
      if (!id.startsWith('local-')) await queueAction('DELETE_CENTRAL_NOTE', { id });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success("Deleted locally");
      SyncEngine.processQueue();
    }
    
    // LocalStorage fallback deletion
    try {
      ['ALL', 'YOUTUBE', 'COURSE', 'PROJECT', 'GENERAL'].forEach(cat => {
        const stored = localStorage.getItem(`notes_backup_${cat}`);
        if (stored) {
          let notes = JSON.parse(stored);
          const filtered = notes.filter((n: any) => n.id !== id);
          localStorage.setItem(`notes_backup_${cat}`, JSON.stringify(filtered));
        }
      });
      if (!db) {
         toast.success("Deleted from local storage");
         queryClient.invalidateQueries({ queryKey: ['notes'] });
      }
    } catch (e) {}
  };

  const filteredNotes = useMemo(() => {
    return notes.filter(n => (n.title?.toLowerCase() || "").includes(search.toLowerCase()));
  }, [notes, search]);

  const handleNativePdfExport = useCallback(async ({ blob, suggestedFileName }: { blob: Blob; suggestedFileName: string; }) => {
    const base64Data = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
      reader.readAsDataURL(blob);
    });

    const result = await invoke<{ saved: boolean; path?: string | null }>("save_pdf_with_dialog", {
      suggestedFileName, base64Data, initialDirectory: localStorage.getItem("notes.export.lastDirectory")
    });

    if (result?.saved && result.path) {
      const slash = Math.max(result.path.lastIndexOf("/"), result.path.lastIndexOf("\\"));
      if (slash > 0) localStorage.setItem("notes.export.lastDirectory", result.path.slice(0, slash));
      toast.success("PDF exported");
    }
    return true;
  }, []);

  return (
    <div className={view === 'EDITOR' ? 'h-full w-full flex flex-col overflow-hidden bg-[var(--bg-primary)]' : 'p-6 md:p-10 w-full mx-auto h-full flex flex-col overflow-y-auto custom-scrollbar bg-[var(--bg-primary)]'}>
      <AnimatePresence mode="wait">
        {view === 'LIST' ? (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
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
                    {isOnline ? 'Neural Link Active' : 'Offline Buffer'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-[var(--accent-color)] transition-colors" size={18} />
                  <input type="text" placeholder="Search neural archive..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-12 pr-6 py-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl text-sm text-[var(--text-primary)] focus:outline-none focus:ring-4 focus:ring-[var(--accent-color)]/10 focus:border-[var(--accent-color)]/50 transition-all w-64 shadow-sm" />
                </div>
                <button
                  onClick={() => void handleManualSync()}
                  disabled={isSyncingNotes}
                  className="flex items-center gap-3 px-6 py-4 bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)] rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest hover:text-[var(--text-primary)] transition-all shadow-sm active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw size={16} className={isSyncingNotes ? 'animate-spin' : ''} />
                  {isSyncingNotes ? 'Syncing...' : 'Sync'}
                </button>
                <button onClick={() => { setEditingNote(null); setView('EDITOR'); }} className="flex items-center gap-3 px-8 py-4 bg-[var(--accent-color)] text-[var(--bg-primary)] rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-[var(--accent-color)]/20 active:scale-95"><Plus size={16} /> Initialize</button>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-10 overflow-x-auto no-scrollbar pb-2">
              {['ALL', 'YOUTUBE', 'COURSE', 'PROJECT', 'GENERAL'].map((cat) => (
                <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${activeCategory === cat ? 'bg-[var(--accent-color)] border-[var(--accent-color)] text-[var(--bg-primary)] shadow-lg shadow-[var(--accent-color)]/20' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>{cat}</button>
              ))}
            </div>
            <div className="flex-1">
              {loading && notes.length === 0 ? (
                <div className="h-full flex items-center justify-center min-h-[400px]"><Loader2 className="animate-spin text-[var(--accent-color)]" size={40} /></div>
              ) : filteredNotes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredNotes.map(note => (
                    <NoteCard key={note.id} note={note} onClick={() => { setEditingNote(note); setView('EDITOR'); }} onDelete={() => handleDelete(note.id)} />
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-20 bg-[var(--bg-secondary)]/30 border border-dashed border-[var(--border-color)] rounded-[3rem]">
                  <div className="p-6 bg-[var(--bg-secondary)] rounded-full text-[var(--text-secondary)] mb-6"><StickyNote size={48} /></div>
                  <h3 className="text-xl font-black text-[var(--text-secondary)] uppercase tracking-tight mb-2">No neural data found</h3>
                  <button onClick={() => setView('EDITOR')} className="text-[var(--accent-color)] font-black text-[10px] uppercase tracking-widest hover:underline">Initialize note →</button>
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
              onExportPdf={handleNativePdfExport}
              onBack={() => { setView('LIST'); setEditingNote(null); }}
            />
          </Suspense>
        )}
      </AnimatePresence>
    </div>
  );
}
