//apps/desktop/src/pages/study/TrackDetailPage.tsx
import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Settings, Trash2, Share2, BookOpen, MoreVertical, Clock, CheckCircle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { KanbanBoard, TrackHeader, EmptyTrackSetup } from '@gritorquit/study-ui-web';
import { EnergyLevel, useStudy } from '@gritorquit/study-core';
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

  if (loading && !activeTrack) return <div className="p-20 text-center text-rose-500 font-bold animate-pulse uppercase tracking-widest italic">Loading course...</div>;
  if (!activeTrack) return <div className="p-20 text-center text-[var(--text-secondary)] font-bold uppercase tracking-widest italic">Course not found.</div>;

  const MainBoard = (
    <div className="relative flex flex-col text-[var(--text-primary)] w-full h-full bg-[var(--bg-primary)] overflow-hidden text-left italic">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--accent-color)]/5 rounded-full blur-[60px] -z-10 pointer-events-none opacity-50" />
      
      <header className="flex flex-col gap-6 w-full p-8 shrink-0 border-b border-[var(--border-color)] bg-[var(--bg-card)]/40 backdrop-blur-md">
        <div className="flex items-center gap-6 w-full">
          <button onClick={() => navigate('/study')} className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all shadow-sm active:scale-95 shrink-0">
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1 min-w-0">
             <div className="flex items-center gap-3 mb-1">
               <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight truncate uppercase leading-none">{activeTrack.track.title}</h1>
               <span className="text-[10px] font-black bg-[var(--accent-color)] text-[var(--bg-primary)] px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shrink-0">{activeTrack.track.type === 'PLAYLIST' ? 'Course' : 'Manual'}</span>
             </div>
             <p className="text-[var(--text-secondary)] font-bold truncate uppercase tracking-widest opacity-60 text-xs">{activeTrack.track.description || 'Active learning path.'}</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <button className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all shadow-sm"><Share2 size={20} /></button>
            <button onClick={() => openModal('COMMIT')} className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all shadow-sm"><Settings size={20} /></button>
            <button onClick={async () => {
              await fetchTrack(activeTrack.track.id);
              openModal('DELETE');
            }} className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl text-rose-400 hover:text-rose-600 transition-all shadow-sm"><Trash2 size={20} /></button>
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

      <main className="flex-1 overflow-hidden relative z-0 w-full">
        <div className="absolute inset-0 overflow-x-auto overflow-y-auto custom-scrollbar p-8">
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
    <div className="flex flex-col h-full bg-[var(--bg-card)] border-l border-[var(--border-color)] text-left italic">
      <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-primary)]/50 backdrop-blur-md">
        <h2 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest flex items-center gap-3">
          <BookOpen size={16} className="text-[var(--accent-color)]" />
          Path Notes
        </h2>
        <div className="flex items-center gap-3">
           <button 
             onClick={() => navigate(`/study/${trackId}`)}
             className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
           >
             Close
           </button>
           <button className="text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition-colors">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>
      {selectedUnit ? (
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          <div className="mb-8">
            <span className="text-[9px] font-black bg-[var(--accent-color)]/10 text-[var(--accent-color)] px-3 py-1.5 rounded-lg uppercase tracking-widest border border-[var(--accent-color)]/20 shadow-sm italic">
              {selectedUnit.type} Context
            </span>
            <h1 className="text-2xl font-black text-[var(--text-primary)] mt-6 mb-3 leading-tight uppercase tracking-tight">
              {selectedUnit.title}
            </h1>
            <div className="flex items-center gap-4 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest opacity-40 italic">
              <span className="flex items-center gap-1.5"><Clock size={14} /> {(selectedUnit as any).durationMinutes || 0}m Session</span>
              <span className="flex items-center gap-1.5"><CheckCircle size={14} /> {selectedUnit.status}</span>
            </div>
          </div>
          <div className="prose prose-invert prose-sm max-w-none">
            <p className="text-[var(--text-secondary)] leading-relaxed italic">
              {(selectedUnit as any).description || 'No additional neural context available for this unit.'}
            </p>
            <div className="mt-10 p-6 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] text-[var(--text-secondary)] italic text-xs shadow-inner opacity-60">
              Notes integration ready. Start typing to attach neural artifacts...
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 p-10 flex flex-col items-center justify-center text-center text-[var(--text-secondary)] bg-[var(--bg-primary)]/20">
          <div className="bg-[var(--bg-secondary)] p-6 rounded-3xl border border-[var(--border-color)] shadow-inner mb-6 opacity-40">
            <BookOpen size={32} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest mb-2 italic">No Active Context</p>
          <p className="text-[11px] max-w-[220px] leading-relaxed opacity-40 italic">
            Select a step from the board to view or edit attached neural notes.
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
