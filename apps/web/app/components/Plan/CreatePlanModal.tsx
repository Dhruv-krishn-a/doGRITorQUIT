"use client";
import React, { useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startDate || !endDate) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          startDate,
          endDate,
          // Removed tasks array - not needed for empty plan
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create plan");
      }
      
      onCreateComplete?.();
      onClose();
      
      // Reset form
      setTitle("");
      setDescription("");
      setStartDate("");
      setEndDate("");
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Failed to create plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Plan">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-2">Plan Title *</label>
          <input 
            className="w-full bg-gray-50 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-2">Description</label>
          <textarea 
            className="w-full bg-gray-50 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">Start Date *</label>
            <input 
              type="date" 
              className="w-full bg-gray-50 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              required 
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">End Date *</label>
            <input 
              type="date" 
              className="w-full bg-gray-50 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              required 
              disabled={loading}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
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
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Plan"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}