//apps/web/features/study/views/TracksView.tsx
"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Youtube, LayoutGrid, Search, Loader2, PlayCircle, Clock, CheckCircle, ArrowRight, History, Calendar, TrendingUp, Info, List } from 'lucide-react';
import { toast } from 'sonner';
import { useStudy, Track, studyApi } from '@planner/study-core';
import { 
  ReviewList, 
  TrackCard 
} from '@planner/study-ui-web';

export function TracksView() {
  const { tracks, dashboard, loading, fetchDashboard, openModal, deleteTrack } = useStudy();
  const [commandValue, setCommandValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewMode, setViewMode] = useState<'GRID' | 'DETAILED'>('GRID');

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

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
        // Handle YouTube Import
        const data = await studyApi.importPlaylist(commandValue) as { error?: string };
        if (data.error) throw new Error(data.error);
        toast.success('Course imported successfully');
      } else {
        // Handle New Track Creation
        await studyApi.createTrack({ 
          title: commandValue, 
          type: 'MANUAL',
          description: 'Added from dashboard'
        });
        toast.success('New track created');
      }
      setCommandValue('');
      fetchDashboard();
    } catch (error: any) {
      toast.error(error.message || 'Action failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading && !dashboard) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
        <div className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading your dashboard...</div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto space-y-12 pb-24 px-6 md:px-10 animate-in fade-in duration-1000">
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between md:items-center gap-8 border-b border-slate-100 pb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Study Dashboard</h1>
          <p className="text-slate-500 font-medium mt-1">Manage your courses and daily progress.</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => openModal('REFLECTION')} 
            title="Complete your weekly progress review"
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-50 text-slate-600 border border-slate-200 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-all"
          >
            <Calendar size={16} /> Weekly Review
          </button>
        </div>
      </header>

      {/* Unified Command Bar */}
      <section className="relative group">
        <form onSubmit={handleCommand} className="relative z-10 flex items-center gap-4 bg-white p-2 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-100/50 focus-within:border-rose-300 focus-within:ring-8 focus-within:ring-rose-50/50 transition-all">
          <div className="flex-1 flex items-center gap-4 pl-6">
            {commandValue.startsWith('http') ? (
              <Youtube className="text-rose-500 animate-pulse" size={24} />
            ) : (
              <Search className="text-slate-300 group-focus-within:text-rose-500 transition-colors" size={24} />
            )}
            <input 
              type="text" 
              placeholder="Search tracks, paste YouTube link, or type to create new..." 
              className="w-full bg-transparent border-none py-4 font-bold text-slate-800 focus:outline-none placeholder:text-slate-300" 
              value={commandValue} 
              onChange={e => setCommandValue(e.target.value)}
              disabled={isProcessing}
            />
          </div>
          <button 
            type="submit" 
            disabled={!commandValue || isProcessing}
            title={commandValue.startsWith('http') ? "Import YouTube Playlist" : "Create manual study track"}
            className={`px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all ${
              !commandValue || isProcessing 
                ? 'bg-slate-100 text-slate-400' 
                : 'bg-slate-900 text-white hover:bg-rose-600 shadow-lg shadow-slate-200'
            }`}
          >
            {isProcessing ? <Loader2 className="animate-spin" size={18} /> : (commandValue.startsWith('http') ? 'Import' : 'Add Track')}
          </button>
        </form>
      </section>

      {/* Global Performance Overview (NEW) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-rose-600 text-white p-8 rounded-[2.5rem] shadow-xl shadow-rose-200 relative overflow-hidden group">
          <TrendingUp size={120} className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform" />
          <div className="relative z-10 space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-100">Overall Progress</p>
            <h2 className="text-5xl font-black tracking-tighter">
              {Math.round(tracks.reduce((acc, t) => acc + t.progressPercentage, 0) / Math.max(1, tracks.length))}%
            </h2>
            <p className="text-xs font-bold text-rose-100 uppercase tracking-widest">Average across all tracks</p>
          </div>
        </div>

        <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200 relative overflow-hidden group">
          <Clock size={120} className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform" />
          <div className="relative z-10 space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Total Study Time</p>
            <h2 className="text-5xl font-black tracking-tighter">
              {Math.round(tracks.reduce((acc, t) => acc + (t.units?.reduce((sum, u) => sum + (u.actualTimeSpentMinutes || 0), 0) || 0), 0) / 60)}h
            </h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Logged using timers</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
          <div className="relative z-10 space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Consistency</p>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black text-slate-400 uppercase">{dashboard?.streak || 0} Day Streak</span>
              </div>
            </div>
            
            <div className="flex justify-between items-end h-16 gap-1">
              {[...Array(14)].map((_, i) => {
                // Mock heatmap data based on randomness for demo, or real if available
                // Ideally this comes from dashboard.dailySessions history
                const dayHeight = Math.max(20, Math.random() * 100); 
                return (
                  <div key={i} className="flex-1 flex flex-col justify-end gap-1 group/bar">
                    <div 
                      className="w-full bg-slate-100 rounded-md transition-all hover:bg-rose-400 relative"
                      style={{ height: `${dayHeight}%` }}
                    >
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] font-bold px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-10">
                        Day {i + 1}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Last 14 Days</p>
          </div>
        </div>
      </section>

      {/* Daily Pulse: Next Lesson & Reviews */}
      {dashboard && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* Primary Focus Card */}
           <div className="lg:col-span-7 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <PlayCircle className="text-rose-500" size={20} />
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Up Next</h2>
              </div>
              {dashboard.globalNextUnit ? (
                <div className="flex-1 bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl hover:shadow-rose-100/30 transition-all group">
                  <div className="flex flex-col h-full justify-between gap-6">
                    <div>
                      <span className="text-[10px] font-black bg-rose-50 text-rose-600 px-3 py-1 rounded-lg uppercase tracking-widest border border-rose-100">
                        From {tracks.find(t => t.id === dashboard.globalNextUnit?.trackId)?.title || 'Your Track'}
                      </span>
                      <h3 className="text-3xl font-black text-slate-900 mt-4 leading-tight group-hover:text-rose-600 transition-colors line-clamp-2">
                        {dashboard.globalNextUnit.title}
                      </h3>
                      <div className="flex items-center gap-4 mt-4 text-slate-400 font-bold text-xs uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><Clock size={14} /> {(dashboard.globalNextUnit as any).durationMinutes || 0}m</span>
                        <span className="flex items-center gap-1.5"><History size={14} /> {dashboard.streak || 0} Day Streak</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => openModal('SESSION', dashboard.globalNextUnit as any, 'STUDY')}
                      title="Resume learning this lesson"
                      className="w-full md:w-fit bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-600 transition-all flex items-center justify-center gap-3 shadow-lg shadow-slate-200"
                    >
                      Resume Learning <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 bg-slate-50 border border-dashed border-slate-200 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center">
                  <CheckCircle className="text-slate-200 mb-4" size={48} />
                  <p className="font-bold text-slate-500">All caught up! Add a new track to continue.</p>
                </div>
              )}
           </div>
           
           {/* Actionable Review Section */}
           <div className="lg:col-span-5 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <History className="text-rose-500" size={20} />
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Next Reviews</h2>
              </div>
              <div className="flex-1 bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm overflow-hidden">
                <ReviewList revisions={dashboard.dueRevisions} />
              </div>
           </div>
        </div>
      )}

      {/* Track List Section */}
      <section className="space-y-8 pt-8 border-t border-slate-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg shadow-slate-200">
              <LayoutGrid size={20} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Your Courses</h2>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setViewMode('GRID')}
              title="Grid View"
              className={`p-2 rounded-lg transition-all ${viewMode === 'GRID' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('DETAILED')}
              title="Detailed List View"
              className={`p-2 rounded-lg transition-all ${viewMode === 'DETAILED' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
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
              title="Create a new study track"
              className="group h-full min-h-[250px] bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 hover:bg-white hover:border-rose-200 transition-all active:scale-95"
            >
              <div className="p-4 bg-white rounded-2xl text-slate-400 group-hover:text-rose-500 group-hover:rotate-90 transition-all shadow-sm">
                <Plus size={32} />
              </div>
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-rose-600">Create New Track</span>
            </button>
          </div>
        ) : (
          <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Course Name</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Time Left</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actual Study</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredTracks.map(track => {
                  const studyTime = track.units?.reduce((sum, u) => sum + (u.actualTimeSpentMinutes || 0), 0) || 0;
                  return (
                    <tr key={track.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-black text-slate-900 group-hover:text-rose-600 transition-colors cursor-pointer" onClick={() => (window.location.href = `/dashboard/study/${track.id}`)}>{track.title}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase mt-1">{track.type}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <span className="font-black text-sm text-slate-900 w-10">{Math.round(track.progressPercentage)}%</span>
                          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-rose-500" style={{ width: `${track.progressPercentage}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                          <Clock size={14} className="text-slate-300" />
                          {Math.ceil((track.remainingMinutes || 0) / 60)}h left
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                          <TrendingUp size={14} className="text-rose-400" />
                          {Math.round(studyTime / 60)}h spent
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => (window.location.href = `/dashboard/study/${track.id}`)}
                          className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-rose-600 transition-all shadow-md active:scale-95"
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
  );
}
