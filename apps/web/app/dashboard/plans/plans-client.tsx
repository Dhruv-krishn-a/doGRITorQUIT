// apps/web/app/dashboard/plans/plans-client.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plan } from "@/types/plan";
import { 
  PlanCard, 
  CreatePlanModal, 
  ImportExcelModal, 
  AIPlanGenerator 
} from "@features/plans"; 
import { Lock } from "lucide-react"; 

// ✅ FIX: Added missing props to interface
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

  useEffect(() => {
    setPlans(initialPlans);
  }, [initialPlans]);

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Limit Banner */}
        {isLimitReached && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg mb-6 flex items-center gap-3 text-sm">
            <Lock size={16} />
            <span>
              <strong>Plan Limit Reached.</strong> You have used {plans.length}/{maxPlans} plans. 
              Please upgrade to create more or delete an old plan.
            </span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Plans</h1>
            <p className="text-gray-600 mt-2">
              Create, import, or generate plans with AI
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Disable buttons if limit reached */}
            <button 
              onClick={() => !isLimitReached && setImportOpen(true)}
              disabled={isLimitReached}
              className={`px-4 py-2 border rounded-lg transition-colors font-medium ${
                isLimitReached 
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200" 
                  : "border-gray-300 hover:bg-gray-50 bg-white"
              }`}
            >
              Import from Excel
            </button>
            
            <button 
              onClick={() => !isLimitReached && setCreateOpen(true)}
              disabled={isLimitReached}
              className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                isLimitReached 
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              + New Plan
            </button>
            
            <div className={isLimitReached ? "opacity-50 pointer-events-none" : ""}>
               <AIPlanGenerator />
            </div>
          </div>
        </div>

        {plans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📋</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No plans yet
            </h3>
            <p className="text-gray-600 mb-6">
              Get started by creating your first plan.
            </p>
            <button 
              onClick={() => setCreateOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create New Plan
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
    </div>
  );
}