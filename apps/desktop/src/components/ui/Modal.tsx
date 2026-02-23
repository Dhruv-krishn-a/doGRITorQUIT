import React, { Fragment } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className={`relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl transition-all ${className}`}>
        <div className="flex items-center justify-between mb-5">
          {title && <h3 className="text-lg font-bold leading-6 text-slate-900">{title}</h3>}
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}
