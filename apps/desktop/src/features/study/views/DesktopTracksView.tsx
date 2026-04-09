import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Plus, LayoutGrid, Loader2, History, TrendingUp, Briefcase, BookOpen, Sparkles, ChevronDown, Lock, FileSpreadsheet, PenTool } from 'lucide-react';
import { useStudy, Track } from '@gritorquit/study-core';
import { ReviewList, TrackCard, PlanCard } from '@gritorquit/study-ui-web';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import { usePlans } from '../../plans/hooks/usePlans';
import CreatePlanModal from '../../plans/components/CreatePlanModal';
import ImportExcelModal from '../../plans/components/ImportExcelModal';
import AIPlanGenerator from '../../plans/components/AIPlanGenerator';
import { InitializeVectorModal } from '../components/InitializeVectorModal';
import { useEntitlements } from '../../billing/hooks/useEntitlements';
import { buildApiUrl } from '../../../config/env';
import { useAuth } from '../../auth/hooks/useAuth';

export function DesktopTracksView() {
 const navigate = useNavigate();
 const { tracks, dashboard, loading, fetchDashboard, openModal, deleteTrack } = useStudy();
 const { plans, refreshPlans } = usePlans();
 const { entitlements } = useEntitlements();
 const { session } = useAuth();

 const [filterType, setFilterType] = useState<'ALL' | 'ROADMAP' | 'PROJECT' | 'COURSE' | 'YOUTUBE'>('ALL');
 const [showActionMenu, setShowActionMenu] = useState(false);
 const actionMenuRef = useRef<HTMLDivElement>(null);

 const [createOpen, setCreateOpen] = useState(false);
 const [importOpen, setImportOpen] = useState(false);
 const [isAiOpen, setIsAiOpen] = useState(false);
 const [initVectorModalOpen, setInitVectorModalOpen] = useState(false);

 const maxPlans = entitlements?.features?.MAX_PLANS || 1;
 const isLimitReached = plans.length >= maxPlans;

 useEffect(() => {
  function handleClickOutside(event: MouseEvent) {
   if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
    setShowActionMenu(false);
   }
  }
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
 }, []);

 useEffect(() => { 
  fetchDashboard(); 
 }, [fetchDashboard]);

 const handleDeletePlan = async (planId: string) => {
  if (!confirm("Are you sure you want to delete this plan?")) return;
  try {
    const res = await fetch(buildApiUrl(`/plans/${planId}`), {
     method: 'DELETE',
     headers: {
      'Authorization': `Bearer ${session?.access_token}`
     }
    });
    if (!res.ok) throw new Error("Failed to delete plan");
    refreshPlans();
  } catch (err) {
    console.error(err);
  }
 };

 const handleCreateComplete = () => {
  refreshPlans();
  setCreateOpen(false);
 };

 const handleImportComplete = () => {
  refreshPlans();
  setImportOpen(false);
 };

 const filteredTracks = useMemo(() => {
  if (filterType === 'ALL') return tracks;
  if (filterType === 'PROJECT') return tracks.filter(t => t.type === 'PROJECT');
  if (filterType === 'COURSE') return tracks.filter(t => t.type === 'COURSE');
  if (filterType === 'YOUTUBE') return tracks.filter(t => t.type === 'PLAYLIST');
  return tracks;
 }, [tracks, filterType]);

 const projectAnalytics = useMemo(() => {
  const projects = tracks.filter(t => t.type === 'PROJECT');
  if (projects.length === 0) return { progress: 0, count: 0, timeSpent: 0 };
  const progress = Math.round(projects.reduce((acc, t) => acc + t.progressPercentage, 0) / projects.length);
  const timeSpent = projects.reduce((acc, t) => acc + (t.units?.reduce((sum, u) => sum + (u.actualTimeSpentMinutes || 0), 0) || 0), 0);
  return { progress, count: projects.length, timeSpent: Math.round(timeSpent / 60) };
 }, [tracks]);

 const courseAnalytics = useMemo(() => {
  const courses = tracks.filter(t => t.type === 'COURSE');
  if (courses.length === 0) return { progress: 0, count: 0, timeSpent: 0 };
  const progress = Math.round(courses.reduce((acc, t) => acc + t.progressPercentage, 0) / courses.length);
  const timeSpent = courses.reduce((acc, t) => acc + (t.units?.reduce((sum, u) => sum + (u.actualTimeSpentMinutes || 0), 0) || 0), 0);
  return { progress, count: courses.length, timeSpent: Math.round(timeSpent / 60) };
 }, [tracks]);

 const youtubeAnalytics = useMemo(() => {
  const youtube = tracks.filter(t => t.type === 'PLAYLIST');
  if (youtube.length === 0) return { progress: 0, count: 0, timeSpent: 0 };
  const progress = Math.round(youtube.reduce((acc, t) => acc + t.progressPercentage, 0) / youtube.length);
  const timeSpent = youtube.reduce((acc, t) => acc + (t.units?.reduce((sum, u) => sum + (u.actualTimeSpentMinutes || 0), 0) || 0), 0);
  return { progress, count: youtube.length, timeSpent: Math.round(timeSpent / 60) };
 }, [tracks]);

 if (loading && !dashboard) return (
  <div className="flex items-center justify-center min-h-[60vh] w-full bg-[var(--bg-primary)]">
   <div className="flex flex-col items-center gap-4">
    <Loader2 className="w-8 h-8 text-[var(--accent-color)] animate-spin" />
    <div className="text-[var(--text-secondary)] font-bold uppercase tracking-widest text-xs">Booting Workspace...</div>
   </div>
  </div>
 );

 return (
  <div className="relative w-full h-full bg-[var(--bg-primary)] text-[var(--text-primary)] selection:bg-[var(--accent-color)]/30 selection:text-[var(--text-primary)] font-sans overflow-y-auto overflow-x-hidden">

   {/* Animated Ethereal Background Gradients */}
   <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[var(--accent-color)]/5 rounded-full blur-[120px] animate-pulse pointer-events-none" />
   <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-indigo-500/5 rounded-full blur-[150px] animate-pulse delay-1000 pointer-events-none" />

   <div className="relative z-10 w-full max-w-7xl mx-auto space-y-12 pt-10 pb-24 px-6 md:px-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">

    {/* Header Section */}
    <header className="flex flex-col md:flex-row justify-between md:items-center gap-8 pb-8 border-b border-[var(--border-color)]">
     <div className="space-y-2">
      <div className="flex items-center gap-3">
       <h1 className="text-4xl font-bold text-[var(--text-primary)] tracking-tighter uppercase italic">
        Neural Hub <span className="text-[var(--text-secondary)] opacity-30">//</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-color)] to-sky-500">Projects</span>
       </h1>
       <span className="bg-[var(--bg-secondary)] text-[var(--accent-color)] text-[10px] font-black px-3 py-1 rounded-full border border-[var(--border-color)] shadow-sm">V3.0</span>
      </div>
      <p className="text-[var(--text-secondary)] font-bold uppercase tracking-[0.2em] text-[10px] flex items-center gap-2">
       <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color)] animate-pulse" />
       Unified Tracking & Cognitive Management
      </p>
     </div>

     <div className="flex flex-wrap gap-4 items-center">
      {/* --- Main Action Area --- */}
      <div className="relative" ref={actionMenuRef}>
       <button 
         onClick={() => setShowActionMenu(!showActionMenu)}
         className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[var(--accent-color)] text-[var(--bg-primary)] font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all duration-300 shadow-xl shadow-[var(--accent-color)]/20 hover:-translate-y-0.5 active:scale-95 active:translate-y-0"
       >
         <Plus size={16} className={`transition-transform duration-500 ${showActionMenu ?"rotate-45" :""}`} />
         New Vector
         <ChevronDown size={14} className={`transition-transform duration-200 ${showActionMenu ?"rotate-180" :""}`} />
       </button>

       <AnimatePresence>
         {showActionMenu && (
           <motion.div 
             initial={{ opacity: 0, y: 10, scale: 0.95 }}
             animate={{ opacity: 1, y: 0, scale: 1 }}
             exit={{ opacity: 0, y: 10, scale: 0.95 }}
             className="absolute right-0 top-full mt-2 w-72 bg-[var(--bg-card)] rounded-3xl shadow-2xl border border-[var(--border-color)] p-2 z-[50] origin-top-right overflow-hidden backdrop-blur-xl"
           >
             <div className="max-h-[60vh] overflow-y-auto custom-scrollbar space-y-4 p-1">

               {/* --- Study Tracks Group --- */}
               <div>
                 <div className="text-[10px] font-black text-[var(--text-secondary)] px-3 py-2 uppercase tracking-[0.2em]">Study Vectors</div>
                 <div className="space-y-1">
                   <button 
                     onClick={() => { openModal('CREATE_COURSE'); setShowActionMenu(false); }}
                     className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[var(--bg-secondary)] transition-all text-left group"
                   >
                     <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                       <BookOpen size={16} />
                     </div>
                     <div>
                       <div className="font-bold text-[var(--text-primary)] text-sm">New Course</div>
                       <div className="text-[10px] text-[var(--text-secondary)]">Track structured learning</div>
                     </div>
                   </button>

                   <button 
                     onClick={() => { openModal('CREATE_PROJECT'); setShowActionMenu(false); }}
                     className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[var(--bg-secondary)] transition-all text-left group"
                   >
                     <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                       <Briefcase size={16} />
                     </div>
                     <div>
                       <div className="font-bold text-[var(--text-primary)] text-sm">New Project</div>
                       <div className="text-[10px] text-[var(--text-secondary)]">Manage complex builds</div>
                     </div>
                   </button>

                   <button 
                     onClick={() => { openModal('IMPORT_YOUTUBE'); setShowActionMenu(false); }}
                     className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[var(--bg-secondary)] transition-all text-left group"
                   >
                     <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                       <TrendingUp size={16} />
                     </div>
                     <div>
                       <div className="font-bold text-[var(--text-primary)] text-sm">Import YouTube</div>
                       <div className="text-[10px] text-[var(--text-secondary)]">Track a video playlist</div>
                     </div>
                   </button>
                 </div>
               </div>

               <div className="h-px bg-[var(--border-color)]" />

               {/* --- Plans / Roadmaps Group --- */}
               <div>
                 <div className="text-[10px] font-black text-[var(--text-secondary)] px-3 py-2 uppercase tracking-[0.2em] flex justify-between items-center">
                   <span>Roadmaps</span>
                   {isLimitReached && <Lock size={10} className="text-amber-500" />}
                 </div>

                 {isLimitReached ? (
                   <div className="px-4 py-3 bg-amber-500/5 rounded-xl border border-amber-500/20">
                     <p className="text-[10px] text-amber-500 font-bold leading-relaxed">
                       Limit reached ({plans.length}/{maxPlans}). Upgrade to create more roadmaps.
                     </p>
                   </div>
                 ) : (
                   <div className="space-y-1">
                     <button 
                       onClick={() => { setIsAiOpen(true); setShowActionMenu(false); }}
                       className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-gradient-to-r from-[var(--accent-color)]/10 to-fuchsia-500/10 hover:from-[var(--accent-color)]/20 hover:to-fuchsia-500/20 transition-all text-left group border border-[var(--border-color)]"
                     >
                       <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-color)] to-fuchsia-500 text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                         <Sparkles size={16} />
                       </div>
                       <div>
                         <div className="font-bold text-[var(--text-primary)] text-sm">AI Architect</div>
                         <div className="text-[10px] text-[var(--accent-color)]">Generate detailed plans</div>
                       </div>
                     </button>

                     <button 
                       onClick={() => { setImportOpen(true); setShowActionMenu(false); }}
                       className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[var(--bg-secondary)] transition-all text-left group"
                     >
                       <div className="w-8 h-8 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                         <FileSpreadsheet size={16} />
                       </div>
                       <div>
                         <div className="font-bold text-[var(--text-primary)] text-sm">Import from Excel</div>
                         <div className="text-[10px] text-[var(--text-secondary)]">Use existing data</div>
                       </div>
                     </button>

                     <button 
                       onClick={() => { setCreateOpen(true); setShowActionMenu(false); }}
                       className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[var(--bg-secondary)] transition-all text-left group"
                     >
                       <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-secondary)] flex items-center justify-center group-hover:scale-110 transition-transform border border-[var(--border-color)]">
                         <PenTool size={16} />
                       </div>
                       <div>
                         <div className="font-bold text-[var(--text-primary)] text-sm">Manual Entry</div>
                         <div className="text-[10px] text-[var(--text-secondary)]">Start from scratch</div>
                       </div>
                     </button>
                   </div>
                 )}
               </div>

             </div>
           </motion.div>
         )}
       </AnimatePresence>
      </div>

      <button 
       onClick={() => { fetchDashboard(); refreshPlans(); }} 
       className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)] font-black text-xs uppercase tracking-widest hover:text-[var(--text-primary)] transition-all duration-300 shadow-sm active:scale-95"
      >
       <History size={16} /> Sync
      </button>
     </div>
    </header>

    {/* Global Analytics Overview */}
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
     {[
      { title: 'Project', icon: Briefcase, color: 'text-rose-500', shadow: 'hover:shadow-rose-500/10', progress: projectAnalytics.progress, count: projectAnalytics.count, time: projectAnalytics.timeSpent, accent: 'rose' },
      { title: 'Course', icon: BookOpen, color: 'text-fuchsia-500', shadow: 'hover:shadow-fuchsia-500/10', progress: courseAnalytics.progress, count: courseAnalytics.count, time: courseAnalytics.timeSpent, accent: 'fuchsia' },
      { title: 'YouTube', icon: TrendingUp, color: 'text-pink-500', shadow: 'hover:shadow-pink-500/10', progress: youtubeAnalytics.progress, count: youtubeAnalytics.count, time: youtubeAnalytics.timeSpent, accent: 'pink' }
     ].map((stat, idx) => (
      <div key={idx} className={`bg-[var(--bg-card)]/40 backdrop-blur-xl border border-[var(--border-color)] p-6 md:p-8 rounded-[2.5rem] relative overflow-hidden group transition-all duration-500 shadow-xl ${stat.shadow} hover:-translate-y-1 flex flex-col md:flex-row items-center gap-6 md:gap-8`}>
       <div className={`absolute top-0 right-0 p-8 opacity-[0.03] ${stat.color} group-hover:scale-110 group-hover:-rotate-6 transition-all duration-700 group-hover:opacity-10 pointer-events-none`}>
        <stat.icon size={120} />
       </div>

       <div className="relative w-24 h-24 md:w-32 md:h-32 flex items-center justify-center shrink-0">
         <svg className="w-full h-full transform -rotate-90">
          <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-[var(--bg-secondary)]" />
          <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="283" strokeDashoffset={283 - (283 * stat.progress) / 100} className={`${stat.color} transition-all duration-1000 ease-out`} />
         </svg>
         <div className="absolute flex flex-col items-center">
          <span className="text-2xl md:text-3xl font-black text-[var(--text-primary)] tracking-tighter uppercase italic">{stat.progress}%</span>
         </div>
       </div>

       <div className="relative z-10 space-y-4 flex-1 text-center md:text-left">
         <div>
          <h3 className={`text-[10px] font-black uppercase tracking-[0.4em] ${stat.color} mb-1 flex items-center justify-center md:justify-start gap-2`}>
           <stat.icon size={12} /> {stat.title}
          </h3>
         </div>

         <div className="flex gap-4 md:gap-6 justify-center md:justify-start">
          <div className="flex flex-col">
           <span className="text-xl md:text-2xl font-black text-[var(--text-primary)] tracking-tighter uppercase italic">{stat.count}</span>
           <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Active</span>
          </div>
          <div className="w-px bg-[var(--border-color)]" />
          <div className="flex flex-col">
           <span className="text-xl md:text-2xl font-black text-[var(--text-primary)] tracking-tighter uppercase italic">{stat.time}<span className="text-sm text-[var(--text-secondary)] ml-1">H</span></span>
           <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Logged</span>
          </div>
         </div>
       </div>
      </div>
     ))}
    </section>

    {/* Actionable Review Section */}
    {dashboard && dashboard.dueRevisions && dashboard.dueRevisions.length > 0 && (
     <section className="flex flex-col mt-4">
      <div className="flex items-center gap-3 mb-4 ml-1">
       <div className="w-1.5 h-4 bg-[var(--accent-color)] rounded-full shadow-[0_0_10px_var(--accent-color)]" />
       <h2 className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em]">Neural Revision Pipeline</h2>
      </div>
      <div className="flex-1 bg-[var(--bg-card)]/30 backdrop-blur-xl border border-[var(--border-color)] shadow-2xl rounded-[3.5rem] p-8 relative overflow-hidden">
       <div className="absolute top-6 right-8 px-4 py-2 bg-[var(--accent-color)]/10 border border-[var(--accent-color)]/20 rounded-full">
         <span className="text-[9px] font-black text-[var(--accent-color)] uppercase tracking-widest">{dashboard.dueRevisions.length} Critical Vectors</span>
       </div>
       <ReviewList revisions={dashboard.dueRevisions} />
      </div>
     </section>
    )}

    {/* Track List Section */}
    <section className="space-y-8 pt-10 mt-10 border-t border-[var(--border-color)]">
     <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex items-center gap-4">
       <div className="p-3 bg-[var(--bg-secondary)] text-[var(--accent-color)] rounded-2xl shadow-sm border border-[var(--border-color)] flex items-center justify-center">
        <LayoutGrid size={20} />
       </div>
       <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tighter uppercase italic">Active Vectors</h2>
      </div>

      <div className="flex items-center">
        <div className="flex bg-[var(--bg-secondary)]/80 backdrop-blur-md p-1.5 rounded-2xl border border-[var(--border-color)] shadow-inner overflow-x-auto w-full md:w-auto">
         {(['ALL', 'ROADMAP', 'PROJECT', 'COURSE', 'YOUTUBE'] as const).map((type) => (
          <button 
           key={type}
           onClick={() => setFilterType(type)}
           className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
            filterType === type 
            ? 'bg-[var(--bg-card)] text-[var(--accent-color)] shadow-sm scale-100 border border-[var(--border-color)]' 
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] scale-95 hover:scale-100'
           }`}
          >
           {type === 'YOUTUBE' ? 'Media' : type}
          </button>
         ))}
        </div>
      </div>
     </div>

     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

      {/* Render Plans */}
      {(filterType === 'ALL' || filterType === 'ROADMAP') && plans.map((plan) => (
        <div className="group transition-all duration-300 hover:-translate-y-1 h-full" key={plan.id}>
         <PlanCard
          plan={plan as any}
          onView={(p) => navigate(`/plans/${p.id}`)}
          onDelete={() => handleDeletePlan(plan.id)}
         />
        </div>
      ))}

      {/* Render Tracks */}
      {filteredTracks.map((track: Track) => (
        <div className="group transition-all duration-300 hover:-translate-y-1 h-full" key={track.id}>
         <TrackCard track={track} onDelete={deleteTrack} />
        </div>
      ))}

      <button 
       onClick={() => setInitVectorModalOpen(true)}
       className="group h-full min-h-[350px] bg-[var(--bg-card)]/30 backdrop-blur-sm border-2 border-dashed border-[var(--border-color)] rounded-[3.5rem] flex flex-col items-center justify-center gap-5 hover:bg-[var(--bg-card)]/50 hover:border-[var(--accent-color)]/30 transition-all duration-500 active:scale-95 shadow-sm hover:shadow-2xl"
      >
       <div className="p-5 bg-[var(--bg-secondary)] rounded-2xl text-[var(--text-secondary)] group-hover:text-[var(--accent-color)] group-hover:rotate-90 transition-all duration-500 border border-[var(--border-color)] shadow-sm group-hover:shadow-md">
        <Plus size={32} />
       </div>
       <span className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] group-hover:text-[var(--text-primary)] transition-colors">Initialize New Vector</span>
      </button>
     </div>
    </section>
   </div>

   {/* --- Modals for Plans --- */}
   <CreatePlanModal 
    isOpen={createOpen} 
    onClose={() => setCreateOpen(false)} 
    onCreateComplete={handleCreateComplete} 
   />

   <ImportExcelModal 
    isOpen={importOpen} 
    onClose={() => setImportOpen(false)} 
    onImport={handleImportComplete} 
   />

   <AIPlanGenerator 
    isOpen={isAiOpen}
    onClose={() => setIsAiOpen(false)}
   />

   <InitializeVectorModal
    isOpen={initVectorModalOpen}
    onClose={() => setInitVectorModalOpen(false)}
    onAiArchitect={() => setIsAiOpen(true)}
    onImportExcel={() => setImportOpen(true)}
    onManualEntry={() => setCreateOpen(true)}
    isLimitReached={isLimitReached}
    plansCount={plans.length}
    maxPlans={maxPlans}
   />
  </div>
 );
}
