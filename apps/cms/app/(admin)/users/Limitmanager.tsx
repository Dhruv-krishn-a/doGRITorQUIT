// apps/cms/app/(admin)/users/Limitmanager.tsx
"use client";

import { useState } from "react";
import { Settings, RefreshCw, Save, X } from "lucide-react";
import { updateLimitAction, resetUsageAction } from "./actions";

import { toast } from "sonner";

type Props = {
  userId: string;
  usage: number;
  // The effective limit (plan or custom)
  currentLimit: number | null;
  // The specific custom limit override, if any
  customLimit: number | null; 
};

export default function LimitManager({ userId, usage, currentLimit, customLimit }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Local state for the input
  const [limitVal, setLimitVal] = useState(customLimit?.toString() ?? "");

  const handleUpdateLimit = async (formData: FormData) => {
    try {
      await updateLimitAction(formData);
      toast.success("AI limit updated successfully");
      setIsOpen(false);
    } catch (err) {
      toast.error("Failed to update AI limit");
    }
  };

  const handleResetUsage = async (formData: FormData) => {
    if (!confirm("Are you sure you want to reset usage for this user?")) return;
    try {
      await resetUsageAction(formData);
      toast.success("AI usage reset successfully");
      setIsOpen(false);
    } catch (err) {
      toast.error("Failed to reset usage");
    }
  };

  return (
    <div className="relative">
      {/* 1. Summary Display */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-all border border-slate-200 shadow-sm"
        title="Manage Limits"
      >
        <span className={`${usage >= (currentLimit || 999) ? "text-rose-600 font-bold" : "text-slate-600"}`}>
          {usage} / {currentLimit === null ? "∞" : currentLimit}
        </span>
        <Settings size={12} className="text-slate-400" />
      </button>

      {/* 2. Popover / Edit Mode */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-3 w-72 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-white p-6 z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-5">
            <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em]">Usage Controls</h4>
            <button onClick={() => setIsOpen(false)} className="p-1.5 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-lg transition-colors border border-slate-100">
              <X size={14} />
            </button>
          </div>

          <div className="space-y-6">
            
            {/* Custom Limit Form */}
            <div>
              <label className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-2 block ml-1">Limit Override</label>
              <form action={handleUpdateLimit} className="flex gap-2">
                <input type="hidden" name="userId" value={userId} />
                <input 
                  name="limit" 
                  type="number" 
                  placeholder="System"
                  value={limitVal}
                  onChange={(e) => setLimitVal(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:bg-white focus:border-rose-300 outline-none transition-all shadow-inner"
                />
                <button className="bg-slate-900 text-white p-2.5 rounded-xl hover:bg-rose-600 transition-all shadow-sm active:scale-95" title="Save Limit">
                  <Save size={14} />
                </button>
              </form>
              <p className="text-[9px] text-slate-400 font-bold mt-2 ml-1 leading-tight">Leave empty to use tier defaults.</p>
            </div>

            <div className="h-px bg-slate-100" />

            {/* Reset Usage Button */}
            <div>
              <label className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-2 block ml-1">Troubleshooting</label>
              <form action={handleResetUsage}>
                <input type="hidden" name="userId" value={userId} />
                <button 
                  className="w-full flex items-center justify-center gap-2 bg-slate-50 text-slate-600 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 px-4 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm active:scale-95"
                >
                  <RefreshCw size={12} /> Reset Current Usage
                </button>
              </form>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}