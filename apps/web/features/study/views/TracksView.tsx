//apps/web/features/study/views/TracksView.tsx
"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Youtube, LayoutGrid, Search, Loader2, Clock, CheckCircle, ArrowRight, History, Calendar, TrendingUp, Info, List } from 'lucide-react';
import { toast } from 'sonner';
import { useStudy, Track, studyApi, Unit } from '@planner/study-core';
import { 
  ReviewList, 
  TrackCard 
} from '@planner/study-ui-web';

export function TracksView() {
  const { tracks, dashboard, loading, fetchDashboard, openModal, deleteTrack } = useStudy();
  const [commandValue, setCommandValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewMode, setViewMode] = useState<'GRID' | 'DETAILED'>('GRID');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { 
    setMounted(true);
    fetchDashboard(); 
  }, [fetchDashboard]);

  const filteredTracks = useMemo(() => {
    if (!commandValue || commandValue.startsWith('http')) return tracks;
    return tracks.filter(t => t.title.toLowerCase().includes(commandValue.toLowerCase()));
  }, [tracks, commandValue]);

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandValue) return;

    setIsProcessing(true);
    try {
      if (commandValue.startsWith('http')) {
        const data = await studyApi.importPlaylist(commandValue) as { error?: string };
        if (data.error) throw new Error(data.error);
        toast.success('Course imported successfully');
      } else {
        await studyApi.createTrack({ 
          title: commandValue, 
          type: 'MANUAL',
          description: 'Added from dashboard'
        });
        toast.success('New track created');
      }
      setCommandValue('');
      fetchDashboard();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Action failed';
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!mounted) return null;

  if (loading && !dashboard) return (
    <div className="flex items-center justify-center min-h-[60vh] bg-[#0a0105] w-full">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-rose-500 animate-spin drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
        <div className="text-rose-300/50 font-bold uppercase tracking-widest text-xs">Loading Command Center...</div>
      </div>
    </div>
  );

  return (
    <div className="relative w-full min-h-screen bg-[#0a0105] text-rose-100 selection:bg-rose-500/30 selection:text-white font-sans overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 w-200 h-150 bg-rose-600/5 rounded-full blur-[150px] -translate-x-1/2 pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto space-y-12 pt-6 pb-24 px-6 md:px-10 animate-in fade-in duration-1000">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between md:items-center gap-8 border-b border-rose-900/40 pb-8">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-rose-50 tracking-tighter uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">Upgrade OS</h1>
              <span className="bg-rose-500/20 text-rose-400 text-[10px] font-black px-2 py-0.5 rounded border border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.2)]">V2.5</span>
            </div>
            <p className="text-rose-500/60 font-black uppercase tracking-[0.3em] text-[10px] flex items-center gap-2 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse drop-shadow-[0_0_5px_rgba(244,63,94,0.8)]" />
              Neural Command Center & Cognitive Optimizer
            </p>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => fetchDashboard()} 
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#14030b] text-rose-200/80 border border-rose-900/50 font-black text-[10px] uppercase tracking-widest hover:bg-[#1c0510] hover:border-rose-500/50 transition-all hover:shadow-[0_0_15px_rgba(244,63,94,0.15)] active:scale-95"
            >
              <History size={14} className="text-rose-400" /> Weekly Sync
            </button>
            <button 
              onClick={() => openModal('REFLECTION')} 
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#14030b] text-rose-200/80 border border-rose-900/50 font-black text-[10px] uppercase tracking-widest hover:bg-[#1c0510] hover:border-rose-500/50 transition-all hover:shadow-[0_0_15px_rgba(244,63,94,0.15)] active:scale-95"
            >
              <Calendar size={14} className="text-rose-400" /> Import
            </button>
          </div>
        </header>

        {/* Unified Command Bar */}
        <section className="relative group">
          <form onSubmit={handleCommand} className="relative z-10 flex items-center gap-4 bg-[#14030b] p-2 rounded-2xl border border-rose-900/40 focus-within:border-rose-500/50 focus-within:ring-4 focus-within:ring-rose-500/10 transition-all shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
            <div className="flex-1 flex items-center gap-4 pl-6">
              {commandValue.startsWith('http') ? (
                <Youtube className="text-rose-500 animate-pulse drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]" size={20} />
              ) : (
                <Search className="text-rose-500/40 group-focus-within:text-rose-400 transition-colors" size={20} />
              )}
              <input 
                type="text" 
                placeholder="NEURAL_INPUT: PASTE_URL OR TYPE_COMMAND..." 
                className="w-full bg-transparent border-none py-4 font-bold text-rose-100 focus:outline-none placeholder:text-rose-500/30 uppercase tracking-widest text-xs" 
                value={commandValue} 
                onChange={e => setCommandValue(e.target.value)}
                disabled={isProcessing}
              />
            </div>
            <button 
              type="submit" 
              disabled={!commandValue || isProcessing}
              className={`px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                !commandValue || isProcessing 
                  ? 'bg-[#1c0510] text-rose-50/30 border border-transparent' 
                  : 'bg-linear-to-r from-rose-600 to-pink-600 text-white hover:from-rose-500 hover:to-pink-500 shadow-[0_0_15px_rgba(244,63,94,0.4)] hover:shadow-[0_0_25px_rgba(244,63,94,0.6)] border border-rose-400/50 active:scale-95'
              }`}
            >
              {isProcessing ? <Loader2 className="animate-spin" size={16} /> : 'Execute'}
            </button>
          </form>
        </section>

        {/* Global Performance Overview */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#14030b] border border-rose-900/40 p-8 rounded-4xl relative overflow-hidden group hover:border-rose-500/30 transition-colors shadow-black/40">
            <div className="absolute top-0 right-0 p-8 opacity-5 text-rose-500 group-hover:scale-110 transition-transform duration-700 group-hover:opacity-10 pointer-events-none">
              <TrendingUp size={120} />
            </div>
            <div className="relative z-10 space-y-6">
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-rose-400/50 text-center">Optimized Progress</p>
              <div className="flex justify-center">
                 <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-[#2a081a]" />
                      <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={377} strokeDashoffset={377 - (377 * Math.round(tracks.reduce((acc, t) => acc + t.progressPercentage, 0) / Math.max(1, tracks.length))) / 100} className="text-rose-500 drop-shadow-[0_0_12px_rgba(244,63,94,0.6)] transition-all duration-1000" />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-3xl font-black text-rose-50 tracking-tighter">{Math.round(tracks.reduce((acc, t) => acc + t.progressPercentage, 0) / Math.max(1, tracks.length))}%</span>
                      <span className="text-[8px] font-black text-rose-400/60 uppercase tracking-widest mt-1">Optimized</span>
                    </div>
                 </div>
              </div>
              <div className="space-y-1 text-center">
                 <p className="text-xs font-black text-rose-100 uppercase tracking-widest">Neural Stability</p>
                 <p className="text-[9px] text-rose-200/40 font-bold leading-relaxed">Cognitive resource allocation within recommended parameters.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <StatCard icon={<TrendingUp size={14} />} label="Day Streak" value={dashboard?.streak?.toString() || '0'} color="rose" />
             <StatCard icon={<Clock size={14} />} label="Study Time" value={`${Math.round(tracks.reduce((acc, t) => acc + (t.units?.reduce((sum, u) => sum + (u.actualTimeSpentMinutes || 0), 0) || 0), 0) / 60)}h`} color="purple" />
             <StatCard icon={<Info size={14} />} label="Efficiency" value="High" color="purple" />
             <StatCard icon={<History size={14} />} label="Last Sync" value="Today" color="purple" />
          </div>

          <div className="bg-[#14030b] border border-rose-900/40 p-8 rounded-4xl relative overflow-hidden group hover:border-rose-500/30 transition-colors shadow-black/40">
            <div className="relative z-10 space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-rose-400/50">Cognitive Load</p>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse drop-shadow-[0_0_5px_rgba(244,63,94,0.8)]" />
                  <span className="text-[8px] font-black text-rose-300/60 uppercase tracking-widest">Active</span>
                </div>
              </div>
              
              <div className="flex justify-between items-end h-24 gap-1.5">
                {[...Array(14)].map((_, i) => {
                  const dayHeight = mounted ? Math.max(20, Math.random() * 100) : 30; 
                  return (
                    <div key={i} className="flex-1 flex flex-col justify-end gap-1 group/bar">
                      <div 
                        className="w-full bg-[#2a081a] rounded-t-sm transition-all hover:bg-rose-500/50 relative overflow-hidden border-x border-t border-rose-900/30"
                        style={{ height: `${dayHeight}%` }}
                      >
                        {dayHeight > 60 && <div className="absolute inset-x-0 top-0 h-1.5 bg-rose-500 blur-[2px]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-[9px] font-black text-rose-500/30 uppercase tracking-[0.2em] text-right">Neural Variance / 14D</p>
            </div>
          </div>
        </section>

        {/* Daily Pulse: Next Lesson & Reviews */}
        {dashboard && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
             {/* Primary Focus Card */}
             <div className="lg:col-span-7 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-4 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                  <h2 className="text-[10px] font-black text-rose-300/50 uppercase tracking-[0.3em]">Neural Priority Vector</h2>
                </div>
                {dashboard.globalNextUnit ? (
                  <div className="flex-1 bg-linear-to-br from-[#1c0510] to-[#0a0105] border border-rose-500 rounded-[2.5rem] p-10 relative overflow-hidden group shadow-[0_0_40px_rgba(244,63,94,0.15)]">
                    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-linear-to-t from-rose-500/10 to-transparent pointer-events-none" />
                    <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col h-full justify-between gap-10">
                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                          <span className="text-[8px] font-black bg-rose-500/20 text-rose-300 px-3 py-1.5 rounded-lg uppercase tracking-[0.2em] border border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.1)]">Priority Vector</span>
                          <span className="text-[8px] font-black text-rose-300/60 uppercase tracking-[0.2em]">{tracks.find(t => t.id === dashboard.globalNextUnit?.trackId)?.title || 'Your Track'}</span>
                        </div>
                        <h3 className="text-4xl md:text-5xl font-black text-white leading-[0.9] tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                          {dashboard.globalNextUnit.title}
                        </h3>
                        <p className="text-rose-200/70 text-sm leading-relaxed max-w-xl line-clamp-3 font-bold">
                          {dashboard.globalNextUnit.description || "System ready for optimization. Initialize cognitive upload to proceed with this learning module."}
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-6">
                        <button 
                          onClick={() => openModal('SESSION', (dashboard.globalNextUnit as unknown as Unit), 'STUDY')}
                          className="bg-linear-to-r from-rose-500 to-pink-600 text-white px-8 py-4 rounded-4xl font-black text-[10px] uppercase tracking-[0.2em] hover:from-rose-400 hover:to-pink-500 transition-all flex items-center gap-3 shadow-[0_0_20px_rgba(244,63,94,0.4)] hover:shadow-[0_0_30px_rgba(244,63,94,0.6)] border border-rose-400/50 active:scale-95"
                        >
                          Resume Optimization <ArrowRight size={16} />
                        </button>
                        <div className="flex items-center gap-6">
                           <div className="flex flex-col">
                              <span className="text-[8px] font-black text-rose-400/50 uppercase tracking-widest">Next</span>
                              <span className="text-[10px] font-black text-rose-100 uppercase">Video Focus</span>
                           </div>
                           <div className="w-px h-8 bg-rose-900/40" />
                           <div className="flex flex-col">
                              <span className="text-[8px] font-black text-rose-400/50 uppercase tracking-widest">Duration</span>
                              <span className="text-[10px] font-black text-rose-100 uppercase">{(dashboard.globalNextUnit as { durationMinutes?: number }).durationMinutes || 0}m</span>
                           </div>
                           {dashboard.globalNextUnit.todayGoalMinutes && (
                             <>
                               <div className="w-px h-8 bg-rose-900/40" />
                               <div className="flex flex-col">
                                  <span className="text-[8px] font-black text-amber-400/50 uppercase tracking-widest">Today's Goal</span>
                                  <span className="text-[10px] font-black text-amber-400 uppercase">{dashboard.globalNextUnit.todayGoalMinutes}m</span>
                               </div>
                             </>
                           )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 bg-[#14030b] border border-dashed border-rose-900/50 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center">
                    <CheckCircle className="text-rose-500/20 mb-4" size={48} />
                    <p className="font-black text-[10px] text-rose-300/50 uppercase tracking-widest">All caught up! Add a new track to continue.</p>
                  </div>
                )}
             </div>
             
             {/* Actionable Review Section */}
             <div className="lg:col-span-5 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-4 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                  <h2 className="text-[10px] font-black text-rose-300/50 uppercase tracking-[0.3em]">Review Pipeline</h2>
                </div>
                <div className="flex-1 bg-[#14030b] border border-rose-900/40 shadow-lg shadow-black/20 rounded-[2.5rem] p-8 relative overflow-hidden">
                  <div className="absolute top-6 right-8 px-3 py-1.5 bg-[#1c0510] border border-rose-500/30 rounded-full shadow-sm shadow-black/20">
                     <span className="text-[8px] font-black text-rose-400 uppercase tracking-widest">{dashboard.dueRevisions?.length || 0} Critical</span>
                  </div>
                  <ReviewList revisions={dashboard.dueRevisions} />
                </div>
             </div>
          </div>
        )}

        {/* Track List Section */}
        <section className="space-y-8 pt-8 border-t border-rose-900/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#1c0510] text-rose-400 rounded-2xl shadow-[0_0_15px_rgba(244,63,94,0.1)] border border-rose-500/20">
                <LayoutGrid size={20} />
              </div>
              <h2 className="text-xl font-black text-rose-50 tracking-tighter uppercase drop-shadow-sm">Active Learning Tracks</h2>
            </div>
            
            <div className="flex bg-[#14030b] p-1 rounded-xl border border-rose-900/50">
              <button 
                onClick={() => setViewMode('GRID')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'GRID' ? 'bg-linear-to-r from-rose-600 to-pink-600 text-white shadow-[0_0_10px_rgba(244,63,94,0.4)]' : 'text-rose-400/40 hover:text-rose-200'}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('DETAILED')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'DETAILED' ? 'bg-linear-to-r from-rose-600 to-pink-600 text-white shadow-[0_0_10px_rgba(244,63,94,0.4)]' : 'text-rose-400/40 hover:text-rose-200'}`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
          
          {viewMode === 'GRID' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTracks.map((track: Track) => (
                <TrackCard 
                  key={track.id} 
                  track={track} 
                  onDelete={deleteTrack} 
                />
              ))}
              <button 
                onClick={() => openModal('CREATE')}
                className="group h-full min-h-75 bg-[#14030b] border-2 border-dashed border-rose-900/50 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 hover:bg-[#1c0510] hover:border-rose-500/50 transition-all active:scale-95 shadow-lg shadow-black/20"
              >
                <div className="p-5 bg-[#1c0510] rounded-2xl text-rose-500/40 group-hover:text-rose-400 group-hover:rotate-90 transition-all border border-rose-900/50 group-hover:border-rose-500/40 group-hover:shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                  <Plus size={32} />
                </div>
                <span className="text-[10px] font-black text-rose-500/50 uppercase tracking-[0.3em] group-hover:text-rose-400">Initialize New Track</span>
              </button>
            </div>
          ) : (
            <div className="bg-[#14030b] border border-rose-900/40 rounded-[2.5rem] overflow-hidden shadow-2xl overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#0a0105] border-b border-rose-900/40">
                    <th className="px-8 py-6 text-[9px] font-black text-rose-400/50 uppercase tracking-[0.3em]">Course Identifier</th>
                    <th className="px-8 py-6 text-[9px] font-black text-rose-400/50 uppercase tracking-[0.3em]">Optimization</th>
                    <th className="px-8 py-6 text-[9px] font-black text-rose-400/50 uppercase tracking-[0.3em]">Remaining</th>
                    <th className="px-8 py-6 text-[9px] font-black text-rose-400/50 uppercase tracking-[0.3em]">Energy Effort</th>
                    <th className="px-8 py-6 text-[9px] font-black text-rose-400/50 uppercase tracking-[0.3em] text-right">Access</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-900/40">
                  {filteredTracks.map(track => {
                    const studyTime = track.units?.reduce((sum, u) => sum + (u.actualTimeSpentMinutes || 0), 0) || 0;
                    return (
                      <tr key={track.id} className="hover:bg-rose-500/5 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="font-black text-rose-50 group-hover:text-rose-400 transition-colors cursor-pointer uppercase tracking-tight" onClick={() => (window.location.href = `/dashboard/study/${track.id}`)}>{track.title}</span>
                            <span className="text-[8px] font-black text-rose-500/60 uppercase tracking-widest mt-1">{track.type}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <span className="font-black text-xs text-rose-200 w-8">{Math.round(track.progressPercentage)}%</span>
                            <div className="w-32 h-1.5 bg-[#1c0510] rounded-full overflow-hidden border border-rose-900/50">
                              <div className="h-full bg-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]" style={{ width: `${track.progressPercentage}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2 text-rose-300/80 font-bold text-xs uppercase tracking-tighter">
                            <Clock size={12} className="text-rose-500 drop-shadow-[0_0_5px_rgba(244,63,94,0.5)]" />
                            {Math.ceil((track.remainingMinutes || 0) / 60)}H LEFT
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2 text-rose-300/80 font-bold text-xs uppercase tracking-tighter">
                            <TrendingUp size={12} className="text-fuchsia-500 drop-shadow-[0_0_5px_rgba(217,70,239,0.5)]" />
                            {Math.round(studyTime / 60)}H SPENT
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button 
                            onClick={() => (window.location.href = `/dashboard/study/${track.id}`)}
                            className="p-3 bg-[#1c0510] text-rose-200 rounded-xl hover:bg-rose-500 hover:text-white hover:shadow-[0_0_15px_rgba(244,63,94,0.4)] transition-all border border-rose-900/50 active:scale-95"
                          >
                            <ArrowRight size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: 'rose' | 'purple' }) {
  return (
    <div className="bg-[#14030b] border border-rose-900/40 p-6 rounded-2xl flex flex-col justify-between group hover:border-rose-500/30 transition-colors shadow-black/40">
       <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color === 'rose' ? 'bg-[#1c0510] border border-rose-500/20 text-rose-500' : 'bg-[#1c0510] border border-fuchsia-500/20 text-fuchsia-500'} mb-4 group-hover:scale-110 transition-transform group-hover:shadow-[0_0_10px_rgba(244,63,94,0.2)]`}>
          {icon}
       </div>
       <div className="space-y-1">
          <p className="text-[20px] font-black text-rose-50 tracking-tighter">{value}</p>
          <p className="text-[8px] font-black text-rose-400/60 uppercase tracking-[0.2em]">{label}</p>
       </div>
    </div>
  );
}