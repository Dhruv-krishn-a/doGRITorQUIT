import re
import os

def update_web():
    path = 'apps/web/features/study/shared/views/StudyView.tsx'
    with open(path, 'r') as f:
        content = f.read()

    # 1. Update YouTubePlayer
    content = content.replace(
'''interface YouTubePlayer {
  getCurrentTime: () => number;
  getIframe: () => HTMLIFrameElement | null;
}''', 
'''interface YouTubePlayer {
  getCurrentTime: () => number;
  getIframe: () => HTMLIFrameElement | null;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
}''')

    # 2. Update VideoPanelProps & VideoPanel
    content = content.replace('interface VideoPanelProps {', 'interface VideoPanelProps {\n  playerRef: React.MutableRefObject<YouTubePlayer | null>;')
    content = content.replace('const VideoPanel = ({', 'const VideoPanel = ({\n  playerRef,')
    content = content.replace('const playerRef = React.useRef<YouTubePlayer | null>(null);', '')

    # 3. Update NotesPanelProps
    content = re.sub(
        r'interface NotesPanelProps \{.*?\}',
        '''interface NotesPanelProps {
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
}''',
        content,
        flags=re.DOTALL
    )

    # 4. Update NotesPanel signature
    content = re.sub(
        r'const NotesPanel = \(\{.*?watchPercentage\n\}: NotesPanelProps\) => \{',
        '''const NotesPanel = ({
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
        content,
        flags=re.DOTALL
    )

    # 5. Update NotesPanel UI
    ui_replacement = '''<div className="transform-gpu flex-1 p-8 flex flex-col h-full overflow-hidden">
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
      </div>'''

    content = re.sub(
        r'<div className="transform-gpu flex-1 p-8">\s+<textarea.*?</textarea>\s+</div>',
        ui_replacement,
        content,
        flags=re.DOTALL
    )

    # 6. Update StudyView logic
    content = content.replace(
        '''export function StudyView() {
  const { trackId, unitId } = useParams();''',
        '''export function StudyView() {
  const { trackId, unitId } = useParams();
  const playerRef = React.useRef<YouTubePlayer | null>(null);'''
    )

    content = content.replace(
        'const [notes, setNotes] = useState("");',
        '''const [freeformNotes, setFreeformNotes] = useState<string>("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentTab, setCurrentTab] = useState<"NOTES" | "QUESTIONS">("NOTES");'''
    )

    # Add initialization logic just after unit definition
    init_effect = '''  useEffect(() => {
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

    content = content.replace(
        '''  const unit = activeTrack?.track?.units?.find((u) => u.id === unitId);

  // Progress Tracking Hook''',
        f'''  const unit = activeTrack?.track?.units?.find((u) => u.id === unitId);

{init_effect}

  // Progress Tracking Hook'''
    )

    content = content.replace(
        'await saveNotes(unitId as string, notes);',
        'await saveNotes(unitId as string, JSON.stringify({ freeform: freeformNotes, questions }));'
    )

    # Update instances of VideoPanel & NotesPanel
    content = content.replace('<VideoPanel\n                  unit={unit}', '<VideoPanel\n                  playerRef={playerRef}\n                  unit={unit}')
    
    content = content.replace(
'''<NotesPanel
                  unit={unit}
                  notes={notes}
                  setNotes={setNotes}''',
'''<NotesPanel
                  playerRef={playerRef}
                  currentTab={currentTab}
                  setCurrentTab={setCurrentTab}
                  currentTime={seconds}
                  unit={unit}
                  freeformNotes={freeformNotes}
                  setFreeformNotes={setFreeformNotes}
                  questions={questions}
                  setQuestions={setQuestions}'''
    )


    with open(path, 'w') as f:
        f.write(content)

update_web()
