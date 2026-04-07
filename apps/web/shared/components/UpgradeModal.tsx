"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Zap, ChevronRight, ShieldCheck, Sparkles } from "lucide-react";
import Modal from "./ui/Modal";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  limit: number;
  featureName: string;
}

export function UpgradeModal({
  isOpen,
  onClose,
  title,
  description,
  limit,
  featureName
}: UpgradeModalProps) {
  const router = useRouter();

  const handleUpgrade = () => {
    onClose();
    router.push("/dashboard/subscriptions");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Limit Reached"
      panelClassName="max-w-md"
    >
      <div className="transform-gpu flex flex-col items-center text-center py-4">
        <div className="transform-gpu relative mb-8">
          <div className="transform-gpu absolute inset-0 bg-rose-200 rounded-full blur-2xl opacity-40 animate-pulse" />
          <div className="transform-gpu relative bg-linear-to-br from-rose-500 to-pink-600 p-5 rounded-[2rem] shadow-xl shadow-rose-200">
            <Zap size={40} className="transform-gpu text-white fill-white/20" />
          </div>
          <div className="transform-gpu absolute -bottom-2 -right-2 bg-white p-2 rounded-xl shadow-lg border border-slate-100">
            <ShieldCheck size={18} className="transform-gpu text-emerald-500" />
          </div>
        </div>

        <h3 className="transform-gpu text-2xl font-bold text-slate-900 mb-2 tracking-tight">
          {title}
        </h3>
        
        <div className="transform-gpu inline-flex items-center gap-2 px-3 py-1 bg-rose-50 border border-rose-100 rounded-full text-[10px] font-bold text-rose-600 uppercase tracking-widest mb-6">
          <Sparkles size={12} /> {featureName} Limit: {limit}
        </div>

        <p className="transform-gpu text-slate-500 text-sm leading-relaxed mb-10 max-w-[280px]">
          {description}
        </p>

        <div className="transform-gpu w-full space-y-3">
          <button
            onClick={handleUpgrade}
            className="transform-gpu w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-rose-600 hover:shadow-rose-100 transition-all active:scale-95 flex items-center justify-center gap-2 group"
          >
            Upgrade My Plan
            <ChevronRight size={16} className="transform-gpu group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button
            onClick={onClose}
            className="transform-gpu w-full py-4 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-slate-600 transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </Modal>
  );
}
