"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Plus, Trash2, Calendar, Briefcase, Moon, Dumbbell, Coffee, 
  Car, Laptop, Utensils, BookOpen, Heart, Flame, Gamepad, Tv, 
  Music, Users, MessageCircle, Phone, Plane, Bus, Settings, Brain, 
  ChevronRight, Play, Zap, ListTodo, Clock
} from 'lucide-react';
import { toast } from 'sonner';

// --- Types & Constants ---
export const ICON_LIST = [
  { id: 'Briefcase', icon: Briefcase, label: 'Work' }, { id: 'Moon', icon: Moon, label: 'Sleep' },
  { id: 'Dumbbell', icon: Dumbbell, label: 'Gym' }, { id: 'Coffee', icon: Coffee, label: 'Break' },
  { id: 'Car', icon: Car, label: 'Travel' }, { id: 'Laptop', icon: Laptop, label: 'Code' },
  { id: 'Utensils', icon: Utensils, label: 'Food' }, { id: 'BookOpen', icon: BookOpen, label: 'Study' },
  { id: 'Heart', icon: Heart, label: 'Health' }, { id: 'Flame', icon: Flame, label: 'Focus' },
  { id: 'Gamepad', icon: Gamepad, label: 'Game' }, { id: 'Tv', icon: Tv, label: 'TV' },
  { id: 'Music', icon: Music, label: 'Music' }, { id: 'Users', icon: Users, label: 'Social' },
  { id: 'MessageCircle', icon: MessageCircle, label: 'Chat' }, { id: 'Phone', icon: Phone, label: 'Call' },
  { id: 'Plane', icon: Plane, label: 'Flight' }, { id: 'Bus', icon: Bus, label: 'Bus' },
  { id: 'Settings', icon: Settings, label: 'Admin' }, { id: 'Brain', icon: Brain, label: 'Deep' },
];

const parseTimeToMinutes = (timeStr: string, ampm: string) => {
  let [h, m] = timeStr.split(':').map(Number);
  if (isNaN(h)) h = 0; if (isNaN(m)) m = 0;
  if (ampm === 'PM' && h < 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return h * 60 + m;
};

const formatMinutesToTime = (mins: number) => {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const displayM = m.toString().padStart(2, '0');
  return { time: `${displayH}:${displayM}`, ampm };
};

const parse24hToMinutes = (timeStr: string) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + (m || 0);
};

// --- Shared Components ---
function TimeInput({ label, time, ampm, onTimeChange, onAmpmChange }: any) {
  return (
    <div className="flex-1">
      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-2">{label}</label>
      <div className="flex gap-2">
        <input 
          type="text" 
          placeholder="09:00" 
          value={time} 
          onChange={(e) => onTimeChange(e.target.value)} 
          className="flex-1 px-5 py-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl outline-none focus:border-[var(--accent-color)] text-base font-black transition-all"
        />
        <button 
          type="button"
          onClick={() => onAmpmChange(ampm === 'AM' ? 'PM' : 'AM')}
          className="w-20 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl font-black text-xs hover:border-[var(--accent-color)] transition-all flex items-center justify-center text-[var(--text-primary)]"
        >
          {ampm}
        </button>
      </div>
    </div>
  );
}

