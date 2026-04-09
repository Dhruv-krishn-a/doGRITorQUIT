"use client";

import React, { useEffect, useState } from 'react';
import { 
 ArrowLeft, Settings, Trash2, Share2, Loader2, LayoutGrid, 
 List, Play, Pause, RotateCcw, Save, Brain, BookOpen
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStudy, EnergyLevel, Unit, UnitStatus, Track } from '@gritorquit/study-core';
import { toast } from 'sonner';
import { 
 TrackHeader, 
 KanbanBoard,
 UnitCard
} from '@gritorquit/study-ui-web';
import { motion, AnimatePresence } from 'framer-motion';

interface DragResult {
 draggableId: string;
 destination?: {
  droppableId: string;
  index: number;
 } | null;
}

export function CourseDetailView() {
 const params = useParams();
 const navigate = useNavigate();
 const trackId = Array.isArray(params.trackId) ? params.trackId[0] : params.trackId;
 
 const { 
  fetchTrack, activeTrack, loading, openModal, moveUnit, planToday,
  seconds, setSeconds, isTimerRunning, setIsTimerRunning
 } = useStudy();
 const [energy, setEnergy] = useState<EnergyLevel>('MEDIUM');
 const [viewMode, setViewMode] = useState<'KANBAN' | 'LIST'>('KANBAN');
 const [mounted, setMounted] = useState(false);
 
 // Extra features state
 const [activeTab, setActiveTab] = useState<'BOARD' | 'NOTES'>('BOARD');
 const [globalNotes, setGlobalNotes] = useState("");
 const [isSaving, setIsSaving] = useState(false);

 useEffect(() => {
  setMounted(true);
  if (trackId) {
   fetchTrack(trackId);
  }
 }, [trackId, fetchTrack]);


 const handleAction = (type: 'SESSION' | 'TIMER' | 'COMPLETE', unit: Unit) => {
  if (type === 'SESSION') {
   navigate(`/study/course/${trackId}/unit/${unit.id}`);
  } else if (type === 'TIMER') {
   navigate(`/study/course/${trackId}/unit/${unit.id}?layout=FULL_NOTES&autostart=true`);
  } else if (type === 'COMPLETE') {
   openModal('SESSION', unit, 'LOGS');
  }
 };

 const handleDragEnd = async (result: DragResult) => {
  if (!result.destination) return;
  const { draggableId, destination } = result;
  
  if (destination.droppableId === 'DONE' || destination.droppableId === 'REVISE') {
   const unitToComplete = activeTrack?.track?.units.find(u => u.id === draggableId);
   if (unitToComplete) {
    openModal('SESSION', unitToComplete, 'LOGS');
   }
   return;
  }

  const statusMap: Record<string, UnitStatus> = {
   'LEFT': 'BACKLOG' as UnitStatus,
   'THIS_WEEK': 'THIS_WEEK' as UnitStatus, 
   'TODAY': 'TODAY' as UnitStatus,
   'STUDYING': 'IN_PROGRESS' as UnitStatus
  };

  const newStatus = statusMap[destination.droppableId];
  if (newStatus) {
   try {
    await moveUnit(draggableId, newStatus, destination.index);
    if (trackId) fetchTrack(trackId);
    toast.success("Curriculum updated");
   } catch (error) {
    console.error("Failed to update module status:", error);
   }
  }
 };

 const formatTime = (totalSeconds: number) => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h > 0 ? h +":" :""}${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`;
 };

 if (!mounted) return null;

 if (loading && !activeTrack) return (
  <div className="flex items-center justify-center min-h-[60vh] bg-[var(--bg-primary)] w-full">
   <div className="flex flex-col items-center gap-4">
    <Loader2 className="w-8 h-8 text-[var(--accent-color)] animate-spin drop-shadow-[0_0_10px_var(--accent-color)]" />
    <div className="text-[var(--text-secondary)] font-black uppercase tracking-widest text-xs italic">Accessing Knowledge Base...</div>
   </div>
  </div>
 );

 if (!activeTrack) return (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 bg-[var(--bg-primary)] w-full">
   <div className="text-[var(--text-secondary)] font-black uppercase tracking-widest text-sm italic">Course link severed.</div>
   <button 
    onClick={() => navigate('/study')} 
    className="px-8 py-4 bg-gradient-to-r from-[var(--accent-color)] to-sky-600 text-[var(--bg-primary)] rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:opacity-90 transition-all active:scale-95 italic"
   >
    Return to Command Center
   </button>
  </div>
 );

 const { track, stats } = activeTrack;

 return (
  <div className="flex-1 min-w-0 relative space-y-12 text-[var(--text-primary)] w-full font-sans bg-[var(--bg-primary)] flex flex-col h-full overflow-hidden">
   <div className="fixed top-0 right-0 w-96 h-96 bg-[var(--accent-color)]/5 rounded-full blur-[120px] -z-10 pointer-events-none opacity-50" />
   
   <div className="relative z-10 flex flex-col h-full w-full">
    <header className="flex flex-col gap-10 w-full p-6 md:p-8 shrink-0">
     <div className="flex flex-col md:flex-row md:items-center gap-8 w-full">
      <button 
       onClick={() => navigate('/study')} 
       className="p-5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl text-[var(--text-secondary)] hover:text-[var(--accent-color)] hover:border-[var(--accent-color)]/30 transition-all active:scale-95 shrink-0 self-start"
      >
       <ArrowLeft size={28} />
      </button>
      
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center gap-4 mb-2">
         <h1 className="text-4xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight truncate italic uppercase">
          {track.title}
         </h1>
         <span className="text-[10px] font-black bg-[var(--accent-color)]/10 text-[var(--accent-color)] border border-[var(--accent-color)]/20 shadow-sm px-3 py-1 rounded-lg uppercase tracking-widest shrink-0 flex items-center gap-1.5 italic">
          <BookOpen size={10} /> Course Vector
         </span>
        </div>
        <p className="text-[var(--text-secondary)] font-black uppercase tracking-widest text-[10px] italic">
         {track.description || 'Structured cognitive acquisition track.'}
        </p>
      </div>

      <div className="flex items-center gap-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] p-2 rounded-2xl shadow-xl">
        <div className="px-4 py-2 border-r border-[var(--border-color)] text-left">
         <p className="text-[8px] font-black uppercase text-[var(--text-secondary)] tracking-widest italic">Focus Duration</p>
         <p className="text-xl font-black text-[var(--text-primary)] font-mono tracking-tighter italic">{formatTime(seconds)}</p>
        </div>
        <div className="flex gap-1 pr-2">
         <button 
          onClick={() => setIsTimerRunning(!isTimerRunning)}
          className={`p-3 rounded-xl transition-all ${isTimerRunning ? 'bg-[var(--accent-color)] text-[var(--bg-primary)] shadow-lg shadow-[var(--accent-color)]/20' : 'bg-[var(--bg-primary)] text-[var(--accent-color)] hover:bg-[var(--bg-card)]'}`}
         >
          {isTimerRunning ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
         </button>
         <button onClick={() => { setSeconds(0); setIsTimerRunning(false); }} className="p-3 bg-[var(--bg-primary)] text-[var(--text-secondary)]/40 hover:text-[var(--text-secondary)] rounded-xl transition-all border border-[var(--border-color)]">
          <RotateCcw size={20} />
         </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 shrink-0">
       <button className="p-5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all active:scale-95"><Share2 size={24} /></button>
       <button onClick={() => openModal('COMMIT')} className="p-5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all active:scale-95"><Settings size={24} /></button>
       <button onClick={async () => { await fetchTrack(track.id); openModal('DELETE'); }} className="p-5 bg-[var(--bg-secondary)] border border-rose-500/20 rounded-3xl text-rose-500 hover:bg-rose-500/10 transition-all active:scale-95"><Trash2 size={24} /></button>
      </div>
     </div>

     <div className="mt-8 bg-[var(--bg-secondary)]/40 backdrop-blur-xl border border-[var(--border-color)] rounded-[2.5rem] p-2">
      <TrackHeader 
       track={track as Track & { units: Unit[] }} 
       stats={stats}
       currentEnergy={energy}
       onEnergySelect={(lvl) => setEnergy(lvl)}
       onOptimize={() => planToday(track.id, energy)}
      />
     </div>
    </header>

    <div className="flex-1 flex flex-col min-h-0 bg-black/5">
     <div className="flex items-center justify-between px-8 py-6 border-b border-[var(--border-color)]">
      <div className="flex gap-10">
       <button 
        onClick={() => setActiveTab('BOARD')}
        className={`text-xl font-black uppercase tracking-tight flex items-center gap-3 transition-all italic ${activeTab === 'BOARD' ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]/30 hover:text-[var(--text-secondary)]/60'}`}
       >
        <LayoutGrid size={20} className={activeTab === 'BOARD' ? 'text-[var(--accent-color)]' : ''} /> Lesson Board
       </button>
       <button 
        onClick={() => setActiveTab('NOTES')}
        className={`text-xl font-black uppercase tracking-tight flex items-center gap-3 transition-all italic ${activeTab === 'NOTES' ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]/30 hover:text-[var(--text-secondary)]/60'}`}
       >
        <Brain size={20} className={activeTab === 'NOTES' ? 'text-[var(--accent-color)]' : ''} /> Course Ledger
       </button>
      </div>

      <div className="flex bg-[var(--bg-secondary)] border border-[var(--border-color)] p-1 rounded-xl shadow-inner">
       <button 
        onClick={() => setViewMode('KANBAN')}
        className={`p-2 rounded-lg transition-all ${viewMode === 'KANBAN' ? 'bg-[var(--accent-color)] text-[var(--bg-primary)] shadow-sm' : 'text-[var(--text-secondary)]/40 hover:text-[var(--text-secondary)]'}`}
       >
        <LayoutGrid size={18} />
       </button>
       <button 
        onClick={() => setViewMode('LIST')}
        className={`p-2 rounded-lg transition-all ${viewMode === 'LIST' ? 'bg-[var(--accent-color)] text-[var(--bg-primary)] shadow-sm' : 'text-[var(--text-secondary)]/40 hover:text-[var(--text-secondary)]'}`}
       >
        <List size={18} />
       </button>
      </div>
     </div>

     <main className="flex-1 relative overflow-hidden">
      <div className="absolute inset-0 overflow-y-auto no-scrollbar p-8">
       <AnimatePresence mode="wait">
        {activeTab === 'BOARD' && (
         <motion.div key="board" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
          {viewMode === 'KANBAN' ? (
           <KanbanBoard 
            units={track.units} 
            onAction={handleAction}
            onDragEnd={handleDragEnd}
           />
          ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {track.units.map((unit, idx) => (
             <UnitCard 
              key={unit.id}
              unit={unit}
              index={idx}
              onAction={handleAction}
              isDraggable={false}
             />
            ))}
           </div>
          )}
         </motion.div>
        )}

        {activeTab === 'NOTES' && (
         <motion.div key="notes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6 max-w-6xl mx-auto">
           <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] p-10 space-y-8 text-left shadow-2xl">
            <div className="flex items-center justify-between">
             <div>
              <h3 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight italic">Curriculum Notes</h3>
              <p className="text-[10px] font-black text-[var(--text-secondary)]/40 uppercase tracking-[0.2em] mt-1 italic">Syllabus-wide synthesis</p>
             </div>
             <button 
              onClick={async () => {
               setIsSaving(true);
               setTimeout(() => { setIsSaving(false); toast.success("Ledger updated"); }, 800);
              }}
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[var(--accent-color)] to-sky-600 text-[var(--bg-primary)] rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:opacity-90 italic"
             >
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Sync Ledger
             </button>
            </div>
            
            <textarea 
             className="w-full h-125 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-3xl p-10 font-black text-[var(--text-primary)] text-lg focus:border-[var(--accent-color)]/50 transition-all outline-none resize-none placeholder:text-[var(--text-secondary)]/20 custom-scrollbar shadow-inner uppercase tracking-tighter italic"
             placeholder="Capture high-level concepts and course structures here..."
             value={globalNotes}
             onChange={(e) => setGlobalNotes(e.target.value)}
            />
           </div>
         </motion.div>
        )}
       </AnimatePresence>
      </div>
     </main>
    </div>
   </div>
  </div>
 );
}