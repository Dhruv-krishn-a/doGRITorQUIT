import React, { useState, useEffect } from "react";
import {
  ArrowLeft, Maximize2, Layout, ChevronRight, ChevronLeft,
  Zap, Activity, Brain, Play, Pause
} from "lucide-react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useStudy } from "@planner/study-core";
import { useVideoProgress } from "@planner/study-ui-web";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { VideoPanel } from "../components/VideoPanel";
import { NotesPanel } from "../components/NotesPanel";

export function StudyView() {
  const { trackId, unitId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
            navigate(`/study/${trackId}`);
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
                onClick={() => navigate(`/study/${trackId}`)}
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

  return (
    <div
      className={`fixed inset-0 z-[2000] flex flex-col overflow-hidden transition-colors duration-700 ${
        isDeepWork ? "bg-slate-950 p-0" : "bg-[#fff9fa] p-4 md:p-8 lg:p-10 gap-6"
      }`}
    >
      {!isDeepWork ? globalHeader : (
        <motion.button
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          onClick={() => setIsDeepWork(false)}
          className="transform-gpu absolute top-6 right-6 z-50 flex items-center gap-3 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-full text-white transition-all group"
        >
          <Zap size={16} className="transform-gpu text-amber-400 group-hover:text-amber-300" />
          <span className="transform-gpu text-[10px] font-bold uppercase tracking-widest">Exit Focus</span>
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
              <div className="transform-gpu w-[45%] h-full">
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
              <div className="transform-gpu flex-1 h-full">
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
              <div className="transform-gpu w-[25%] h-full flex flex-col gap-6">
                <div className="transform-gpu flex-1">
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
              <div className="transform-gpu flex-1 h-full">
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
            <motion.div key="full_notes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="transform-gpu w-full h-full flex gap-6">
              <div className="transform-gpu w-20 flex flex-col gap-4">
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className={`w-full aspect-square rounded-3xl flex items-center justify-center transition-all ${isPaused ? "bg-rose-600 text-white" : "bg-white text-slate-400 border border-rose-100"}`}
                >
                  {isPaused ? <Play size={24} fill="currentColor" /> : <Pause size={24} fill="currentColor" />}
                </button>
                <div className="transform-gpu flex-1 bg-white border border-rose-100 rounded-3xl flex flex-col items-center justify-center gap-1 py-4">
                  <span className="transform-gpu text-[8px] font-bold text-slate-300 uppercase vertical-text tracking-widest mb-4">Timer</span>
                  <span className="transform-gpu text-xl font-bold text-rose-600 font-mono rotate-90">{Math.floor(seconds / 60).toString().padStart(2, "0")}</span>
                  <span className="transform-gpu text-xl font-bold text-rose-400 font-mono rotate-90">{(seconds % 60).toString().padStart(2, "0")}</span>
                </div>
              </div>
              <div className="transform-gpu flex-1 h-full">
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
