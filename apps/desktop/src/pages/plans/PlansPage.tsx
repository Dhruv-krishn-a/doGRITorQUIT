import React, { useState } from 'react';
import { usePlans } from '../../features/plans/hooks/usePlans';
import { PlanCard } from '@planner/study-ui-web';
import CreatePlanModal from '../../features/plans/components/CreatePlanModal';
import { Button } from '../../components/ui/Button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function PlansPage() {
  const { plans, loading, error, refreshPlans } = usePlans();
  const [createOpen, setCreateOpen] = useState(false);
  const navigate = useNavigate();

  const handleDeletePlan = async (planId: string) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;
    try {
        await supabase.from('plans').update({ isArchived: true }).eq('id', planId);
        refreshPlans();
    } catch (err) {
        console.error(err);
    }
  };

  if (loading) return <div className="transform-gpu p-8 flex items-center justify-center"><div className="transform-gpu animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div></div>;
  if (error) return <div className="transform-gpu p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="transform-gpu p-4 md:p-8 max-w-7xl mx-auto w-full">
        <div className="transform-gpu flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="transform-gpu text-4xl font-extrabold text-slate-900 tracking-tight">Your Roadmaps</h1>
            <p className="transform-gpu text-lg text-slate-500 mt-2 max-w-2xl">
              Manage your long-term goals and let AI optimize your path to success.
            </p>
          </div>

          <div className="transform-gpu relative">
             <Button onClick={() => setCreateOpen(true)} className="transform-gpu gap-2">
                <Plus size={20} /> Build New Roadmap
             </Button>
          </div>
        </div>

        {plans.length > 0 ? (
          <div className="transform-gpu grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map((plan: any) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onView={(p: any) => navigate(`/plans/${p.id}`)}
                onDelete={() => handleDeletePlan(plan.id)}
              />
            ))}
          </div>
        ) : (
          <div className="transform-gpu flex flex-col items-center justify-center py-20 bg-white/50 border-2 border-dashed border-slate-200 rounded-3xl text-center">
             <h3 className="transform-gpu text-2xl font-bold text-slate-900 mb-2">No roadmaps yet</h3>
             <Button onClick={() => setCreateOpen(true)}>Create Plan</Button>
          </div>
        )}

        <CreatePlanModal 
            isOpen={createOpen} 
            onClose={() => setCreateOpen(false)} 
            onCreateComplete={refreshPlans}
        />
    </div>
  );
}
