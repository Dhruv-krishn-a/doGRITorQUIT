"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

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

  useEffect(() => setMounted(true), []);

  if (!isOpen || !mounted || typeof document === 'undefined') return null;

  const target = document.getElementById('study-modal-root') || document.body;

  const themedPanel =
    panelClassName && panelClassName.trim().length > 0
      ? panelClassName
      : "bg-[#14030b] border border-rose-900/40 text-rose-100 shadow-[0_20px_80px_rgba(12,3,8,0.75)]";

  const content = (
    <div
      // 1. Apply 'className' here to allow overriding z-index (e.g., !z-[9999])
      className={`fixed inset-0 z-[1200] flex items-center justify-center bg-[#0a0105]/90 backdrop-blur-xl p-4 ${className}`}
      role="dialog"
      aria-modal="true"
    >
      <div 
        // 2. Apply 'panelClassName' here to allow overriding width (e.g., max-w-4xl)
        // Defaulting to bg-white but allowing override
        className={`rounded-2xl w-full max-w-xl p-6 md:p-8 max-h-[90vh] flex flex-col ${themedPanel}`}
      >
        <div className="flex items-start justify-between gap-4 shrink-0 mb-4">
          {title && (
            <h3 className={`text-xl font-black tracking-tight ${themedPanel.includes('text-rose') ? '' : 'text-rose-50'}`}>
              {title}
            </h3>
          )}
          <button 
            aria-label="close" 
            onClick={onClose} 
            className="text-rose-300/60 hover:text-rose-200 hover:bg-rose-500/10 p-2 rounded-full transition-colors border border-transparent hover:border-rose-500/40"
          >
            ✕
          </button>
        </div>

        <div className={`flex-1 overflow-y-auto min-h-0 space-y-4 ${themedPanel.includes('text-rose') ? '' : 'text-rose-100/70'}`}>
            {children}
        </div>

        {/* 3. Only render Footer if onConfirm is passed (avoids double buttons in your forms) */}
        {onConfirm && (
          <div className="mt-6 flex justify-end gap-3 shrink-0 pt-4 border-t border-rose-900/40">
            <button
              className="px-4 py-2 rounded-lg bg-[#1c0510] border border-rose-900/50 text-rose-300 hover:bg-[#2a081a] hover:border-rose-500/40 hover:text-rose-200 font-bold uppercase text-[10px] tracking-widest transition-colors"
              onClick={onClose}
            >
              {cancelLabel}
            </button>
            <button
              onClick={() => onConfirm && onConfirm()}
              className="px-4 py-2 rounded-lg bg-linear-to-r from-rose-600 to-pink-600 text-white hover:from-rose-500 hover:to-pink-500 disabled:opacity-60 font-black uppercase text-[10px] tracking-widest transition-colors shadow-[0_10px_30px_rgba(244,63,94,0.35)]"
              disabled={confirmLoading}
            >
              {confirmLoading ? "Please wait…" : confirmLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(content, target);
}
