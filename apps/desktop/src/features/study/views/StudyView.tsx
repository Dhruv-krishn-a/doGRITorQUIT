import React, { useState, useEffect } from"react";
import {
 ArrowLeft, Maximize2, Layout, ChevronRight, ChevronLeft,
 Zap, Activity, Brain, Play, Pause
} from"lucide-react";
import { useParams, useNavigate, useSearchParams } from"react-router-dom";
import { useStudy } from"@gritorquit/study-core";
import { useVideoProgress } from"@gritorquit/study-ui-web";
import { motion, AnimatePresence } from"framer-motion";
import { toast } from"sonner";
import { VideoPanel } from"../components/VideoPanel";
import { NotesPanel } from"../components/NotesPanel";

function safeParse(str: any, fallback: any = null) {
 if (!str) return fallback;
 if (typeof str !== 'string') return str;
 try {
  return JSON.parse(str);
 } catch (e) {
  return fallback;
 }
}

export function StudyView() {
 const { trackId, unitId } = useParams();
 const playerRef = React.useRef<any>(null);
 const navigate = useNavigate();
 const [searchParams] = useSearchParams();
 const { activeTrack, fetchTrack, openModal, saveNotes, logProgress, dashboard, moveUnit } = useStudy();

 const [hasMounted, setHasMounted] = useState(false);
 const [layout, setLayout] = useState<"SPLIT" |"FULL_NOTES" |"THEATER">(
  (searchParams.get("layout") as"SPLIT" |"FULL_NOTES" |"THEATER") ||"SPLIT"
 );
 const [transpose, setTranspose] = useState(false);
 const [isDeepWork, setIsDeepWork] = useState(false);
 const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

 // Timer State
 const [seconds, setSeconds] = useState(0);
 const [lastLoggedSeconds, setLastLoggedSeconds] = useState(0);
 const [isPaused, setIsPaused] = useState(searchParams.get("autostart") !=="true");

 // Notes State
 const [freeformNotes, setFreeformNotes] = useState<string>("");
 const [questions, setQuestions] = useState<any[]>([]);
 const [currentTab, setCurrentTab] = useState<"NOTES" |"QUESTIONS">("NOTES");
 const [isSaving, setIsSaving] = useState(false);
 const [videoWidth, setVideoWidth] = useState(50);
 const [isDragging, setIsDragging] = useState(false);

 // Memoized Handlers
 const handleSetIsPaused = React.useCallback((p: boolean) => setIsPaused(p), []);
 const handleSetSeconds = React.useCallback((s: number) => setSeconds(s), []);
 const handleSetCurrentTab = React.useCallback((t: "NOTES" | "QUESTIONS") => setCurrentTab(t), []);
 const handleSetFreeformNotes = React.useCallback((n: string) => setFreeformNotes(n), []);
 const handleSetQuestions = React.useCallback((q: any[]) => setQuestions(q), []);
 const handleSetIsDeepWork = React.useCallback((d: boolean) => setIsDeepWork(d), []);

 // Auto-save debounced
 useEffect(() => {
  if (!unitId || !hasMounted) return;
  const timer = setTimeout(() => {
   saveNotes(unitId as string, JSON.stringify({ freeform: freeformNotes, questions })).catch(() => {});
  }, 2000);
  return () => clearTimeout(timer);
 }, [freeformNotes, questions, unitId, saveNotes, hasMounted]);

 const unit = activeTrack?.track?.units?.find((u) => u.id === unitId);

 useEffect(() => {
  if (unit?.notes) {
   const parsed = safeParse(unit.notes);
   if (Array.isArray(parsed)) {
    const qs = parsed.filter((n: any) => n.type === 'QUESTION');
    const others = parsed.filter((n: any) => n.type !== 'QUESTION').map((n: any) => n.content).join('\n\n');
    setQuestions(qs);
    setFreeformNotes(others);
   } else if (parsed && typeof parsed === 'object') {
    setFreeformNotes(parsed.freeform ||"");
    setQuestions(parsed.questions || []);
   } else if (typeof unit.notes === 'string') {
    setFreeformNotes(unit.notes);
   }
  }
 }, [unit?.notes]);

 useEffect(() => {
  setHasMounted(true);
 }, []);

 useEffect(() => {
  if (trackId) fetchTrack(trackId as string);
 }, [trackId, fetchTrack]);

 // Progress Tracking Hook - MUST ALWAYS BE CALLED
 const { percentage, onProgress } = useVideoProgress((unit as any)?.durationSeconds || 0);

 const handleOnProgress = React.useCallback((time: number) => onProgress(time), [onProgress]);

 const backPath = React.useMemo(() => {
  if (!activeTrack?.track) return `/study`;
  const type = activeTrack.track.type?.toUpperCase();
  if (type === 'PLAYLIST' || type === 'YOUTUBE') return `/study/youtube/${trackId}`;
  if (type === 'COURSE') return `/study/course/${trackId}`;
  if (type === 'PROJECT') return `/study/project/${trackId}`;
  return `/study`;
 }, [activeTrack?.track, trackId]);

 useEffect(() => {
  if (unit && ['BACKLOG', 'THIS_WEEK', 'TODAY'].includes(unit.status)) {
   moveUnit(unit.id, 'IN_PROGRESS', unit.orderIndex);
  }
 }, [unit, moveUnit]);

 const youtubeId = React.useMemo(() => {
  if (!unit) return null;
  const meta = safeParse(unit.metadata, {});
  return meta?.youtubeId || null;
 }, [unit]);

 useEffect(() => {
  let interval: NodeJS.Timeout;
  if (!isPaused) {
   interval = setInterval(() => setSeconds((s) => s + 1), 1000);
  }
  return () => clearInterval(interval!);
 }, [isPaused]);

 const formatTime = React.useCallback((totalSeconds: number) => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h > 0 ? h +":" :""}${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`;
 }, []);

 const handleSaveNotesAction = async () => {
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
 
 const handleOpenModal = React.useCallback((...args: any[]) => (openModal as any)(...args), [openModal]);
 const handleLogProgress = React.useCallback((...args: any[]) => (logProgress as any)(...args), [logProgress]);
 const handleSetLastLoggedSeconds = React.useCallback((s: number) => setLastLoggedSeconds(s), []);

 if (!unit) {
  return (
   <div className="fixed inset-0 z-[2000] bg-[var(--bg-primary)] flex items-center justify-center">
    <div className="p-20 text-center text-[var(--accent-color)] font-black animate-pulse uppercase tracking-[0.3em] italic">
     Opening Study Environment...
    </div>
   </div>
  );
 }

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
      navigate(backPath);
     }}
     title="Save session and return to course"
     className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl text-[var(--text-secondary)] hover:text-[var(--accent-color)] hover:border-[var(--accent-color)]/30 transition-all shadow-sm active:scale-95"
    >
     <ArrowLeft size={20} />
    </button>
    <div className="hidden md:block text-left">
     <p className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-color)] mb-0.5 italic">
      {activeTrack?.track?.title}
     </p>
     <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight truncate max-w-sm uppercase italic leading-none">{unit.title}</h2>
    </div>
   </div>

   <div className="flex items-center gap-6">
    {dashboard?.fatigueDetails && (
     <div className="hidden lg:flex items-center gap-3 bg-[var(--bg-secondary)] px-4 py-2 rounded-2xl border border-[var(--border-color)] shadow-sm">
      <Activity
       size={16}
       className={dashboard.fatigueDetails.score > 5 ?"text-rose-500 animate-pulse" :"text-emerald-500"}
      />
      <div className="flex flex-col text-left">
       <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest">System Health</span>
       <span
        className={`text-[10px] font-black uppercase tracking-widest italic ${
         dashboard.fatigueDetails.score > 5 ?"text-rose-500" :"text-emerald-500"
        }`}
       >
        {dashboard.fatigueLevel ||"OPTIMAL"}
       </span>
      </div>
     </div>
    )}

    <div className="flex items-center gap-2">
     {showDiscardConfirm ? (
      <div className="flex items-center gap-3 bg-rose-500/10 px-4 py-2 rounded-2xl border border-rose-500/20 animate-in slide-in-from-right-4 duration-300">
       <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest italic">Discard session?</span>
       <button 
        onClick={() => navigate(backPath)}
        className="text-[10px] font-black text-rose-500 hover:underline uppercase italic"
       >
        Yes
       </button>
       <button 
        onClick={() => setShowDiscardConfirm(false)}
        className="text-[10px] font-black text-[var(--text-secondary)] hover:text-[var(--text-primary)] uppercase italic"
       >
        No
       </button>
      </div>
     ) : (
      <button
       onClick={() => setShowDiscardConfirm(true)}
       title="Exit without saving session"
       className="px-4 py-2 bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)] rounded-2xl hover:text-rose-500 hover:bg-rose-500/5 transition-all text-[10px] font-black uppercase tracking-widest italic"
      >
       Discard
      </button>
     )}

     <button
      onClick={() => setIsDeepWork(true)}
      title="Hide all distractions for deep focus"
      className="flex items-center gap-2 px-4 py-2 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-2xl hover:bg-[var(--accent-color)] transition-all shadow-lg active:scale-95"
     >
      <Zap size={16} className="text-amber-500" />
      <span className="text-[10px] font-black uppercase tracking-widest italic">Deep Work</span>
     </button>
    </div>

    <div className="flex items-center gap-3 bg-[var(--bg-secondary)] p-2 rounded-2xl border border-[var(--border-color)] shadow-sm">
     <button
      onClick={() => setLayout("SPLIT")}
      title="Video and notes side-by-side"
      className={`p-3 rounded-xl transition-all ${layout ==="SPLIT" ?"bg-[var(--accent-color)] text-[var(--bg-primary)] shadow-lg shadow-[var(--accent-color)]/20" :"text-[var(--text-secondary)] hover:bg-[var(--bg-card)]"}`}
     >
      <Layout size={18} />
     </button>
     <button
      onClick={() => setLayout("THEATER")}
      title="Large video layout"
      className={`p-3 rounded-xl transition-all ${layout ==="THEATER" ?"bg-[var(--accent-color)] text-[var(--bg-primary)] shadow-lg shadow-[var(--accent-color)]/20" :"text-[var(--text-secondary)] hover:bg-[var(--bg-card)]"}`}
     >
      <Maximize2 size={18} />
     </button>
     <button
      onClick={() => setLayout("FULL_NOTES")}
      title="Writing focused layout"
      className={`p-3 rounded-xl transition-all ${layout ==="FULL_NOTES" ?"bg-[var(--accent-color)] text-[var(--bg-primary)] shadow-lg shadow-[var(--accent-color)]/20" :"text-[var(--text-secondary)] hover:bg-[var(--bg-card)]"}`}
     >
      <Brain size={18} />
     </button>
     <div className="w-px h-6 bg-[var(--border-color)] mx-1" />
     <button 
      onClick={() => setTranspose(!transpose)} 
      title="Swap side panels"
      className="p-3 text-[var(--text-secondary)] hover:bg-[var(--bg-card)] rounded-xl transition-all"
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
    isDeepWork ?"bg-black p-0" :"bg-[var(--bg-primary)] p-4 md:p-8 lg:p-10 gap-6"
   }`}
  >
   {!isDeepWork && globalHeader}

   <main className={`flex-1 min-h-0 flex gap-6 relative transition-all duration-700 ${isDeepWork ?"scale-100" :""}`}>
    <AnimatePresence mode="wait">
     {layout ==="SPLIT" && (
      <motion.div
       key="split"
       initial={{ opacity: 0, scale: 0.98 }}
       animate={{ opacity: 1, scale: 1 }}
       exit={{ opacity: 0, scale: 0.98 }}
       className={`w-full flex h-full gap-0 relative ${transpose ?"flex-row-reverse" :"flex-row"}`}
      >
       {isDragging && (
        <div 
         className="fixed inset-0 z-50 cursor-col-resize select-none"
         onMouseMove={(e) => {
          const containerWidth = document.body.clientWidth;
          const deltaPercent = (e.clientX / containerWidth) * 100;
          const newWidth = transpose 
           ? Math.min(Math.max(100 - deltaPercent, 20), 80)
           : Math.min(Math.max(deltaPercent, 20), 80);
          setVideoWidth(newWidth);
         }}
         onMouseUp={() => setIsDragging(false)}
        />
       )}

       <div className="h-full shrink-0" style={{ width: `${videoWidth}%` }}>
        <VideoPanel
         playerRef={playerRef}
         unit={unit}
         isDeepWork={isDeepWork}
         youtubeId={youtubeId}
         hasMounted={hasMounted}
         isPaused={isPaused}
         setIsPaused={handleSetIsPaused}
         seconds={seconds}
         setSeconds={handleSetSeconds}
         formatTime={formatTime}
         onProgress={handleOnProgress}
         watchPercentage={percentage}
        />
       </div>

       <div 
        className={`w-2 h-full cursor-col-resize group flex items-center justify-center z-10 relative transition-colors ${isDragging ? 'bg-[var(--accent-color)]/20' : 'hover:bg-[var(--accent-color)]/5'}`}
        onMouseDown={(e) => {
         e.preventDefault();
         setIsDragging(true);
        }}
       >
        <div className={`w-1 h-16 rounded-full transition-colors ${isDragging ? 'bg-[var(--accent-color)] shadow-[0_0_10px_var(--accent-color)]' : 'bg-[var(--border-color)] group-hover:bg-[var(--accent-color)]/50'}`} />
       </div>

       <div className="flex-1 h-full min-w-0 text-left">
        <NotesPanel
         playerRef={playerRef}
         currentTab={currentTab}
         setCurrentTab={handleSetCurrentTab}
         currentTime={seconds}
         unit={unit}
         freeformNotes={freeformNotes}
         setFreeformNotes={handleSetFreeformNotes}
         questions={questions}
         setQuestions={handleSetQuestions}
         handleSaveNotes={handleSaveNotesAction}
         isSaving={isSaving}
         openModal={handleOpenModal}
         logProgress={handleLogProgress}
         seconds={seconds}
         lastLoggedSeconds={lastLoggedSeconds}
         setLastLoggedSeconds={handleSetLastLoggedSeconds}
         setIsPaused={handleSetIsPaused}
         watchPercentage={percentage}
         isDeepWork={isDeepWork}
         setIsDeepWork={handleSetIsDeepWork}
        />
       </div>
      </motion.div>
     )}

     {layout ==="THEATER" && (
      <motion.div
       key="theater"
       initial={{ opacity: 0, scale: 0.98 }}
       animate={{ opacity: 1, scale: 1 }}
       exit={{ opacity: 0, scale: 0.98 }}
       className={`w-full flex h-full gap-6 ${transpose ?"flex-row-reverse" :"flex-row"}`}
      >
       <div className="w-[25%] h-full flex flex-col gap-6">
        <div className="flex-1">
         <VideoPanel
          playerRef={playerRef}
          unit={unit}
          isDeepWork={isDeepWork}
          youtubeId={youtubeId}
          hasMounted={hasMounted}
          isPaused={isPaused}
          setIsPaused={handleSetIsPaused}
          seconds={seconds}
          setSeconds={handleSetSeconds}
          formatTime={formatTime}
          onProgress={handleOnProgress}
          watchPercentage={percentage}
         />
        </div>
       </div>
       <div className="flex-1 h-full text-left">
        <NotesPanel
         playerRef={playerRef}
         currentTab={currentTab}
         setCurrentTab={handleSetCurrentTab}
         currentTime={seconds}
         unit={unit}
         freeformNotes={freeformNotes}
         setFreeformNotes={handleSetFreeformNotes}
         questions={questions}
         setQuestions={handleSetQuestions}
                  handleSaveNotes={handleSaveNotesAction}
         isSaving={isSaving}
         openModal={handleOpenModal}
         logProgress={handleLogProgress}
         seconds={seconds}
         lastLoggedSeconds={lastLoggedSeconds}
         setLastLoggedSeconds={handleSetLastLoggedSeconds}
         setIsPaused={handleSetIsPaused}
         watchPercentage={percentage}
         isDeepWork={isDeepWork}
         setIsDeepWork={handleSetIsDeepWork}
        />
       </div>
      </motion.div>
     )}

     {layout ==="FULL_NOTES" && (
      <motion.div key="full_notes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="w-full h-full flex gap-6">
       <div className="w-20 flex flex-col gap-4">
        <button
         onClick={() => setIsPaused(!isPaused)}
         className={`w-full aspect-square rounded-3xl flex items-center justify-center transition-all ${isPaused ?"bg-[var(--accent-color)] text-[var(--bg-primary)] shadow-lg" :"bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)] shadow-sm"}`}
        >
         {isPaused ? <Play size={24} fill="currentColor" /> : <Pause size={24} fill="currentColor" />}
        </button>
        <div className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl flex flex-col items-center justify-center gap-1 py-4 shadow-inner">
         <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase vertical-text tracking-[0.3em] mb-4 italic">Neural Clock</span>
         <span className="text-xl font-black text-[var(--accent-color)] font-mono rotate-90 italic tracking-tighter">{Math.floor(seconds / 60).toString().padStart(2,"0")}</span>
         <span className="text-xl font-black text-[var(--text-secondary)] font-mono rotate-90 italic tracking-tighter">{(seconds % 60).toString().padStart(2,"0")}</span>
        </div>
       </div>
       <div className="flex-1 h-full text-left">
        <NotesPanel
         playerRef={playerRef}
         currentTab={currentTab}
         setCurrentTab={handleSetCurrentTab}
         currentTime={seconds}
         unit={unit}
         freeformNotes={freeformNotes}
         setFreeformNotes={handleSetFreeformNotes}
         questions={questions}
         setQuestions={handleSetQuestions}
                  handleSaveNotes={handleSaveNotesAction}
         isSaving={isSaving}
         openModal={handleOpenModal}
         logProgress={handleLogProgress}
         seconds={seconds}
         lastLoggedSeconds={lastLoggedSeconds}
         setLastLoggedSeconds={handleSetLastLoggedSeconds}
         setIsPaused={handleSetIsPaused}
         watchPercentage={percentage}
         isDeepWork={isDeepWork}
         setIsDeepWork={handleSetIsDeepWork}
        />
       </div>
      </motion.div>
     )}
    </AnimatePresence>
   </main>
  </div>
 );
}