// --- Main Modal ---
export function AddBlockModal({ 
  onClose, 
  onSaveAll, 
  initialStartTime,
  dayStartHour = 23,
  goals = [],
  selectedGoalIds = [],
  onToggleGoal
}: { 
  onClose: () => void, 
  onSaveAll: (blocks: any[]) => void,
  initialStartTime?: number,
  dayStartHour?: number,
  goals?: any[],
  selectedGoalIds?: string[],
  onToggleGoal?: (id: string) => void
}) {
  const [pendingBlocks, setPendingBlocks] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  
  // Initialize time from initialStartTime if provided
  const initialTimeObj = initialStartTime !== undefined ? formatMinutesToTime(initialStartTime) : { time: '09:00', ampm: 'AM' };
  const initialEndTimeObj = initialStartTime !== undefined ? formatMinutesToTime((initialStartTime + 60) % 1440) : { time: '05:00', ampm: 'PM' };

  const [startTime, setStartTime] = useState(initialTimeObj.time);
  const [startAmpm, setStartAmpm] = useState(initialTimeObj.ampm);
  const [endTime, setEndTime] = useState(initialEndTimeObj.time);
  const [endAmpm, setEndAmpm] = useState(initialEndTimeObj.ampm);
  const [icon, setIcon] = useState('Briefcase');

  const handleAddToList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const sMins = parseTimeToMinutes(startTime, startAmpm);
    const eMins = parseTimeToMinutes(endTime, endAmpm);
    const formatH = (m: number) => Math.floor(m / 60).toString().padStart(2, '0');
    const formatM = (m: number) => (m % 60).toString().padStart(2, '0');
    
    const newBlock = { 
      id: Math.random().toString(), 
      title: title.trim(), 
      start: `${formatH(sMins)}:${formatM(sMins)}`, 
      end: `${formatH(eMins)}:${formatM(eMins)}`, 
      icon 
    };

    setPendingBlocks(prev => {
      const next = [...prev, newBlock];
      // Sort blocks by shifted start time
      return next.sort((a, b) => {
        const aMins = parse24hToMinutes(a.start);
        const bMins = parse24hToMinutes(b.start);
        const aShifted = (aMins - dayStartHour * 60 + 1440) % 1440;
        const bShifted = (bMins - dayStartHour * 60 + 1440) % 1440;
        return aShifted - bShifted;
      });
    });
    
    setTitle('');
    toast.success(`Queued: ${title}`);
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-10 pointer-events-none">
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-md pointer-events-auto" />
      <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.9, opacity:0}} className="w-full max-w-6xl bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[3rem] shadow-2xl relative pointer-events-auto flex flex-col md:flex-row overflow-hidden max-h-[90vh]">
        
        {/* Left Panel: Editor */}
        <div className="flex-[1.5] min-w-[450px] p-10 md:p-14 overflow-y-auto custom-scrollbar border-r border-[var(--border-color)]">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-4xl font-black tracking-tightest mb-2">Daily Architect</h2>
              <p className="text-[var(--text-secondary)] font-bold text-base opacity-60">Design your day's non-negotiable pillars.</p>
            </div>
            <button onClick={onClose} className="p-3 bg-[var(--bg-secondary)] hover:bg-rose-500/10 hover:text-rose-500 rounded-2xl transition-all md:hidden"><X size={20}/></button>
          </div>

          <form onSubmit={handleAddToList} className="space-y-8">
            {goals.length > 0 && (
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] ml-1">Today's Objectives</label>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto custom-scrollbar p-1">
                  {goals.map(goal => {
                    const isSelected = selectedGoalIds.includes(goal.id);
                    return (
                      <button
                        key={goal.id}
                        type="button"
                        onClick={() => onToggleGoal?.(goal.id)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${isSelected 
                          ? 'bg-[var(--accent-color)] text-[var(--bg-primary)] border-[var(--accent-color)]' 
                          : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--accent-color)]'}`}
                      >
                        {goal.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] ml-1">Pillar Identity</label>
              <input type="text" required value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g., Deep Work, Gym, Sleep" className="w-full px-8 py-6 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl outline-none focus:border-[var(--accent-color)] text-xl font-black transition-all shadow-inner" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <TimeInput label="Begins At" time={startTime} ampm={startAmpm} onTimeChange={setStartTime} onAmpmChange={setStartAmpm} />
              <TimeInput label="Ends At" time={endTime} ampm={endAmpm} onTimeChange={setEndTime} onAmpmChange={setEndAmpm} />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] ml-1">Visual Marker</label>
              <div className="flex flex-wrap gap-3 p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl h-48 overflow-y-auto custom-scrollbar shadow-inner">
                {ICON_LIST.map(i => (
                  <button type="button" key={i.id} onClick={()=>setIcon(i.id)} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${icon===i.id ? 'bg-[var(--accent-color)] text-[var(--bg-primary)] shadow-xl scale-110 z-10' : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] border border-transparent hover:border-[var(--border-color)]'}`}><i.icon size={20}/></button>
                ))}
              </div>
            </div>

            <button type="submit" className="w-full py-6 bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--accent-color)] text-[var(--text-primary)] rounded-3xl font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4 shadow-sm hover:shadow-md"><Plus size={20}/> Queue This Pillar</button>
          </form>
        </div>

        {/* Right Panel: Preview */}
        <div className="w-full md:w-[420px] flex-shrink-0 bg-[var(--bg-secondary)]/30 p-10 md:p-14 flex flex-col backdrop-blur-sm">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-40">Your Timeline</h3>
            <span className="px-4 py-1.5 bg-[var(--accent-color)] text-[var(--bg-primary)] rounded-full text-[10px] font-black shadow-lg shadow-[var(--accent-color)]/20">{pendingBlocks.length} Pillars</span>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2 mb-10">
            <AnimatePresence mode="popLayout">
              {pendingBlocks.map(b => {
                const s = formatMinutesToTime(parse24hToMinutes(b.start));
                const e = formatMinutesToTime(parse24hToMinutes(b.end));
                const Icon = ICON_LIST.find(i=>i.id===b.icon)?.icon || Briefcase;
                return (
                  <motion.div layout initial={{opacity:0, x:30}} animate={{opacity:1, x:0}} exit={{opacity:0, scale:0.9}} key={b.id} className="p-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl shadow-sm flex items-center justify-between group transition-all hover:border-[var(--accent-color)]/30 hover:shadow-md">
                    <div className="flex items-center gap-5">
                      <div className="p-3.5 bg-[var(--bg-secondary)] rounded-2xl text-[var(--accent-color)] shadow-inner"><Icon size={20}/></div>
                      <div>
                        <h4 className="font-black text-sm tracking-tight">{b.title}</h4>
                        <p className="text-[10px] font-bold opacity-40 mt-1 uppercase tracking-widest">{s.time} {s.ampm} — {e.time} {e.ampm}</p>
                      </div>
                    </div>
                    <button onClick={()=>setPendingBlocks(p=>p.filter(x=>x.id!==b.id))} className="p-2.5 text-rose-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500/10 rounded-xl"><Trash2 size={16}/></button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {pendingBlocks.length === 0 && <div className="h-full flex flex-col items-center justify-center opacity-10 text-center py-20"><Calendar size={64} strokeWidth={1} className="mb-6"/><p className="text-sm font-black uppercase tracking-[0.2em]">Timeline Empty</p></div>}
          </div>

          <button disabled={pendingBlocks.length===0} onClick={()=>onSaveAll(pendingBlocks)} className="w-full py-7 bg-[var(--accent-color)] text-[var(--bg-primary)] rounded-[2.5rem] font-black text-sm uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(0,0,0,0.2)] shadow-[var(--accent-color)]/30 transition-all hover:scale-[1.03] active:scale-95 disabled:opacity-30 disabled:grayscale">Deploy Schedule</button>
        </div>
      </motion.div>
    </div>
  );
}
