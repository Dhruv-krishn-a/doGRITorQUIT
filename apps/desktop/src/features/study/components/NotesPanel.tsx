import React from"react";
import { Brain, Save, Timer as TimerIcon, CheckCircle, Loader2, Play, MoreVertical, Zap } from"lucide-react";
import { Unit } from"@gritorquit/study-core";
import { useNavigate, useParams } from"react-router-dom";
import { toast } from"sonner";

interface NotesPanelProps {
 playerRef: React.MutableRefObject<any>;
 currentTab:"NOTES" |"QUESTIONS";
 setCurrentTab: (t:"NOTES" |"QUESTIONS") => void;
 currentTime: number;
 unit: Unit | undefined;
 freeformNotes: string;
 setFreeformNotes: (n: string) => void;
 questions: any[];
 setQuestions: (q: any[]) => void;
 handleSaveNotes: () => void;
 isSaving: boolean;
 openModal: (
  modal:"CREATE" |"DELETE" |"COMMIT" |"SESSION" |"LOGS" |"REFLECTION" | null,
  unit?: Unit | null,
  mode?:"STUDY" |"TIMER" |"COMPLETE" |"LOGS",
  data?: unknown
 ) => void;
 logProgress: (unitId: string, data: { secondsSpent: number; watchPercentage: number }) => Promise<void>;
 seconds: number;
 lastLoggedSeconds: number;
 watchPercentage: number;
 setLastLoggedSeconds: (s: number) => void;
 setIsPaused: (p: boolean) => void;
 isDeepWork?: boolean;
 setIsDeepWork?: (d: boolean) => void;
}

export const NotesPanel = React.memo(({
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
 const navigate = useNavigate();
 const { trackId } = useParams();
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
   navigate(`/study`);
  }
 };

 return (
  <div className={`h-full flex flex-col bg-white border shadow-xl overflow-hidden ${isDeepWork ?"rounded-none border-none" :"rounded-[2.5rem] border-rose-100"}`}>
   <header className="p-8 border-b border-rose-50 flex justify-between items-center shrink-0 relative z-20">
    <div className="flex items-center gap-4">
     <div className="p-3 bg-rose-50 text-rose-500 rounded-2xl">
      <Brain size={20} />
     </div>
     <div>
      <h2 className="text-lg font-bold text-slate-800 tracking-tight">Study Notes</h2>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Auto-saving notes</p>
     </div>
    </div>
    <div className="flex items-center gap-2 relative">
     <button
      onClick={() => setIsMenuOpen(!isMenuOpen)}
      title="Menu"
      className={`p-3 rounded-xl transition-all ${isMenuOpen ? 'bg-rose-600 text-white' : 'bg-slate-50 text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}
     >
      <MoreVertical size={18} />
     </button>
     
     {isMenuOpen && (
      <>
       <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
       <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col">
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
          openModal("SESSION", unit,"LOGS", { 
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
       </div>
      </>
     )}
    </div>
   </header>
   <div className="flex-1 p-8 flex flex-col h-full overflow-hidden">
    <div className="flex gap-2 mb-4">
     {(['NOTES', 'QUESTIONS'] as const).map(tab => (
      <button
       key={tab}
       onClick={() => setCurrentTab(tab)}
       className={`px-4 py-2 rounded-full text-[10px] font-bold tracking-widest transition-all ${currentTab === tab ? 'bg-rose-600 text-white shadow-md shadow-rose-900/50' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
      >
       {tab}
      </button>
     ))}
    </div>
    
    {currentTab === 'NOTES' ? (
     <div className="flex-1 min-h-0">
      <textarea
       className="w-full h-full bg-slate-900 border border-slate-800 focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/20 rounded-3xl p-6 text-sm text-white resize-none transition-all placeholder:text-slate-600"
       placeholder="Write your comprehensive study notes here..."
       value={freeformNotes}
       onChange={(e) => setFreeformNotes(e.target.value)}
      />
     </div>
    ) : (
     <>
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
       {Array.isArray(questions) && questions.map((note, idx) => (
        <div key={note.id || idx} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl group hover:border-amber-900/50 transition-all">
         <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400">
           QUESTION
          </span>
          <button 
           onClick={() => {
            if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
             playerRef.current.seekTo(note.timestampSeconds, true);
            }
           }}
           className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-md hover:bg-amber-500/20 transition-colors"
          >
           <Play size={10} />
           {Math.floor(note.timestampSeconds / 60)}:{(Math.floor(note.timestampSeconds) % 60).toString().padStart(2, '0')}
          </button>
         </div>
         <p className="text-sm text-slate-300 whitespace-pre-wrap">{note.content}</p>
        </div>
       ))}
       {questions.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-50">
          <p className="text-xs font-bold uppercase tracking-widest">No questions yet</p>
        </div>
       )}
      </div>
      <div className="shrink-0 relative mt-auto">
       <textarea
        className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/20 rounded-2xl p-4 text-sm text-white resize-none transition-all placeholder:text-slate-600"
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
       <div className="absolute bottom-4 right-4 text-[10px] font-bold text-slate-600">
        Press Enter ↵
       </div>
      </div>
     </>
    )}
   </div>
  </div>
 );
});
