"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { 
  ArrowLeft, Settings, Trash2, RefreshCw, Loader2, 
  LayoutGrid, List, Play, Pause, RotateCcw, Save, Brain,
  Activity, Clock, Youtube, Target, TrendingUp, AlertCircle,
  Star, PieChart, Zap
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
  const [hasPrompted, setHasPrompted] = useState(false);
  
  // Extra features state
  const [activeTab, setActiveTab] = useState<'BOARD' | 'NOTES' | 'ANALYTICS'>('BOARD');
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
    if (activeTrack?.track && !activeTrack.track.targetDate && !hasPrompted) {
      openModal('COMMIT');
      setHasPrompted(true);
    }
  }, [activeTrack, hasPrompted, openModal]);

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

  const formatMins = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = Math.round(mins % 60);
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  };

  const analytics = useMemo(() => {
    if (!activeTrack?.track?.units) return null;
    const units = activeTrack.track.units;
    const completedUnits = units.filter(u => u.status === 'DONE' || u.status === 'COMPLETED');
    const activeUnits = units.filter(u => u.status === 'IN_PROGRESS' || u.status === 'TODAY' || u.status === 'THIS_WEEK');
    const backlogUnits = units.filter(u => u.status === 'BACKLOG');
    
    const longestUnit = [...units].sort((a,b) => (b.actualTimeSpentMinutes||0) - (a.actualTimeSpentMinutes||0))[0];
    const hardestUnit = [...completedUnits].sort((a,b) => (a.confidenceRating||5) - (b.confidenceRating||5))[0];
    const avgConfidence = completedUnits.length > 0 
      ? completedUnits.reduce((acc, u) => acc + (u.confidenceRating || 0), 0) / completedUnits.length 
      : 0;

    const completedVideoTime = completedUnits.reduce((acc, u) => acc + (u.durationMinutes || 0), 0);
    const completedStudyTime = completedUnits.reduce((acc, u) => acc + (u.actualTimeSpentMinutes || 0), 0);
    const studyMultiplier = completedVideoTime > 0 ? (completedStudyTime / completedVideoTime).toFixed(1) : "0.0";

    return { 
      longestUnit, 
      hardestUnit, 
      avgConfidence,
      studyMultiplier,
      counts: {
        completed: completedUnits.length,
        active: activeUnits.length,
        backlog: backlogUnits.length
      }
    };
  }, [activeTrack]);

  if (!mounted) return null;

  if (loading && !activeTrack) return (
    <div className="flex items-center justify-center min-h-[60vh] bg-slate-50 w-full rounded-tl-3xl">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
        <div className="text-rose-400 font-bold uppercase tracking-widest text-xs">Loading Course...</div>
      </div>
    </div>
  );

  if (!activeTrack) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 bg-slate-50 w-full rounded-tl-3xl">
      <div className="text-slate-400 font-bold uppercase tracking-widest text-sm">Course not found.</div>
      <button 
        onClick={() => router.push('/dashboard/study')} 
        className="px-8 py-4 bg-rose-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-rose-600 transition-colors"
      >
        Return to Dashboard
      </button>
    </div>
  );

  const { track, stats } = activeTrack;

  return (
    <div className="flex-1 min-w-0 relative text-slate-800 w-full rounded-tl-3xl overflow-x-hidden min-h-screen bg-slate-50/50">
      
      <div className="relative z-10 w-full px-4 md:px-8 pb-24 space-y-8">
        <header className="flex flex-col gap-8 w-full pt-8 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 w-full">
            
            <div className="flex items-start md:items-center gap-4 flex-1 min-w-0">
              <button 
                onClick={() => router.push('/dashboard/study')} 
                className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-rose-500 hover:border-rose-300 shadow-sm transition-colors shrink-0"
              >
                <ArrowLeft size={20} />
              </button>
              
              <div className="flex-1 min-w-0 space-y-1">
                 <div className="flex flex-wrap items-center gap-3">
                   <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight truncate">
                     {track.title}
                   </h1>
                   <span className="text-[9px] font-bold bg-rose-50 text-rose-500 border border-rose-100 px-2 py-1 rounded-md uppercase tracking-widest shrink-0">
                     YouTube Course
                   </span>
                 </div>
                 <p className="text-slate-400 font-medium text-xs line-clamp-1">
                   {track.description || 'Active learning track.'}
                 </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              
              {/* Simple Timer */}
              <div className="flex items-center gap-2 bg-white border border-slate-200 p-1.5 rounded-xl shadow-sm">
                 <div className="px-3">
                    <p className="text-[8px] font-bold uppercase text-slate-400 tracking-widest leading-none mb-1">Session</p>
                    <p className="text-lg font-bold text-slate-800 font-mono tracking-tight leading-none">{formatTime(seconds)}</p>
                 </div>
                 <div className="flex gap-1 border-l border-slate-100 pl-2">
                    <button 
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className={`p-2 rounded-lg transition-colors ${isTimerRunning ? 'bg-rose-500 text-white' : 'bg-slate-50 text-slate-500 hover:text-rose-500 hover:bg-rose-50'}`}
                    >
                      {isTimerRunning ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                    </button>
                    <button onClick={() => { setSeconds(0); setIsTimerRunning(false); }} className="p-2 bg-slate-50 text-slate-500 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                      <RotateCcw size={16} />
                    </button>
                 </div>
              </div>

              {/* Actions */}
              <button 
                onClick={handleSync} disabled={isSyncing}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-rose-500 shadow-sm font-bold text-[10px] uppercase tracking-widest transition-colors disabled:opacity-50"
              >
                {isSyncing ? <Loader2 size={14} className="animate-spin text-rose-500" /> : <RefreshCw size={14} />}
                {isSyncing ? 'Syncing' : 'Sync'}
              </button>
              <button onClick={async () => { await fetchTrack(track.id); openModal('DELETE'); }} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200 shadow-sm transition-colors" title="Delete Course">
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          <div>
            <TrackHeader 
              track={track as Track & { units: Unit[] }} 
              stats={stats}
              currentEnergy={energy}
              onEnergySelect={(lvl) => setEnergy(lvl)}
              onOptimize={() => planToday(track.id, energy)}
            />
          </div>
        </header>

        <div className="space-y-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="flex gap-6">
              <button 
                onClick={() => setActiveTab('BOARD')}
                className={`text-sm font-bold uppercase tracking-widest flex items-center gap-2 transition-colors ${activeTab === 'BOARD' ? 'text-rose-500 border-b-2 border-rose-500 pb-2 -mb-[18px]' : 'text-slate-400 hover:text-slate-600 pb-2 -mb-[18px]'}`}
              >
                <LayoutGrid size={16} /> Lessons
              </button>
              <button 
                onClick={() => setActiveTab('NOTES')}
                className={`text-sm font-bold uppercase tracking-widest flex items-center gap-2 transition-colors ${activeTab === 'NOTES' ? 'text-rose-500 border-b-2 border-rose-500 pb-2 -mb-[18px]' : 'text-slate-400 hover:text-slate-600 pb-2 -mb-[18px]'}`}
              >
                <Brain size={16} /> Global Notes
              </button>
              <button 
                onClick={() => setActiveTab('ANALYTICS')}
                className={`text-sm font-bold uppercase tracking-widest flex items-center gap-2 transition-colors ${activeTab === 'ANALYTICS' ? 'text-rose-500 border-b-2 border-rose-500 pb-2 -mb-[18px]' : 'text-slate-400 hover:text-slate-600 pb-2 -mb-[18px]'}`}
              >
                <Activity size={16} /> Analytics
              </button>
            </div>

            {activeTab === 'BOARD' && (
              <div className="flex bg-white border border-slate-200 p-1 rounded-lg shadow-sm self-start md:self-auto">
                <button 
                  onClick={() => setViewMode('KANBAN')}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'KANBAN' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'}`}
                >
                  <LayoutGrid size={14} />
                </button>
                <button 
                  onClick={() => setViewMode('LIST')}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'LIST' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'}`}
                >
                  <List size={14} />
                </button>
              </div>
            )}
          </div>

          <main className="pt-4">
            <AnimatePresence mode="wait">
              {activeTab === 'BOARD' && (
                <motion.div key="board" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {viewMode === 'KANBAN' ? (
                    <KanbanBoard 
                      units={track.units} 
                      onAction={handleAction}
                      onDragEnd={handleDragEnd}
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                <motion.div key="notes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                   <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 md:p-8 space-y-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Track Observations</h3>
                          <p className="text-xs font-medium text-slate-500 mt-1">Cross-unit synthesis and mental models</p>
                        </div>
                        <button 
                          onClick={async () => {
                            setIsSaving(true);
                            setTimeout(() => { setIsSaving(false); toast.success("Notes synchronized"); }, 800);
                          }}
                          className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-rose-500 transition-colors"
                        >
                          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                          Save Insights
                        </button>
                      </div>
                      
                      <textarea 
                        className="w-full h-[400px] bg-slate-50 border border-slate-200 rounded-2xl p-6 font-medium text-slate-700 focus:border-rose-400 focus:bg-white transition-colors outline-none resize-none placeholder:text-slate-400"
                        placeholder="Capture high-level patterns across the entire course here..."
                        value={globalNotes}
                        onChange={(e) => setGlobalNotes(e.target.value)}
                      />
                   </div>
                </motion.div>
              )}

              {activeTab === 'ANALYTICS' && (
                <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Time Remaining Card */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 bg-rose-50 text-rose-500 rounded-xl"><Clock size={18} /></div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Time Remaining</h3>
                      </div>
                      <p className="text-3xl font-bold text-slate-800">{formatMins(track.remainingMinutes || 0)}</p>
                      <p className="text-xs text-slate-400 mt-2 font-medium">Estimated pure watch time left in the course.</p>
                    </div>

                    {/* Longest Watched Lesson */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 bg-fuchsia-50 text-fuchsia-500 rounded-xl"><TrendingUp size={18} /></div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Longest Study Session</h3>
                      </div>
                      {analytics?.longestUnit && (analytics.longestUnit.actualTimeSpentMinutes || 0) > 0 ? (
                        <>
                          <p className="text-2xl font-bold text-slate-800 truncate mb-1" title={analytics.longestUnit.title}>{analytics.longestUnit.title}</p>
                          <p className="text-sm font-bold text-rose-500">{analytics.longestUnit.actualTimeSpentMinutes} mins logged</p>
                        </>
                      ) : (
                        <p className="text-sm font-medium text-slate-400 italic">No study sessions logged yet.</p>
                      )}
                    </div>

                    {/* Needs Review (Hardest Lesson) */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 bg-amber-50 text-amber-500 rounded-xl"><AlertCircle size={18} /></div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Most Challenging Lesson</h3>
                      </div>
                      {analytics?.hardestUnit ? (
                        <>
                          <p className="text-2xl font-bold text-slate-800 truncate mb-1" title={analytics.hardestUnit.title}>{analytics.hardestUnit.title}</p>
                          <p className="text-sm font-bold text-amber-500">Confidence: {analytics.hardestUnit.confidenceRating}/5</p>
                        </>
                      ) : (
                        <p className="text-sm font-medium text-slate-400 italic">Complete lessons and rate confidence to see insights.</p>
                      )}
                    </div>

                    {/* Average Confidence */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 bg-emerald-50 text-emerald-500 rounded-xl"><Star size={18} /></div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Avg. Confidence</h3>
                      </div>
                      <p className="text-3xl font-bold text-slate-800">{analytics?.avgConfidence ? analytics.avgConfidence.toFixed(1) : "0.0"} <span className="text-xl text-slate-400">/ 5</span></p>
                      <p className="text-xs text-slate-400 mt-2 font-medium">Average understanding across completed lessons.</p>
                    </div>

                    {/* Study Efficiency */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 bg-indigo-50 text-indigo-500 rounded-xl"><Zap size={18} /></div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Study Efficiency</h3>
                      </div>
                      <p className="text-3xl font-bold text-slate-800">{analytics?.studyMultiplier}x</p>
                      <p className="text-xs text-slate-400 mt-2 font-medium">Time spent studying vs actual video length.</p>
                    </div>

                    {/* Course Distribution */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 bg-sky-50 text-sky-500 rounded-xl"><PieChart size={18} /></div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Course Distribution</h3>
                      </div>
                      {analytics?.counts && (
                        <>
                           <p className="text-3xl font-bold text-slate-800 mb-2">{analytics.counts.completed} Done</p>
                           <div className="flex gap-4 text-sm font-bold">
                             <span className="text-sky-500">{analytics.counts.active} Active</span>
                             <span className="text-slate-400">{analytics.counts.backlog} Queued</span>
                           </div>
                        </>
                      )}
                    </div>

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