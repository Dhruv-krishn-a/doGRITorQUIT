"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Layout,
  ChevronRight,
  ChevronLeft,
  Youtube,
  CheckCircle,
  Save,
  Brain,
  Timer as TimerIcon,
  VideoOff,
  Loader2,
  Zap,
  Activity,
  Target,
  MoreVertical,
} from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useStudy, Unit } from "@planner/study-core";
import { useVideoProgress } from "@planner/study-ui-web";
import { motion, AnimatePresence } from "framer-motion";
import YouTube, { YouTubeProps } from "react-youtube";
import { toast } from "sonner";
import { createPortal } from "react-dom";

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
  setIsDeepWork?: (d: boolean) => void;
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
  }, [isPaused, onProgress]);

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
    } catch (e) {
      console.warn("Failed to adjust iframe style:", e);
    }
  };

  return (
    <div className={`h-full flex flex-col bg-white overflow-hidden border shadow-xl relative h-full ${isDeepWork ? "rounded-none border-none" : "rounded-[2.5rem] border-rose-100/50"}`}>
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
              <p className="transform-gpu font-bold uppercase tracking-[0.3em] text-[10px] mb-8">
                Video stream unavailable
              </p>
              {unit?.metadata?.youtubeId && (
                <a
                  href={`https://youtube.com/watch?v=${unit.metadata.youtubeId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="transform-gpu inline-flex items-center gap-3 bg-rose-600 text-white px-8 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-900/40"
                >
                  <Youtube size={16} /> Open Study Source
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="transform-gpu p-8 flex-1 flex flex-col justify-between">
        <div>
          <div className="transform-gpu flex items-center justify-between mb-4">
            <div className="transform-gpu flex items-center gap-3">
              <span className="transform-gpu bg-rose-600 text-white text-[8px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                Lesson Active
              </span>
              <span className="transform-gpu text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                {unit?.durationMinutes}m duration
              </span>
            </div>
            <div className="transform-gpu flex items-center gap-2">
              <div className="transform-gpu w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${watchPercentage}%` }}
                  className="transform-gpu h-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                />
              </div>
              <span className="transform-gpu text-[10px] font-bold text-rose-500 font-mono w-8 text-right">
                {Math.round(watchPercentage)}%
              </span>
            </div>
          </div>
          <h1 className="transform-gpu text-xl md:text-2xl font-bold text-slate-900 mb-4 line-clamp-2">
            {unit?.title}
          </h1>
        </div>

        <div className="transform-gpu bg-rose-50/50 border border-rose-100/50 rounded-3xl p-6 flex items-center justify-between">
          <div className="transform-gpu flex items-center gap-4">
            <div className="transform-gpu w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
              <TimerIcon size={24} />
            </div>
            <div>
              <p className="transform-gpu text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                Study Timer
              </p>
              <p className="transform-gpu text-2xl font-bold text-slate-800 font-mono">{formatTime(seconds)}</p>
            </div>
          </div>
          <div className="transform-gpu flex gap-2">
            <button
              onClick={() => setIsPaused(!isPaused)}
              title={isPaused ? "Resume study session" : "Pause study session"}
              className={`p-4 rounded-2xl transition-all active:scale-95 border ${
                isPaused ? "bg-rose-600 text-white border-rose-600 shadow-lg shadow-rose-200" : "bg-white text-slate-400 border-slate-200 hover:text-slate-900 hover:border-slate-300 hover:shadow-sm"
              }`}
            >
              {isPaused ? <Play size={20} fill="currentColor" /> : <Pause size={20} fill="currentColor" />}
            </button>
            <button
              onClick={() => setSeconds(0)}
              title="Reset session timer"
              className="transform-gpu p-4 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:text-slate-900 hover:border-slate-300 hover:shadow-sm transition-all active:scale-95"
            >
              <RotateCcw size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface NotesPanelProps {
  playerRef: React.MutableRefObject<YouTubePlayer | null>;
  currentTab: "NOTES" | "QUESTIONS";
  setCurrentTab: (t: "NOTES" | "QUESTIONS") => void;
  currentTime: number;
  unit: Unit | undefined;
  freeformNotes: string;
  setFreeformNotes: (n: string) => void;
  questions: any[];
  setQuestions: (q: any[]) => void;
  handleSaveNotes: () => void;
  isSaving: boolean;
  openModal: (
    modal: "CREATE" | "DELETE" | "COMMIT" | "SESSION" | "LOGS" | "REFLECTION" | null,
    unit?: Unit | null,
    mode?: "STUDY" | "TIMER" | "COMPLETE" | "LOGS",
    data?: unknown
  ) => void;
  logProgress: (unitId: string, data: { secondsSpent: number; watchPercentage: number }) => Promise<void>;
  seconds: number;
  lastLoggedSeconds: number;
  watchPercentage: number;
  isDeepWork?: boolean;
  setIsDeepWork?: (d: boolean) => void;
}

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
  openModal,
  logProgress,
  seconds,
  lastLoggedSeconds,
  watchPercentage,
  isDeepWork,
  setIsDeepWork
}: NotesPanelProps) => {
  const router = useRouter();
  const params = useParams();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleEndTimer = async () => {
    const sessionSeconds = seconds - lastLoggedSeconds;
    if (sessionSeconds < 5) {
      toast.error("Session too short to save");
      return;
    }
    if (unit) {
      await logProgress(unit.id, {
        secondsSpent: sessionSeconds,
        watchPercentage: watchPercentage,
      });
      toast.success("Study session saved");
      router.push(window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/')));
    }
  };

  return (
    <div className={`h-full flex flex-col bg-white border shadow-xl overflow-hidden ${isDeepWork ? "rounded-none border-none" : "rounded-[2.5rem] border-rose-100"}`}>
      <header className="transform-gpu p-8 border-b border-rose-50 flex justify-between items-center shrink-0 relative z-20">
        <div className="transform-gpu flex items-center gap-4">
          <div className="transform-gpu p-3 bg-rose-50 text-rose-500 rounded-2xl">
            <Brain size={20} />
          </div>
          <div>
            <h2 className="transform-gpu text-lg font-bold text-slate-800 tracking-tight">Study Notes</h2>
            <p className="transform-gpu text-[10px] font-bold text-slate-400 uppercase tracking-widest">Auto-saving notes</p>
          </div>
        </div>
        <div className="transform-gpu flex items-center gap-2 relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            title="Menu"
            className={`transform-gpu p-3 rounded-xl transition-all ${isMenuOpen ? 'bg-rose-600 text-white' : 'bg-slate-50 text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}
          >
            <MoreVertical size={18} />
          </button>
          
          <AnimatePresence>
            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col"
                >
                  <button
                    onClick={() => {
                      handleSaveNotes();
                      setIsMenuOpen(false);
                    }}
                    disabled={isSaving}
                    className="flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 text-xs text-slate-700 font-bold uppercase tracking-widest transition-colors"
                  >
                    {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                    Save
                  </button>
                  <button
                    onClick={() => {
                      handleEndTimer();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 text-xs text-slate-700 font-bold uppercase tracking-widest transition-colors"
                  >
                    <TimerIcon size={14} />
                    End Session
                  </button>
                  <button
                    onClick={() => {
                      const sessionSeconds = seconds - lastLoggedSeconds;
                      openModal("SESSION", unit, "LOGS", { 
                        minutesSpent: Math.max(1, Math.round(sessionSeconds / 60)),
                        watchPercentage: Math.round(watchPercentage)
                      });
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 text-left hover:bg-rose-50 text-xs text-rose-600 font-bold uppercase tracking-widest transition-colors border-t border-slate-50"
                  >
                    <CheckCircle size={14} />
                    Complete
                  </button>
                  {isDeepWork && setIsDeepWork && (
                    <button
                      onClick={() => {
                        setIsDeepWork(false);
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 text-xs text-slate-700 font-bold uppercase tracking-widest transition-colors border-t border-slate-50"
                    >
                      <Zap size={14} className="text-amber-500" />
                      Exit Focus
                    </button>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </header>
      <div className="transform-gpu flex-1 p-8 flex flex-col h-full overflow-hidden">
        <div className="transform-gpu flex gap-2 mb-4">
          {(['NOTES', 'QUESTIONS'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setCurrentTab(tab)}
              className={`px-4 py-2 rounded-full text-[10px] font-bold tracking-widest transition-all ${currentTab === tab ? 'bg-rose-600 text-white shadow-md shadow-rose-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        {currentTab === 'NOTES' ? (
          <div className="transform-gpu flex-1 min-h-0">
            <textarea
              className="transform-gpu w-full h-full bg-slate-50 border border-slate-200 focus:border-rose-300 focus:ring-2 focus:ring-rose-100 rounded-3xl p-6 text-sm resize-none transition-all placeholder:text-slate-400"
              placeholder="Write your comprehensive study notes here..."
              value={freeformNotes}
              onChange={(e) => setFreeformNotes(e.target.value)}
            />
          </div>
        ) : (
          <>
            <div className="transform-gpu flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
              {Array.isArray(questions) && questions.map((note, idx) => (
                <div key={note.id || idx} className="transform-gpu bg-amber-50 border border-amber-100 p-4 rounded-2xl group hover:border-amber-200 transition-all">
                  <div className="transform-gpu flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-200/50 text-amber-700">
                      QUESTION
                    </span>
                    <button 
                      onClick={() => {
                        if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
                          playerRef.current.seekTo(note.timestampSeconds, true);
                        }
                      }}
                      className="transform-gpu flex items-center gap-1 text-[10px] font-bold text-rose-500 bg-white px-2 py-1 rounded-md hover:bg-rose-50 shadow-sm transition-colors"
                    >
                      <Play size={10} />
                      {Math.floor(note.timestampSeconds / 60)}:{(Math.floor(note.timestampSeconds) % 60).toString().padStart(2, '0')}
                    </button>
                  </div>
                  <p className="transform-gpu text-sm text-slate-800 whitespace-pre-wrap">{note.content}</p>
                </div>
              ))}
              {questions.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-50">
                   <p className="text-xs font-bold uppercase tracking-widest">No questions yet</p>
                </div>
              )}
            </div>
            <div className="transform-gpu shrink-0 relative mt-auto">
              <textarea
                className="transform-gpu w-full bg-slate-50 border border-slate-200 focus:border-rose-300 focus:ring-2 focus:ring-rose-100 rounded-2xl p-4 text-sm resize-none transition-all placeholder:text-slate-400"
                rows={3}
                placeholder="Ask a question about this timestamp... (Press Enter to save, Shift+Enter for new line)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    const val = e.currentTarget.value.trim();
                    if (val) {
                      const newNote = {
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
              <div className="transform-gpu absolute bottom-4 right-4 text-[10px] font-bold text-slate-400">
                Press Enter ↵
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export function StudyView() {
  const { trackId, unitId } = useParams();
  const playerRef = React.useRef<YouTubePlayer | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { activeTrack, fetchTrack, openModal, saveNotes, logProgress, dashboard, moveUnit } = useStudy();

  const [hasMounted, setHasMounted] = useState(false);
  const [layout, setLayout] = useState<"SPLIT" | "FULL_NOTES" | "THEATER">(
    (searchParams.get("layout") as "SPLIT" | "FULL_NOTES" | "THEATER") || "SPLIT"
  );
  const [transpose, setTranspose] = useState(false);
  const [isDeepWork, setIsDeepWork] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  // Timer State
  const [seconds, setSeconds] = useState(0);
  const [lastLoggedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(searchParams.get("autostart") !== "true");

  // Notes State
  const [freeformNotes, setFreeformNotes] = useState<string>("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentTab, setCurrentTab] = useState<"NOTES" | "QUESTIONS">("NOTES");
  const [isSaving, setIsSaving] = useState(false);
  const [videoWidth, setVideoWidth] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

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
      } catch (e) {
        if (typeof unit.notes === 'string') {
          setFreeformNotes(unit.notes);
        }
      }
    }
  }, [unit?.notes]);

  // Progress Tracking Hook
  const durationSeconds = typeof unit?.metadata === 'string' 
    ? (JSON.parse(unit.metadata)?.durationSeconds || 0)
    : (unit?.metadata as { durationSeconds?: number })?.durationSeconds || 0;
  const { percentage, onProgress } = useVideoProgress(durationSeconds);

  useEffect(() => {
    if (unit && ['BACKLOG', 'THIS_WEEK', 'TODAY'].includes(unit.status)) {
      moveUnit(unit.id, 'IN_PROGRESS', unit.orderIndex);
    }
  }, [unit, moveUnit]);

  // FIXED: youtubeId was not defined in this scope
  const youtubeId = React.useMemo(() => {
    if (!unit) return null;
    try {
      const meta = typeof unit.metadata === "string" ? JSON.parse(unit.metadata) : unit.metadata;
      const id = meta?.youtubeId;
      return id || null;
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

  const handleSaveNotes = async () => {
    if (!unitId || isSaving) return;
    setIsSaving(true);
    try {
      await saveNotes(unitId as string, JSON.stringify({ freeform: freeformNotes, questions }));
      toast.success("Notes saved");
    } catch {
      toast.error("Sync failed");
    } finally {
      setIsSaving(false);
    }
  };

  if (!unit)
    return (
      <div className="transform-gpu p-20 text-center text-rose-400 font-bold animate-pulse uppercase tracking-widest">
        Opening Study Environment...
      </div>
    );

  const globalHeader = (
    <header className="transform-gpu flex justify-between items-center shrink-0 h-16 px-4 md:px-0">
      <div className="transform-gpu flex items-center gap-6">
        <button
          onClick={async () => {
            const sessionSeconds = seconds - lastLoggedSeconds;
            if (sessionSeconds >= 5 && unit) {
              await logProgress(unit.id, {
                secondsSpent: sessionSeconds,
                watchPercentage: percentage,
              });
              toast.success("Study session saved automatically");
            }
            router.push(window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/')));
          }}
          title="Save session and return to course"
          className="transform-gpu p-4 bg-white border border-rose-100 rounded-2xl text-slate-400 hover:text-rose-600 hover:border-rose-300 transition-all shadow-sm active:scale-95"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="transform-gpu hidden md:block">
          <p className="transform-gpu text-[10px] font-bold uppercase tracking-widest text-rose-400 mb-0.5">
            {activeTrack?.track?.title}
          </p>
          <h2 className="transform-gpu text-xl font-bold text-slate-900 tracking-tight truncate max-w-sm">{unit.title}</h2>
        </div>
      </div>

      <div className="transform-gpu flex items-center gap-6">
        {unit.todayGoalMinutes && (
          <div className="transform-gpu flex items-center gap-3 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-100 shadow-sm">
            <Target size={16} className="transform-gpu text-amber-600" />
            <div className="transform-gpu flex flex-col">
              <span className="transform-gpu text-[8px] font-bold text-amber-400 uppercase tracking-widest">Daily Target</span>
              <span className="transform-gpu text-[10px] font-bold text-amber-700 uppercase tracking-widest">
                {Math.floor((unit.totalWatchedSeconds || 0) / 60)} / {unit.todayGoalMinutes}m
              </span>
            </div>
          </div>
        )}

        {dashboard?.fatigueDetails && (
          <div className="transform-gpu hidden lg:flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-rose-100 shadow-sm">
            <Activity
              size={16}
              className={dashboard.fatigueDetails.score > 5 ? "text-rose-500 animate-pulse" : "text-emerald-500"}
            />
            <div className="transform-gpu flex flex-col">
              <span className="transform-gpu text-[8px] font-bold text-slate-400 uppercase tracking-widest">System Health</span>
              <span
                className={`text-[10px] font-bold uppercase tracking-widest ${
                  dashboard.fatigueDetails.score > 5 ? "text-rose-600" : "text-emerald-600"
                }`}
              >
                {dashboard.fatigueLevel || "OPTIMAL"}
              </span>
            </div>
          </div>
        )}

        <div className="transform-gpu flex items-center gap-2">
          {showDiscardConfirm ? (
            <div className="transform-gpu flex items-center gap-3 bg-rose-50 px-4 py-2 rounded-2xl border border-rose-100 animate-in slide-in-from-right-4 duration-300">
              <span className="transform-gpu text-[10px] font-bold text-rose-600 uppercase tracking-widest">Discard session?</span>
              <button 
                onClick={() => router.push(window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/')))}
                className="transform-gpu text-[10px] font-bold text-rose-600 hover:underline uppercase"
              >
                Yes
              </button>
              <button 
                onClick={() => setShowDiscardConfirm(false)}
                className="transform-gpu text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDiscardConfirm(true)}
              title="Exit without saving session"
              className="transform-gpu px-4 py-2 bg-white text-slate-400 border border-slate-100 rounded-2xl hover:text-rose-600 hover:bg-rose-50 transition-all text-[10px] font-bold uppercase tracking-widest"
            >
              Discard
            </button>
          )}

          <button
            onClick={() => setIsDeepWork(true)}
            title="Hide all distractions for deep focus"
            className="transform-gpu flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all shadow-lg active:scale-95"
          >
            <Zap size={16} className="transform-gpu text-amber-400" />
            <span className="transform-gpu text-[10px] font-bold uppercase tracking-widest">Deep Work</span>
          </button>
        </div>

        <div className="transform-gpu flex items-center gap-3 bg-white p-2 rounded-2xl border border-rose-100 shadow-sm">
          <button
            onClick={() => setLayout("SPLIT")}
            title="Video and notes side-by-side"
            className={`p-3 rounded-xl transition-all ${layout === "SPLIT" ? "bg-rose-600 text-white shadow-md shadow-rose-200" : "text-slate-400 hover:bg-rose-50"}`}
          >
            <Layout size={18} />
          </button>
          <button
            onClick={() => setLayout("THEATER")}
            title="Large video layout"
            className={`p-3 rounded-xl transition-all ${layout === "THEATER" ? "bg-rose-600 text-white shadow-md shadow-rose-200" : "text-slate-400 hover:bg-rose-50"}`}
          >
            <Maximize2 size={18} />
          </button>
          <button
            onClick={() => setLayout("FULL_NOTES")}
            title="Writing focused layout"
            className={`p-3 rounded-xl transition-all ${layout === "FULL_NOTES" ? "bg-rose-600 text-white shadow-md shadow-rose-200" : "text-slate-400 hover:bg-rose-50"}`}
          >
            <Brain size={18} />
          </button>
          <div className="transform-gpu w-px h-6 bg-rose-100 mx-1" />
          <button 
            onClick={() => setTranspose(!transpose)} 
            title="Swap side panels"
            className="transform-gpu p-3 text-slate-400 hover:bg-rose-50 rounded-xl transition-all"
          >
            {transpose ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </div>
    </header>
  );

  const root = typeof document !== 'undefined' ? document.getElementById('study-view-root') : null;
  if (!root) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[1500] flex flex-col overflow-hidden transition-colors duration-700 ${
        isDeepWork ? "bg-[#fdfbfb] p-0" : "bg-[#fdfbfb] p-4 md:p-8 lg:p-10 gap-6"
      }`}
    >
      {!isDeepWork && globalHeader}

      <main className={`flex-1 min-h-0 flex gap-6 relative transition-all duration-700 ${isDeepWork ? "scale-100" : ""}`}>
        <AnimatePresence mode="wait">
          {layout === "SPLIT" && (
            <motion.div
              key="split"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className={`w-full flex h-full gap-0 ${transpose ? "flex-row-reverse" : "flex-row"}`}
            >
              <div className="h-full shrink-0" style={{ width: `${transpose ? 100 - videoWidth : videoWidth}%` }}>
                <VideoPanel
                  playerRef={playerRef}
                  unit={unit}
                  isDeepWork={isDeepWork}
                  youtubeId={youtubeId}
                  hasMounted={hasMounted}
                  isPaused={isPaused}
                  setIsPaused={setIsPaused}
                  seconds={seconds}
                  setSeconds={setSeconds}
                  formatTime={formatTime}
                  onProgress={onProgress}
                  watchPercentage={percentage}
                />
              </div>

              <div 
                className={`w-2 h-full cursor-col-resize group flex items-center justify-center z-10 relative ${isDragging ? 'bg-rose-500/10' : 'hover:bg-slate-100'}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                  const startX = e.pageX;
                  const startWidth = transpose ? 100 - videoWidth : videoWidth;
                  
                  const handleMouseMove = (moveEvent: MouseEvent) => {
                    const deltaX = moveEvent.pageX - startX;
                    const containerWidth = document.body.clientWidth;
                    let deltaPercent = (deltaX / containerWidth) * 100;
                    if (transpose) deltaPercent = -deltaPercent;
                    const newWidth = Math.min(Math.max(startWidth + deltaPercent, 20), 80);
                    setVideoWidth(transpose ? 100 - newWidth : newWidth);
                  };
                  
                  const handleMouseUp = () => {
                    setIsDragging(false);
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };
                  
                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              >
                <div className={`w-1 h-12 rounded-full transition-colors ${isDragging ? 'bg-rose-500' : 'bg-slate-200 group-hover:bg-rose-400'}`} />
              </div>

              <div className="flex-1 h-full min-w-0">
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
                  openModal={openModal}
                  logProgress={logProgress}
                  seconds={seconds}
                  lastLoggedSeconds={lastLoggedSeconds}
                  watchPercentage={percentage}
                  isDeepWork={isDeepWork}
                  setIsDeepWork={setIsDeepWork}
                />
              </div>
            </motion.div>
          )}

          {layout === "THEATER" && (
            <motion.div
              key="theater"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className={`w-full flex h-full gap-6 ${transpose ? "flex-row-reverse" : "flex-row"}`}
            >
              <div className="transform-gpu w-[25%] h-full flex flex-col gap-6">
                <div className="transform-gpu flex-1">
                  <VideoPanel
                    playerRef={playerRef}
                    unit={unit}
                    isDeepWork={isDeepWork}
                    youtubeId={youtubeId}
                    hasMounted={hasMounted}
                    isPaused={isPaused}
                    setIsPaused={setIsPaused}
                    seconds={seconds}
                    setSeconds={setSeconds}
                    formatTime={formatTime}
                    onProgress={onProgress}
                    watchPercentage={percentage}
                  />
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
                  openModal={openModal}
                  logProgress={logProgress}
                  seconds={seconds}
                  lastLoggedSeconds={lastLoggedSeconds}
                  watchPercentage={percentage}
                  isDeepWork={isDeepWork}
                  setIsDeepWork={setIsDeepWork}
                />
              </div>
            </motion.div>
          )}

          {layout === "FULL_NOTES" && (
            <motion.div key="full_notes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="transform-gpu w-full h-full flex gap-6">
              <div className="transform-gpu w-20 flex flex-col gap-4">
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className={`w-full aspect-square rounded-3xl flex items-center justify-center transition-all ${isPaused ? "bg-rose-600 text-white shadow-lg" : "bg-white text-slate-400 border border-slate-200 shadow-sm hover:text-slate-600 hover:border-slate-300"}`}
                >
                  {isPaused ? <Play size={24} fill="currentColor" /> : <Pause size={24} fill="currentColor" />}
                </button>
                <div className="transform-gpu flex-1 bg-white border border-slate-200 shadow-sm rounded-3xl flex flex-col items-center justify-center gap-1 py-4">
                  <span className="transform-gpu text-[8px] font-bold text-slate-300 uppercase vertical-text tracking-widest mb-4">Timer</span>
                  <span className="transform-gpu text-xl font-bold text-rose-500 font-mono rotate-90">{Math.floor(seconds / 60).toString().padStart(2, "0")}</span>
                  <span className="transform-gpu text-xl font-bold text-slate-800 font-mono rotate-90">{(seconds % 60).toString().padStart(2, "0")}</span>
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
                  openModal={openModal}
                  logProgress={logProgress}
                  seconds={seconds}
                  lastLoggedSeconds={lastLoggedSeconds}
                  watchPercentage={percentage}
                  isDeepWork={isDeepWork}
                  setIsDeepWork={setIsDeepWork}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>,
    root
  );
}
