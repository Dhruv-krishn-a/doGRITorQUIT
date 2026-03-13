import re
import os

def update_desktop():
    # 1. Update NotesPanel.tsx
    np_path = 'apps/desktop/src/features/study/components/NotesPanel.tsx'
    with open(np_path, 'r') as f:
        np = f.read()

    np = re.sub(
        r'interface NotesPanelProps \{.*?\}',
        '''interface NotesPanelProps {
  playerRef: React.MutableRefObject<any>;
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
}''',
        np,
        flags=re.DOTALL
    )

    np = re.sub(
        r'export const NotesPanel = \(\{.*?watchPercentage\n\}: NotesPanelProps\) => \{',
        '''export const NotesPanel = ({
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
  watchPercentage
}: NotesPanelProps) => {''',
        np,
        flags=re.DOTALL
    )

    ui_replacement = '''<div className="transform-gpu flex-1 p-8 flex flex-col h-full overflow-hidden">
        <div className="transform-gpu flex gap-2 mb-4">
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
          <div className="transform-gpu flex-1 min-h-0">
            <textarea
              className="transform-gpu w-full h-full bg-slate-900 border border-slate-800 focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/20 rounded-3xl p-6 text-sm text-white resize-none transition-all placeholder:text-slate-600"
              placeholder="Write your comprehensive study notes here..."
              value={freeformNotes}
              onChange={(e) => setFreeformNotes(e.target.value)}
            />
          </div>
        ) : (
          <>
            <div className="transform-gpu flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
              {Array.isArray(questions) && questions.map((note, idx) => (
                <div key={note.id || idx} className="transform-gpu bg-slate-900 border border-slate-800 p-4 rounded-2xl group hover:border-amber-900/50 transition-all">
                  <div className="transform-gpu flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400">
                      QUESTION
                    </span>
                    <button 
                      onClick={() => {
                        if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
                          playerRef.current.seekTo(note.timestampSeconds, true);
                        }
                      }}
                      className="transform-gpu flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-md hover:bg-amber-500/20 transition-colors"
                    >
                      <Play size={10} />
                      {Math.floor(note.timestampSeconds / 60)}:{(Math.floor(note.timestampSeconds) % 60).toString().padStart(2, '0')}
                    </button>
                  </div>
                  <p className="transform-gpu text-sm text-slate-300 whitespace-pre-wrap">{note.content}</p>
                </div>
              ))}
              {questions.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-50">
                   <p className="text-xs font-bold uppercase tracking-widest">No questions yet</p>
                </div>
              )}
            </div>
            <div className="transform-gpu shrink-0 relative mt-auto">
              <textarea
                className="transform-gpu w-full bg-slate-900 border border-slate-800 focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/20 rounded-2xl p-4 text-sm text-white resize-none transition-all placeholder:text-slate-600"
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
              <div className="transform-gpu absolute bottom-4 right-4 text-[10px] font-bold text-slate-600">
                Press Enter ↵
              </div>
            </div>
          </>
        )}
      </div>'''

    np = re.sub(
        r'<div className="transform-gpu flex-1 p-8 flex flex-col h-full overflow-hidden">.*?</div>\s+</div>\s+\);\s+\};',
        ui_replacement + '\n    </div>\n  );\n};',
        np,
        flags=re.DOTALL
    )
    with open(np_path, 'w') as f:
        f.write(np)


    # 2. Update StudyView.tsx
    sv_path = 'apps/desktop/src/features/study/views/StudyView.tsx'
    with open(sv_path, 'r') as f:
        sv = f.read()

    sv = sv.replace(
        'const [notes, setNotes] = useState<any[]>([]);\n  const [currentCategory, setCurrentCategory] = useState<"CONCEPT" | "QUESTION" | "INSIGHT" | "REVISION">("CONCEPT");',
        '''const [freeformNotes, setFreeformNotes] = useState<string>("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentTab, setCurrentTab] = useState<"NOTES" | "QUESTIONS">("NOTES");'''
    )

    effect_replacement = '''useEffect(() => {
    if (unit?.notes) {
      try {
        const parsed = typeof unit.notes === 'string' ? JSON.parse(unit.notes) : unit.notes;
        if (Array.isArray(parsed)) {
          const qs = parsed.filter(n => n.type === 'QUESTION');
          const others = parsed.filter(n => n.type !== 'QUESTION').map(n => n.content).join('\\n\\n');
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
  }, [unit?.notes]);'''

    sv = re.sub(
        r'useEffect\(\(\) => \{\s+if \(unit\?\.notes\) \{.*?^\s+\}, \[unit\?\.notes\]\);',
        effect_replacement,
        sv,
        flags=re.MULTILINE | re.DOTALL
    )

    sv = sv.replace(
        'await saveNotes(unitId as string, notes);',
        'await saveNotes(unitId as string, { freeform: freeformNotes, questions });'
    )

    sv = sv.replace('notes={notes}', 'freeformNotes={freeformNotes}\n                  setFreeformNotes={setFreeformNotes}\n                  questions={questions}\n                  setQuestions={setQuestions}')
    sv = sv.replace('setNotes={setNotes}\n', '')
    sv = sv.replace('currentCategory={currentCategory}', 'currentTab={currentTab}')
    sv = sv.replace('setCurrentCategory={setCurrentCategory}', 'setCurrentTab={setCurrentTab}')


    with open(sv_path, 'w') as f:
        f.write(sv)

update_desktop()
