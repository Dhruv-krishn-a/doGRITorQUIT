"use client";

import React from "react";

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
  if (!isOpen) return null;

  return (
    <div
      // 1. Apply 'className' here to allow overriding z-index (e.g., !z-[9999])
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 ${className}`}
      role="dialog"
      aria-modal="true"
    >
      <div 
        // 2. Apply 'panelClassName' here to allow overriding width (e.g., max-w-4xl)
        // Removed strict 'text-slate-600' from children wrapper to allow forms to handle their own colors
        className={`bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] flex flex-col ${panelClassName}`}
      >
        <div className="flex items-start justify-between gap-4 shrink-0 mb-4">
          {title && <h3 className="text-xl font-bold text-slate-800">{title}</h3>}
          <button 
            aria-label="close" 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-full transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 text-slate-600">
            {children}
        </div>

        {/* 3. Only render Footer if onConfirm is passed (avoids double buttons in your forms) */}
        {onConfirm && (
          <div className="mt-6 flex justify-end gap-3 shrink-0 pt-4 border-t border-slate-100">
            <button
              className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium transition-colors"
              onClick={onClose}
            >
              {cancelLabel}
            </button>
            <button
              onClick={() => onConfirm && onConfirm()}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 font-medium transition-colors shadow-sm shadow-indigo-200"
              disabled={confirmLoading}
            >
              {confirmLoading ? "Please wait…" : confirmLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}