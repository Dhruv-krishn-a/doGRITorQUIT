"use client";

import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

type ModalProps = {
  isOpen: boolean;
  title?: string;
  children?: React.ReactNode;
  onClose: () => void;
  onConfirm?: () => Promise<void> | void;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmLoading?: boolean;
  className?: string;
  panelClassName?: string;
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
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
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
          className={`fixed inset-0 z-[1500] flex items-center justify-center p-4 md:p-6 ${className}`}
          role="dialog"
          aria-modal="true"
        >
          {/* Static Backdrop for absolute stability */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdropClick}
            className="absolute inset-0 bg-black/80 z-0"
          />
          
          {/* Persistent Blur Layer - Non-animated for performance and stability */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 modal-backdrop-blur z-0 pointer-events-none"
          />
          
          <motion.div 
            ref={panelRef}
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={springConfig}
            className={`relative z-10 w-full max-w-xl bg-[var(--bg-primary)] border border-[var(--border-color)] shadow-2xl rounded-[3rem] overflow-hidden flex flex-col max-h-[90vh] ${panelClassName}`}
          >
            <div className="absolute top-[-10%] left-[-10%] w-[30vw] h-[30vw] bg-[var(--accent-color)]/5 rounded-full blur-[80px] mix-blend-screen pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-indigo-500/5 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />

            <div className="p-6 md:p-10 flex flex-col h-full relative z-10">
              <div className="flex items-start justify-between gap-4 shrink-0 mb-8">
                {title && (
                  <h3 className="text-2xl font-black text-[var(--text-primary)] tracking-tighter uppercase italic leading-none">
                    {title}
                  </h3>
                )}
                <button 
                  aria-label="close" 
                  onClick={onClose} 
                  className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-xl transition-all active:scale-95 shrink-0"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar pr-2 italic">
                  {children}
              </div>

              {onConfirm && (
                <div className="mt-8 flex justify-end gap-4 shrink-0 pt-8 border-t border-[var(--border-color)]">
                  <button
                    className="px-8 py-3.5 rounded-2xl bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)] font-black text-[10px] uppercase tracking-widest hover:text-[var(--text-primary)] transition-all active:scale-95 italic"
                    onClick={onClose}
                  >
                    {cancelLabel}
                  </button>
                  <button
                    onClick={() => onConfirm && onConfirm()}
                    className="px-10 py-3.5 rounded-2xl bg-[var(--accent-color)] text-[var(--bg-primary)] font-black text-[10px] uppercase tracking-widest hover:opacity-90 shadow-xl shadow-[var(--accent-color)]/20 active:scale-95 disabled:opacity-50 disabled:grayscale italic"
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
