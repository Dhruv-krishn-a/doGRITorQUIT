//apps/desktop/src/pages/study/TrackDetailPage.tsx
import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Settings, Trash2, Share2, BookOpen, MoreVertical, Clock, CheckCircle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { KanbanBoard, TrackHeader, EmptyTrackSetup } from '@planner/study-ui-web';
import { EnergyLevel, useStudy } from '@planner/study-core';
import { DesktopStudyLayout } from '../../features/study/layouts/DesktopStudyLayout';

export default function TrackDetailPage() {
  const { trackId, unitId } = useParams<{ trackId: string; unitId: string }>();
  const navigate = useNavigate();
  const { fetchTrack, activeTrack, loading, openModal, addUnit, moveUnit, planToday } = useStudy();
  const [energy, setEnergy] = useState<EnergyLevel>('MEDIUM');

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

  const selectedUnit = useMemo(() => {
    if (!unitId || !activeTrack?.track?.units) return null;
    return activeTrack.track.units.find(u => u.id === unitId);
  }, [activeTrack, unitId]);

  const handleEnergySelect = (level: EnergyLevel) => {
    setEnergy(level);
  };

  const handleUnitSelect = (unit: any) => {
    navigate(`/study/${trackId}/unit/${unit.id}`);
  };

  if (loading && !activeTrack) return <div className="transform-gpu p-20 text-center text-rose-500 font-bold animate-pulse uppercase tracking-widest">Loading course...</div>;
  if (!activeTrack) return <div className="transform-gpu p-20 text-center text-slate-400 font-bold uppercase tracking-widest">Course not found.</div>;

  const MainBoard = (
    <div className="transform-gpu relative flex flex-col text-slate-900 w-full h-full bg-[#fdfbfb] overflow-hidden">
      {/* Background Accent */}
      <div className="transform-gpu absolute top-0 right-0 w-125 h-125 bg-rose-50/50 rounded-full blur-[120px] -z-10 pointer-events-none opacity-50" />
      
      <header className="transform-gpu flex flex-col gap-6 w-full p-8 shrink-0 border-b border-rose-100/60 bg-white/40 backdrop-blur-xl">
        <div className="transform-gpu flex items-center gap-6 w-full">
          <button onClick={() => navigate('/study')} className="transform-gpu p-4 bg-white border border-rose-100 rounded-3xl text-slate-400 hover:text-rose-600 hover:border-rose-200 transition-all shadow-sm active:scale-95 shrink-0">
            <ArrowLeft size={24} />
          </button>
          <div className="transform-gpu flex-1 min-w-0">
             <div className="transform-gpu flex items-center gap-3 mb-1">
               <h1 className="transform-gpu text-3xl font-bold text-slate-900 tracking-tight truncate">{activeTrack.track.title}</h1>
               <span className="transform-gpu text-[10px] font-bold bg-slate-900 text-white px-2 py-0.5 rounded-full uppercase tracking-widest shadow-lg shadow-rose-200 shrink-0">{activeTrack.track.type === 'PLAYLIST' ? 'Course' : 'Manual'}</span>
             </div>
             <p className="transform-gpu text-slate-500 font-medium truncate">{activeTrack.track.description || 'Active learning track.'}</p>
          </div>
          <div className="transform-gpu flex gap-3 shrink-0">
            <button className="transform-gpu p-4 bg-white border border-slate-100 rounded-3xl text-slate-400 hover:text-rose-600 transition-all shadow-sm"><Share2 size={20} /></button>
            <button onClick={() => openModal('COMMIT')} className="transform-gpu p-4 bg-white border border-slate-100 rounded-3xl text-slate-400 hover:text-rose-600 transition-all shadow-sm"><Settings size={20} /></button>
            <button onClick={async () => {
              await fetchTrack(activeTrack.track.id);
              openModal('DELETE');
            }} className="transform-gpu p-4 bg-white border border-slate-100 rounded-3xl text-rose-300 hover:text-rose-600 transition-all shadow-sm"><Trash2 size={20} /></button>
          </div>
        </div>

        <TrackHeader 
          track={activeTrack.track} 
          stats={activeTrack.stats as any}
          currentEnergy={energy}
          onEnergySelect={handleEnergySelect}
          onOptimize={() => planToday(activeTrack.track.id, energy)}
        />
      </header>

      <main className="transform-gpu flex-1 overflow-hidden relative z-0 w-full">
        {/* We use an absolute div that fills the parent so it can scroll independently */}
        <div className="transform-gpu absolute inset-0 overflow-x-auto overflow-y-auto custom-scrollbar p-8">
          {activeTrack.track.units.length > 0 ? (
            <KanbanBoard 
              units={activeTrack.track.units} 
              onAction={(type, unit) => {
                if (type === 'SESSION') openModal('SESSION', unit, 'STUDY');
                else if (type === 'TIMER') openModal('SESSION', unit, 'TIMER');
                else if (type === 'COMPLETE') openModal('SESSION', unit, 'COMPLETE');
                else if (type === 'SELECT') handleUnitSelect(unit);
              }}
              onDragEnd={(result) => {
                if (!result.destination) return;
                moveUnit(result.draggableId, result.destination.droppableId, result.destination.index);
              }}
            />
          ) : (
            <EmptyTrackSetup 
              trackId={trackId || ''} 
              onRefresh={() => trackId && fetchTrack(trackId)} 
              onAddUnit={(tid: string, unit: any) => addUnit(tid, unit)} 
            />
          )}
        </div>
      </main>
    </div>
  );

  const NotesPanel = (
    <div className="transform-gpu flex flex-col h-full">
      <div className="transform-gpu p-4 border-b border-slate-200 flex justify-between items-center bg-white">
        <h2 className="transform-gpu text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
          <BookOpen size={14} className="transform-gpu text-indigo-500" />
          Neural Notes
        </h2>
        <div className="transform-gpu flex items-center gap-2">
           <button 
             onClick={() => navigate(`/study/${trackId}`)}
             className="transform-gpu text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600"
           >
             Close
           </button>
           <button className="transform-gpu text-slate-400 hover:text-indigo-500 transition-colors">
            <MoreVertical size={16} />
          </button>
        </div>
      </div>
      {selectedUnit ? (
        <div className="transform-gpu flex-1 p-6 overflow-y-auto">
          <div className="transform-gpu mb-6">
            <span className="transform-gpu text-[9px] font-bold bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg uppercase tracking-widest border border-indigo-100">
              {selectedUnit.type} Context
            </span>
            <h1 className="transform-gpu text-2xl font-bold text-slate-900 mt-4 mb-2 leading-tight">
              {selectedUnit.title}
            </h1>
            <div className="transform-gpu flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span className="transform-gpu flex items-center gap-1"><Clock size={12} /> {(selectedUnit as any).durationMinutes || 0}m Session</span>
              <span className="transform-gpu flex items-center gap-1"><CheckCircle size={12} /> {selectedUnit.status}</span>
            </div>
          </div>
          <div className="transform-gpu prose prose-slate prose-sm max-w-none">
            <p className="transform-gpu text-slate-600 leading-relaxed">
              {(selectedUnit as any).description || 'No additional neural context available for this unit.'}
            </p>
            {/* Placeholder for actual notes editor */}
            <div className="transform-gpu mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-400 italic text-xs">
              Notes integration ready. Start typing to attach neural artifacts...
            </div>
          </div>
        </div>
      ) : (
        <div className="transform-gpu flex-1 p-8 flex flex-col items-center justify-center text-center text-slate-400 bg-slate-50/30">
          <div className="transform-gpu bg-slate-100 p-4 rounded-full mb-4">
            <BookOpen size={24} className="transform-gpu opacity-50" />
          </div>
          <p className="transform-gpu text-[10px] font-bold uppercase tracking-widest mb-2">No Active Context</p>
          <p className="transform-gpu text-xs max-w-[200px] leading-relaxed opacity-70">
            Select a unit from the board to view or edit attached neural notes.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <DesktopStudyLayout
      mainBoard={MainBoard}
      notesPanel={unitId ? NotesPanel : undefined}
    />
  );
}
