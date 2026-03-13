import os
import re

# Update VideoPanel
vp_path = 'apps/desktop/src/features/study/components/VideoPanel.tsx'
with open(vp_path, 'r') as f:
    vp = f.read()

vp = vp.replace('export const VideoPanel = ({', 'export const VideoPanel = ({\n  playerRef,')
vp = vp.replace('interface VideoPanelProps {', 'interface VideoPanelProps {\n  playerRef: React.MutableRefObject<any>;')
vp = re.sub(r'const playerRef = React\.useRef<any>\(null\);\n', '', vp)
with open(vp_path, 'w') as f:
    f.write(vp)

# Update NotesPanel
np_path = 'apps/desktop/src/features/study/components/NotesPanel.tsx'
with open(np_path, 'r') as f:
    np = f.read()

# Replace NotesPanel props and body
np = np.replace('interface NotesPanelProps {', 'interface NotesPanelProps {\n  playerRef: React.MutableRefObject<any>;\n  currentCategory: string;\n  setCurrentCategory: (c: string) => void;\n  currentTime: number;')
np = np.replace('export const NotesPanel = ({', 'export const NotesPanel = ({\n  playerRef,\n  currentCategory,\n  setCurrentCategory,\n  currentTime,')
np = np.replace('notes: string;', 'notes: any[];')
np = np.replace('setNotes: (n: string) => void;', 'setNotes: (n: any[]) => void;')

notes_ui = """
      <div className="transform-gpu flex-1 p-8 flex flex-col h-full overflow-hidden">
        <div className="transform-gpu flex gap-2 mb-4">
          {['CONCEPT', 'QUESTION', 'INSIGHT', 'REVISION'].map(cat => (
            <button
              key={cat}
              onClick={() => setCurrentCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest transition-all ${currentCategory === cat ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="transform-gpu flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
          {Array.isArray(notes) && notes.map((note, idx) => (
            <div key={note.id || idx} className="transform-gpu bg-slate-900 border border-slate-800 p-4 rounded-2xl group hover:border-rose-900/50 transition-all">
              <div className="transform-gpu flex justify-between items-start mb-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${note.type === 'QUESTION' ? 'bg-amber-500/20 text-amber-400' : note.type === 'INSIGHT' ? 'bg-purple-500/20 text-purple-400' : note.type === 'REVISION' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-300'}`}>
                  {note.type}
                </span>
                <button 
                  onClick={() => {
                    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
                      playerRef.current.seekTo(note.timestampSeconds, true);
                    }
                  }}
                  className="transform-gpu flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-1 rounded-md hover:bg-rose-500/20 transition-colors"
                >
                  <Play size={10} />
                  {Math.floor(note.timestampSeconds / 60)}:{(Math.floor(note.timestampSeconds) % 60).toString().padStart(2, '0')}
                </button>
              </div>
              <p className="transform-gpu text-sm text-slate-300 whitespace-pre-wrap">{note.content}</p>
            </div>
          ))}
        </div>
        <div className="transform-gpu shrink-0 relative mt-auto">
          <textarea
            className="transform-gpu w-full bg-slate-900 border border-slate-800 focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/20 rounded-2xl p-4 text-sm text-white resize-none transition-all placeholder:text-slate-600"
            rows={3}
            placeholder={`Add a ${currentCategory.toLowerCase()}... (Press Enter to save, Shift+Enter for new line)`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const val = e.currentTarget.value.trim();
                if (val) {
                  const newNote = {
                    id: Date.now().toString(),
                    type: currentCategory,
                    content: val,
                    timestampSeconds: currentTime || 0,
                    createdAt: new Date().toISOString()
                  };
                  setNotes([...(Array.isArray(notes) ? notes : []), newNote]);
                  e.currentTarget.value = '';
                }
              }
            }}
          />
          <div className="transform-gpu absolute bottom-4 right-4 text-[10px] font-bold text-slate-600">
            Press Enter ↵
          </div>
        </div>
      </div>
"""

np = re.sub(r'<div className="transform-gpu flex-1 p-8">.*?</div>', notes_ui, np, flags=re.DOTALL)
np = np.replace('import { Unit } from "@planner/study-core";', 'import { Unit } from "@planner/study-core";\nimport { Play } from "lucide-react";')
with open(np_path, 'w') as f:
    f.write(np)


# Update StudyView
sv_path = 'apps/desktop/src/features/study/views/StudyView.tsx'
with open(sv_path, 'r') as f:
    sv = f.read()

sv = sv.replace('const [notes, setNotes] = useState("");', 'const [notes, setNotes] = useState<any[]>([]);\n  const [currentCategory, setCurrentCategory] = useState<"CONCEPT" | "QUESTION" | "INSIGHT" | "REVISION">("CONCEPT");\n  const playerRef = React.useRef<any>(null);')

# Add useEffect for initializing notes
init_effect = """
  useEffect(() => {
    if (unit?.notes) {
      try {
        const parsed = typeof unit.notes === 'string' ? JSON.parse(unit.notes) : unit.notes;
        if (Array.isArray(parsed)) {
          setNotes(parsed);
        }
      } catch (e) {}
    }
  }, [unit?.notes]);
"""
sv = sv.replace('const [isSaving, setIsSaving] = useState(false);', f'const [isSaving, setIsSaving] = useState(false);\n{init_effect}')

sv = sv.replace('<VideoPanel', '<VideoPanel\n                  playerRef={playerRef}')
sv = sv.replace('<NotesPanel', '<NotesPanel\n                  playerRef={playerRef}\n                  currentCategory={currentCategory}\n                  setCurrentCategory={setCurrentCategory}\n                  currentTime={seconds}')

with open(sv_path, 'w') as f:
    f.write(sv)
