import React, { useEffect } from 'react';
import { openUrl } from '@tauri-apps/plugin-opener';
import { CreditCard, ArrowRight } from 'lucide-react';
import { useAuth } from '../features/auth/hooks/useAuth';

export default function SubscriptionsPage() {
  const { session } = useAuth();
  
  const handleOpenWeb = async () => {
    try {
      const baseUrl = import.meta.env.VITE_WEB_URL || 'http://localhost:3000';
      await openUrl(`${baseUrl}/dashboard/subscriptions`);
    } catch (err) {
      console.error("Failed to open browser:", err);
    }
  };

  return (
    <div className="transform-gpu flex flex-col items-center justify-center min-h-[70vh] text-center p-8 animate-in fade-in zoom-in duration-300">
      <div className="transform-gpu bg-indigo-50 p-6 rounded-full mb-6 ring-8 ring-indigo-50/50">
        <CreditCard size={48} className="transform-gpu text-indigo-500" />
      </div>
      <h2 className="transform-gpu text-3xl font-bold text-slate-900 tracking-tight mb-3">Manage Subscription</h2>
      <p className="transform-gpu text-slate-500 max-w-md mb-8 leading-relaxed font-medium">
        To ensure your payment details are secure, all subscription management and Razorpay checkouts are handled through our secure web portal.
      </p>
      
      <button 
        onClick={handleOpenWeb}
        className="transform-gpu group flex items-center gap-3 px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
      >
        Open Secure Portal
        <ArrowRight size={16} className="transform-gpu group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}
