//components/Plan/CreatePlanModal.tsx
"use client";
import React, { useState } from "react";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreateComplete?: () => void; // optional callback
};

export default function CreatePlanModal({ isOpen, onClose, onCreateComplete }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startDate || !endDate) return;

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
          tasks: [],
        }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to create plan");
      }
      // const created = await res.json();
      onCreateComplete?.();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to create plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Plan">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-(--text-secondary) mb-2">Plan Title</label>
          <input className="w-full bg-(--bg-secondary) border rounded px-4 py-2" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div>
          <label className="block text-sm text-(--text-secondary) mb-2">Description</label>
          <textarea className="w-full bg-(--bg-secondary) border rounded px-4 py-2" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input type="date" className="w-full bg-(--bg-secondary) border rounded px-4 py-2" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
          <input type="date" className="w-full bg-(--bg-secondary) border rounded px-4 py-2" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={loading}>{loading ? "Creating..." : "Create Plan"}</Button>
        </div>
      </form>
    </Modal>
  );
}
