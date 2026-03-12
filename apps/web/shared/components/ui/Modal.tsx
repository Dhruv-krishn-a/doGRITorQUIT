"use client";

import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

type ModalProps = {
  isOpen: boolean;
  title?: string;
  children?: React.ReactNode;
  onClose: () => void;
  onConfirm?: () => Promise<void> | void;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmLoading?: boolean;
  className?: string;       // For the outer overlay (Z-Index)
  panelClassName?: string;  // For the inner box (Width/Height)
};

export default function Modal({
  isOpen,
  title,
  children,
  onClose,
  onConfirm,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmLoading = false,
  className = "",
  panelClassName = "",
}: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!mounted || typeof document === 'undefined') return null;

  const target = document.getElementById('study-modal-root') || document.body;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const springConfig = { type: "spring" as const, stiffness: 300, damping: 25 };

  const content = (
    <AnimatePresence>
      {isOpen && (
        <div
          className={`fixed inset-0 z-[1200] flex items-center justify-center p-4 md:p-6 ${className}`}
          role="dialog"
          aria-modal="true"
        >
          {/* Frosted Glass Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdropClick}
            className="transform-gpu absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
          />
          
          <motion.div 
            ref={panelRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={springConfig}
            className={`relative w-full max-w-xl bg-white/80 backdrop-blur-2xl rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-white overflow-hidden transform-gpu antialiased flex flex-col max-h-[90vh] ${panelClassName}`}
          >
            {/* Animated Background Gradients */}
            <div className="transform-gpu absolute top-[-10%] left-[-10%] w-[30vw] h-[30vw] bg-rose-200/40 rounded-full blur-[80px] mix-blend-multiply pointer-events-none" />
            <div className="transform-gpu absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-pink-200/40 rounded-full blur-[100px] mix-blend-multiply pointer-events-none" />

            <div className="transform-gpu p-6 md:p-8 flex flex-col h-full relative z-10">
              <div className="transform-gpu flex items-start justify-between gap-4 shrink-0 mb-6">
                {title && (
                  <h3 className="transform-gpu text-2xl font-bold text-slate-900 tracking-tighter uppercase">
                    {title}
                  </h3>
                )}
                <button 
                  aria-label="close" 
                  onClick={onClose} 
                  className="transform-gpu p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 shadow-sm hover:shadow-md rounded-xl transition-all active:scale-95 shrink-0"
                >
                  ✕
                </button>
              </div>

              <div className="transform-gpu flex-1 overflow-y-auto min-h-0 space-y-4 custom-scrollbar pr-2">
                  {children}
              </div>

              {onConfirm && (
                <div className="transform-gpu mt-6 flex justify-end gap-3 shrink-0 pt-4 border-t border-slate-100">
                  <button
                    className="transform-gpu px-6 py-2.5 rounded-2xl bg-white text-slate-600 border border-slate-200 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 hover:text-rose-500 hover:border-rose-200 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95"
                    onClick={onClose}
                  >
                    {cancelLabel}
                  </button>
                  <button
                    onClick={() => onConfirm && onConfirm()}
                    className="transform-gpu px-6 py-2.5 rounded-2xl bg-linear-to-r from-rose-500 to-pink-500 text-white font-bold text-xs uppercase tracking-widest hover:from-rose-400 hover:to-pink-400 transition-all duration-300 shadow-[0_8px_20px_rgba(244,63,94,0.25)] hover:shadow-[0_12px_25px_rgba(244,63,94,0.4)] hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:grayscale"
                    disabled={confirmLoading}
                  >
                    {confirmLoading ? "Please wait…" : confirmLabel}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(content, target);
}
