import React from "react";
import { Brain, Save, Timer as TimerIcon, CheckCircle, Loader2 } from "lucide-react";
import { Unit } from "@planner/study-core";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

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

export const NotesPanel = ({
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
  const navigate = useNavigate();
  const { trackId } = useParams();

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
      navigate(`/study/${trackId}`);
    }
  };

  return (
    <div className="transform-gpu h-full flex flex-col bg-white rounded-[2.5rem] border border-rose-100 shadow-xl overflow-hidden">
      <header className="transform-gpu p-8 border-b border-rose-50 flex justify-between items-center shrink-0">
        <div className="transform-gpu flex items-center gap-4">
          <div className="transform-gpu p-3 bg-rose-50 text-rose-500 rounded-2xl">
            <Brain size={20} />
          </div>
          <div>
            <h2 className="transform-gpu text-lg font-bold text-slate-800 tracking-tight">Study Notes</h2>
            <p className="transform-gpu text-[10px] font-bold text-slate-400 uppercase tracking-widest">Auto-saving notes</p>
          </div>
        </div>
        <div className="transform-gpu flex items-center gap-2">
          <button
            onClick={handleSaveNotes}
            disabled={isSaving}
            title="Save your current notes"
            className="transform-gpu p-4 bg-slate-900 text-white rounded-2xl hover:bg-rose-600 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="transform-gpu animate-spin" size={18} /> : <Save size={18} />}
            <span className="transform-gpu hidden sm:inline text-[9px] font-bold uppercase tracking-widest">Save Notes</span>
          </button>

          <button
            onClick={handleEndTimer}
            title="Stop timer, save time, and go back to track"
            className="transform-gpu p-4 bg-rose-600 text-white rounded-2xl hover:bg-rose-700 transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-rose-200"
          >
            <TimerIcon size={18} />
            <span className="transform-gpu hidden sm:inline text-[9px] font-bold uppercase tracking-widest">End Session</span>
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
            className="transform-gpu p-4 bg-white text-rose-600 border-2 border-rose-100 rounded-2xl hover:bg-rose-50 transition-all active:scale-95 flex items-center gap-2"
          >
            <CheckCircle size={18} />
            <span className="transform-gpu hidden sm:inline text-[9px] font-bold uppercase tracking-widest">Done</span>
          </button>
        </div>
      </header>
      <div className="transform-gpu flex-1 p-8">
        <textarea
          className="transform-gpu w-full h-full bg-slate-50/50 rounded-4xl p-10 font-medium text-slate-700 text-lg focus:outline-none focus:ring-4 focus:ring-rose-50/50 transition-all resize-none border-none placeholder:text-slate-300"
          placeholder="Document your insights here..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
    </div>
  );
};
