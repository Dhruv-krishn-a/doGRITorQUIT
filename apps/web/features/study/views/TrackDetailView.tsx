"use client";

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Settings, Trash2, Share2, RefreshCw, Loader2, LayoutGrid, List } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useStudy, EnergyLevel, Unit, UnitStatus } from '@planner/study-core';
import { 
  TrackHeader, 
  KanbanBoard,
  UnitCard
} from '@planner/study-ui-web';

interface DragResult {
  draggableId: string;
  destination?: {
    droppableId: string;
    index: number;
  } | null;
}

export function TrackDetailView() {
  const params = useParams();
  const router = useRouter();
  const trackId = Array.isArray(params.trackId) ? params.trackId[0] : params.trackId;
  
  const { fetchTrack, syncTrack, activeTrack, loading, openModal, moveUnit, planToday } = useStudy();
  const [energy, setEnergy] = useState<EnergyLevel>('MEDIUM');
  const [isSyncing, setIsSyncing] = useState(false);
  const [viewMode, setViewMode] = useState<'KANBAN' | 'LIST'>('KANBAN');

  useEffect(() => {
    if (trackId) {
      fetchTrack(trackId);
    }
  }, [trackId, fetchTrack]);

  useEffect(() => {
    if (activeTrack && activeTrack.track && !activeTrack.track.dailyAllocationMinutes) {
      openModal('COMMIT');
    }
  }, [activeTrack, openModal]);

  const handleSync = async () => {
    if (!trackId) return;
    setIsSyncing(true);
    await syncTrack(trackId);
    setIsSyncing(false);
  };

  const handleAction = (type: 'SESSION' | 'TIMER' | 'COMPLETE', unit: Unit) => {
    if (type === 'SESSION') {
      router.push(`/dashboard/study/${trackId}/unit/${unit.id}`);
    } else if (type === 'TIMER') {
      router.push(`/dashboard/study/${trackId}/unit/${unit.id}?layout=FULL_NOTES&autostart=true`);
    } else if (type === 'COMPLETE') {
      openModal('SESSION', unit, 'LOGS');
    }
  };

  const handleDragEnd = async (result: DragResult) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    
    // Trigger completion modal if moved to Done or Revise
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
        // Refresh track to update timeline/stats immediately
        if (trackId) fetchTrack(trackId);
        toast.success("Timeline updated");
      } catch (error) {
        console.error("Failed to update unit status:", error);
      }
    }
  };

  if (loading && !activeTrack) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
        <div className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading course...</div>
      </div>
    </div>
  );

  if (!activeTrack) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <div className="text-slate-400 font-bold uppercase tracking-widest text-sm">Course not found.</div>
      <button onClick={() => router.push('/dashboard/study')} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest">Back to Dashboard</button>
    </div>
  );

  return (
    <div className="flex-1 min-w-0 relative space-y-12 text-slate-900 pb-24 w-full px-4 md:px-8">
      <div className="fixed top-0 right-0 w-96 h-96 bg-rose-50/50 rounded-full blur-[120px] -z-10 pointer-events-none opacity-50" />
      
      <header className="flex flex-col gap-10 w-full pt-10">
        <div className="flex flex-col md:flex-row md:items-center gap-8 w-full">
          <button 
            onClick={() => router.push('/dashboard/study')} 
            className="p-5 bg-white border border-rose-100 rounded-3xl text-slate-400 hover:text-rose-600 hover:border-rose-200 transition-all shadow-sm active:scale-95 shrink-0 self-start"
          >
            <ArrowLeft size={28} />
          </button>
          <div className="flex-1 min-w-0">
             <div className="flex items-center gap-4 mb-2">
               <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight truncate">
                 {activeTrack.track.title}
               </h1>
               <span className="text-[10px] font-black bg-slate-900 text-white px-3 py-1 rounded-lg uppercase tracking-widest shrink-0">
                 {activeTrack.track.type === 'PLAYLIST' ? 'Course' : 'Manual'}
               </span>
             </div>
             <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] opacity-60">
               {activeTrack.track.description || 'Active learning track.'}
             </p>
          </div>
          <div className="flex flex-wrap gap-4 shrink-0">
            {activeTrack.track.type === 'PLAYLIST' && (
              <button 
                onClick={handleSync}
                disabled={isSyncing}
                className="flex items-center gap-2 px-6 py-4 bg-white border border-slate-100 rounded-3xl text-slate-600 hover:text-rose-600 font-black text-[10px] uppercase tracking-widest transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                {isSyncing ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                {isSyncing ? 'Syncing...' : 'Sync Course'}
              </button>
            )}
            <button className="p-5 bg-white border border-slate-100 rounded-3xl text-slate-400 hover:text-rose-600 transition-all shadow-sm"><Share2 size={24} /></button>
            <button onClick={() => openModal('COMMIT')} className="p-5 bg-white border border-slate-100 rounded-3xl text-slate-400 hover:text-rose-600 transition-all shadow-sm"><Settings size={24} /></button>
            <button onClick={async () => {
              await fetchTrack(activeTrack.track.id);
              openModal('DELETE');
            }} className="p-5 bg-white border border-rose-50 rounded-3xl text-rose-300 hover:text-rose-600 transition-all shadow-sm"><Trash2 size={24} /></button>
          </div>
        </div>

        <TrackHeader 
          track={activeTrack.track} 
          stats={activeTrack.stats}
          currentEnergy={energy}
          onEnergySelect={(lvl) => setEnergy(lvl)}
          onOptimize={() => planToday(trackId as string, energy)}
        />
      </header>

      <div className="space-y-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Lesson Board</h2>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setViewMode('KANBAN')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'KANBAN' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('LIST')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'LIST' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        <main className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
          {viewMode === 'KANBAN' ? (
            <KanbanBoard 
              units={activeTrack.track.units} 
              onAction={handleAction}
              onDragEnd={handleDragEnd}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {activeTrack.track.units.map((unit, idx) => (
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
        </main>
      </div>
    </div>
  );
}
