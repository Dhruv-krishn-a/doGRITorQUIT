"use client";
import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  trackTitle: string;
  loading: boolean;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ isOpen, onClose, onConfirm, trackTitle, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-8 relative animate-in zoom-in-95 duration-200">
        <div className="flex justify-center mb-4">
          <div className="bg-red-100 text-red-600 p-3 rounded-full">
            <AlertTriangle size={24} />
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-center text-slate-900 mb-2">Delete Track</h2>
        <p className="text-slate-500 text-center mb-8">Are you sure you want to permanently delete the track "{trackTitle}"? This action cannot be undone.</p>

        <div className="flex gap-4">
            <button 
                onClick={onClose}
                className="flex-1 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
                Cancel
            </button>
            <button 
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-200 transition-all active:scale-95 disabled:opacity-50"
            >
                {loading ? 'Deleting...' : 'Delete'}
            </button>
        </div>
      </div>
    </div>
  );
};
