//apps/desktop/src/features/study/views/DesktopTracksView.tsx
import React, { useState, useEffect } from 'react';
import { useStudy } from '@planner/study-core';
import { KanbanBoard } from '@planner/study-ui-web';
import { Layers, Plus, Hash, Search, Zap, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function DesktopTracksView() {
  const { tracks, fetchDashboard, openModal } = useStudy();
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'GRID' | 'FEED'>('GRID');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const allUnits = React.useMemo(() => {
    return tracks.flatMap(t => t.units || []);
  }, [tracks]);

  const filteredTracks = tracks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
      <header className="px-8 py-8 bg-white border-b border-slate-100 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              Study Hub
              <span className="text-[10px] bg-rose-50 text-rose-600 px-3 py-1 rounded-full uppercase tracking-widest border border-rose-100">
                {tracks.length} Vectors Active
              </span>
            </h1>
            <p className="text-slate-500 font-medium mt-1">Manage your knowledge ingestion paths.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search tracks..." 
                className="bg-slate-50 border-slate-100 rounded-2xl py-2.5 pl-11 pr-4 text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-rose-500/20 w-64 transition-all focus:bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={() => openModal('CREATE')}
              className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-2xl font-black text-sm hover:bg-rose-600 transition-all shadow-lg shadow-slate-200 active:scale-95"
            >
              <Plus size={18} />
              New Track
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 mt-8 p-1 bg-slate-50 rounded-xl w-fit border border-slate-100">
          <button 
            onClick={() => setView('GRID')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${view === 'GRID' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            All Tracks
          </button>
          <button 
            onClick={() => setView('FEED')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${view === 'FEED' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Global Feed
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-8">
        {view === 'GRID' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTracks.map(track => (
              <TrackCard 
                key={track.id} 
                track={track} 
                onClick={() => navigate(`/study/${track.id}`)} 
              />
            ))}
          </div>
        ) : (
          <div className="h-full">
            <KanbanBoard 
              units={allUnits} 
              onAction={(type, unit) => console.log(type, unit)}
              onDragEnd={() => {}} 
            />
          </div>
        )}
      </main>
    </div>
  );
}

function TrackCard({ track, onClick }: { track: any, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="group bg-white border border-slate-100 p-8 rounded-[2.5rem] text-left transition-[transform,box-shadow,border-color] duration-300 hover:shadow-2xl hover:shadow-rose-200/40 hover:-translate-y-2 relative overflow-hidden will-change-transform"
    >
      {/* Background Neural Pattern */}
      <div className="absolute top-0 right-0 p-8 text-slate-50 group-hover:text-rose-50/50 transition-colors duration-500">
        <Hash size={64} strokeWidth={3} />
      </div>

      {/* Decorative Gradient Glow */}
      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl group-hover:bg-rose-500/10 transition-colors" />
      
      <div className="relative z-10 space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-rose-600 group-hover:text-white group-hover:rotate-6 transition-all duration-500 shadow-sm">
          <Layers size={28} />
        </div>
        
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-rose-600 transition-colors duration-300">
            {track.title}
          </h3>
          <p className="text-slate-500 text-sm font-medium line-clamp-2 mt-2 leading-relaxed">
            {track.description || 'Systematic knowledge ingestion active.'}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Neural Link Progress</span>
            <span className="text-sm font-black text-rose-600">{Math.round(track.progressPercentage)}%</span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-50">
            <div 
              className="h-full bg-slate-900 rounded-full transition-all duration-1000 ease-out group-hover:bg-rose-600" 
              style={{ width: `${track.progressPercentage}%` }} 
            />
          </div>
        </div>

        <div className="pt-4 flex items-center justify-between border-t border-slate-50 group-hover:border-rose-50 transition-colors">
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
               {track.units?.length || 0} Synaptic Nodes
             </span>
           </div>
           <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-rose-600 group-hover:text-white transition-all duration-300">
             <ArrowRight size={20} className="-rotate-45 group-hover:rotate-0 transition-transform duration-500" />
           </div>
        </div>
      </div>
    </button>
  );
}
