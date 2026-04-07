"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Sparkles, LayoutDashboard, Zap, ListTodo, Brain, BarChart3, CreditCard, Settings, Lock } from "lucide-react";

export function SidebarPreview({ productFeatures, productName, tier }: { productFeatures: any[], productName: string, tier: string }) {
  const [showPreview, setShowPreview] = useState(false);

  const features = new Set(productFeatures.map(pf => pf.feature.key));
  
  const navItems = [
    { label: "Dashboard", icon: <LayoutDashboard size={18} />, key: "ACCESS_PLANS" },
    { label: "Today", icon: <Zap size={18} />, key: "ACCESS_TODAY" },
    { label: "Checklist", icon: <ListTodo size={18} />, key: "ACCESS_HABITS" },
    { label: "Study", icon: <Brain size={18} />, key: "ACCESS_STUDY" },
    { label: "Analytics", icon: <BarChart3 size={18} />, key: "ACCESS_ANALYTICS" },
    { label: "Settings", icon: <Settings size={18} />, key: "ACCESS_SETTINGS" },
  ];

  if (!showPreview) {
    return (
      <button 
        onClick={() => setShowPreview(true)}
        className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg active:scale-95"
      >
        <Eye size={14} /> Preview Sidebar
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-sm overflow-hidden relative border border-white/20">
        <button 
          onClick={() => setShowPreview(false)}
          className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-full transition-all z-10"
        >
          <EyeOff size={20} />
        </button>

        <div className="p-8 h-[600px] flex flex-col bg-slate-50/30">
          <div className="flex items-center gap-2 font-bold text-xl text-slate-900 tracking-tighter uppercase mb-10">
            <span>Planner</span>
            <Sparkles size={14} className="text-rose-500" />
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const isLocked = !features.has(item.key) && item.key !== "ACCESS_SETTINGS";
              return (
                <div 
                  key={item.label}
                  className={`flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all ${
                    isLocked 
                      ? 'bg-slate-100/50 border-transparent text-slate-300 opacity-60' 
                      : 'bg-white border-slate-100 text-slate-600 shadow-sm'
                  }`}
                >
                  <span className={isLocked ? 'text-slate-300' : 'text-rose-500'}>
                    {item.icon}
                  </span>
                  <span className="flex-1 font-bold text-sm tracking-tight">{item.label}</span>
                  {isLocked && <Lock size={12} className="text-slate-300" />}
                </div>
              );
            })}
          </nav>

          <div className="mt-auto p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                {tier.charAt(0)}
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-900 uppercase tracking-tight">{productName} Active</p>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">System v1.6.0</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-900 p-4 text-center">
           <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Administrator Live Preview Mode</p>
        </div>
      </div>
    </div>
  );
}
