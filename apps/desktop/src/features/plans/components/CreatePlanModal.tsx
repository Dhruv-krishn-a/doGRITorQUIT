import React, { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../auth/hooks/useAuth";

interface CreatePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateComplete?: () => void;
}

export default function CreatePlanModal({ 
  isOpen, 
  onClose, 
  onCreateComplete 
}: CreatePlanModalProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Please enter a plan title.");
      return;
    }
    if (!startDate || !endDate) {
      setError("Please select both start and end dates.");
      return;
    }

    const startObj = new Date(startDate);
    const endObj = new Date(endDate);

    if (endObj < startObj) {
      setError("End date cannot be earlier than the start date.");
      return;
    }

    setLoading(true);

    try {
      const { error: insertError } = await supabase.from("plans").insert({
        userId: user?.id,
        title: title.trim(),
        description: description.trim() || null,
        startDate: startObj.toISOString(),
        endDate: endObj.toISOString(),
        isArchived: false,
        status: "active",
        progress: 0,
        totalTasks: 0,
        completedTasks: 0
      });

      if (insertError) throw insertError;
      
      onCreateComplete?.();
      onClose();
      
      setTitle("");
      setDescription("");
      setEndDate("");
      setStartDate(new Date().toISOString().split("T")[0]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Create New Plan"
      className="z-50"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Plan Title <span className="text-red-500">*</span>
          </label>
          <input 
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-hidden placeholder:text-slate-400"
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="e.g. Q4 Marketing Strategy"
            required 
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea 
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-hidden resize-none placeholder:text-slate-400"
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Optional details about this plan..."
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input 
              type="date" 
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-hidden text-slate-600"
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              required 
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              End Date <span className="text-red-500">*</span>
            </label>
            <input 
              type="date" 
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-hidden text-slate-600"
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              required 
              disabled={loading}
            />
          </div>
        </div>

        {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-start gap-2 animate-in fade-in slide-in-from-top-1">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
            </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onClose} 
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            isLoading={loading}
            className="min-w-25"
          >
            Create Plan
          </Button>
        </div>
      </form>
    </Modal>
  );
}
