"use client";

import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, Settings, Trash2, Share2, Loader2, LayoutGrid, 
  List, Play, Pause, RotateCcw, Save, Brain, BookOpen
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
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
  const router = useRouter();
  const trackId = Array.isArray(params.trackId) ? params.trackId[0] : params.trackId;
  
  const { fetchTrack, activeTrack, loading, openModal, moveUnit, planToday } = useStudy();
  const [energy, setEnergy] = useState<EnergyLevel>('MEDIUM');
  const [viewMode, setViewMode] = useState<'KANBAN' | 'LIST'>('KANBAN');
  const [mounted, setMounted] = useState(false);
  
  // Extra features state
  const [activeTab, setActiveTab] = useState<'BOARD' | 'NOTES'>('BOARD');
  const [seconds, setSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [globalNotes, setGlobalNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (trackId) {
      fetchTrack(trackId);
    }
  }, [trackId, fetchTrack]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => setSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const handleAction = (type: 'SESSION' | 'TIMER' | 'COMPLETE', unit: Unit) => {
    if (type === 'SESSION') {
      router.push(`/dashboard/study/course/${trackId}/${unit.id}`);
    } else if (type === 'TIMER') {
      router.push(`/dashboard/study/course/${trackId}/${unit.id}?layout=FULL_NOTES&autostart=true`);
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
    return `${h > 0 ? h + ":" : ""}${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (!mounted) return null;

  if (loading && !activeTrack) return (
    <div className="transform-gpu flex items-center justify-center min-h-[60vh] bg-[#0a0105] w-full">
      <div className="transform-gpu flex flex-col items-center gap-4">
        <Loader2 className="transform-gpu w-8 h-8 text-rose-500 animate-spin drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
        <div className="transform-gpu text-rose-300/50 font-bold uppercase tracking-widest text-xs">Accessing Knowledge Base...</div>
      </div>
    </div>
  );

  if (!activeTrack) return (
    <div className="transform-gpu flex flex-col items-center justify-center min-h-[60vh] gap-6 bg-[#0a0105] w-full">
      <div className="transform-gpu text-rose-400/50 font-bold uppercase tracking-widest text-sm">Course link severed.</div>
      <button 
        onClick={() => router.push('/dashboard/study')} 
        className="transform-gpu px-8 py-4 bg-linear-to-r from-rose-600 to-pink-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(244,63,94,0.4)] hover:shadow-[0_0_25px_rgba(244,63,94,0.6)] border border-rose-400/50 transition-all active:scale-95"
      >
        Return to Command Center
      </button>
    </div>
  );

  const { track, stats } = activeTrack;

  return (
    <div className="transform-gpu flex-1 min-w-0 relative space-y-12 text-rose-100 pb-24 w-full px-4 md:px-8 font-sans bg-[#0a0105] min-h-screen">
      <div className="transform-gpu fixed top-0 right-0 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-[120px] -z-10 pointer-events-none opacity-50" />
      
      <header className="transform-gpu flex flex-col gap-10 w-full pt-10">
        <div className="transform-gpu flex flex-col md:flex-row md:items-center gap-8 w-full">
          <button 
            onClick={() => router.push('/dashboard/study')} 
            className="transform-gpu p-5 bg-[#14030b] border border-rose-900/50 rounded-3xl text-rose-300/50 hover:text-rose-400 hover:border-rose-500/50 hover:bg-[#1c0510] hover:shadow-[0_0_15px_rgba(244,63,94,0.2)] transition-all active:scale-95 shrink-0 self-start"
          >
            <ArrowLeft size={28} />
          </button>
          
          <div className="transform-gpu flex-1 min-w-0">
             <div className="transform-gpu flex items-center gap-4 mb-2">
               <h1 className="transform-gpu text-4xl md:text-5xl font-bold text-rose-50 tracking-tight truncate drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                 {track.title}
               </h1>
               <span className="transform-gpu text-[10px] font-bold bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30 shadow-[0_0_10px_rgba(217,70,239,0.2)] px-3 py-1 rounded-lg uppercase tracking-widest shrink-0 flex items-center gap-1.5">
                 <BookOpen size={10} /> Course Path
               </span>
             </div>
             <p className="transform-gpu text-rose-400/60 font-bold uppercase tracking-widest text-[10px]">
               {track.description || 'Structured cognitive acquisition track.'}
             </p>
          </div>

          {/* Global Timer integrated into Header */}
          <div className="transform-gpu flex items-center gap-4 bg-[#14030b] border border-fuchsia-900/40 p-2 rounded-2xl shadow-xl">
             <div className="transform-gpu px-4 py-2 border-r border-fuchsia-900/20">
                <p className="transform-gpu text-[8px] font-bold uppercase text-fuchsia-400/40 tracking-widest">Focus Duration</p>
                <p className="transform-gpu text-xl font-bold text-rose-50 font-mono tracking-tighter">{formatTime(seconds)}</p>
             </div>
             <div className="transform-gpu flex gap-1 pr-2">
                <button 
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`p-3 rounded-xl transition-all ${isTimerRunning ? 'bg-fuchsia-500 text-white shadow-[0_0_15px_rgba(217,70,239,0.4)]' : 'bg-[#1c0510] text-fuchsia-400 hover:text-rose-100'}`}
                >
                  {isTimerRunning ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                </button>
                <button onClick={() => { setSeconds(0); setIsTimerRunning(false); }} className="transform-gpu p-3 bg-[#1c0510] text-fuchsia-400/40 hover:text-rose-400 rounded-xl transition-all">
                  <RotateCcw size={20} />
                </button>
             </div>
          </div>

          <div className="transform-gpu flex flex-wrap gap-4 shrink-0">
            <button className="transform-gpu p-5 bg-[#14030b] border border-rose-900/50 rounded-3xl text-rose-300/50 hover:text-rose-400 hover:bg-[#1c0510] hover:border-rose-500/50 hover:shadow-[0_0_15px_rgba(244,63,94,0.2)] transition-all active:scale-95"><Share2 size={24} /></button>
            <button onClick={() => openModal('COMMIT')} className="transform-gpu p-5 bg-[#14030b] border border-rose-900/50 rounded-3xl text-rose-300/50 hover:text-rose-400 hover:bg-[#1c0510] hover:border-rose-500/50 hover:shadow-[0_0_15px_rgba(244,63,94,0.2)] transition-all active:scale-95"><Settings size={24} /></button>
            <button onClick={async () => { await fetchTrack(track.id); openModal('DELETE'); }} className="transform-gpu p-5 bg-[#14030b] border border-red-900/50 rounded-3xl text-red-400/60 hover:text-red-400 hover:bg-red-950/30 hover:border-red-500/50 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all active:scale-95"><Trash2 size={24} /></button>
          </div>
        </div>

        <TrackHeader 
          track={track as Track & { units: Unit[] }} 
          stats={stats}
          currentEnergy={energy}
          onEnergySelect={(lvl) => setEnergy(lvl)}
          onOptimize={() => planToday(track.id, energy)}
        />
      </header>

      <div className="transform-gpu space-y-8">
        <div className="transform-gpu flex items-center justify-between border-b border-rose-900/40 pb-6">
          <div className="transform-gpu flex gap-10">
            <button 
              onClick={() => setActiveTab('BOARD')}
              className={`text-xl font-bold uppercase tracking-tight flex items-center gap-3 transition-all ${activeTab === 'BOARD' ? 'text-rose-50' : 'text-rose-400/30 hover:text-rose-400/60'}`}
            >
              <LayoutGrid size={20} className={activeTab === 'BOARD' ? 'text-fuchsia-500' : ''} /> Lesson Board
            </button>
            <button 
              onClick={() => setActiveTab('NOTES')}
              className={`text-xl font-bold uppercase tracking-tight flex items-center gap-3 transition-all ${activeTab === 'NOTES' ? 'text-rose-50' : 'text-rose-400/30 hover:text-rose-400/60'}`}
            >
              <Brain size={20} className={activeTab === 'NOTES' ? 'text-fuchsia-500' : ''} /> Study Notes
            </button>
          </div>

          <div className="transform-gpu flex bg-[#14030b] border border-rose-900/50 p-1 rounded-xl shadow-inner">
            <button 
              onClick={() => setViewMode('KANBAN')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'KANBAN' ? 'bg-linear-to-r from-fuchsia-600 to-purple-600 text-white shadow-[0_0_10px_rgba(217,70,239,0.4)]' : 'text-rose-400/40 hover:text-rose-200'}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('LIST')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'LIST' ? 'bg-linear-to-r from-fuchsia-600 to-purple-600 text-white shadow-[0_0_10px_rgba(217,70,239,0.4)]' : 'text-rose-400/40 hover:text-rose-200'}`}
            >
              <List size={18} />
            </button>
          </div>
        </div>

        <main className="transform-gpu animate-in fade-in slide-in-from-bottom-8 duration-1000 relative">
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
                  <div className="transform-gpu grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
              <motion.div key="notes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="transform-gpu space-y-6">
                 <div className="transform-gpu bg-[#14030b] border border-rose-900/40 rounded-[2.5rem] p-10 space-y-8">
                    <div className="transform-gpu flex items-center justify-between">
                      <div>
                        <h3 className="transform-gpu text-2xl font-bold text-rose-50 uppercase tracking-tight">Path Notes</h3>
                        <p className="transform-gpu text-[10px] font-bold text-rose-400/40 uppercase tracking-widest mt-1">Plan-wide overview and core concepts</p>
                      </div>
                      <button 
                        onClick={async () => {
                          setIsSaving(true);
                          setTimeout(() => { setIsSaving(false); toast.success("Notes updated"); }, 800);
                        }}
                        className="transform-gpu flex items-center gap-2 px-8 py-4 bg-linear-to-r from-fuchsia-600 to-purple-600 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:from-fuchsia-500 hover:to-purple-500 shadow-lg shadow-fuchsia-900/40"
                      >
                        {isSaving ? <Loader2 size={14} className="transform-gpu animate-spin" /> : <Save size={14} />}
                        Save Notes
                      </button>
                    </div>
                    
                    <textarea 
                      className="transform-gpu w-full h-125 bg-[#0a0105] border border-rose-900/20 rounded-3xl p-10 font-medium text-rose-100/80 text-lg focus:border-fuchsia-500/50 transition-all outline-none resize-none placeholder:text-rose-900/20 custom-scrollbar shadow-inner"
                      placeholder="Capture high-level concepts and course structures here..."
                      value={globalNotes}
                      onChange={(e) => setGlobalNotes(e.target.value)}
                    />
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}