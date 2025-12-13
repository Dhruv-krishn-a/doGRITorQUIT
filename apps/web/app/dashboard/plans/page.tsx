"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plan } from "@/types/plan";
import CreatePlanModal from "@/components/Plan/CreatePlanModal";
import ImportExcelModal from "@/components/Plan/ImportExcelModal";
import AIPlanGenerator from "@/components/Plan/AIPlanGenerator";
import PlanCard from "@/components/Plan/PlanCard";
import { Loader2 } from "lucide-react";

export default function PlanningPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const loadPlans = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch("/api/plans", { 
        headers: { "Content-Type": "application/json" } 
      });
      
      if (!res.ok) {
        throw new Error(`Failed to load plans: ${res.status}`);
      }
      
      const data: Plan[] = await res.json();
      setPlans(data);
    } catch (err) {
      console.error("Error loading plans:", err);
      setError(err instanceof Error ? err.message : "Failed to load plans");
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleCreateComplete = () => {
    loadPlans();
  };

  const handleImportComplete = () => {
    loadPlans();
  };

  const handleViewPlan = (plan: Plan) => {
    router.push(`/dashboard/plans/${plan.id}`);
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm("Are you sure you want to delete this plan and all its tasks?")) {
      return;
    }

    try {
      const res = await fetch(`/api/plans/${planId}`, { 
        method: "DELETE" 
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Delete failed");
      }
      
      setPlans((prevPlans) => prevPlans.filter((plan) => plan.id !== planId));
    } catch (err) {
      console.error("Delete error:", err);
      alert(err instanceof Error ? err.message : "Failed to delete plan");
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

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Loading your plans...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 font-medium mb-2">Error loading plans</p>
            <p className="text-red-500 text-sm mb-4">{error}</p>
            <button
              onClick={loadPlans}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : plans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onView={handleViewPlan}
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
              Get started by creating your first plan or importing from Excel.
            </p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setCreateOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create New Plan
              </button>
              <button 
                onClick={() => setImportOpen(true)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Import from Excel
              </button>
            </div>
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