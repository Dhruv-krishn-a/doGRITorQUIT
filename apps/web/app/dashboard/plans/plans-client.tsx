// apps/web/app/dashboard/plans/plans-client.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plan } from "@/types/plan";
import { 
  PlanCard, 
  CreatePlanModal, 
  ImportExcelModal, 
  AIPlanGenerator 
} from "@features/plans"; 
import { 
  Lock, Plus, Sparkles, FileSpreadsheet, PenTool, ChevronDown 
} from "lucide-react"; 
import { AnimatePresence, motion } from "framer-motion";

interface PlansClientProps {
  initialPlans: Plan[];
  isLimitReached: boolean;
  maxPlans: number;
}

export default function PlansClient({ initialPlans, isLimitReached, maxPlans }: PlansClientProps) {
  const router = useRouter();
  
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  
  const [isAiOpen, setIsAiOpen] = useState(false);
  
  const [showActionMenu, setShowActionMenu] = useState(false);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPlans(initialPlans);
  }, [initialPlans]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setShowActionMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const refreshData = () => {
    router.refresh(); 
  };

  const handleCreateComplete = () => {
    refreshData();
    setCreateOpen(false);
  };

  const handleImportComplete = () => {
    refreshData();
    setImportOpen(false);
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;
    setPlans((prev) => prev.filter((p) => p.id !== planId));

    try {
      const res = await fetch(`/api/plans/${planId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to delete plan");
      setPlans(initialPlans); 
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50/50 via-white to-purple-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        
        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Your Roadmaps</h1>
            <p className="text-lg text-slate-500 mt-2 max-w-2xl">
              Manage your long-term goals and let AI optimize your path to success.
            </p>
          </div>

          {/* --- Main Action Area --- */}
          <div className="relative" ref={actionMenuRef}>
            {isLimitReached ? (
               <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-xl border border-amber-200 text-sm font-bold">
                 <Lock size={16} /> Plan Limit Reached ({plans.length}/{maxPlans})
               </div>
            ) : (
                <div className="flex gap-3">
                    {/* Primary Trigger */}
                    <button 
                        onClick={() => setShowActionMenu(!showActionMenu)}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95"
                    >
                        <Plus size={20} />
                        Build New Roadmap
                        <ChevronDown size={16} className={`transition-transform duration-200 ${showActionMenu ? "rotate-180" : ""}`} />
                    </button>
                </div>
            )}

            {/* --- Dropdown Menu --- */}
            <AnimatePresence>
                {showActionMenu && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 origin-top-right"
                    >
                        <div className="space-y-1">
                            {/* ✅ AI Option */}
                            <div className="p-1">
                                <div className="text-xs font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">Recommended</div>
                                <button 
                                    onClick={() => { setIsAiOpen(true); setShowActionMenu(false); }}
                                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-linear-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 transition-all text-left group border border-indigo-100/50"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                        <Sparkles size={16} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-indigo-900 text-sm">AI Architect</div>
                                        <div className="text-xs text-indigo-600/80">Generate detailed plans</div>
                                    </div>
                                </button>
                            </div>

                            <div className="h-px bg-slate-100 my-1" />

                            {/* Standard Options */}
                            <button 
                                onClick={() => { setImportOpen(true); setShowActionMenu(false); }}
                                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors text-left group"
                            >
                                <div className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                                    <FileSpreadsheet size={16} />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-800 text-sm">Import from Excel</div>
                                    <div className="text-xs text-slate-500">Use existing data</div>
                                </div>
                            </button>

                            <button 
                                onClick={() => { setCreateOpen(true); setShowActionMenu(false); }}
                                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors text-left group"
                            >
                                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                                    <PenTool size={16} />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-800 text-sm">Manual Entry</div>
                                    <div className="text-xs text-slate-500">Start from scratch</div>
                                </div>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
          </div>
        </div>

        {/* --- Content Grid --- */}
        {plans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onView={(p) => router.push(`/dashboard/plans/${p.id}`)}
                onDelete={() => handleDeletePlan(plan.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white/50 border-2 border-dashed border-slate-200 rounded-3xl text-center">
            <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
              <span className="text-4xl">🚀</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              No roadmaps yet
            </h3>
            <p className="text-slate-500 mb-8 max-w-md">
              Your journey begins here. Create your first roadmap to start tracking your progress.
            </p>
            <button 
              onClick={() => setIsAiOpen(true)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >
              Start with AI
            </button>
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