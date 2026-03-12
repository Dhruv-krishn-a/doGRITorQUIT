"use client";

import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, Settings, Trash2, RefreshCw, Loader2, 
  LayoutGrid, List, Play, Pause, RotateCcw, Save, Brain
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useStudy, EnergyLevel, Unit, UnitStatus, Track } from '@planner/study-core';
import { toast } from 'sonner';
import { 
  TrackHeader, 
  KanbanBoard,
  UnitCard
} from '@planner/study-ui-web';
import { motion, AnimatePresence } from 'framer-motion';

interface DragResult {
  draggableId: string;
  destination?: {
    droppableId: string;
    index: number;
  } | null;
}

export function YoutubeDetailView() {
  const params = useParams();
  const router = useRouter();
  const trackId = Array.isArray(params.trackId) ? params.trackId[0] : params.trackId;
  
  const { fetchTrack, syncTrack, activeTrack, loading, openModal, moveUnit, planToday } = useStudy();
  const [energy, setEnergy] = useState<EnergyLevel>('MEDIUM');
  const [isSyncing, setIsSyncing] = useState(false);
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

  const handleSync = async () => {
    if (!trackId) return;
    setIsSyncing(true);
    await syncTrack(trackId);
    setIsSyncing(false);
  };

  const handleAction = (type: 'SESSION' | 'TIMER' | 'COMPLETE', unit: Unit) => {
    if (type === 'SESSION') {
      router.push(`/dashboard/study/youtube/${trackId}/${unit.id}`);
    } else if (type === 'TIMER') {
      router.push(`/dashboard/study/youtube/${trackId}/${unit.id}?layout=FULL_NOTES&autostart=true`);
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
        toast.success("Timeline updated");
      } catch (error) {
        console.error("Failed to update unit status:", error);
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
    <div className="transform-gpu flex items-center justify-center min-h-[60vh] bg-[#fdfbfb] w-full rounded-tl-3xl relative overflow-hidden">
      <div className="transform-gpu absolute top-[20%] left-[30%] w-[40vw] h-[40vw] bg-rose-200/40 rounded-full blur-[120px] mix-blend-multiply animate-pulse pointer-events-none" />
      <div className="transform-gpu flex flex-col items-center gap-4 relative z-10">
        <Loader2 className="transform-gpu w-8 h-8 text-rose-500 animate-spin" />
        <div className="transform-gpu text-rose-400 font-bold uppercase tracking-widest text-xs">Loading YouTube Vector...</div>
      </div>
    </div>
  );

  if (!activeTrack) return (
    <div className="transform-gpu flex flex-col items-center justify-center min-h-[60vh] gap-6 bg-[#fdfbfb] w-full rounded-tl-3xl">
      <div className="transform-gpu text-slate-400 font-bold uppercase tracking-widest text-sm">Vector not found.</div>
      <button 
        onClick={() => router.push('/dashboard/study')} 
        className="transform-gpu px-8 py-4 bg-linear-to-r from-rose-500 to-pink-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-[0_8px_20px_rgba(244,63,94,0.25)] hover:shadow-[0_12px_25px_rgba(244,63,94,0.4)] hover:-translate-y-0.5 transition-all duration-300 active:scale-95"
      >
        Return to Command Center
      </button>
    </div>
  );

  const { track, stats } = activeTrack;

  return (
    // Note: Removed the background color from the main scrolling div so we can see the fixed canvas behind it
    <div className="transform-gpu flex-1 min-w-0 relative text-slate-800 w-full rounded-tl-3xl overflow-x-hidden min-h-screen">
      
      {/* ========================================= */}
      {/* FIXED PREMIUM ANIMATED BACKGROUND CANVAS  */}
      {/* ========================================= */}
      <div className="transform-gpu fixed inset-0 z-0 bg-[#fdfbfb] pointer-events-none">
        {/* Subtle Tech Grid Pattern */}
        <div className="transform-gpu absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[24px_24px]"></div>
        
        {/* Animated Floating Orbs */}
        <div className="transform-gpu absolute top-[-5%] left-[-5%] w-[45vw] h-[45vw] max-w-150 max-h-150 bg-rose-200/40 rounded-full blur-[120px] mix-blend-multiply animate-float pointer-events-none" />
        <div className="transform-gpu absolute top-[30%] right-[-10%] w-[40vw] h-[40vw] max-w-125 max-h-125 bg-fuchsia-100/50 rounded-full blur-[100px] mix-blend-multiply animate-float-delayed pointer-events-none" />
        <div className="transform-gpu absolute bottom-[-10%] left-[15%] w-[55vw] h-[55vw] max-w-175 max-h-175 bg-pink-200/30 rounded-full blur-[130px] mix-blend-multiply animate-float-slow pointer-events-none" />
      </div>

      {/* ========================================= */}
      {/* SCROLLING CONTENT WRAPPER                 */}
      {/* ========================================= */}
      <div className="transform-gpu relative z-10 w-full px-4 md:px-8 pb-24 space-y-12">
        <header className="transform-gpu flex flex-col gap-10 w-full pt-10 relative z-10">
          <div className="transform-gpu flex flex-col lg:flex-row lg:items-center justify-between gap-8 w-full">
            
            {/* Back Button & Title Area */}
            <div className="transform-gpu flex items-start md:items-center gap-6 flex-1 min-w-0">
              <button 
                onClick={() => router.push('/dashboard/study')} 
                className="transform-gpu p-4 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-3xl text-slate-400 hover:text-rose-500 hover:border-rose-300 hover:bg-white shadow-sm hover:shadow-md transition-all duration-300 active:scale-95 shrink-0"
              >
                <ArrowLeft size={24} />
              </button>
              
              <div className="transform-gpu flex-1 min-w-0 space-y-1">
                 <div className="transform-gpu flex flex-wrap items-center gap-4">
                   <h1 className="transform-gpu text-3xl md:text-4xl font-bold text-slate-900 tracking-tighter truncate">
                     {track.title}
                   </h1>
                   <span className="transform-gpu text-[10px] font-bold bg-rose-50 text-rose-500 border border-rose-100 shadow-sm px-3 py-1.5 rounded-lg uppercase tracking-widest shrink-0">
                     YouTube Course
                   </span>
                 </div>
                 <p className="transform-gpu text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                   {track.description || 'Active learning track.'}
                 </p>
              </div>
            </div>

            {/* Controls Area (Timer & Actions) */}
            <div className="transform-gpu flex flex-wrap items-center gap-4 shrink-0">
              
              {/* Glassmorphic Neural Timer */}
              <div className="transform-gpu flex items-center gap-3 bg-white/80 backdrop-blur-md border border-slate-200/60 p-2 rounded-2xl shadow-sm">
                 <div className="transform-gpu px-4 py-1 border-r border-slate-200">
                    <p className="transform-gpu text-[9px] font-bold uppercase text-slate-400 tracking-widest">Neural Load</p>
                    <p className="transform-gpu text-xl font-bold text-slate-800 font-mono tracking-tighter">{formatTime(seconds)}</p>
                 </div>
                 <div className="transform-gpu flex gap-1 pr-1">
                    <button 
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className={`p-2.5 rounded-xl transition-all duration-300 ${isTimerRunning ? 'bg-linear-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-200' : 'bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50'}`}
                    >
                      {isTimerRunning ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                    </button>
                    <button onClick={() => { setSeconds(0); setIsTimerRunning(false); }} className="transform-gpu p-2.5 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all duration-300">
                      <RotateCcw size={18} />
                    </button>
                 </div>
              </div>

              {/* Actions */}
              <button 
                onClick={handleSync} disabled={isSyncing}
                className="transform-gpu flex items-center gap-2 px-5 py-4 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl text-slate-600 hover:text-rose-500 hover:border-rose-300 hover:bg-white shadow-sm hover:shadow-md font-bold text-[10px] uppercase tracking-widest transition-all duration-300 active:scale-95 disabled:opacity-50"
              >
                {isSyncing ? <Loader2 size={16} className="transform-gpu animate-spin text-rose-500" /> : <RefreshCw size={16} className="transform-gpu text-slate-400 group-hover:text-rose-500" />}
                {isSyncing ? 'Syncing' : 'Sync'}
              </button>
              <button onClick={() => openModal('COMMIT')} className="transform-gpu p-4 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl text-slate-400 hover:text-rose-500 hover:border-rose-300 hover:bg-white shadow-sm hover:shadow-md transition-all duration-300 active:scale-95">
                <Settings size={20} />
              </button>
              <button onClick={async () => { await fetchTrack(track.id); openModal('DELETE'); }} className="transform-gpu p-4 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 shadow-sm hover:shadow-md transition-all duration-300 active:scale-95">
                <Trash2 size={20} />
              </button>
            </div>
          </div>

          <div className="transform-gpu bg-white/50 backdrop-blur-xl border border-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-2">
            <TrackHeader 
              track={track as Track & { units: Unit[] }} 
              stats={stats}
              currentEnergy={energy}
              onEnergySelect={(lvl) => setEnergy(lvl)}
              onOptimize={() => planToday(track.id, energy)}
            />
          </div>
        </header>

        <div className="transform-gpu space-y-8 relative z-10">
          <div className="transform-gpu flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-rose-100/60 pb-6">
            <div className="transform-gpu flex gap-8">
              <button 
                onClick={() => setActiveTab('BOARD')}
                className={`text-xl font-bold uppercase tracking-tight flex items-center gap-3 transition-all duration-300 ${activeTab === 'BOARD' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <LayoutGrid size={20} className={activeTab === 'BOARD' ? 'text-rose-500' : ''} /> Lesson Board
              </button>
              <button 
                onClick={() => setActiveTab('NOTES')}
                className={`text-xl font-bold uppercase tracking-tight flex items-center gap-3 transition-all duration-300 ${activeTab === 'NOTES' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Brain size={20} className={activeTab === 'NOTES' ? 'text-rose-500' : ''} /> Global Insights
              </button>
            </div>

            <div className="transform-gpu flex bg-white/80 backdrop-blur-md border border-slate-200 p-1.5 rounded-2xl shadow-sm self-start md:self-auto">
              <button 
                onClick={() => setViewMode('KANBAN')}
                className={`p-2.5 rounded-xl transition-all duration-300 ${viewMode === 'KANBAN' ? 'bg-linear-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-200' : 'text-slate-400 hover:text-slate-700'}`}
              >
                <LayoutGrid size={16} />
              </button>
              <button 
                onClick={() => setViewMode('LIST')}
                className={`p-2.5 rounded-xl transition-all duration-300 ${viewMode === 'LIST' ? 'bg-linear-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-200' : 'text-slate-400 hover:text-slate-700'}`}
              >
                <List size={16} />
              </button>
            </div>
          </div>

          <main className="transform-gpu animate-in fade-in slide-in-from-bottom-8 duration-1000">
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
                   <div className="transform-gpu bg-white/60 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] p-8 md:p-10 space-y-8">
                      <div className="transform-gpu flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                          <h3 className="transform-gpu text-2xl font-bold text-slate-900 uppercase tracking-tight">Track-level Observations</h3>
                          <p className="transform-gpu text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Cross-unit synthesis and mental models</p>
                        </div>
                        <button 
                          onClick={async () => {
                            setIsSaving(true);
                            setTimeout(() => { setIsSaving(false); toast.success("Notes synchronized"); }, 800);
                          }}
                          className="transform-gpu group flex items-center justify-center gap-2 px-8 py-4 bg-linear-to-r from-rose-500 to-pink-500 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:from-rose-400 hover:to-pink-400 shadow-[0_8px_20px_rgba(244,63,94,0.25)] hover:shadow-[0_12px_25px_rgba(244,63,94,0.4)] hover:-translate-y-0.5 transition-all duration-300 active:scale-95"
                        >
                          {isSaving ? <Loader2 size={16} className="transform-gpu animate-spin" /> : <Save size={16} className="transform-gpu group-hover:scale-110 transition-transform" />}
                          Save Insights
                        </button>
                      </div>
                      
                      <textarea 
                        className="transform-gpu w-full h-100 bg-white/50 border border-slate-200 rounded-3xl p-8 font-medium text-slate-700 text-lg focus:border-rose-300 focus:ring-4 focus:ring-rose-100/50 transition-all outline-none resize-none placeholder:text-slate-300 shadow-inner custom-scrollbar"
                        placeholder="Capture high-level patterns across the entire playlist here..."
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
    </div>
  );
}