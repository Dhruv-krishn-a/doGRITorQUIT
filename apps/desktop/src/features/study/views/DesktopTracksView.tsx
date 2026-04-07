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
  <div className="flex items-center justify-center min-h-[60vh] w-full bg-[#fdfbfb]">
   <div className="flex flex-col items-center gap-4">
    <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
    <div className="text-rose-400 font-bold uppercase tracking-widest text-xs">Booting Workspace...</div>
   </div>
  </div>
 );

 return (
  <div className="relative w-full h-full bg-[#fdfbfb] text-slate-800 selection:bg-rose-200 selection:text-rose-900 font-sans overflow-y-auto overflow-x-hidden">

   {/* Animated Ethereal Background Gradients */}
   <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-rose-200/40 rounded-full blur-[60px]  animate-pulse pointer-events-none" />
   <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-pink-200/40 rounded-full blur-[60px]  animate-pulse delay-1000 pointer-events-none" />
   <div className="absolute top-[40%] left-[50%] w-[40vw] h-[40vw] bg-fuchsia-100/40 rounded-full blur-[60px]  pointer-events-none -translate-x-1/2" />

   <div className="relative z-10 w-full max-w-7xl mx-auto space-y-12 pt-10 pb-24 px-6 md:px-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">

    {/* Header Section */}
    <header className="flex flex-col md:flex-row justify-between md:items-center gap-8 pb-8 border-b border-rose-100/60">
     <div className="space-y-2">
      <div className="flex items-center gap-3">
       <h1 className="text-4xl font-bold text-slate-900 tracking-tighter uppercase">
        Upgrade <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-fuchsia-500">OS</span>
       </h1>
       <span className="bg-white text-rose-500 text-[10px] font-bold px-2.5 py-1 rounded-full border border-rose-100 shadow-sm shadow-rose-100/50">V3.0</span>
      </div>
      <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] flex items-center gap-2">
       <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
       Unified Tracking & Cognitive Management
      </p>
     </div>

     <div className="flex flex-wrap gap-4 items-center">
      {/* --- Main Action Area --- */}
      <div className="relative" ref={actionMenuRef}>
       <button 
         onClick={() => setShowActionMenu(!showActionMenu)}
         className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-xs uppercase tracking-widest hover:from-rose-400 hover:to-pink-400 transition-all duration-300 shadow-[0_8px_20px_rgba(244,63,94,0.25)] hover:shadow-[0_12px_25px_rgba(244,63,94,0.4)] hover:-translate-y-0.5 active:scale-95 active:translate-y-0"
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
             className="absolute right-0 top-full mt-2 w-72 bg-white rounded-3xl shadow-2xl border border-slate-100 p-2 z-[50] origin-top-right overflow-hidden"
           >
             <div className="max-h-[60vh] overflow-y-auto custom-scrollbar space-y-4 p-1">

               {/* --- Study Tracks Group --- */}
               <div>
                 <div className="text-[10px] font-bold text-slate-400 px-3 py-2 uppercase tracking-[0.2em]">Study Vectors</div>
                 <div className="space-y-1">
                   <button 
                     onClick={() => { openModal('CREATE_COURSE'); setShowActionMenu(false); }}
                     className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition-all text-left group"
                   >
                     <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                       <BookOpen size={16} />
                     </div>
                     <div>
                       <div className="font-bold text-slate-800 text-sm">New Course</div>
                       <div className="text-[10px] text-slate-500">Track structured learning</div>
                     </div>
                   </button>

                   <button 
                     onClick={() => { openModal('CREATE_PROJECT'); setShowActionMenu(false); }}
                     className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition-all text-left group"
                   >
                     <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                       <Briefcase size={16} />
                     </div>
                     <div>
                       <div className="font-bold text-slate-800 text-sm">New Project</div>
                       <div className="text-[10px] text-slate-500">Manage complex builds</div>
                     </div>
                   </button>

                   <button 
                     onClick={() => { openModal('IMPORT_YOUTUBE'); setShowActionMenu(false); }}
                     className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition-all text-left group"
                   >
                     <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                       <TrendingUp size={16} />
                     </div>
                     <div>
                       <div className="font-bold text-slate-800 text-sm">Import YouTube</div>
                       <div className="text-[10px] text-slate-500">Track a video playlist</div>
                     </div>
                   </button>
                 </div>
               </div>

               <div className="h-px bg-slate-100" />

               {/* --- Plans / Roadmaps Group --- */}
               <div>
                 <div className="text-[10px] font-bold text-slate-400 px-3 py-2 uppercase tracking-[0.2em] flex justify-between items-center">
                   <span>Roadmaps</span>
                   {isLimitReached && <Lock size={10} className="text-amber-500" />}
                 </div>

                 {isLimitReached ? (
                   <div className="px-4 py-3 bg-amber-50/50 rounded-xl border border-amber-100/50">
                     <p className="text-[10px] text-amber-700 font-bold leading-relaxed">
                       Plan limit reached ({plans.length}/{maxPlans}). Upgrade to create more roadmaps.
                     </p>
                   </div>
                 ) : (
                   <div className="space-y-1">
                     <button 
                       onClick={() => { setIsAiOpen(true); setShowActionMenu(false); }}
                       className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-gradient-to-r from-rose-50 to-fuchsia-50 hover:from-rose-100 hover:to-fuchsia-100 transition-all text-left group border border-rose-100/50"
                     >
                       <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-fuchsia-500 text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                         <Sparkles size={16} />
                       </div>
                       <div>
                         <div className="font-bold text-slate-900 text-sm">AI Architect</div>
                         <div className="text-[10px] text-rose-600/80">Generate detailed plans</div>
                       </div>
                     </button>

                     <button 
                       onClick={() => { setImportOpen(true); setShowActionMenu(false); }}
                       className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition-all text-left group"
                     >
                       <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                         <FileSpreadsheet size={16} />
                       </div>
                       <div>
                         <div className="font-bold text-slate-800 text-sm">Import from Excel</div>
                         <div className="text-[10px] text-slate-500">Use existing data</div>
                       </div>
                     </button>

                     <button 
                       onClick={() => { setCreateOpen(true); setShowActionMenu(false); }}
                       className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition-all text-left group"
                     >
                       <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                         <PenTool size={16} />
                       </div>
                       <div>
                         <div className="font-bold text-slate-800 text-sm">Manual Entry</div>
                         <div className="text-[10px] text-slate-500">Start from scratch</div>
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
       className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white text-slate-600 border border-slate-200 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 hover:text-rose-500 hover:border-rose-200 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95"
      >
       <History size={16} /> Sync
      </button>
     </div>
    </header>

    {/* Global Analytics Overview */}
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
     {[
      { title: 'Project', icon: Briefcase, color: 'text-rose-500', shadow: 'hover:shadow-rose-100', progress: projectAnalytics.progress, count: projectAnalytics.count, time: projectAnalytics.timeSpent, accent: 'rose' },
      { title: 'Course', icon: BookOpen, color: 'text-fuchsia-500', shadow: 'hover:shadow-fuchsia-100', progress: courseAnalytics.progress, count: courseAnalytics.count, time: courseAnalytics.timeSpent, accent: 'fuchsia' },
      { title: 'YouTube', icon: TrendingUp, color: 'text-pink-500', shadow: 'hover:shadow-pink-100', progress: youtubeAnalytics.progress, count: youtubeAnalytics.count, time: youtubeAnalytics.timeSpent, accent: 'pink' }
     ].map((stat, idx) => (
      <div key={idx} className={`bg-white/60 backdrop-blur-md border border-white p-6 md:p-8 rounded-[2.5rem] relative overflow-hidden group hover:border-${stat.accent}-200 transition-all duration-500 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl ${stat.shadow} hover:-translate-y-1 flex flex-col md:flex-row items-center gap-6 md:gap-8`}>
       <div className={`absolute top-0 right-0 p-8 opacity-[0.03] ${stat.color} group-hover:scale-110 group-hover:-rotate-6 transition-all duration-700 group-hover:opacity-10 pointer-events-none`}>
        <stat.icon size={120} />
       </div>

       <div className="relative w-24 h-24 md:w-32 md:h-32 flex items-center justify-center shrink-0">
         <svg className="w-full h-full transform -rotate-90">
          <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
          <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="283" strokeDashoffset={283 - (283 * stat.progress) / 100} className={`${stat.color} transition-all duration-1000 ease-out`} />
         </svg>
         <div className="absolute flex flex-col items-center">
          <span className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tighter">{stat.progress}%</span>
         </div>
       </div>

       <div className="relative z-10 space-y-4 flex-1 text-center md:text-left">
         <div>
          <h3 className={`text-[10px] font-bold uppercase tracking-[0.4em] ${stat.color} mb-1 flex items-center justify-center md:justify-start gap-2`}>
           <stat.icon size={12} /> {stat.title} Analytics
          </h3>
         </div>

         <div className="flex gap-4 md:gap-6 justify-center md:justify-start">
          <div className="flex flex-col">
           <span className="text-xl md:text-2xl font-bold text-slate-800 tracking-tighter">{stat.count}</span>
           <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Active</span>
          </div>
          <div className="w-px bg-slate-200" />
          <div className="flex flex-col">
           <span className="text-xl md:text-2xl font-bold text-slate-800 tracking-tighter">{stat.time}<span className="text-sm text-slate-400 ml-1">H</span></span>
           <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Logged</span>
          </div>
         </div>
       </div>
      </div>
     ))}
    </section>

    {/* Actionable Review Section */}
    {dashboard && dashboard.dueRevisions && dashboard.dueRevisions.length > 0 && (
     <section className="flex flex-col mt-4">
      <div className="flex items-center gap-3 mb-4">
       <div className="w-1.5 h-4 bg-rose-400 rounded-full" />
       <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em]">Neural Revision Pipeline</h2>
      </div>
      <div className="flex-1 bg-white/60 backdrop-blur-md border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] p-8 relative overflow-hidden">
       <div className="absolute top-6 right-8 px-4 py-2 bg-rose-50 border border-rose-100 rounded-full">
         <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest">{dashboard.dueRevisions.length} Critical</span>
       </div>
       <ReviewList revisions={dashboard.dueRevisions} />
      </div>
     </section>
    )}

    {/* Track List Section */}
    <section className="space-y-8 pt-10 mt-10 border-t border-rose-100/60">
     <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex items-center gap-4">
       <div className="p-3 bg-white text-rose-500 rounded-2xl shadow-sm border border-rose-100 flex items-center justify-center">
        <LayoutGrid size={20} />
       </div>
       <h2 className="text-2xl font-bold text-slate-900 tracking-tighter uppercase">Active Vectors</h2>
      </div>

      <div className="flex items-center">
        <div className="flex bg-white/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto w-full md:w-auto">
         {(['ALL', 'ROADMAP', 'PROJECT', 'COURSE', 'YOUTUBE'] as const).map((type) => (
          <button 
           key={type}
           onClick={() => setFilterType(type)}
           className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
            filterType === type 
            ? 'bg-rose-50 text-rose-600 shadow-sm scale-100' 
            : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50 scale-95 hover:scale-100'
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
       className="group h-full min-h-[350px] bg-white/40 backdrop-blur-sm border-2 border-dashed border-rose-200 rounded-[2.5rem] flex flex-col items-center justify-center gap-5 hover:bg-white/80 hover:border-rose-400 transition-all duration-500 active:scale-95 shadow-sm hover:shadow-xl hover:shadow-rose-100/50"
      >
       <div className="p-5 bg-white rounded-2xl text-rose-300 group-hover:text-rose-500 group-hover:rotate-90 transition-all duration-500 border border-rose-100 shadow-sm group-hover:shadow-md">
        <Plus size={32} />
       </div>
       <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] group-hover:text-rose-500 transition-colors">Initialize New Vector</span>
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
