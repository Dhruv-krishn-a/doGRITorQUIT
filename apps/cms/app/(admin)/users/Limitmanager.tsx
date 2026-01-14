// apps/cms/app/(admin)/users/Limitmanager.tsx
"use client";

import { useState } from "react";
import { Settings, RefreshCw, Save, X } from "lucide-react";
import { updateLimitAction, resetUsageAction } from "./actions";

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

  return (
    <div className="relative">
      {/* 1. Summary Display */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xs font-medium bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded transition-colors"
        title="Manage Limits"
      >
        <span className={`${usage >= (currentLimit || 999) ? "text-red-600 font-bold" : "text-slate-600"}`}>
          {usage} / {currentLimit === null ? "∞" : currentLimit}
        </span>
        <Settings size={12} className="text-slate-400" />
      </button>

      {/* 2. Popover / Edit Mode */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Manage Limits</h4>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          </div>

          <div className="space-y-4">
            
            {/* Custom Limit Form */}
            <div>
              <label className="text-[10px] text-slate-500 font-bold mb-1 block">CUSTOM LIMIT OVERRIDE</label>
              <form action={async (formData) => {
                  await updateLimitAction(formData);
                  setIsOpen(false);
              }} className="flex gap-2">
                <input type="hidden" name="userId" value={userId} />
                <input 
                  name="limit" 
                  type="number" 
                  placeholder="Default"
                  value={limitVal}
                  onChange={(e) => setLimitVal(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                />
                <button className="bg-blue-600 text-white p-1.5 rounded hover:bg-blue-700" title="Save Limit">
                  <Save size={14} />
                </button>
              </form>
              <p className="text-[10px] text-slate-400 mt-1">Leave empty to use Plan defaults.</p>
            </div>

            <hr className="border-slate-100" />

            {/* Reset Usage Button */}
            <div>
              <label className="text-[10px] text-slate-500 font-bold mb-1 block">TROUBLESHOOTING</label>
              <form action={resetUsageAction}>
                <input type="hidden" name="userId" value={userId} />
                <button 
                  className="w-full flex items-center justify-center gap-2 bg-slate-50 text-slate-600 border border-slate-200 hover:bg-white hover:text-red-600 hover:border-red-200 px-3 py-2 rounded text-xs font-medium transition-all"
                >
                  <RefreshCw size={12} /> Reset Usage to 0
                </button>
              </form>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}