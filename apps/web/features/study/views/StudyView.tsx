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
} from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useStudy, Unit } from "@planner/study-core";
import { useVideoProgress } from "@planner/study-ui-web";
import { motion, AnimatePresence } from "framer-motion";
import YouTube, { YouTubeProps } from "react-youtube";
import { toast } from "sonner";

interface VideoPanelProps {
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
}

const VideoPanel = ({
  unit,
  youtubeId,
  hasMounted,
  isPaused,
  setIsPaused,
  seconds,
  setSeconds,
  formatTime,
  onProgress,
  watchPercentage
}: VideoPanelProps) => {
  const playerRef = React.useRef<any>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!isPaused && playerRef.current) {
      interval = setInterval(() => {
        const time = playerRef.current.getCurrentTime();
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
    playerRef.current = event.target;
    try {
      const iframe = event.target.getIframe ? event.target.getIframe() : null;
      if (iframe && iframe.style) {
        iframe.style.pointerEvents = "auto";
      }
    } catch {}
  };

  return (
    <div className="flex flex-col bg-slate-950 rounded-[2.5rem] overflow-hidden border border-rose-100/10 shadow-2xl relative h-full">
      <div className="aspect-video w-full bg-black relative z-0">
        {youtubeId && hasMounted ? (
          <div className="absolute inset-0 z-10 pointer-events-auto">
            <YouTube
              videoId={youtubeId}
              className="w-full h-full"
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
          <div className="absolute inset-0 flex items-center justify-center text-white/20">
            <div className="text-center p-8">
              <VideoOff size={48} className="mx-auto mb-6 opacity-20" />
              <p className="font-black uppercase tracking-[0.3em] text-[10px] mb-8">
                Video stream unavailable
              </p>
              {unit?.metadata?.youtubeId && (
                <a
                  href={`https://youtube.com/watch?v=${unit.metadata.youtubeId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-3 bg-rose-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-900/40"
                >
                  <Youtube size={16} /> Open Study Source
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="p-8 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="bg-rose-600 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                Lesson Active
              </span>
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                {unit?.durationMinutes}m duration
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${watchPercentage}%` }}
                  className="h-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                />
              </div>
              <span className="text-[10px] font-black text-rose-500 font-mono w-8 text-right">
                {Math.round(watchPercentage)}%
              </span>
            </div>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white mb-4 line-clamp-2">
            {unit?.title}
          </h1>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center text-rose-400">
              <TimerIcon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                Study Timer
              </p>
              <p className="text-2xl font-black text-white font-mono">{formatTime(seconds)}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsPaused(!isPaused)}
              title={isPaused ? "Resume study session" : "Pause study session"}
              className={`p-4 rounded-2xl transition-all active:scale-95 ${
                isPaused ? "bg-rose-600 text-white shadow-lg shadow-rose-900/40" : "bg-white/10 text-white"
              }`}
            >
              {isPaused ? <Play size={20} fill="currentColor" /> : <Pause size={20} fill="currentColor" />}
            </button>
            <button
              onClick={() => setSeconds(0)}
              title="Reset session timer"
              className="p-4 bg-white/5 text-slate-400 rounded-2xl hover:text-white transition-all active:scale-95"
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
  unit: Unit | undefined;
  notes: string;
  setNotes: (n: string) => void;
  handleSaveNotes: () => void;
  isSaving: boolean;
  openModal: (
    modal: "CREATE" | "DELETE" | "COMMIT" | "SESSION" | "LOGS" | "REFLECTION" | null,
    unit?: Unit | null,
    mode?: "STUDY" | "TIMER" | "COMPLETE" | "LOGS",
    data?: any
  ) => void;
  logProgress: (unitId: string, data: { secondsSpent: number; watchPercentage: number }) => Promise<void>;
  seconds: number;
  lastLoggedSeconds: number;
  setLastLoggedSeconds: (s: number) => void;
  setIsPaused: (p: boolean) => void;
  watchPercentage: number;
}

const NotesPanel = ({
  unit,
  notes,
  setNotes,
  handleSaveNotes,
  isSaving,
  openModal,
  logProgress,
  seconds,
  lastLoggedSeconds,
  setLastLoggedSeconds,
  setIsPaused,
  watchPercentage
}: NotesPanelProps) => {
  const router = useRouter();
  const params = useParams();

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
      router.push(`/dashboard/study/${params.trackId}`);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-[2.5rem] border border-rose-100 shadow-xl overflow-hidden">
      <header className="p-8 border-b border-rose-50 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-500 rounded-2xl">
            <Brain size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Study Notes</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Auto-saving notes</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveNotes}
            disabled={isSaving}
            title="Save your current notes"
            className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-rose-600 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            <span className="hidden sm:inline text-[9px] font-black uppercase tracking-widest">Save Notes</span>
          </button>

          <button
            onClick={handleEndTimer}
            title="Stop timer, save time, and go back to track"
            className="p-4 bg-rose-600 text-white rounded-2xl hover:bg-rose-700 transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-rose-200"
          >
            <TimerIcon size={18} />
            <span className="hidden sm:inline text-[9px] font-black uppercase tracking-widest">End Session</span>
          </button>

          <button
            onClick={() => {
              const sessionSeconds = seconds - lastLoggedSeconds;
              openModal("SESSION", unit, "LOGS", { 
                minutesSpent: Math.max(1, Math.round(sessionSeconds / 60)),
                watchPercentage: Math.round(watchPercentage)
              });
            }}
            title="Finish this lesson completely"
            className="p-4 bg-white text-rose-600 border-2 border-rose-100 rounded-2xl hover:bg-rose-50 transition-all active:scale-95 flex items-center gap-2"
          >
            <CheckCircle size={18} />
            <span className="hidden sm:inline text-[9px] font-black uppercase tracking-widest">Done</span>
          </button>
        </div>
      </header>
      <div className="flex-1 p-8">
        <textarea
          className="w-full h-full bg-slate-50/50 rounded-4xl p-10 font-medium text-slate-700 text-lg focus:outline-none focus:ring-4 focus:ring-rose-50/50 transition-all resize-none border-none placeholder:text-slate-300"
          placeholder="Document your insights here..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
    </div>
  );
};

export function StudyView() {
  const { trackId, unitId } = useParams();
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
  const [lastLoggedSeconds, setLastLoggedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(searchParams.get("autostart") !== "true");

  // Notes State
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (trackId) fetchTrack(trackId as string);
  }, [trackId, fetchTrack]);

  const unit = activeTrack?.track?.units?.find((u) => u.id === unitId);

  // Progress Tracking Hook
  const { percentage, onProgress } = useVideoProgress((unit as any)?.durationSeconds || 0);

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
      await saveNotes(unitId as string, notes);
      toast.success("Notes saved");
    } catch {
      toast.error("Sync failed");
    } finally {
      setIsSaving(false);
    }
  };

  if (!unit)
    return (
      <div className="p-20 text-center text-rose-400 font-black animate-pulse uppercase tracking-widest">
        Opening Study Environment...
      </div>
    );

  const globalHeader = (
    <header className="flex justify-between items-center shrink-0 h-16 px-4 md:px-0">
      <div className="flex items-center gap-6">
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
            router.push(`/dashboard/study/${trackId}`);
          }}
          title="Save session and return to course"
          className="p-4 bg-white border border-rose-100 rounded-2xl text-slate-400 hover:text-rose-600 hover:border-rose-300 transition-all shadow-sm active:scale-95"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="hidden md:block">
          <p className="text-[10px] font-black uppercase tracking-widest text-rose-400 mb-0.5">
            {activeTrack?.track?.title}
          </p>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight truncate max-w-sm">{unit.title}</h2>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {dashboard?.fatigueDetails && (
          <div className="hidden lg:flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-rose-100 shadow-sm">
            <Activity
              size={16}
              className={dashboard.fatigueDetails.score > 5 ? "text-rose-500 animate-pulse" : "text-emerald-500"}
            />
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">System Health</span>
              <span
                className={`text-[10px] font-black uppercase tracking-widest ${
                  dashboard.fatigueDetails.score > 5 ? "text-rose-600" : "text-emerald-600"
                }`}
              >
                {dashboard.fatigueLevel || "OPTIMAL"}
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          {showDiscardConfirm ? (
            <div className="flex items-center gap-3 bg-rose-50 px-4 py-2 rounded-2xl border border-rose-100 animate-in slide-in-from-right-4 duration-300">
              <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Discard session?</span>
              <button 
                onClick={() => router.push(`/dashboard/study/${trackId}`)}
                className="text-[10px] font-black text-rose-600 hover:underline uppercase"
              >
                Yes
              </button>
              <button 
                onClick={() => setShowDiscardConfirm(false)}
                className="text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDiscardConfirm(true)}
              title="Exit without saving session"
              className="px-4 py-2 bg-white text-slate-400 border border-slate-100 rounded-2xl hover:text-rose-600 hover:bg-rose-50 transition-all text-[10px] font-black uppercase tracking-widest"
            >
              Discard
            </button>
          )}

          <button
            onClick={() => setIsDeepWork(true)}
            title="Hide all distractions for deep focus"
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all shadow-lg active:scale-95"
          >
            <Zap size={16} className="text-amber-400" />
            <span className="text-[10px] font-black uppercase tracking-widest">Deep Work</span>
          </button>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-rose-100 shadow-sm">
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
          <div className="w-px h-6 bg-rose-100 mx-1" />
          <button 
            onClick={() => setTranspose(!transpose)} 
            title="Swap side panels"
            className="p-3 text-slate-400 hover:bg-rose-50 rounded-xl transition-all"
          >
            {transpose ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </div>
    </header>
  );

  return (
    <div
      className={`fixed inset-0 z-60 flex flex-col overflow-hidden transition-colors duration-700 ${
        isDeepWork ? "bg-slate-950 p-0" : "bg-[#fff9fa] p-4 md:p-8 lg:p-10 gap-6"
      }`}
    >
      {!isDeepWork ? globalHeader : (
        <motion.button
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          onClick={() => setIsDeepWork(false)}
          className="absolute top-6 right-6 z-50 flex items-center gap-3 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-full text-white transition-all group"
        >
          <Zap size={16} className="text-amber-400 group-hover:text-amber-300" />
          <span className="text-[10px] font-black uppercase tracking-widest">Exit Focus</span>
        </motion.button>
      )}

      <main className={`flex-1 min-h-0 flex gap-6 relative transition-all duration-700 ${isDeepWork ? "scale-100" : ""}`}>
        <AnimatePresence mode="wait">
          {layout === "SPLIT" && (
            <motion.div
              key="split"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className={`w-full flex h-full gap-6 ${transpose ? "flex-row-reverse" : "flex-row"}`}
            >
              <div className="w-[45%] h-full">
                <VideoPanel
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
                />
              </div>
              <div className="flex-1 h-full">
                <NotesPanel
                  unit={unit}
                  notes={notes}
                  setNotes={setNotes}
                  handleSaveNotes={handleSaveNotes}
                  isSaving={isSaving}
                  openModal={openModal}
                  logProgress={logProgress}
                  seconds={seconds}
                  lastLoggedSeconds={lastLoggedSeconds}
                  setLastLoggedSeconds={setLastLoggedSeconds}
                  setIsPaused={setIsPaused}
                  watchPercentage={percentage}
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
              <div className="w-[25%] h-full flex flex-col gap-6">
                <div className="flex-1">
                  <VideoPanel
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
                  />
                </div>
              </div>
              <div className="flex-1 h-full">
                <NotesPanel
                  unit={unit}
                  notes={notes}
                  setNotes={setNotes}
                  handleSaveNotes={handleSaveNotes}
                  isSaving={isSaving}
                  openModal={openModal}
                  logProgress={logProgress}
                  seconds={seconds}
                  lastLoggedSeconds={lastLoggedSeconds}
                  setLastLoggedSeconds={setLastLoggedSeconds}
                  setIsPaused={setIsPaused}
                  watchPercentage={percentage}
                />
              </div>
            </motion.div>
          )}

          {layout === "FULL_NOTES" && (
            <motion.div key="full_notes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="w-full h-full flex gap-6">
              <div className="w-20 flex flex-col gap-4">
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className={`w-full aspect-square rounded-3xl flex items-center justify-center transition-all ${isPaused ? "bg-rose-600 text-white" : "bg-white text-slate-400 border border-rose-100"}`}
                >
                  {isPaused ? <Play size={24} fill="currentColor" /> : <Pause size={24} fill="currentColor" />}
                </button>
                <div className="flex-1 bg-white border border-rose-100 rounded-3xl flex flex-col items-center justify-center gap-1 py-4">
                  <span className="text-[8px] font-black text-slate-300 uppercase vertical-text tracking-widest mb-4">Timer</span>
                  <span className="text-xl font-black text-rose-600 font-mono rotate-90">{Math.floor(seconds / 60).toString().padStart(2, "0")}</span>
                  <span className="text-xl font-black text-rose-400 font-mono rotate-90">{(seconds % 60).toString().padStart(2, "0")}</span>
                </div>
              </div>
              <div className="flex-1 h-full">
                <NotesPanel
                  unit={unit}
                  notes={notes}
                  setNotes={setNotes}
                  handleSaveNotes={handleSaveNotes}
                  isSaving={isSaving}
                  openModal={openModal}
                  logProgress={logProgress}
                  seconds={seconds}
                  lastLoggedSeconds={lastLoggedSeconds}
                  setLastLoggedSeconds={setLastLoggedSeconds}
                  setIsPaused={setIsPaused}
                  watchPercentage={percentage}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
