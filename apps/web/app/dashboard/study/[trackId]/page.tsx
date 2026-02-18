"use client";

import React, { useEffect, useState, use, useCallback } from 'react';
import { ArrowLeft, Settings, Trash2, Share2, Info } from 'lucide-react';
import Link from 'next/link';
import { KanbanBoard } from '@/features/study/components/KanbanBoard';
import { CommitmentModal } from '@/features/study/components/CommitmentModal';
import { TrackHeaderSummary } from '@/features/study/components/TrackHeaderSummary';
import { StudySessionModal } from '@/features/study/components/StudySessionModal';
import { ConfirmDeleteModal } from '@/features/study/components/ConfirmDeleteModal';
import { EmptyTrackSetup } from '@/features/study/components/EmptyTrackSetup';
import { toast } from 'sonner';
import { Track, Unit, EnergyLevel, UnitStatus } from '@prisma/client';

type TrackStats = {
  avgMinsPerDay: number;
  estCompletionDate: Date;
  status: 'AHEAD' | 'BEHIND' | 'ON_TRACK';
  daysDiff: number;
  todayTargetMins: number;
  todayTargetVideos: number;
  completedVideos: number;
  totalVideos: number;
};

type TrackData = {
  track: Track & { units: Unit[] };
  stats: TrackStats;
};

