"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStudy, Unit, UnitStatus } from '@gritorquit/study-core';
import { toast } from 'sonner';
import { AnimatePresence } from 'framer-motion';

import {
 ProjectSidebar,
 ProjectContextPanel,
 ProjectHeader,
 ProjectOverviewTab,
 ProjectBoardTab,
 ProjectTimelineTab,
 ProjectTasksTab,
 ProjectPhasesTab,
 ProjectTimeTab,
 ProjectNotesTab,
 ProjectSettingsTab
} from '@gritorquit/study-ui-web';
import type { ProjectTab, EnergyLevel } from '@gritorquit/study-ui-web';

export function ProjectDetailView() {
 const params = useParams();
 const navigate = useNavigate();
 const trackId = Array.isArray(params.trackId) ? params.trackId[0] : params.trackId;
 
 const { 
  fetchTrack, activeTrack, loading, openModal, moveUnit, planToday, 
  updateTrack, deleteUnit, addUnit, updateUnit, logProgress,
  seconds, setSeconds, isTimerRunning, setIsTimerRunning
 } = useStudy();
 
 // Local UI State
 const [activeTab, setActiveTab] = useState<ProjectTab>('OVERVIEW');
 const [mounted, setMounted] = useState(false);
 const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
 const [isContextPanelOpen, setIsContextPanelOpen] = useState(true);
 const [energy, setEnergy] = useState<EnergyLevel>('MEDIUM');
 const [viewMode, setViewMode] = useState<'KANBAN' | 'LIST'>('KANBAN');

 // Derived state
 const { track, recentSessions } = activeTrack || { track: null, recentSessions: [] };
 const metadata = (track?.metadata as { phases?: string[]; projectType?: string; priority?: string; globalNotes?: string }) || {};
 const units = track?.units || [];

 // Notes State
 const [projectNotes, setProjectNotes] = useState(metadata.globalNotes ||"");
 const [isSaving, setIsSaving] = useState(false);

 useEffect(() => {
  setMounted(true);
  if (trackId) {
   fetchTrack(trackId);
  }
 }, [trackId, fetchTrack]);

 // Update notes if track loads with different notes
 useEffect(() => {
  if (metadata.globalNotes) {
   setProjectNotes(metadata.globalNotes);
  }
 }, [metadata.globalNotes]);
 
 // Group units by phase
 const phases = useMemo(() => {
  const phaseMap: Record<string, Unit[]> = {};
  const phaseList: string[] = metadata.phases || ['Default'];
  
  phaseList.forEach(p => phaseMap[p] = []);
  units.forEach(u => {
   const phase = (u.metadata as { phase?: string })?.phase || phaseList[0];
   if (!phaseMap[phase]) phaseMap[phase] = [];
   phaseMap[phase].push(u);
  });
  
  return phaseMap;
 }, [units, metadata.phases]);

 const handleAction = (type: 'SESSION' | 'TIMER' | 'COMPLETE', unit: Unit) => {
  if (type === 'SESSION') {
   navigate(`/study/project/${trackId}/unit/${unit.id}`);
  } else if (type === 'TIMER') {
   navigate(`/study/project/${trackId}/unit/${unit.id}?layout=FULL_NOTES&autostart=true`);
  } else if (type === 'COMPLETE') {
   openModal('SESSION', unit, 'LOGS');
  }
 };

 const handleDragEnd = async (result: any) => {
  if (!result.destination) return;
  const { draggableId, destination } = result;
  
  if (destination.droppableId === 'DONE' || destination.droppableId === 'REVISE') {
   const unitToComplete = track?.units.find(u => u.id === draggableId);
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
    toast.success("Execution updated");
   } catch (error) {
    console.error("Failed to update unit status:", error);
   }
  }
 };

 const formatTime = (totalSeconds: number) => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h > 0 ? h +":" :""}${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`;
 };

 const formatMins = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
 };

 if (!mounted) return null;

 if (loading && !activeTrack) return (
  <div className="flex items-center justify-center min-h-[60vh] bg-[var(--bg-primary)] w-full">
   <div className="flex flex-col items-center gap-4">
    <Loader2 className="w-8 h-8 text-[var(--accent-color)] animate-spin drop-shadow-[0_0_10px_var(--accent-color)]" />
    <div className="text-[var(--accent-color)] font-black uppercase tracking-widest text-xs italic">Loading Project Vector...</div>
   </div>
  </div>
 );

 if (!activeTrack || !track) return (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 bg-[var(--bg-primary)] w-full text-left">
   <div className="text-[var(--text-secondary)] font-black uppercase tracking-widest text-sm italic">Vector not found.</div>
   <button 
    onClick={() => navigate('/study')} 
    className="px-8 py-4 bg-gradient-to-r from-[var(--accent-color)] to-sky-600 text-[var(--bg-primary)] rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:opacity-90 transition-all active:scale-95 italic"
   >
    Return to Command Center
   </button>
  </div>
 );

 const sharedProps = {
  track,
  units,
  phases,
  metadata,
  recentSessions,
  formatMins,
  formatTime,
  addUnit,
 };

 return (
  <div className="flex flex-col w-full h-full flex-1 bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden font-sans selection:bg-[var(--accent-color)]/30 selection:text-[var(--text-primary)] relative">
   {/* --- BACKGROUND GLOW --- */}
   <div className="absolute top-0 left-1/2 w-[60rem] h-[40rem] bg-[var(--accent-color)]/5 rounded-full blur-[120px] -translate-x-1/2 pointer-events-none -z-10" />

   {/* --- STICKY TOP BAR --- */}
   <div className="shrink-0">
    <ProjectHeader 
     {...sharedProps}
     onBack={() => navigate('/study')}
     seconds={seconds}
     isTimerRunning={isTimerRunning}
     setIsTimerRunning={setIsTimerRunning}
     activeTab={activeTab}
     setActiveTab={setActiveTab}
    />
   </div>

   <div className="flex-1 flex overflow-hidden">
    {/* --- LEFT COLUMN: SideBar --- */}
    <div className="shrink-0 h-full border-r border-[var(--border-color)]">
     <ProjectSidebar 
      {...sharedProps}
      isSidebarCollapsed={isSidebarCollapsed}
      energy={energy}
      setEnergy={setEnergy}
      planToday={planToday}
     />
    </div>

    {/* --- MIDDLE COLUMN: Workspace --- */}
    <main className="flex-1 relative overflow-hidden h-full">
      <div className="absolute inset-0 overflow-y-auto no-scrollbar">
        {activeTab === 'OVERVIEW' && <ProjectOverviewTab {...sharedProps} />}
        
        {activeTab === 'BOARD' && (
         <div className="p-6 md:p-8">
          <ProjectBoardTab 
           units={units}
           viewMode={viewMode}
           setViewMode={setViewMode}
           handleAction={handleAction}
           handleDragEnd={handleDragEnd}
          />
         </div>
        )}

        {activeTab === 'TIMELINE' && <ProjectTimelineTab phases={phases} units={units} />}
        
        {activeTab === 'TASKS' && <ProjectTasksTab units={units} deleteUnit={deleteUnit} addUnit={addUnit} updateUnit={updateUnit} trackId={track.id} phases={phases} />}
        
        {activeTab === 'PHASES' && <ProjectPhasesTab phases={phases} track={track} metadata={metadata} updateTrack={updateTrack} />}
        
        {activeTab === 'TIME' && <ProjectTimeTab units={units} formatMins={formatMins} />}
        
        {activeTab === 'NOTES' && (
         <ProjectNotesTab 
          track={track}
          metadata={metadata}
          projectNotes={projectNotes}
          setProjectNotes={setProjectNotes}
          isSaving={isSaving}
          setIsSaving={setIsSaving}
          updateTrack={updateTrack}
         />
        )}

        {activeTab === 'SETTINGS' && <ProjectSettingsTab track={track} updateTrack={updateTrack} />}
      </div>
    </main>

    {/* --- RIGHT COLUMN: Context Panel --- */}
    <div className="shrink-0 h-full border-l border-[var(--border-color)] bg-[var(--bg-card)]/40 backdrop-blur-xl">
     <ProjectContextPanel 
      track={track}
      units={units}
      formatTime={formatTime}
      isContextPanelOpen={isContextPanelOpen}
      setIsContextPanelOpen={setIsContextPanelOpen}
      seconds={seconds}
      setSeconds={setSeconds}
      isTimerRunning={isTimerRunning}
      setIsTimerRunning={setIsTimerRunning}
      logProgress={logProgress}
     />
    </div>
   </div>
  </div>
 );
}
