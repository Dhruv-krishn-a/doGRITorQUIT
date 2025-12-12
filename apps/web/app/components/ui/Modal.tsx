//components/ui/Modal.tsx
"use client";

import React from "react";
import { X } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
};

export default function Modal({ isOpen, onClose, title, children }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-(--bg-card) w-full max-w-lg rounded-xl shadow-lg border border-(--border-color)">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-(--border-color)">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-(--bg-secondary) rounded">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
