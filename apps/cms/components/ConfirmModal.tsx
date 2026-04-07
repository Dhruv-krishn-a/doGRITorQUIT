// apps/cms/components/ConfirmModal.tsx
"use client";

import React, { useEffect, useRef } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
};

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  isDestructive = false,
  isLoading = false,
}: Props) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className="relative bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300 border border-white"
        role="dialog"
        aria-modal="true"
      >
        {/* Animated Background Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-48 h-48 bg-rose-100/50 rounded-full blur-[60px] pointer-events-none -z-10 mix-blend-multiply" />
        <div className="absolute bottom-[-10%] right-[-10%] w-48 h-48 bg-pink-100/50 rounded-full blur-[60px] pointer-events-none -z-10 mix-blend-multiply" />

        <div className="p-8 relative z-10">
          <h3 className="text-xl font-bold text-slate-900 mb-2 uppercase tracking-tight">{title}</h3>
          <p className="text-slate-500 text-xs font-bold leading-relaxed mb-8 uppercase tracking-widest opacity-70">{description}</p>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-rose-100/50">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 hover:bg-slate-50 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white rounded-xl transition-all flex items-center gap-2 shadow-lg ${
                isDestructive 
                  ? "bg-rose-500 hover:bg-rose-600 shadow-rose-200" 
                  : "bg-slate-900 hover:bg-slate-800 shadow-slate-200"
              } ${isLoading ? "opacity-70 cursor-wait" : "active:scale-95"}`}
            >
              {isLoading && (
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}