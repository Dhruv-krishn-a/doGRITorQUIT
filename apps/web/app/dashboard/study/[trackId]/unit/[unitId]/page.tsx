"use client";

import React, { useEffect, useState, use, useCallback } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Type, 
  Clock, 
  Save, 
  Hash,
  LayoutList,
  ChevronRight,
  ChevronDown,
  Info
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Unit } from '@prisma/client';
import { NeuralNotesEngine } from '@/features/study/components/Notes/NeuralNotesEngine';

export default function UnitNotesPage({ params }: { params: Promise<{ trackId: string, unitId: string }> }) {
  const { trackId, unitId } = use(params);
  const [unit, setUnit] = useState<Unit | null>(null);
  const [loading, setLoading] = useState(true);
  const [wordCount, setWordCount] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchUnit = useCallback(async () => {
    try {
      const res = await fetch(`/api/study/units/${unitId}`);
      const data = await res.json();
      setUnit(data.unit);
    } catch {
      toast.error('Failed to sync knowledge base');
    } finally {
      setLoading(false);
    }
  }, [unitId]);

  useEffect(() => {
    fetchUnit();
  }, [fetchUnit]);

  const handleSave = async (json: any) => {
    setIsSaving(true);
    try {
      await fetch(`/api/study/units/${unitId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: json })
      });
      setLastSaved(new Date());
    } catch {
      toast.error("Cloud sync failed");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !unit) return <div className="p-20 text-center text-rose-500 font-black animate-pulse">Accessing Knowledge Node...</div>;

  return (
    <div className="fixed inset-0 bg-white z-[60] flex flex-col overflow-hidden">
      {/* Top Bar */}
      <header className="h-16 border-b border-slate-100 flex items-center justify-between px-6 bg-white/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-6">
          <Link 
            href={`/dashboard/study/${trackId}`}
            className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900 transition-all active:scale-95"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="h-6 w-px bg-slate-100" />
          <div>
            <h1 className="text-sm font-black text-slate-900 truncate max-w-[300px]">{unit.title}</h1>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <span>Unit Module</span>
              <span>•</span>
              <span className={isSaving ? "text-rose-500" : "text-emerald-500"}>
                {isSaving ? 'Syncing...' : lastSaved ? `Saved ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Draft'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
              <Type size={12} />
              <span>{wordCount} Words</span>
            </div>
          </div>
          
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-500 transition-colors" size={14} />
            <input 
              type="text" 
              placeholder="Search concepts..." 
              className="bg-slate-50 border border-slate-100 rounded-xl py-2 pl-9 pr-4 text-xs font-bold focus:outline-none focus:border-rose-200 focus:bg-white transition-all w-48"
            />
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Outline Panel (Optional Left) */}
        <aside className="w-64 border-r border-slate-50 p-6 overflow-y-auto bg-slate-50/30 hidden lg:block shrink-0">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
            <LayoutList size={14} /> Neural Outline
          </h3>
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
              <p className="text-[10px] text-slate-400 leading-relaxed italic">"Structured hierarchy auto-populates as you use /h1, /h2 commands."</p>
            </div>
          </div>
        </aside>

        {/* Main Editor Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-white relative">
          <div className="max-w-4xl mx-auto px-12 py-20 min-h-full">
            <NeuralNotesEngine 
              initialData={unit.notes} 
              onSave={handleSave} 
              onWordCountChange={setWordCount}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
