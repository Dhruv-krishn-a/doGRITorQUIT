// apps/web/app/dashboard/plans/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plan } from "@/types/plan";
import CreatePlanModal from "@/app/components/Plan/CreatePlanModal";
import ImportExcelModal from "@/app/components/Plan/ImportExcelModal";
import AIPlanGenerator from "@/app/components/Plan/AIPlanGenerator";
import PlanCard from "@/app/components/Plan/PlanCard";

export default function PlanningPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const loadPlans = async () => {
  setLoading(true);
  try {
    const res = await fetch("/api/plans", { 
      headers: { "Content-Type": "application/json" } 
    });
    
    console.log("Response status:", res.status); // Add this
    console.log("Response status text:", res.statusText); // Add this
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error("Error response:", errorText);
      throw new Error(`Failed to load plans: ${res.status} - ${errorText}`);
    }
    
    const data: Plan[] = await res.json();
    setPlans(data);
  } catch (err) {
    console.error("Error details:", err);
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

  const handleDelete = async (planId: string) => {
    if (!confirm("Delete plan and all tasks?")) return;
    try {
      const res = await fetch(`/api/plans/${planId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setPlans((p) => p.filter((x) => x.id !== planId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete");
    }
  };

  return (
    <div className="p-6 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Your Plans</h1>
            <p className="text-sm text-(--text-secondary) mt-1">Create, import, or generate plans with AI</p>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setImportOpen(true)} className="px-3 py-2 border rounded">Import from Excel</button>
            <button onClick={() => setCreateOpen(true)} className="px-4 py-2 bg-(--accent-color) text-white rounded">New Plan</button>
            <AIPlanGenerator />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading plans…</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.length > 0 ? plans.map((p) => (
              <PlanCard key={p.id} plan={p} onView={handleViewPlan} onDelete={() => handleDelete(p.id)} />
            )) : (
              <div className="col-span-full text-center py-12 text-(--text-secondary)">
                No plans yet — create one or import from Excel.
              </div>
            )}
          </div>
        )}
      </div>

      <CreatePlanModal isOpen={createOpen} onClose={() => setCreateOpen(false)} onCreateComplete={handleCreateComplete} />
      <ImportExcelModal isOpen={importOpen} onClose={() => setImportOpen(false)} onImport={handleImportComplete} />
    </div>
  );
}