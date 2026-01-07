"use client";
import React, { useState, useEffect } from "react";
import Button from "@shared/components/ui/Button";
import Modal from "@shared/components/ui/Modal";
import { CheckCircle2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (finalMinutes: number) => void;
  taskTitle: string;
  loggedMinutes: number; // Time already recorded by timer
}

export default function TaskCompletionModal({ isOpen, onClose, onConfirm, taskTitle, loggedMinutes }: Props) {
  const [manualMinutes, setManualMinutes] = useState(0);

  // Reset when opening
  useEffect(() => {
    if (isOpen) setManualMinutes(0);
  }, [isOpen]);

  const total = loggedMinutes + manualMinutes;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Complete Task">
      <div className="space-y-6">
        <div className="flex items-center gap-3 bg-green-50 p-4 rounded-xl border border-green-100">
          <div className="bg-green-100 p-2 rounded-full">
            <CheckCircle2 className="text-green-600 w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-green-900 line-clamp-1">{taskTitle}</h3>
            <p className="text-sm text-green-700">Great job! Let&apos;s log your time.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <div className="text-xs font-bold text-slate-400 uppercase mb-1">Timer Recorded</div>
            <div className="text-2xl font-mono font-bold text-slate-700">
              {Math.floor(loggedMinutes / 60)}h {loggedMinutes % 60}m
            </div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 text-center">
            <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Add Extra Time (min)</label>
            <input 
              type="number" 
              min="0"
              className="w-full text-center text-2xl font-bold border-b-2 border-slate-200 focus:border-blue-500 outline-none pb-1"
              value={manualMinutes}
              onChange={(e) => setManualMinutes(parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        <div className="flex justify-between items-center pt-2">
          <div className="text-sm text-slate-500">
            Total Time: <span className="font-bold text-slate-900">{total} mins</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button variant="primary" onClick={() => onConfirm(total)}>Complete Task</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}