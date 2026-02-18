"use client";
import React, { useState } from 'react';
import { 
  Plus, 
  Layers, 
  FileText, 
  Zap, 
  Clock, 
  ChevronRight, 
  Layout,
  PlusCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface EmptyTrackSetupProps {
  trackId: string;
  onRefresh: () => void;
}

export const EmptyTrackSetup: React.FC<EmptyTrackSetupProps> = ({ trackId, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  
  // Quick Add State
  const [newUnit, setNewUnit] = useState({
    title: '',
    durationMinutes: 30,
    type: 'LESSON'
  });

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnit.title) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/study/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackId,
          ...newUnit
        })
      });
      if (!res.ok) throw new Error();
      
      toast.success("Unit added to engine");
      setNewUnit({ title: '', durationMinutes: 30, type: 'LESSON' });
      onRefresh();
    } catch {
      toast.error("Failed to add unit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 space-y-12">
      <div className="text-center space-y-4">
        <div className="inline-flex p-5 bg-rose-50 text-rose-500 rounded-[2rem] border-2 border-rose-100 shadow-xl shadow-rose-100/20 mb-4">
          <Layers size={48} strokeWidth={1.5} />
        </div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Your Engine is Primed</h2>
        <p className="text-slate-500 text-lg font-medium max-w-lg mx-auto">This track is empty. Define its structure to activate the pacing and auto-planning algorithms.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Option A: Structured Setup */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 space-y-8 group hover:border-rose-200 transition-all duration-500">
          <div className="space-y-2">
            <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl inline-block group-hover:scale-110 transition-transform">
              <Layout size={24} />
            </div>
            <h3 className="text-xl font-black text-slate-900">Module Architecture</h3>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">For complex courses & books</p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
              <PlusCircle size={20} />
              <span className="text-sm font-bold">Import Modules (CSV/Text)</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed italic">"Coming soon: Paste a syllabus or table of contents to auto-generate units."</p>
          </div>

          <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
            Define Modules
          </button>
        </div>

        {/* Option B: Quick Add / Session Mode */}
        <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl space-y-8 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:bg-white/10 transition-all duration-700" />
          
          <div className="space-y-2 relative z-10">
            <div className="p-3 bg-rose-600 text-white rounded-2xl inline-block group-hover:rotate-12 transition-transform">
              <Zap size={24} fill="currentColor" />
            </div>
            <h3 className="text-xl font-black text-white">Quick Ingestion</h3>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Add lessons or sessions individually</p>
          </div>

          <form onSubmit={handleQuickAdd} className="space-y-4 relative z-10">
            <input 
              type="text"
              placeholder="Unit Title (e.g., Intro to Hooks)"
              className="w-full bg-white/5 border-2 border-white/10 rounded-2xl py-4 px-6 font-bold text-white placeholder:text-slate-600 focus:border-rose-500 outline-none transition-all"
              value={newUnit.title}
              onChange={e => setNewUnit({...newUnit, title: e.target.value})}
            />
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="number"
                  className="w-full bg-white/5 border-2 border-white/10 rounded-2xl py-4 pl-12 pr-4 font-bold text-white outline-none focus:border-rose-500 transition-all"
                  value={newUnit.durationMinutes}
                  onChange={e => setNewUnit({...newUnit, durationMinutes: parseInt(e.target.value)})}
                />
              </div>
              <button 
                type="submit"
                disabled={loading || !newUnit.title}
                className="px-8 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-rose-950/50 disabled:opacity-50 active:scale-95"
              >
                Add Unit
              </button>
            </div>
          </form>

          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center">Velocity will update immediately</p>
        </div>
      </div>
    </div>
  );
};
