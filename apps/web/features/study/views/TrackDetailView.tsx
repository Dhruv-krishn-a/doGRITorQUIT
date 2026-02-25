"use client";

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Settings, Trash2, Share2, RefreshCw, Loader2, LayoutGrid, List } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useStudy, EnergyLevel, Unit, UnitStatus } from '@planner/study-core';
import { toast } from 'sonner';
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

  if (!mounted) return null;

  if (loading && !activeTrack) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-rose-500 animate-spin drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
        <div className="text-rose-300/50 font-bold uppercase tracking-widest text-xs">Loading Neural Vector...</div>
      </div>
    </div>
  );

  if (!activeTrack) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <div className="text-rose-400/50 font-bold uppercase tracking-widest text-sm">Vector not found.</div>
      <button 
        onClick={() => router.push('/dashboard/study')} 
        className="px-8 py-4 bg-linear-to-r from-rose-600 to-pink-600 text-white rounded-4xl font-black text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(244,63,94,0.4)] hover:shadow-[0_0_25px_rgba(244,63,94,0.6)] border border-rose-400/50 transition-all active:scale-95"
      >
        Return to Command Center
      </button>
    </div>
  );

  return (
    // CHANGED: text-slate-900 replaced with text-rose-100 to inherit dark mode properly
    <div className="flex-1 min-w-0 relative space-y-12 text-rose-100 pb-24 w-full px-4 md:px-8">
      {/* CHANGED: Background ambient blur updated to rose pink */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-[120px] -z-10 pointer-events-none opacity-50" />
      
      <header className="flex flex-col gap-10 w-full pt-10">
        <div className="flex flex-col md:flex-row md:items-center gap-8 w-full">
          <button 
            onClick={() => router.push('/dashboard/study')} 
            // CHANGED: Restyled to match the dark cherry dashboard buttons
            className="p-5 bg-[#14030b] border border-rose-900/50 rounded-3xl text-rose-300/50 hover:text-rose-400 hover:border-rose-500/50 hover:bg-[#1c0510] hover:shadow-[0_0_15px_rgba(244,63,94,0.2)] transition-all active:scale-95 shrink-0 self-start"
          >
            <ArrowLeft size={28} />
          </button>
          <div className="flex-1 min-w-0">
             <div className="flex items-center gap-4 mb-2">
               {/* CHANGED: Title and badge restyled */}
               <h1 className="text-4xl md:text-5xl font-black text-rose-50 tracking-tight truncate drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                 {activeTrack.track.title}
               </h1>
               <span className="text-[10px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.2)] px-3 py-1 rounded-lg uppercase tracking-widest shrink-0">
                 {activeTrack.track.type === 'PLAYLIST' ? 'Course' : 'Manual'}
               </span>
             </div>
             <p className="text-rose-400/60 font-bold uppercase tracking-widest text-[10px]">
               {activeTrack.track.description || 'Active learning track.'}
             </p>
          </div>
          <div className="flex flex-wrap gap-4 shrink-0">
            {activeTrack.track.type === 'PLAYLIST' && (
              <button 
                onClick={handleSync}
                disabled={isSyncing}
                // CHANGED: Primary action buttons completely restyled
                className="flex items-center gap-2 px-6 py-4 bg-[#14030b] border border-rose-900/50 rounded-3xl text-rose-200/80 hover:text-rose-100 hover:bg-[#1c0510] hover:border-rose-500/50 hover:shadow-[0_0_15px_rgba(244,63,94,0.2)] font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
              >
                {isSyncing ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} className="text-rose-500" />}
                {isSyncing ? 'Syncing...' : 'Sync Course'}
              </button>
            )}
            <button className="p-5 bg-[#14030b] border border-rose-900/50 rounded-3xl text-rose-300/50 hover:text-rose-400 hover:bg-[#1c0510] hover:border-rose-500/50 hover:shadow-[0_0_15px_rgba(244,63,94,0.2)] transition-all active:scale-95"><Share2 size={24} /></button>
            <button onClick={() => openModal('COMMIT')} className="p-5 bg-[#14030b] border border-rose-900/50 rounded-3xl text-rose-300/50 hover:text-rose-400 hover:bg-[#1c0510] hover:border-rose-500/50 hover:shadow-[0_0_15px_rgba(244,63,94,0.2)] transition-all active:scale-95"><Settings size={24} /></button>
            <button onClick={async () => {
              await fetchTrack(activeTrack.track.id);
              openModal('DELETE');
            }} className="p-5 bg-[#14030b] border border-red-900/50 rounded-3xl text-red-400/60 hover:text-red-400 hover:bg-red-950/30 hover:border-red-500/50 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all active:scale-95"><Trash2 size={24} /></button>
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
        {/* CHANGED: Border updated to dark mode rose-900/40 */}
        <div className="flex items-center justify-between border-b border-rose-900/40 pb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-black text-rose-50 uppercase tracking-tight drop-shadow-sm">Lesson Board</h2>
            <div className="flex bg-[#14030b] border border-rose-900/50 p-1 rounded-xl shadow-inner">
              <button 
                onClick={() => setViewMode('KANBAN')}
                // CHANGED: View toggle buttons restyled
                className={`p-2 rounded-lg transition-all ${viewMode === 'KANBAN' ? 'bg-linear-to-r from-rose-600 to-pink-600 text-white shadow-[0_0_10px_rgba(244,63,94,0.4)]' : 'text-rose-400/40 hover:text-rose-200'}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('LIST')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'LIST' ? 'bg-linear-to-r from-rose-600 to-pink-600 text-white shadow-[0_0_10px_rgba(244,63,94,0.4)]' : 'text-rose-400/40 hover:text-rose-200'}`}
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