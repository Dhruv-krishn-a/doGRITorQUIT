"use client";

import React, { useState, useEffect, lazy, Suspense, useMemo, useRef } from "react";
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Youtube,
  Brain,
  Timer as TimerIcon,
  VideoOff,
  Loader2,
  Zap,
} from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useStudy, Unit } from "@gritorquit/study-core";
import { useVideoProgress } from "@gritorquit/study-ui-web";
import { motion, AnimatePresence } from "framer-motion";
import YouTube, { YouTubeProps } from "react-youtube";
import { toast } from "sonner";

interface VideoPanelProps {
  playerRef: React.MutableRefObject<YouTubePlayer | null>;
  unit: Unit | undefined;
  youtubeId: string | null;
  hasMounted: boolean;
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
  seconds: number;
  setSeconds: (seconds: number) => void;
  formatTime: (s: number) => string;
  onProgress: (time: number) => void;
  watchPercentage: number;
  isDeepWork?: boolean;
}

interface YouTubePlayer {
  getCurrentTime: () => number;
  getIframe: () => HTMLIFrameElement | null;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
}

const VideoPanel = ({
  playerRef,
  unit,
  youtubeId,
  hasMounted,
  isPaused,
  setIsPaused,
  seconds,
  setSeconds,
  formatTime,
  onProgress,
  watchPercentage,
  isDeepWork
}: VideoPanelProps) => {
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!isPaused && playerRef.current) {
      interval = setInterval(() => {
        const time = playerRef.current?.getCurrentTime();
        if (time) onProgress(time);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPaused, onProgress, playerRef]);

  const onPlayerStateChange: YouTubeProps["onStateChange"] = (event) => {
    const state = event.data;
    if (state === 1) setIsPaused(false);
    if (state === 2 || state === 0) setIsPaused(true);
  };

  const onPlayerReady: YouTubeProps["onReady"] = (event) => {
    playerRef.current = event.target as unknown as YouTubePlayer;
    try {
      const iframe = playerRef.current?.getIframe ? playerRef.current.getIframe() : null;
      if (iframe && iframe.style) {
        iframe.style.pointerEvents = "auto";
      }
    } catch {
      // Ignored
    }
  };

  return (
    <div className={`h-full flex flex-col bg-[var(--bg-card)] overflow-hidden border shadow-xl relative ${isDeepWork ? "rounded-none border-none" : "rounded-[2.5rem] border-[var(--border-color)]"}`}>
      <div className="transform-gpu aspect-video w-full bg-black relative z-0">
        {youtubeId && hasMounted ? (
          <div className="transform-gpu absolute inset-0 z-10 pointer-events-auto">
            <YouTube
              videoId={youtubeId}
              className="transform-gpu w-full h-full"
              opts={{
                width: "100%",
                height: "100%",
                playerVars: {
                  autoplay: 0,
                  rel: 0,
                  modestbranding: 1,
                  iv_load_policy: 3,
                },
              }}
              onReady={onPlayerReady}
              onStateChange={onPlayerStateChange}
            />
          </div>
        ) : (
          <div className="transform-gpu absolute inset-0 flex items-center justify-center text-white/20">
            <div className="transform-gpu text-center p-8">
              <VideoOff size={48} className="transform-gpu mx-auto mb-6 opacity-20" />
              <p className="transform-gpu font-black uppercase tracking-[0.3em] text-[10px] mb-8 italic">
                Video stream unavailable
              </p>
              {unit?.metadata && (typeof unit.metadata === 'object' && 'youtubeId' in unit.metadata) && (
                <a
                  href={`https://youtube.com/watch?v=${(unit.metadata as { youtubeId: string }).youtubeId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="transform-gpu inline-flex items-center gap-3 bg-rose-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-900/40 italic"
                >
                  <Youtube size={16} /> Open Study Source
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="transform-gpu p-8 flex-1 flex flex-col justify-between text-left">
        <div>
          <div className="transform-gpu flex items-center justify-between mb-4">
            <div className="transform-gpu flex items-center gap-3">
              <span className="transform-gpu bg-rose-600 text-white text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest italic">
                Lesson Active
              </span>
              <span className="transform-gpu text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-widest italic opacity-60">
                {unit?.durationMinutes}m duration
              </span>
            </div>
            <div className="transform-gpu flex items-center gap-2">
              <div className="transform-gpu w-24 h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden border border-[var(--border-color)]/50">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${watchPercentage}%` }}
                  className="transform-gpu h-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                />
              </div>
              <span className="transform-gpu text-[10px] font-black text-rose-500 font-mono w-8 text-right italic">
                {Math.round(watchPercentage)}%
              </span>
            </div>
          </div>
          <h1 className="transform-gpu text-xl md:text-2xl font-black text-[var(--text-primary)] mb-4 line-clamp-2 tracking-tighter uppercase italic">
            {unit?.title}
          </h1>
        </div>

        <div className="transform-gpu bg-[var(--bg-secondary)]/50 border border-[var(--border-color)] shadow-inner rounded-[2rem] p-6 flex items-center justify-between">
          <div className="transform-gpu flex items-center gap-4">
            <div className="transform-gpu w-12 h-12 rounded-2xl bg-[var(--accent-color)]/10 flex items-center justify-center text-[var(--accent-color)] border border-[var(--accent-color)]/20 shadow-sm">
              <TimerIcon size={24} />
            </div>
            <div>
              <p className="transform-gpu text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-1 italic opacity-40">
                Study Timer
              </p>
              <p className="transform-gpu text-2xl font-black text-[var(--text-primary)] font-mono tracking-tighter leading-none italic">{formatTime(seconds)}</p>
            </div>
          </div>
          <div className="transform-gpu flex gap-2">
            <button
              onClick={() => setIsPaused(!isPaused)}
              title={isPaused ? "Resume study session" : "Pause study session"}
              className={`p-4 rounded-2xl transition-all active:scale-95 border ${
                isPaused ? "bg-[var(--accent-color)] text-[var(--bg-primary)] border-[var(--accent-color)] shadow-xl shadow-[var(--accent-color)]/20" : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-[var(--border-color)] hover:border-[var(--text-secondary)] shadow-sm"
              }`}
            >
              {isPaused ? <Play size={20} fill="currentColor" /> : <Pause size={20} fill="currentColor" />}
            </button>
            <button
              onClick={() => setSeconds(0)}
              title="Reset session timer"
              className="transform-gpu p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-2xl hover:border-[var(--text-secondary)] transition-all active:scale-95 shadow-sm"
            >
              <RotateCcw size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface Question {
  id: string;
  type: string;
  content: string;
  timestampSeconds: number;
  createdAt: string;
}

interface NotesPanelProps {
  playerRef: React.MutableRefObject<YouTubePlayer | null>;
  currentTab: "NOTES" | "QUESTIONS";
  setCurrentTab: (t: "NOTES" | "QUESTIONS") => void;
  currentTime: number;
  unit: Unit | undefined;
  freeformNotes: string;
  setFreeformNotes: (n: string) => void;
  questions: Question[];
  setQuestions: (q: Question[]) => void;
  handleSaveNotes: (nextFreeformNotes?: unknown, nextQuestions?: unknown[]) => Promise<void>;
  isSaving: boolean;
  isDeepWork?: boolean;
}

const LazyNoteEditor = lazy(() =>
  import("@gritorquit/notes-ui-web").then((mod) => ({ default: mod.NoteEditor }))
);

const NotesPanel = ({
  playerRef,
  currentTab,
  setCurrentTab,
  currentTime,
  unit,
  freeformNotes,
  setFreeformNotes,
  questions,
  setQuestions,
  handleSaveNotes,
  isSaving,
  isDeepWork,
}: NotesPanelProps) => {
  if (currentTab === 'NOTES') {
    return (
      <div className={`h-full flex flex-col bg-[var(--bg-card)] border shadow-xl overflow-hidden text-left ${isDeepWork ? "rounded-none border-none" : "rounded-[2.5rem] border-[var(--border-color)]"}`}>
        <div className="flex-1 p-6 md:p-8 flex flex-col h-full overflow-hidden">
          <div className="transform-gpu flex gap-4 mb-8">
            {(['NOTES', 'QUESTIONS'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setCurrentTab(tab)}
                className={`px-6 py-3 rounded-full text-[10px] font-black tracking-[0.2em] transition-all italic uppercase ${currentTab === tab ? 'bg-[var(--accent-color)] text-[var(--bg-primary)] shadow-lg shadow-[var(--accent-color)]/20' : 'bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-secondary)] shadow-sm'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex-1 min-h-0">
            <Suspense fallback={<div className="h-full w-full flex items-center justify-center"><Loader2 className="animate-spin text-[var(--accent-color)]" size={24} /></div>}>
              <LazyNoteEditor
                initialTitle={unit?.title || ""}
                initialContent={freeformNotes}
                onSave={(_title, content, isAutoSave) => {
                  setFreeformNotes(content);
                  if (!isAutoSave) {
                    void handleSaveNotes(content, questions);
                  }
                }}
                isSaving={isSaving}
                mode="SPLIT"
              />
            </Suspense>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col bg-[var(--bg-card)] border shadow-xl overflow-hidden text-left ${isDeepWork ? "rounded-none border-none" : "rounded-[2.5rem] border-[var(--border-color)]"}`}>
      <div className="transform-gpu flex-1 p-8 flex flex-col h-full overflow-hidden">
        <div className="transform-gpu flex gap-4 mb-8">
          {(['NOTES', 'QUESTIONS'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setCurrentTab(tab)}
              className={`px-6 py-3 rounded-full text-[10px] font-black tracking-[0.2em] transition-all italic uppercase ${currentTab === tab ? 'bg-[var(--accent-color)] text-[var(--bg-primary)] shadow-lg shadow-[var(--accent-color)]/20' : 'bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-secondary)] shadow-sm'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="transform-gpu flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
          {Array.isArray(questions) && questions.map((note, idx) => (
            <div key={note.id || idx} className="transform-gpu bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 rounded-2xl group hover:border-[var(--accent-color)]/50 transition-all shadow-inner">
              <div className="transform-gpu flex justify-between items-start mb-4">
                <span className="text-[9px] font-black px-3 py-1.5 rounded-lg bg-[var(--accent-color)]/10 text-[var(--accent-color)] uppercase tracking-[0.2em] border border-[var(--accent-color)]/20 shadow-sm italic">
                  Timestamped Vector
                </span>
                <button 
                  onClick={() => {
                    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
                      playerRef.current.seekTo(note.timestampSeconds, true);
                    }
                  }}
                  className="transform-gpu flex items-center gap-2 text-[10px] font-black text-[var(--accent-color)] bg-[var(--bg-primary)] border border-[var(--border-color)] px-3 py-1.5 rounded-xl hover:border-[var(--accent-color)]/50 shadow-sm transition-all italic active:scale-95"
                >
                  <Play size={10} fill="currentColor" />
                  {Math.floor(note.timestampSeconds / 60)}:{(Math.floor(note.timestampSeconds) % 60).toString().padStart(2, '0')}
                </button>
              </div>
              <p className="transform-gpu text-sm text-[var(--text-primary)] whitespace-pre-wrap font-black tracking-tight italic uppercase">{note.content}</p>
            </div>
          ))}
          {questions.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-[var(--text-secondary)] opacity-30">
               <p className="text-[10px] font-black uppercase tracking-[0.3em] italic">No queries initialized</p>
            </div>
          )}
        </div>
        <div className="transform-gpu shrink-0 relative mt-auto">
          <textarea
            className="transform-gpu w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--accent-color)] focus:ring-4 focus:ring-[var(--accent-color)]/5 rounded-3xl p-6 text-sm font-black italic tracking-tight uppercase resize-none transition-all placeholder:text-[var(--text-secondary)]/30 text-[var(--text-primary)] shadow-inner"
            rows={3}
            placeholder="Ask a question about this timestamp... (Press Enter to save)"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const val = e.currentTarget.value.trim();
                if (val) {
                  const newNote: Question = {
                    id: Date.now().toString(),
                    type: 'QUESTION',
                    content: val,
                    timestampSeconds: currentTime || 0,
                    createdAt: new Date().toISOString()
                  };
                  setQuestions([...questions, newNote]);
                  e.currentTarget.value = '';
                }
              }
            }}
          />
          <div className="transform-gpu absolute bottom-6 right-6 text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] italic opacity-60">
            Press Enter ↵
          </div>
        </div>
      </div>
    </div>
  );
};

export function StudyView() {
  const { trackId, unitId } = useParams();
  const playerRef = useRef<YouTubePlayer | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { activeTrack, fetchTrack, openModal, saveNotes, moveUnit } = useStudy();

  const [hasMounted, setHasMounted] = useState(false);
  const [layout] = useState<"SPLIT" | "FULL_NOTES" | "THEATER">(
    (searchParams.get("layout") as "SPLIT" | "FULL_NOTES" | "THEATER") || "SPLIT"
  );
  const [isDeepWork, setIsDeepWork] = useState(false);

  // Timer State
  const [seconds, setSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(searchParams.get("autostart") !== "true");

  // Notes State
  const [freeformNotes, setFreeformNotes] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentTab, setCurrentTab] = useState<"NOTES" | "QUESTIONS">("NOTES");
  const [isSaving, setIsSaving] = useState(false);

  // Auto-save debounced
  useEffect(() => {
    if (!unitId || !hasMounted) return;
    const timer = setTimeout(() => {
      saveNotes(unitId as string, JSON.stringify({ freeform: freeformNotes, questions })).catch(() => {});
    }, 2000);
    return () => clearTimeout(timer);
  }, [freeformNotes, questions, unitId, saveNotes, hasMounted]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (trackId) fetchTrack(trackId as string);
  }, [trackId, fetchTrack]);

  const unit = activeTrack?.track?.units?.find((u) => u.id === unitId);

  useEffect(() => {
    if (unit?.notes) {
      try {
        const parsed = typeof unit.notes === 'string' ? JSON.parse(unit.notes) : unit.notes;
        if (Array.isArray(parsed)) {
          const qs = parsed.filter(n => n.type === 'QUESTION');
          const others = parsed.filter(n => n.type !== 'QUESTION').map(n => n.content).join('\n\n');
          setQuestions(qs);
          setFreeformNotes(others);
        } else if (parsed && typeof parsed === 'object') {
          setFreeformNotes(parsed.freeform || "");
          setQuestions(parsed.questions || []);
        }
      } catch {
        if (typeof unit.notes === 'string') {
          setFreeformNotes(unit.notes);
        }
      }
    }
  }, [unit?.notes]);

  // Progress Tracking Hook
  const durationSeconds = useMemo(() => {
    if (!unit?.metadata) return 0;
    try {
      const meta = typeof unit.metadata === 'string' 
        ? JSON.parse(unit.metadata)
        : unit.metadata as { durationSeconds?: number };
      return meta?.durationSeconds || 0;
    } catch {
      return 0;
    }
  }, [unit?.metadata]);

  const { percentage, onProgress } = useVideoProgress(durationSeconds);

  useEffect(() => {
    if (unit && ['BACKLOG', 'THIS_WEEK', 'TODAY'].includes(unit.status)) {
      moveUnit(unit.id, 'IN_PROGRESS', unit.orderIndex);
    }
  }, [unit, moveUnit]);

  const youtubeId = useMemo(() => {
    if (!unit) return null;
    try {
      const meta = typeof unit.metadata === "string" ? JSON.parse(unit.metadata) : unit.metadata as { youtubeId?: string };
      return meta?.youtubeId || null;
    } catch {
      return null;
    }
  }, [unit]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!isPaused) {
      interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(interval!);
  }, [isPaused]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h > 0 ? h + ":" : ""}${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleSaveNotes = async (
    nextFreeformNotes: unknown = freeformNotes,
    nextQuestions: unknown[] = questions
  ) => {
    if (!unitId || isSaving) return;
    setIsSaving(true);
    try {
      await saveNotes(
        unitId as string,
        JSON.stringify({ freeform: nextFreeformNotes, questions: nextQuestions })
      );
      toast.success("Ledger updated");
    } catch {
      toast.error("Sync failed");
    } finally {
      setIsSaving(false);
    }
  };

  if (!unit)
    return (
      <div className="transform-gpu p-20 text-center text-[var(--accent-color)] font-black animate-pulse uppercase tracking-[0.3em] italic bg-[var(--bg-primary)] h-screen">
        Initializing Study Vector...
      </div>
    );

  return (
    <div className={`transform-gpu min-h-screen ${isDeepWork ? "bg-black" : "bg-[var(--bg-primary)]"} transition-colors duration-500 text-left`}>
      <header className={`transform-gpu px-8 py-5 flex items-center justify-between sticky top-0 z-50 transition-all duration-300 ${isDeepWork ? "bg-black border-b border-white/5 opacity-0 hover:opacity-100 h-1" : "bg-[var(--bg-card)]/80 backdrop-blur-xl border-b border-[var(--border-color)] shadow-sm"}`}>
        <div className="transform-gpu flex items-center gap-6">
          <button onClick={() => router.back()} className="transform-gpu p-3 hover:bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--accent-color)]/30 text-[var(--text-secondary)] hover:text-[var(--accent-color)] rounded-2xl transition-all shadow-sm active:scale-95">
            <ArrowLeft size={20} />
          </button>
          <div className="transform-gpu h-8 w-px bg-[var(--border-color)]" />
          <div className="transform-gpu flex items-center gap-5">
            <div className="transform-gpu w-12 h-12 rounded-2xl bg-[var(--accent-color)] flex items-center justify-center text-[var(--bg-primary)] shadow-lg shadow-[var(--accent-color)]/20">
              <Brain size={24} />
            </div>
            <div>
              <p className="transform-gpu text-[10px] font-black text-[var(--accent-color)] uppercase tracking-[0.3em] leading-none mb-1.5 italic opacity-80">Studying Vector</p>
              <h2 className="transform-gpu text-lg font-black text-[var(--text-primary)] tracking-tight leading-none uppercase italic">{unit?.title}</h2>
            </div>
          </div>
        </div>

        <div className="transform-gpu flex items-center gap-4">
          <button 
            onClick={() => setIsDeepWork(!isDeepWork)}
            className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-sm active:scale-95 italic ${isDeepWork ? "bg-amber-500 text-black shadow-amber-500/40" : "bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-amber-500/50 text-amber-500"}`}
          >
            <Zap size={16} className={isDeepWork ? "animate-pulse" : ""} strokeWidth={3} />
            {isDeepWork ? "Deep Work Active" : "Enable Deep Work"}
          </button>
          
          <button 
             onClick={() => openModal('SESSION', unit, 'LOGS')}
             className="transform-gpu px-10 py-3.5 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-xl active:scale-95 italic"
          >
            Complete Session
          </button>
        </div>
      </header>

      <main className={`transform-gpu transition-all duration-500 ${isDeepWork ? "p-0 h-[calc(100vh-4px)]" : "p-8 md:p-10 h-[calc(100vh-88px)]"}`}>
        <AnimatePresence mode="wait">
          {layout === "SPLIT" ? (
            <motion.div key="split" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="transform-gpu flex flex-col lg:flex-row gap-8 md:gap-10 h-full">
              <div className="transform-gpu flex-1 min-h-0">
                <VideoPanel
                  playerRef={playerRef}
                  unit={unit}
                  youtubeId={youtubeId}
                  hasMounted={hasMounted}
                  isPaused={isPaused}
                  setIsPaused={setIsPaused}
                  seconds={seconds}
                  setSeconds={setSeconds}
                  formatTime={formatTime}
                  onProgress={onProgress}
                  watchPercentage={percentage}
                  isDeepWork={isDeepWork}
                />
              </div>

              <div className="transform-gpu lg:w-[450px] xl:w-[550px] shrink-0 h-full">
                <NotesPanel
                  playerRef={playerRef}
                  currentTab={currentTab}
                  setCurrentTab={setCurrentTab}
                  currentTime={seconds}
                  unit={unit}
                  freeformNotes={freeformNotes}
                  setFreeformNotes={setFreeformNotes}
                  questions={questions}
                  setQuestions={setQuestions}
                  handleSaveNotes={handleSaveNotes}
                  isSaving={isSaving}
                  isDeepWork={isDeepWork}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div key="full_notes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="transform-gpu w-full h-full flex gap-6">
              <div className="transform-gpu w-20 flex flex-col gap-4">
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className={`w-full aspect-square rounded-[2rem] flex items-center justify-center transition-all shadow-sm border ${isPaused ? "bg-[var(--accent-color)] border-[var(--accent-color)] text-[var(--bg-primary)] shadow-[var(--accent-color)]/20" : "bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--accent-color)] hover:text-[var(--accent-color)]"}`}
                >
                  {isPaused ? <Play size={24} fill="currentColor" /> : <Pause size={24} fill="currentColor" />}
                </button>
                <div className="transform-gpu flex-1 bg-[var(--bg-card)] border border-[var(--border-color)] shadow-inner rounded-[2rem] flex flex-col items-center justify-center gap-2 py-4">
                  <span className="transform-gpu text-[8px] font-black text-[var(--text-secondary)] uppercase vertical-text tracking-[0.3em] mb-4 opacity-40 italic">Timer</span>
                  <span className="transform-gpu text-2xl font-black text-[var(--accent-color)] font-mono rotate-90 tracking-tighter italic">{Math.floor(seconds / 60).toString().padStart(2, "0")}</span>
                  <span className="transform-gpu text-xl font-black text-[var(--text-secondary)] font-mono rotate-90 opacity-60 tracking-tighter italic">{(seconds % 60).toString().padStart(2, "0")}</span>
                </div>
              </div>
              <div className="transform-gpu flex-1 h-full">
                <NotesPanel
                  playerRef={playerRef}
                  currentTab={currentTab}
                  setCurrentTab={setCurrentTab}
                  currentTime={seconds}
                  unit={unit}
                  freeformNotes={freeformNotes}
                  setFreeformNotes={setFreeformNotes}
                  questions={questions}
                  setQuestions={setQuestions}
                  handleSaveNotes={handleSaveNotes}
                  isSaving={isSaving}
                  isDeepWork={isDeepWork}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
