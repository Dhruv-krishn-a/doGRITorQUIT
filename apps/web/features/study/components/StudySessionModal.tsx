"use client";
import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { 
  X, 
  Play, 
  Pause, 
  CheckCircle2, 
  Trophy, 
  Brain, 
  Gauge, 
  Timer,
  History,
  Plus,
  MonitorPlay,
  Clock,
  ChevronRight
} from 'lucide-react';
import { NeuralNotesEngine } from './Notes/NeuralNotesEngine';
import { Unit } from '@prisma/client';
import { toast } from 'sonner';

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

interface StudySessionModalProps {
  unit: Unit;
  mode?: 'STUDY' | 'TIMER' | 'COMPLETE';
  onClose: () => void;
  onSessionEnd: (watchedSeconds: number) => Promise<void>;
  onComplete: (data: { confidence: number; difficulty: number; takeaways: string[]; minutesSpent: number; watchPercentage: number }) => Promise<void>;
}

export const StudySessionModal: React.FC<StudySessionModalProps> = ({ unit, mode = 'STUDY', onClose, onSessionEnd, onComplete }) => {
  const [playing, setPlaying] = useState(mode !== 'COMPLETE');
  const [elapsed, setElapsed] = useState(0);
  const [showForm, setShowForm] = useState(mode === 'COMPLETE');
  
  const [completionData, setCompletionData] = useState({
    confidence: 3,
    difficulty: 3,
    takeaways: '',
    sessionStudyMins: '', 
    videoProgressMins: '', 
    calculatedPercentage: unit.watchPercentage || 0
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const youtubeUrl = React.useMemo(() => {
    try {
      const meta = typeof unit.metadata === 'string' ? JSON.parse(unit.metadata) : unit.metadata;
      const id = (meta as any)?.youtubeId;
      if (id && mode === 'STUDY') return `https://www.youtube.com/watch?v=${id}`;
    } catch (e) {}
    return '';
  }, [unit.metadata, mode]);

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => setElapsed(prev => prev + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if(timerRef.current) clearInterval(timerRef.current); };
  }, [playing]);

  const totalVideoMins = unit.durationMinutes || 1;
  const previousStudyMins = unit.actualTimeSpentMinutes || 0;

  const handleVideoProgressChange = (val: string) => {
    const reachedMins = parseInt(val) || 0;
    const percent = Math.min(100, Math.round((reachedMins / totalVideoMins) * 100));
    setCompletionData(prev => ({ ...prev, videoProgressMins: val, calculatedPercentage: percent }));
  };

  const handleFinalize = async (e: React.FormEvent) => {
    e.preventDefault();
    const studyTime = parseInt(completionData.sessionStudyMins) || Math.floor(elapsed / 60);
    await onComplete({
      confidence: completionData.confidence,
      difficulty: completionData.difficulty,
      takeaways: completionData.takeaways.split('\n').filter(t => t.trim()),
      minutesSpent: studyTime,
      watchPercentage: completionData.calculatedPercentage
    });
    onClose();
  };

  // --- POPUP: MARK AS DONE ---
  if (mode === 'COMPLETE' || showForm) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
        <div className="relative bg-white rounded-[3.5rem] w-full max-w-xl shadow-2xl p-12 border border-slate-100 animate-in zoom-in-95 duration-200">
          <form onSubmit={handleFinalize} className="space-y-8">
            <div className="text-center space-y-2">
              <div className="inline-flex p-5 bg-emerald-50 text-emerald-600 rounded-3xl mb-4">
                <Trophy size={40} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Save Progress</h2>
              <div className="flex items-center justify-center gap-4 py-2 px-4 bg-slate-50 rounded-xl w-fit mx-auto border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Studied:</span>
                  <span className="text-sm font-black text-rose-600">{previousStudyMins}m</span>
                </div>
                <Plus size={10} className="text-slate-300" />
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Today:</span>
                  <span className="text-sm font-black text-rose-600">{completionData.sessionStudyMins || Math.floor(elapsed / 60)}m</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Time Spent Today</label>
                  <input type="number" placeholder={Math.floor(elapsed / 60).toString()} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-black text-xl text-slate-800 focus:border-rose-500 outline-none transition-all" value={completionData.sessionStudyMins} onChange={e => setCompletionData({...completionData, sessionStudyMins: e.target.value})} />
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Minutes Watched</label>
                  <input type="number" placeholder="Min" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-black text-xl text-slate-800 focus:border-rose-500 outline-none transition-all" value={completionData.videoProgressMins} onChange={e => handleVideoProgressChange(e.target.value)} />
               </div>
            </div>

            <div className="bg-slate-900 rounded-3xl p-6 text-white flex justify-between items-center shadow-xl">
               <div>
                  <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-1">Video Completion</p>
                  <p className="text-3xl font-black">{completionData.calculatedPercentage}%</p>
               </div>
               <div className="h-2 w-32 bg-white/10 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-1000" style={{ width: `${completionData.calculatedPercentage}%` }} />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3 flex flex-col">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confidence</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(v => (
                    <button key={v} type="button" onClick={() => setCompletionData({...completionData, confidence: v})} className={`flex-1 py-3 rounded-xl border-2 font-black text-sm transition-all ${completionData.confidence === v ? 'bg-rose-600 border-rose-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400'}`}>{v}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-3 flex flex-col">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Difficulty</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(v => (
                    <button key={v} type="button" onClick={() => setCompletionData({...completionData, difficulty: v})} className={`flex-1 py-3 rounded-xl border-2 font-black text-sm transition-all ${completionData.difficulty === v ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400'}`}>{v}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button type="button" onClick={onClose} className="flex-1 py-5 rounded-2xl font-black text-slate-400 hover:bg-slate-50 transition-colors uppercase tracking-widest text-[10px]">Cancel</button>
              <button type="submit" className="flex-[2] py-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black shadow-xl shadow-emerald-100 transition-all active:scale-95 uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                <CheckCircle2 size={20} /> Save Progress
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // --- FULL PAGE: STUDY MODE ---
  return (
    <div className="fixed inset-0 z-[150] bg-white flex flex-col overflow-hidden animate-in fade-in duration-500">
      <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-10 shrink-0 z-20">
        <div className="flex items-center gap-6">
          <div className="bg-rose-600 p-3 rounded-2xl text-white shadow-xl shadow-rose-200">
            <Brain size={24} />
          </div>
          <div>
            <h2 className="text-slate-900 font-black text-lg tracking-tight uppercase">{unit.title}</h2>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-rose-500 font-black uppercase tracking-[0.2em]">Study Session Active</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-12">
          <div className="flex items-center gap-10 bg-slate-50 px-8 py-2 rounded-[2rem] border border-slate-100 shadow-inner">
            <div className="text-center">
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Time Elapsed</p>
              <p className="text-rose-600 font-mono font-bold text-2xl">
                {new Date(elapsed * 1000).toISOString().substr(11, 8)}
              </p>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-center">
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Mastery</p>
              <p className="text-slate-900 font-mono font-bold text-2xl">{Math.round(unit.watchPercentage || 0)}%</p>
            </div>
          </div>
          
          <button onClick={onClose} className="p-4 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-2xl transition-all active:scale-90 border border-slate-100 group">
            <X size={24} className="group-hover:rotate-90 transition-transform" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-white">
          <div className="max-w-4xl mx-auto px-12 py-20 min-h-full">
            <NeuralNotesEngine 
              initialData={unit.notes} 
              onSave={async (json) => {
                await fetch(`/api/study/units/${unit.id}/notes`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ notes: json })
                });
              }} 
              onWordCountChange={() => {}} 
            />
          </div>
        </main>

        {youtubeUrl && (
          <aside className="w-[450px] bg-slate-50 border-l border-slate-100 flex flex-col p-8 gap-8 hidden xl:flex shadow-2xl relative z-10">
             <div className="aspect-video w-full bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 ring-1 ring-black/5">
                <ReactPlayer
                  url={youtubeUrl}
                  width="100%"
                  height="100%"
                  playing={playing}
                  controls
                  onPlay={() => setPlaying(true)}
                  onPause={() => setPlaying(false)}
                />
             </div>
             
             <div className="space-y-6">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
                   <div className="flex items-center gap-3">
                      <div className="bg-rose-100 p-2 rounded-xl text-rose-600">
                        <MonitorPlay size={18} />
                      </div>
                      <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Video Stream</span>
                   </div>
                   <p className="text-xs text-slate-500 font-medium leading-relaxed">
                     The timer is synced with your study session. You can also watch directly on YouTube.
                   </p>
                   <a href={youtubeUrl} target="_blank" className="flex items-center justify-center gap-3 w-full py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-rose-600 transition-all shadow-lg">
                      Open YouTube <ChevronRight size={14} />
                   </a>
                </div>

                <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[2rem] flex flex-col items-center text-center gap-3">
                   <CheckCircle2 size={32} className="text-emerald-600" />
                   <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Finished studying?</p>
                   <button onClick={() => setShowForm(true)} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all">
                      Save Progress
                   </button>
                </div>
             </div>
          </aside>
        )}

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-slate-900/95 backdrop-blur-3xl px-10 py-5 rounded-[2.5rem] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.3)] z-30">
          <button 
            onClick={() => setPlaying(!playing)}
            className={`p-5 rounded-2xl transition-all active:scale-90 shadow-2xl ${
              playing ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-rose-600 text-white hover:bg-rose-700'
            }`}
          >
            {playing ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
          </button>
          <div className="h-10 w-px bg-white/10" />
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center gap-3 px-8 py-5 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] active:scale-95"
          >
            <CheckCircle2 size={24} />
            Save Session
          </button>
        </div>
      </div>
    </div>
  );
};
