"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { 
  Plus, 
  Loader2, 
  History, 
  BookOpen, 
  Sparkles, 
  Github, 
  ArrowRight, 
  Zap, 
  TrendingUp, 
  Play, 
  AlertCircle
} from 'lucide-react';
import { useStudy } from '@gritorquit/study-core';
import { ReviewList } from '@gritorquit/study-ui-web';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePlans } from '../../plans/hooks/usePlans';
import { api } from '../../../services/api';
import { InitializeVectorModal } from '../components/InitializeVectorModal';
import { useEntitlements } from '../../billing/hooks/useEntitlements';

export function DesktopTracksView() {
  const navigate = useNavigate();
  const { tracks, dashboard, loading, fetchDashboard } = useStudy();
  const { plans, loading: plansLoading } = usePlans();
  const { entitlements } = useEntitlements();
  
  const [initPathModalOpen, setInitPathModalOpen] = useState(false);
  const [trackerProjectsCount, setTrackerProjectsCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  const maxPlans = entitlements?.features?.MAX_PLANS || 1;
  const isLimitReached = plans.length >= maxPlans;

  useEffect(() => {
    setMounted(true);
    fetchDashboard();
    
    // Fetch project count
    api.get("/api/github-projects")
      .then(data => setTrackerProjectsCount(data?.length || 0))
      .catch(() => setTrackerProjectsCount(0));
  }, [fetchDashboard]);

  // Logic for the "Next Step" Hero Card
  const nextStep = useMemo(() => {
    if (dashboard?.dueRevisions && dashboard.dueRevisions.length > 0) {
      return {
        title: "Keep it fresh",
        description: "You have concepts ready for review.",
        actionLabel: "Start Revision",
        onClick: () => navigate('/today'),
        icon: <History className="text-amber-400" />
      };
    }
    const activeTrack = tracks.find(t => t.status === 'ACTIVE');
    if (activeTrack) {
      return {
        title: `Continue: ${activeTrack.title}`,
        description: "Pick up exactly where you left off.",
        actionLabel: "Resume Now",
        onClick: () => {
          const typePath = activeTrack.type === 'PLAYLIST' ? 'youtube' : 'course';
          navigate(`/study/${typePath}/${activeTrack.id}`);
        },
        icon: <Play className="text-emerald-400" fill="currentColor" />
      };
    }
    return {
      title: "Begin your journey",
      description: "You haven't started a path yet today.",
      actionLabel: "Explore Options",
      onClick: () => setInitPathModalOpen(true),
      icon: <Zap className="text-indigo-400" fill="currentColor" />
    };
  }, [dashboard, tracks, navigate]);

  // Energy Balance Score
  const energyScore = useMemo(() => {
    const activeCount = tracks.filter(t => t.status === 'ACTIVE').length + (trackerProjectsCount > 0 ? 1 : 0);
    if (activeCount === 0) return { percent: 20, label: "Plenty of room", color: "from-blue-500 to-sky-400", advice: "You have a lot of energy to start something new." };
    if (activeCount <= 2) return { percent: 50, label: "Perfect Balance", color: "from-emerald-500 to-teal-400", advice: "Your learning pace is exactly where it should be." };
    if (activeCount <= 4) return { percent: 80, label: "Day is Full", color: "from-amber-500 to-orange-400", advice: "You have a lot on your plate. Focus on finishing these." };
    return { percent: 95, label: "Overload Risk", color: "from-rose-500 to-pink-400", advice: "Warning: You might feel tired soon. Maybe pause one path?" };
  }, [tracks, trackerProjectsCount]);

  if (loading || plansLoading || !mounted) return (
    <div className="flex items-center justify-center min-h-[60vh] w-full bg-[var(--bg-primary)]">
      <Loader2 className="w-8 h-8 text-[var(--accent-color)] animate-spin" />
    </div>
  );

  return (
    <div className="relative w-full h-full bg-[var(--bg-primary)] selection:bg-[var(--accent-color)]/30 font-sans pb-20 overflow-y-auto custom-scrollbar">
      
      <div className="absolute top-0 left-1/4 w-[40vw] h-[40vw] bg-[var(--accent-color)]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-12 space-y-12">
        
        <header className="space-y-2 text-left">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold tracking-tight italic"
          >
            Your <span className="text-[var(--accent-color)]">Growth</span> Hub
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[var(--text-secondary)] font-medium uppercase tracking-[0.2em] text-[10px]"
          >
            Simple. Focused. Non-stop Progress.
          </motion.p>
        </header>

        {/* Hero Card */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          onClick={nextStep.onClick}
          className="relative group cursor-pointer overflow-hidden rounded-[3rem] border border-[var(--border-color)] bg-[var(--bg-card)]/40 backdrop-blur-xl p-8 md:p-12 shadow-2xl transition-all hover:border-[var(--accent-color)]/30"
        >
          <div className="absolute top-0 right-0 p-12 opacity-5 transition-transform group-hover:scale-110 group-hover:-rotate-12">
             {React.cloneElement(nextStep.icon as React.ReactElement<any>, { size: 200 })}
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
             <div className="w-20 h-20 rounded-3xl bg-[var(--bg-secondary)] flex items-center justify-center shadow-inner border border-[var(--border-color)] group-hover:scale-110 transition-transform duration-500">
                {React.cloneElement(nextStep.icon as React.ReactElement<any>, { size: 32 })}
             </div>
             <div className="flex-1 text-center md:text-left space-y-2">
                <h2 className="text-2xl font-bold italic uppercase tracking-tight">{nextStep.title}</h2>
                <p className="text-[var(--text-secondary)] font-medium">{nextStep.description}</p>
             </div>
             <button className="px-8 py-4 bg-[var(--accent-color)] text-[var(--bg-primary)] rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[var(--accent-color)]/20 active:scale-95 transition-all">
                {nextStep.actionLabel}
             </button>
          </div>
        </motion.section>

        {/* Balance Meter */}
        <section className="bg-[var(--bg-card)]/20 border border-[var(--border-color)] rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center gap-10 shadow-sm">
           <div className="w-full md:w-64 space-y-3 text-center md:text-left">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)]">Your Day Balance</h3>
              <div className="h-3 w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden border border-[var(--border-color)]">
                 <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${energyScore.percent}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={`h-full bg-gradient-to-r ${energyScore.color}`} 
                 />
              </div>
              <div className="flex items-center justify-between font-black text-[10px] italic">
                 <span className="text-[var(--accent-color)]">{energyScore.label}</span>
                 <span className="opacity-40">{energyScore.percent}% Capacity</span>
              </div>
           </div>
           <div className="flex-1 p-5 rounded-2xl bg-[var(--bg-secondary)]/50 border border-[var(--border-color)] flex items-start gap-4 text-left">
              <AlertCircle size={18} className="text-[var(--accent-color)] shrink-0 mt-0.5" />
              <p className="text-sm font-medium leading-relaxed italic opacity-80">{energyScore.advice}</p>
           </div>
        </section>

        {/* Pillars */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { id: 'build', label: 'Build', sub: 'Projects', path: '/project-tracker', icon: <Github />, count: trackerProjectsCount, color: 'hover:border-rose-500/30' },
            { id: 'learn', label: 'Learn', sub: 'Courses', path: '/course-tracker', icon: <BookOpen />, count: tracks.filter(t => t.type === 'COURSE').length, color: 'hover:border-fuchsia-500/30' },
            { id: 'watch', label: 'Watch', sub: 'Media', path: '/media-tracker', icon: <TrendingUp />, count: tracks.filter(t => t.type === 'PLAYLIST').length, color: 'hover:border-pink-500/30' },
            { id: 'plan', label: 'Plan', sub: 'Roadmaps', path: '/roadmap-tracker', icon: <Sparkles />, count: plans.length, color: 'hover:border-sky-500/30' },
          ].map((pillar) => (
            <motion.div 
              whileHover={{ y: -5 }}
              key={pillar.id}
              onClick={() => navigate(pillar.path)}
              className={`group cursor-pointer bg-[var(--bg-card)]/40 border border-[var(--border-color)] p-6 rounded-[2.5rem] transition-all duration-300 ${pillar.color} hover:shadow-2xl text-left`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-[var(--bg-secondary)] rounded-2xl text-[var(--text-primary)] group-hover:text-[var(--accent-color)] transition-colors border border-[var(--border-color)]">
                   {React.cloneElement(pillar.icon as React.ReactElement<any>, { size: 24 })}
                </div>
                <div className="text-right">
                   <div className="text-2xl font-black italic tracking-tighter">{pillar.count}</div>
                   <div className="text-[8px] font-bold uppercase tracking-widest opacity-40">{pillar.sub}</div>
                </div>
              </div>
              <h3 className="text-xl font-bold uppercase tracking-tight italic flex items-center gap-2">
                {pillar.label} <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0 transition-transform" />
              </h3>
            </motion.div>
          ))}
        </section>

        {/* Daily Refresh */}
        {dashboard?.dueRevisions && dashboard.dueRevisions.length > 0 && (
          <section className="space-y-6 text-left">
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-6 bg-[var(--accent-color)] rounded-full shadow-[0_0_15px_var(--accent-color)]" />
              <h2 className="text-xl font-bold uppercase italic tracking-widest">Don't forget these</h2>
            </div>
            <div className="bg-[var(--bg-card)]/30 backdrop-blur-md border border-[var(--border-color)] rounded-[3.5rem] p-8">
              <ReviewList revisions={dashboard.dueRevisions} />
            </div>
          </section>
        )}

        {/* Quick Start */}
        <footer className="pt-10 flex flex-col items-center">
           <button 
              onClick={() => setInitPathModalOpen(true)}
              className="group flex flex-col items-center gap-4"
           >
              <div className="w-16 h-16 rounded-full bg-[var(--bg-card)] border-2 border-dashed border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] group-hover:border-[var(--accent-color)] group-hover:text-[var(--accent-color)] transition-all duration-500 group-hover:rotate-90">
                 <Plus size={32} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">Start something new</span>
           </button>
        </footer>
      </div>

      <InitializeVectorModal 
        isOpen={initPathModalOpen}
        onClose={() => setInitPathModalOpen(false)}
        onAiArchitect={() => navigate('/roadmap-tracker')}
        onImportExcel={() => navigate('/roadmap-tracker')}
        onManualEntry={() => navigate('/roadmap-tracker')}
        onNewProject={() => navigate('/project-tracker')}
        isLimitReached={isLimitReached}
        plansCount={plans.length}
        maxPlans={maxPlans}
      />
    </div>
  );
}
