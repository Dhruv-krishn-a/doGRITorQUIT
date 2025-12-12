//components/ui/Modal.tsx
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
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-md shadow-lg w-full max-w-lg p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            {title && <h3 className="text-lg font-semibold">{title}</h3>}
            <div className="mt-2 text-sm text-slate-600">{children}</div>
          </div>
          <button aria-label="close" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            className="px-3 py-2 rounded-md bg-white border hover:bg-slate-50"
            onClick={onClose}
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => onConfirm && onConfirm()}
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
            disabled={confirmLoading}
          >
            {confirmLoading ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
