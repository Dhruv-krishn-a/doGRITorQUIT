import React, { useEffect, useState, useMemo } from 'react';
import { 
  ArrowLeft, Settings, Trash2, RefreshCw, Loader2, 
  LayoutGrid, List, Play, Pause, RotateCcw, Save, Brain,
  Activity, Clock, Youtube, Target, TrendingUp, AlertCircle,
  Star, PieChart, Zap
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

export function YoutubeDetailView() {
  const params = useParams();
  const navigate = useNavigate();
  const trackId = params.trackId;
  
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
      navigate(`/study/youtube/${trackId}/unit/${unit.id}`);
    } else if (type === 'TIMER') {
      navigate(`/study/youtube/${trackId}/unit/${unit.id}?layout=FULL_NOTES&autostart=true`);
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
        toast.success("Path updated");
      } catch (error) {
        console.error("Failed to update status:", error);
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
    <div className="flex items-center justify-center min-h-[60vh] bg-[var(--bg-primary)] w-full rounded-tl-3xl">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-[var(--accent-color)] animate-spin" />
        <div className="text-[var(--accent-color)] font-black uppercase tracking-widest text-xs italic">Loading Path...</div>
      </div>
    </div>
  );

  if (!activeTrack) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 bg-[var(--bg-primary)] w-full rounded-tl-3xl text-left">
      <div className="text-[var(--text-secondary)] font-black uppercase tracking-widest text-sm italic">Path link severed.</div>
      <button 
        onClick={() => navigate('/study')} 
        className="px-8 py-4 bg-gradient-to-r from-[var(--accent-color)] to-sky-600 text-[var(--bg-primary)] rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all italic active:scale-95"
      >
        Return to Dashboard
      </button>
    </div>
  );

  const { track, stats, momentum } = activeTrack;

  return (
    <div className="flex-1 min-w-0 relative text-[var(--text-primary)] w-full rounded-tl-3xl overflow-x-hidden min-h-screen bg-[var(--bg-primary)]">
      
      <div className="relative z-10 w-full px-4 md:px-8 pb-24 space-y-8 text-left italic">
        <header className="flex flex-col gap-6 w-full pt-8 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 w-full">
            
            <div className="flex items-start md:items-center gap-4 flex-1 min-w-0">
              <button 
                onClick={() => navigate('/study')} 
                className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-color)]/30 shadow-sm transition-colors shrink-0 active:scale-95"
              >
                <ArrowLeft size={20} />
              </button>
              
              <div className="flex-1 min-w-0 space-y-2">
                 <div className="flex flex-wrap items-center gap-3">
                   <h1 className="text-2xl md:text-3xl font-black text-[var(--text-primary)] tracking-tighter italic uppercase truncate leading-none">
                     {track.title}
                   </h1>
                   <span className="text-[9px] font-black bg-rose-500/10 text-rose-500 border border-rose-500/20 px-2.5 py-1 rounded-md uppercase tracking-widest shrink-0 italic">
                     YouTube Path
                   </span>
                 </div>
                 <div className="flex items-center gap-3">
                   <div className="h-1.5 w-32 bg-[var(--bg-secondary)] rounded-full overflow-hidden border border-[var(--border-color)]/50 p-0.5">
                     <div style={{ width: `${track.progressPercentage}%` }} className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
                   </div>
                   <p className="text-[var(--text-secondary)] font-black text-[10px] uppercase tracking-widest italic opacity-60">
                     {Math.round(track.progressPercentage)}% Complete
                   </p>
                 </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              
              {/* Session Controls */}
              <div className="flex items-center gap-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] p-1.5 rounded-xl shadow-sm">
                 <div className="px-3">
                    <p className="text-[8px] font-black uppercase text-[var(--text-secondary)] tracking-widest leading-none mb-1 opacity-40 italic">Session</p>
                    <p className="text-lg font-black text-[var(--text-primary)] font-mono tracking-tight leading-none italic">{formatTime(seconds)}</p>
                 </div>
                 <div className="flex gap-1 border-l border-[var(--border-color)] pl-2">
                    <button 
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className={`p-2 rounded-lg transition-colors ${isTimerRunning ? 'bg-[var(--accent-color)] text-[var(--bg-primary)] shadow-lg shadow-[var(--accent-color)]/20' : 'bg-[var(--bg-primary)] text-[var(--accent-color)] hover:bg-[var(--bg-card)]'}`}
                      title={isTimerRunning ? "Pause Session" : "Start Session"}
                    >
                      {isTimerRunning ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                    </button>
                    <button onClick={() => { setSeconds(0); setIsTimerRunning(false); }} className="p-2 bg-[var(--bg-primary)] text-[var(--text-secondary)]/40 hover:text-[var(--text-secondary)] rounded-lg transition-colors border border-[var(--border-color)]" title="Reset Timer">
                      <RotateCcw size={16} />
                    </button>
                 </div>
              </div>

              {/* Menu Actions */}
              <div className="flex items-center gap-1.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] p-1.5 rounded-xl shadow-sm">
                <button 
                  onClick={handleSync} disabled={isSyncing}
                  className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition-colors disabled:opacity-50"
                  title="Save Notes"
                >
                  <RefreshCw size={16} className={isSyncing ? "animate-spin text-[var(--accent-color)]" : ""} />
                </button>
                <button onClick={async () => { await fetchTrack(track.id); openModal('DELETE'); }} className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors" title="Delete Path">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="space-y-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4 text-left">
            <div className="flex gap-8">
              <button 
                onClick={() => setActiveTab('BOARD')}
                className={`text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-colors italic ${activeTab === 'BOARD' ? 'text-[var(--accent-color)] border-b-2 border-[var(--accent-color)] pb-2 -mb-[18px]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] pb-2 -mb-[18px] opacity-60'}`}
              >
                <LayoutGrid size={16} /> Lessons
              </button>
              <button 
                onClick={() => setActiveTab('NOTES')}
                className={`text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-colors italic ${activeTab === 'NOTES' ? 'text-[var(--accent-color)] border-b-2 border-[var(--accent-color)] pb-2 -mb-[18px]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] pb-2 -mb-[18px] opacity-60'}`}
              >
                <Brain size={16} /> Study Notes
              </button>
              <button 
                onClick={() => setActiveTab('ANALYTICS')}
                className={`text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-colors italic ${activeTab === 'ANALYTICS' ? 'text-[var(--accent-color)] border-b-2 border-[var(--accent-color)] pb-2 -mb-[18px]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] pb-2 -mb-[18px] opacity-60'}`}
              >
                <Activity size={16} /> Insights
              </button>
            </div>

            {activeTab === 'BOARD' && (
              <div className="flex bg-[var(--bg-secondary)] border border-[var(--border-color)] p-1 rounded-xl shadow-inner self-start md:self-auto">
                <button 
                  onClick={() => setViewMode('KANBAN')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'KANBAN' ? 'bg-[var(--accent-color)] text-[var(--bg-primary)] shadow-sm' : 'text-[var(--text-secondary)]/40 hover:text-[var(--text-secondary)]'}`}
                >
                  <LayoutGrid size={16} />
                </button>
                <button 
                  onClick={() => setViewMode('LIST')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'LIST' ? 'bg-[var(--accent-color)] text-[var(--bg-primary)] shadow-sm' : 'text-[var(--text-secondary)]/40 hover:text-[var(--text-secondary)]'}`}
                >
                  <List size={16} />
                </button>
              </div>
            )}
          </div>

          <main className="pt-4 text-left">
            <AnimatePresence mode="wait">

              {activeTab === 'BOARD' && (
                <motion.div key="board" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {momentum?.isDrifting && momentum?.nudge && (
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-[2.5rem] p-8 mb-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden group">
                      <div className="transform-gpu absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
                      <div className="relative z-10 text-left">
                        <h3 className="text-rose-500 font-black text-xl italic uppercase tracking-tighter mb-2">{momentum.nudge.message}</h3>
                        <p className="text-[var(--text-secondary)] font-black text-xs uppercase tracking-widest italic opacity-60">{momentum.nudge.action}</p>
                      </div>
                      <button 
                        onClick={() => navigate(`/study/youtube/${trackId}/unit/${momentum.nudge?.unitId}`)}
                        className="px-8 py-4 bg-rose-500 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/20 italic active:scale-95 relative z-10"
                      >
                        Resume Learning
                      </button>
                    </div>
                  )}
    
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
                <motion.div key="notes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                   <div className="bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl rounded-[3rem] p-8 md:p-12 space-y-8 text-left">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="text-left">
                          <h3 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight italic leading-none">Path Notes</h3>
                          <p className="text-[10px] font-black text-[var(--text-secondary)] mt-2 uppercase tracking-widest italic opacity-40">Cross-path learning notes</p>
                        </div>
                        <button 
                          onClick={async () => {
                            setIsSaving(true);
                            setTimeout(() => { setIsSaving(false); toast.success("Notes updated"); }, 800);
                          }}
                          className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[var(--accent-color)] to-sky-600 text-[var(--bg-primary)] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-[var(--accent-color)]/20 italic"
                        >
                          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                          Save Notes
                        </button>
                      </div>
                      
                      <textarea 
                        className="w-full h-[500px] bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[2rem] p-8 font-black text-[var(--text-primary)] text-lg focus:border-[var(--accent-color)]/50 transition-all outline-none resize-none placeholder:text-[var(--text-secondary)]/20 italic uppercase tracking-tighter custom-scrollbar shadow-inner"
                        placeholder="Start taking notes for path structure..."
                        value={globalNotes}
                        onChange={(e) => setGlobalNotes(e.target.value)}
                      />
                   </div>
                </motion.div>
              )}

              {activeTab === 'ANALYTICS' && (
                <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-10 text-left">
                  
                  <div className="bg-[var(--bg-secondary)]/40 backdrop-blur-xl border border-[var(--border-color)] rounded-[3rem] p-4 shadow-sm">
                    <TrackHeader 
                      track={track as Track & { units: Unit[] }} 
                      stats={stats}
                      currentEnergy={energy}
                      onEnergySelect={(lvl) => setEnergy(lvl)}
                      onOptimize={() => planToday(track.id, energy)}
                    />
                  </div>


                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Momentum Graph */}
                    <div className="bg-[var(--bg-card)] p-8 rounded-[3rem] border border-[var(--border-color)] shadow-2xl col-span-full relative overflow-hidden group">
                      <div className="transform-gpu absolute top-0 right-0 w-96 h-96 bg-[var(--accent-color)]/5 rounded-full blur-[100px] pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
                      <div className="flex items-center justify-between mb-10 relative z-10 text-left">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-[var(--accent-color)]/10 text-[var(--accent-color)] rounded-xl border border-[var(--accent-color)]/20 shadow-sm"><Activity size={20} /></div>
                          <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] italic">Learning Momentum</h3>
                        </div>
                        <div className="text-right">
                          <span className="text-3xl font-black text-[var(--accent-color)] italic tracking-tighter leading-none">{momentum?.score || 0}%</span>
                          <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-3 italic opacity-40 leading-none">{momentum?.status || 'STEADY'}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center gap-3 relative z-10">
                        {momentum?.activity?.map((day: any, idx: number) => {
                          const minutes = Math.floor(day.seconds / 60);
                          let colorClass = "bg-[var(--bg-secondary)] border border-[var(--border-color)]";
                          if (minutes > 30) colorClass = "bg-[var(--accent-color)] border-[var(--accent-color)] shadow-[0_0_15px_var(--accent-color)]";
                          else if (minutes > 10) colorClass = "bg-[var(--accent-color)]/60 border-[var(--accent-color)]/20";
                          else if (minutes > 0) colorClass = "bg-[var(--accent-color)]/30 border-[var(--accent-color)]/10";
                          
                          return (
                            <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                              <div className={`w-full aspect-square rounded-lg border transition-all duration-500 ${colorClass}`} title={`${day.date}: ${minutes} mins`} />
                            </div>
                          );
                        })}
                      </div>
                    </div>
    
                    {/* Time Remaining Card */}
                    <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border-color)] shadow-xl relative overflow-hidden group text-left">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/20 shadow-sm"><Clock size={20} /></div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] italic">Time Remaining</h3>
                      </div>
                      <p className="text-4xl font-black text-[var(--text-primary)] italic tracking-tighter uppercase leading-none">{formatMins(track.remainingMinutes || 0)}</p>
                      <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest mt-4 opacity-40 leading-relaxed italic">Estimated watch time remaining in the mission.</p>
                    </div>

                    {/* Focus Session Card */}
                    <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border-color)] shadow-xl relative overflow-hidden group text-left">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-fuchsia-500/10 text-fuchsia-500 rounded-xl border border-fuchsia-500/20 shadow-sm"><TrendingUp size={20} /></div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] italic">Focus Session</h3>
                      </div>
                      {analytics?.longestUnit && (analytics.longestUnit.actualTimeSpentMinutes || 0) > 0 ? (
                        <>
                          <p className="text-xl font-black text-[var(--text-primary)] truncate mb-2 italic uppercase tracking-tighter" title={analytics.longestUnit.title}>{analytics.longestUnit.title}</p>
                          <p className="text-xs font-black text-fuchsia-500 italic uppercase leading-none">{analytics.longestUnit.actualTimeSpentMinutes} MIN LOGGED</p>
                        </>
                      ) : (
                        <p className="text-[10px] font-black text-[var(--text-secondary)] italic opacity-40 uppercase tracking-widest leading-none">No sessions logged yet.</p>
                      )}
                    </div>

                    {/* Priority Task Card */}
                    <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border-color)] shadow-xl relative overflow-hidden group text-left">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20 shadow-sm"><AlertCircle size={20} /></div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] italic">Priority Task</h3>
                      </div>
                      {analytics?.hardestUnit ? (
                        <>
                          <p className="text-xl font-black text-[var(--text-primary)] truncate mb-2 italic uppercase tracking-tighter" title={analytics.hardestUnit.title}>{analytics.hardestUnit.title}</p>
                          <p className="text-xs font-black text-amber-500 italic uppercase tracking-widest leading-none">Confidence: {analytics.hardestUnit.confidenceRating}/5</p>
                        </>
                      ) : (
                        <p className="text-[10px] font-black text-[var(--text-secondary)] italic opacity-40 uppercase tracking-widest leading-none">Rate confidence for insights.</p>
                      )}
                    </div>

                    {/* Understanding Level Card */}
                    <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border-color)] shadow-xl relative overflow-hidden group text-left">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20 shadow-sm"><Star size={20} /></div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] italic">Understanding Level</h3>
                      </div>
                      <p className="text-4xl font-black text-[var(--text-primary)] italic tracking-tighter leading-none">{analytics?.avgConfidence ? analytics.avgConfidence.toFixed(1) : "0.0"} <span className="text-xl text-[var(--text-secondary)] opacity-30 italic">/ 5</span></p>
                      <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest mt-4 opacity-40 italic">Avg comprehension across resolved units.</p>
                    </div>

                    {/* Learning Speed Card */}
                    <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border-color)] shadow-xl relative overflow-hidden group text-left">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl border border-indigo-500/20 shadow-sm"><Zap size={20} /></div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] italic">Learning Speed</h3>
                      </div>
                      <p className="text-4xl font-black text-[var(--text-primary)] italic tracking-tighter leading-none">{analytics?.studyMultiplier}X</p>
                      <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest mt-4 opacity-40 italic">Study vs Learning time.</p>
                    </div>

                    {/* Category Map Card */}
                    <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border-color)] shadow-xl relative overflow-hidden group text-left">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-sky-500/10 text-sky-500 rounded-xl border border-sky-500/20 shadow-sm"><PieChart size={20} /></div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] italic">Category Map</h3>
                      </div>
                      {analytics?.counts && (
                        <>
                           <p className="text-3xl font-black text-[var(--text-primary)] mb-3 italic uppercase tracking-tighter leading-none">{analytics.counts.completed} Completed</p>
                           <div className="flex gap-5 text-[10px] font-black uppercase tracking-widest italic leading-none">
                             <span className="text-sky-500">{analytics.counts.active} Active</span>
                             <span className="text-[var(--text-secondary)] opacity-40">{analytics.counts.backlog} Queued</span>
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