export default function TrackDetailPage({ params }: { params: Promise<{ trackId: string }> }) {
  const { trackId } = use(params);
  const [data, setData] = useState<TrackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [energy, setEnergy] = useState<EnergyLevel>('MEDIUM');
  
  // Modals
  const [showCommitModal, setShowCommitModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionMode, setSessionMode] = useState<'STUDY' | 'TIMER'>('STUDY');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeUnit, setActiveUnit] = useState<Unit | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTrack = useCallback(async () => {
    try {
      const res = await fetch(`/api/study/tracks/${trackId}`);
      const result = await res.json();
      if (result.error) throw new Error(result.error);
      
      setData(result);
      
      if (result.track && !result.track.dailyAllocationMinutes) {
        setShowCommitModal(true);
      }
    } catch {
      toast.error('Failed to sync neural engine');
    } finally {
      setLoading(false);
    }
  }, [trackId]);

  useEffect(() => {
    fetchTrack();
  }, [fetchTrack]);

  const handleCommit = async (minutes: number) => {
    await fetch(`/api/study/tracks/${trackId}/commit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dailyAllocationMinutes: minutes })
    });
    fetchTrack();
  };

  const handlePlanToday = async () => {
    await fetch('/api/study/plan-today', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackId, energyLevel: energy })
    });
    toast.success("Daily trajectory recalculated");
    fetchTrack();
  };

  const handleEnergySelect = (level: EnergyLevel) => {
    setEnergy(level);
    // Auto-replan when energy changes
    setTimeout(() => handlePlanToday(), 100);
  };

  const handleStartSession = (unit: Unit, mode: 'STUDY' | 'TIMER' = 'STUDY') => {
    setActiveUnit(unit);
    setSessionMode(mode);
    setShowSessionModal(true);
  };

  const handleSessionEnd = async (watchedSeconds: number) => {
    fetchTrack();
  };

  const handleCompleteUnit = async (completion: { confidence: number; difficulty: number; takeaways: string[]; minutesSpent?: number; watchPercentage?: number }) => {
    if (!activeUnit) return;
    try {
      await fetch(`/api/study/units/${activeUnit.id}/complete`, {
         method: 'POST', 
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(completion)
      });
      fetchTrack();
    } catch {
      toast.error("Failed to finalize mastery");
    }
  };

  const handleMoveUnit = async (unitId: string, toStatus: UnitStatus, newIndex: number) => {
     if (!data) return;
     const updatedUnits = data.track.units.map(u => u.id === unitId ? { ...u, status: toStatus } : u);
     setData({ ...data, track: { ...data.track, units: updatedUnits } });
     
     await fetch(`/api/study/units/${unitId}/move`, { 
       method: 'POST', 
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ toStatus, positionIndex: newIndex }) 
     });
  };

  const handleDeleteTrack = async () => {
    setDeleting(true);
    try {
      await fetch(`/api/study/tracks/${trackId}`, { method: 'DELETE' });
      window.location.href = '/dashboard/study';
    } catch {
      toast.error("Failed to delete track");
      setDeleting(false);
    }
  };

  if (loading || !data) return <div className="p-20 text-center text-rose-500 font-black animate-pulse uppercase tracking-[0.3em]">Calibrating Neural Path...</div>;

  return (
    <div className="relative space-y-10 text-slate-900 pb-20 p-2 md:p-4">
      {/* Background Accent */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-rose-50/50 rounded-full blur-[120px] -z-10 pointer-events-none opacity-50" />
      
      <header className="flex flex-col gap-8">
        <div className="flex items-center gap-6">
          <Link href="/dashboard/study" className="p-4 bg-white border border-rose-100 rounded-[1.5rem] text-slate-400 hover:text-rose-600 hover:border-rose-200 transition-all shadow-sm active:scale-95">
            <ArrowLeft size={24} />
          </Link>
          <div className="flex-1">
             <div className="flex items-center gap-3 mb-1">
               <h1 className="text-4xl font-black text-slate-900 tracking-tight">{data.track.title}</h1>
               <span className="text-[10px] font-black bg-rose-600 text-white px-2 py-0.5 rounded-full uppercase tracking-widest shadow-lg shadow-rose-200">Engine V1</span>
             </div>
             <p className="text-slate-500 font-medium">{data.track.description || 'Systematic knowledge ingestion active.'}</p>
          </div>
          <div className="flex gap-3">
            <button className="p-4 bg-white border border-slate-100 rounded-[1.5rem] text-slate-400 hover:text-rose-600 transition-all shadow-sm"><Share2 size={20} /></button>
            <button onClick={() => setShowCommitModal(true)} className="p-4 bg-white border border-slate-100 rounded-[1.5rem] text-slate-400 hover:text-rose-600 transition-all shadow-sm"><Settings size={20} /></button>
            <button onClick={() => setShowDeleteModal(true)} className="p-4 bg-white border border-slate-100 rounded-[1.5rem] text-rose-300 hover:text-rose-600 transition-all shadow-sm"><Trash2 size={20} /></button>
          </div>
        </div>

        <TrackHeaderSummary 
          track={data.track} 
          stats={data.stats}
          currentEnergy={energy}
          onEnergySelect={handleEnergySelect}
          onCommitClick={() => setShowCommitModal(true)} 
          onPlanClick={handlePlanToday} 
        />
      </header>

      <main className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {data.track.units.length > 0 ? (
          <KanbanBoard 
            units={data.track.units} 
            onMoveUnit={handleMoveUnit}
            onStartSession={(u) => handleStartSession(u, 'STUDY')}
            onStartTimer={(u) => handleStartSession(u, 'TIMER')}
            onCompleteUnit={(u) => { setActiveUnit(u); setSessionMode('COMPLETE'); setShowSessionModal(true); }}
            onNotesClick={(u) => handleStartSession(u, 'STUDY')}
          />
        ) : (
          <EmptyTrackSetup trackId={trackId} onRefresh={fetchTrack} />
        )}
      </main>

      <CommitmentModal 
        isOpen={showCommitModal} 
        onClose={() => setShowCommitModal(false)} 
        onCommit={handleCommit}
        trackTitle={data.track.title}
        totalMinutes={data.track.totalDurationMinutes}
        totalVideos={data.track.units.length}
      />

      <ConfirmDeleteModal 
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteTrack}
        trackTitle={data.track.title}
        loading={deleting}
      />

      {activeUnit && showSessionModal && (
        <StudySessionModal
          unit={activeUnit}
          mode={sessionMode}
          onClose={() => setShowSessionModal(false)}
          onSessionEnd={handleSessionEnd}
          onComplete={handleCompleteUnit}
        />
      )}
    </div>
  );
}
