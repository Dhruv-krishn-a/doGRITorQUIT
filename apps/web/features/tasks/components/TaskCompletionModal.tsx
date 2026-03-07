"use client";
import React, { useState, useEffect } from "react";
import Button from "@shared/components/ui/Button";
import Modal from "@shared/components/ui/Modal";
import { CheckCircle2, Clock, Plus } from "lucide-react";

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
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Complete Task"
      panelClassName="!bg-[#14030b] !border !border-rose-900/40 !text-rose-100"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-4 bg-rose-500/10 p-5 rounded-2xl border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
          <div className="bg-rose-500/20 p-3 rounded-full border border-rose-500/30">
            <CheckCircle2 className="text-rose-500 w-6 h-6 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-black text-rose-50 truncate uppercase tracking-tight">{taskTitle}</h3>
            <p className="text-[10px] font-black text-rose-400/60 uppercase tracking-widest mt-0.5">Vector Optimization Complete</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-[#1c0510] rounded-2xl border border-rose-900/40 text-center">
            <div className="text-[8px] font-black text-rose-400/50 uppercase tracking-[0.2em] mb-2 flex items-center justify-center gap-1">
              <Clock size={10} /> Recorded
            </div>
            <div className="text-xl font-black text-rose-50 tracking-tighter">
              {Math.floor(loggedMinutes / 60)}H {loggedMinutes % 60}M
            </div>
          </div>

          <div className="p-4 bg-[#1c0510] rounded-2xl border border-rose-500/20 text-center group focus-within:border-rose-500/50 transition-all">
            <label className="text-[8px] font-black text-rose-400/50 uppercase tracking-[0.2em] mb-2 block flex items-center justify-center gap-1">
              <Plus size={10} /> Extra (Min)
            </label>
            <input 
              type="number" 
              min="0"
              className="w-full bg-transparent text-center text-xl font-black text-rose-500 focus:outline-none placeholder:text-rose-900 tracking-tighter"
              value={manualMinutes}
              onChange={(e) => setManualMinutes(parseInt(e.target.value) || 0)}
              autoFocus
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-2">
          <div className="flex justify-between items-center px-2">
            <span className="text-[10px] font-black text-rose-400/40 uppercase tracking-widest">Total Neural Effort</span>
            <span className="text-lg font-black text-rose-50 tracking-tighter">{total} <span className="text-[10px] text-rose-400/60 uppercase tracking-widest ml-1">Minutes</span></span>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 py-4 bg-[#1c0510] border border-rose-900/50 rounded-2xl text-rose-400/60 font-black text-[10px] uppercase tracking-widest hover:bg-[#2a081a] hover:text-rose-400 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button 
              onClick={() => onConfirm(total)}
              className="flex-3 py-4 bg-linear-to-r from-rose-600 to-pink-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-[0_0_15px_rgba(244,63,94,0.3)] hover:shadow-[0_0_25px_rgba(244,63,94,0.5)] border border-rose-400/50 transition-all active:scale-95"
            >
              Finalize Optimization
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
