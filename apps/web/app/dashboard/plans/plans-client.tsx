"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plan } from "@/types/plan";
import { 
  PlanCard, 
  CreatePlanModal, 
  ImportExcelModal, 
  AIPlanGenerator 
} from "@features/plans"; // [cite: 180]

interface PlansClientProps {
  initialPlans: Plan[];
}

export default function PlansClient({ initialPlans }: PlansClientProps) {
  const router = useRouter();
  
  // Initialize state with the data we got from the server (Instant Load)
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  // Keep client state in sync if the server revalidates
  useEffect(() => {
    setPlans(initialPlans);
  }, [initialPlans]);

  const refreshData = () => {
    router.refresh(); // Tells the server to re-fetch the data in the background
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

    // 1. Optimistic Update: Remove from UI immediately for speed
    setPlans((prev) => prev.filter((p) => p.id !== planId));

    try {
      // 2. Call API to delete in background
      const res = await fetch(`/api/plans/${planId}`, { method: "DELETE" }); // [cite: 180]
      
      if (!res.ok) {
        throw new Error("Delete failed");
      }
      
      // 3. Sync with server to ensure data integrity
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to delete plan");
      // Revert if failed
      setPlans(initialPlans); 
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Plans</h1>
            <p className="text-gray-600 mt-2">
              Create, import, or generate plans with AI
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => setImportOpen(true)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Import from Excel
            </button>
            <button 
              onClick={() => setCreateOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              + New Plan
            </button>
            <AIPlanGenerator />
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