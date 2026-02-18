"use client";
import React, { useState, useMemo } from 'react';
import { Clock, Calendar, X, Rocket } from 'lucide-react';
import { toast } from 'sonner';

interface CommitmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCommit: (minutes: number, targetDate?: string) => Promise<void>;
  trackTitle: string;
  totalMinutes: number;
  totalVideos: number;
}

export const CommitmentModal: React.FC<CommitmentModalProps> = ({ 
  isOpen, 
  onClose, 
  onCommit, 
  trackTitle, 
  totalMinutes, 
  totalVideos 
}) => {
  const [minutes, setMinutes] = useState(30);
  const [loading, setLoading] = useState(false);

  const stats = useMemo(() => {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const avgLen = Math.round(totalMinutes / totalVideos);
    const daysToFinish = minutes > 0 ? Math.ceil(totalMinutes / minutes) : 0;
    
    return {
      durationStr: `${hours}h ${mins}m`,
      avgLen,
      daysToFinish
    };
  }, [totalMinutes, totalVideos, minutes]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onCommit(minutes);
      toast.success("Learning plan activated!");
      onClose();
    } catch {
      toast.error("Failed to save plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl p-10 relative animate-in zoom-in-95 duration-200 border border-slate-100">
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 transition-colors">
          <X size={24} />
        </button>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-rose-100 p-3 rounded-2xl text-rose-600">
            <Rocket size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Configure Your Pace</h2>
            <p className="text-slate-500 font-medium">Setting velocity for <span className="font-bold text-slate-800">{trackTitle}</span></p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Time</p>
            <p className="text-lg font-black text-slate-800">{stats.durationStr}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Videos</p>
            <p className="text-lg font-black text-slate-800">{totalVideos}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg Video</p>
            <p className="text-lg font-black text-slate-800">~{stats.avgLen}m</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <label className="text-sm font-black text-slate-900 uppercase tracking-widest block ml-1">Daily Commitment</label>
            <div className="flex gap-3">
              {[15, 30, 45, 60, 90].map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMinutes(m)}
                  className={`flex-1 py-4 rounded-2xl font-black border-2 transition-all ${
                    minutes === m ? 'border-rose-500 bg-rose-50 text-rose-600 shadow-lg shadow-rose-100' : 'border-slate-100 text-slate-400 hover:border-slate-200 bg-white'
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>
            <div className="relative group">
              <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors" size={20} />
              <input 
                type="number" 
                value={minutes}
                onChange={e => setMinutes(Number(e.target.value))}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-5 pl-14 pr-6 font-black text-xl text-slate-700 focus:border-rose-500 focus:bg-white outline-none transition-all"
                placeholder="Custom minutes..."
              />
            </div>
          </div>

          <div className="bg-rose-600 rounded-3xl p-6 text-white shadow-xl shadow-rose-200 flex items-center justify-between">
            <div>
              <p className="text-rose-100 text-xs font-bold uppercase tracking-widest mb-1">Live Preview</p>
              <p className="text-lg font-bold leading-tight">
                At <span className="underline decoration-2 underline-offset-4">{minutes} mins/day</span>, you will finish in <span className="text-2xl font-black">{stats.daysToFinish} days</span>.
              </p>
            </div>
            <Rocket className="opacity-20" size={48} />
          </div>

          <button 
            type="submit" 
            disabled={loading || minutes <= 0}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-5 rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-50 text-lg uppercase tracking-widest"
          >
            {loading ? 'Initializing Engine...' : 'Start Track'}
          </button>
        </form>
      </div>
    </div>
  );
};
