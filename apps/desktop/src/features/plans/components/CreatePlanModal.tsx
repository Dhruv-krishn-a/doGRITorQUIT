import React, { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
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
  const { user, session } = useAuth();
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
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const res = await fetch(`${baseUrl}/api/plans`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          startDate: startObj.toISOString(),
          endDate: endObj.toISOString(),
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to create plan");
      }
      
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
      className="transform-gpu z-[1300]"
    >
      <form onSubmit={handleSubmit} className="transform-gpu space-y-5">
        <div>
          <label className="transform-gpu block text-sm font-medium text-slate-700 mb-1">
            Plan Title <span className="transform-gpu text-red-500">*</span>
          </label>
          <input 
            className="transform-gpu w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none placeholder:text-slate-400"
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="e.g. Q4 Marketing Strategy"
            required 
            disabled={loading}
          />
        </div>

        <div>
          <label className="transform-gpu block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea 
            className="transform-gpu w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none resize-none placeholder:text-slate-400"
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Optional details about this plan..."
            disabled={loading}
          />
        </div>

        <div className="transform-gpu grid grid-cols-2 gap-4">
          <div>
            <label className="transform-gpu block text-sm font-medium text-slate-700 mb-1">
              Start Date <span className="transform-gpu text-red-500">*</span>
            </label>
            <input 
              type="date" 
              className="transform-gpu w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-slate-600"
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              required 
              disabled={loading}
            />
          </div>
          <div>
            <label className="transform-gpu block text-sm font-medium text-slate-700 mb-1">
              End Date <span className="transform-gpu text-red-500">*</span>
            </label>
            <input 
              type="date" 
              className="transform-gpu w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-slate-600"
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              required 
              disabled={loading}
            />
          </div>
        </div>

        {error && (
            <div className="transform-gpu p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-start gap-2 animate-in fade-in slide-in-from-top-1">
                <AlertCircle size={16} className="transform-gpu mt-0.5 shrink-0" />
                <span>{error}</span>
            </div>
        )}

        <div className="transform-gpu flex justify-end gap-3 pt-2">
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
            className="transform-gpu min-w-25"
          >
            Create Plan
          </Button>
        </div>
      </form>
    </Modal>
  );
}
