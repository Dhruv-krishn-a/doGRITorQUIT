import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Sparkles, Loader2, History, ChevronDown, FileSpreadsheet, PenTool } from 'lucide-react';
import { PlanCard } from '@gritorquit/study-ui-web';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { usePlans } from '../../plans/hooks/usePlans';
import { api } from '../../../services/api';
import CreatePlanModal from '../../plans/components/CreatePlanModal';
import ImportExcelModal from '../../plans/components/ImportExcelModal';
import AIPlanGenerator from '../../plans/components/AIPlanGenerator';
import { useEntitlements } from '../../billing/hooks/useEntitlements';

export function RoadmapTrackerView() {
  const navigate = useNavigate();
  const { plans, loading, refreshPlans } = usePlans();
  const { entitlements } = useEntitlements();
  
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const actionMenuRef = useRef<HTMLDivElement>(null);

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

  const handleCreateComplete = useCallback(() => {
    refreshPlans();
    setCreateOpen(false);
  }, [refreshPlans]);

  const handleImportComplete = useCallback(() => {
    refreshPlans();
    setImportOpen(false);
  }, [refreshPlans]);

  const handleDeletePlan = useCallback(async (planId: string) => {
    if (!confirm("Are you sure you want to delete this roadmap?")) return;
    try {
      await api.delete(`/api/plans/${planId}`);
      refreshPlans();
    } catch (err) {
      console.error(err);
    }
  }, [refreshPlans]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh] bg-[var(--bg-primary)] w-full">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-[var(--accent-color)] animate-spin" />
        <div className="text-[var(--text-secondary)] font-bold uppercase tracking-widest text-xs italic">Syncing Roadmaps...</div>
      </div>
    </div>
  );

  return (
    <div className="relative w-full h-full bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans overflow-hidden italic overflow-y-auto custom-scrollbar">
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[var(--accent-color)]/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-7xl mx-auto space-y-12 pt-10 pb-24 px-6 md:px-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <header className="flex flex-col md:flex-row justify-between md:items-center gap-8 pb-8 border-b border-[var(--border-color)]">
          <div className="space-y-2 text-left">
            <h1 className="text-4xl font-bold text-[var(--text-primary)] tracking-tighter uppercase">
              Roadmap <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-color)] to-sky-500">Tracker</span>
            </h1>
            <p className="text-[var(--text-secondary)] font-bold uppercase tracking-[0.2em] text-[10px] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color)] animate-pulse" />
              AI Architected and custom learning roadmaps
            </p>
          </div>
          
          <div className="flex gap-4 items-center">
            <div className="relative" ref={actionMenuRef}>
              <button 
                  onClick={() => setShowActionMenu(!showActionMenu)}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[var(--accent-color)] text-[var(--bg-primary)] font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all duration-300 shadow-xl shadow-[var(--accent-color)]/20 hover:-translate-y-0.5 active:scale-95"
              >
                  <Plus size={16} className={`transition-transform duration-500 ${showActionMenu ? "rotate-45" : ""}`} />
                  New Roadmap
                  <ChevronDown size={14} className={`transition-transform duration-200 ${showActionMenu ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                  {showActionMenu && (
                      <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 top-full mt-2 w-72 bg-[var(--bg-card)] rounded-3xl shadow-2xl border border-[var(--border-color)] p-2 z-50 origin-top-right overflow-hidden backdrop-blur-xl"
                      >
                          <div className="space-y-1 p-1">
                              <button 
                                  onClick={() => { setIsAiOpen(true); setShowActionMenu(false); }}
                                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[var(--bg-secondary)] transition-all text-left group"
                              >
                                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                      <Sparkles size={16} />
                                  </div>
                                  <div>
                                      <div className="font-bold text-[var(--text-primary)] text-sm">AI Architect</div>
                                      <div className="text-[10px] text-[var(--text-secondary)]">Generate detailed plans</div>
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
                      </motion.div>
                  )}
              </AnimatePresence>
            </div>

            <button 
              onClick={() => refreshPlans()} 
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)] font-black text-xs uppercase tracking-widest hover:text-[var(--text-primary)] transition-all shadow-sm active:scale-95"
            >
              <History size={16} /> Sync
            </button>
          </div>
        </header>

        {plans.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] border-2 border-dashed border-[var(--border-color)] rounded-[3.5rem] bg-[var(--bg-card)]/30 backdrop-blur-sm p-10 text-center">
             <div className="p-6 bg-[var(--bg-secondary)] rounded-3xl text-[var(--accent-color)] mb-6 shadow-sm border border-[var(--border-color)]">
               <Sparkles size={40} />
             </div>
             <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic mb-2">No Roadmaps Found</h3>
             <p className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest max-w-md mx-auto mb-8 leading-relaxed opacity-60">
               Architect your first learning roadmap with AI or manual input.
             </p>
             <button 
                onClick={() => setIsAiOpen(true)}
                className="flex items-center gap-3 px-8 py-4 rounded-full border border-[var(--accent-color)]/50 text-[var(--accent-color)] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[var(--accent-color)] hover:text-[var(--bg-primary)] transition-all shadow-sm"
              >
                Invoke AI Architect <Sparkles size={14} />
              </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map((plan) => (
               <div className="group transition-all duration-300 hover:-translate-y-1 h-full" key={plan.id}>
                 <PlanCard
                   plan={plan as any}
                   onView={(p) => navigate(`/plans/${p.id}`)}
                   onDelete={() => handleDeletePlan(plan.id)}
                 />
               </div>
            ))}
          </div>
        )}
      </div>

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
    </div>
  );
}
