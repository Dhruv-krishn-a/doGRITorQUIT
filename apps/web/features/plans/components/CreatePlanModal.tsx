"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import Button from "../../../shared/components/ui/Button";
import Modal from "../../../shared/components/ui/Modal";

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
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  // Default to today's date in YYYY-MM-DD format
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Client-side Validation
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
      // 2. Prepare Payload
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        startDate: startObj.toISOString(),
        endDate: endObj.toISOString(),
      };

      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json().catch(() => null);
      
      if (!res.ok) {
        throw new Error(data?.error || "Failed to create plan");
      }
      
      onCreateComplete?.();
      onClose();
      
      // Reset form
      setTitle("");
      setDescription("");
      setEndDate("");
      setStartDate(new Date().toISOString().split("T")[0]);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to create plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Create New Plan"
    >
      <form onSubmit={handleSubmit} className="transform-gpu space-y-6">
        
        {/* Title */}
        <div>
          <label className="transform-gpu block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-3 ml-1 italic opacity-40">
            Plan Title *
          </label>
          <input 
            className="transform-gpu w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl px-6 py-4 font-black text-[var(--text-primary)] focus:border-[var(--accent-color)] outline-none transition-all placeholder:text-[var(--text-secondary)]/30 shadow-inner text-sm italic uppercase"
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="e.g. Q4 Marketing Strategy"
            required 
            disabled={loading}
            autoFocus
          />
        </div>

        {/* Description */}
        <div>
          <label className="transform-gpu block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-3 ml-1 italic opacity-40">Description</label>
          <textarea 
            className="transform-gpu w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl px-6 py-4 font-black text-[var(--text-primary)] focus:border-[var(--accent-color)] outline-none transition-all placeholder:text-[var(--text-secondary)]/30 shadow-inner text-sm italic resize-none"
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Optional details about this plan..."
            disabled={loading}
          />
        </div>

        {/* Dates */}
        <div className="transform-gpu grid grid-cols-2 gap-6">
          <div>
            <label className="transform-gpu block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-3 ml-1 italic opacity-40">
              Start Date *
            </label>
            <input 
              type="date" 
              className="transform-gpu w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl px-6 py-4 font-black text-[var(--text-primary)] focus:border-[var(--accent-color)] outline-none transition-all text-sm italic"
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              required 
              disabled={loading}
            />
          </div>
          <div>
            <label className="transform-gpu block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-3 ml-1 italic opacity-40">
              End Date *
            </label>
            <input 
              type="date" 
              className="transform-gpu w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl px-6 py-4 font-black text-[var(--text-primary)] focus:border-[var(--accent-color)] outline-none transition-all text-sm italic"
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              required 
              disabled={loading}
            />
          </div>
        </div>

        {/* Error Display */}
        {error && (
            <div className="transform-gpu p-4 bg-red-500/5 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-red-500/20 flex items-start gap-3 animate-in fade-in slide-in-from-top-1 italic">
                <AlertCircle size={16} className="transform-gpu shrink-0" />
                <span>{error}</span>
            </div>
        )}

        {/* Actions */}
        <div className="transform-gpu flex justify-end gap-4 pt-4 border-t border-[var(--border-color)]">
          <button 
            type="button" 
            className="transform-gpu px-8 py-3.5 rounded-2xl bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)] font-black text-[10px] uppercase tracking-widest hover:text-[var(--text-primary)] transition-all active:scale-95 italic"
            onClick={onClose} 
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="transform-gpu px-10 py-3.5 bg-[var(--accent-color)] text-[var(--bg-primary)] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 shadow-xl shadow-[var(--accent-color)]/20 transition-all active:scale-95 italic"
          >
            {loading ? "Creating..." : "Create Plan"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
