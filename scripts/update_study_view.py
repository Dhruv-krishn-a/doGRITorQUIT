import re
import sys

def main():
    with open('apps/web/features/study/shared/views/StudyView.tsx', 'r') as f:
        content = f.read()

    # 1. Add playerRef and currentVideoTime
    content = content.replace('const [notes, setNotes] = useState("");', 
                              'const [notes, setNotes] = useState<any[]>([]);\n  const [currentCategory, setCurrentCategory] = useState<"CONCEPT" | "QUESTION" | "INSIGHT" | "REVISION">("CONCEPT");\n  const playerRef = React.useRef<YouTubePlayer | null>(null);')

    # 2. Update VideoPanel props and implementation
    # VideoPanel signature:
    # const VideoPanel = ({...}: VideoPanelProps) => { ... const playerRef = React.useRef<YouTubePlayer | null>(null);
    # I need to change it to accept playerRef
    content = content.replace('interface VideoPanelProps {', 'interface VideoPanelProps {\n  playerRef: React.MutableRefObject<YouTubePlayer | null>;')
    content = content.replace('const VideoPanel = ({', 'const VideoPanel = ({\n  playerRef,')
    content = content.replace('const playerRef = React.useRef<YouTubePlayer | null>(null);', '')

    # 3. Update NotesPanel Props
    content = content.replace('interface NotesPanelProps {', 'interface NotesPanelProps {\n  playerRef: React.MutableRefObject<YouTubePlayer | null>;\n  currentCategory: string;\n  setCurrentCategory: (c: any) => void;\n  currentTime: number;')
    content = content.replace('const NotesPanel = ({', 'const NotesPanel = ({\n  playerRef,\n  currentCategory,\n  setCurrentCategory,\n  currentTime,')
    content = content.replace('notes: string;\n  setNotes: (n: string) => void;', 'notes: any[];\n  setNotes: (n: any[]) => void;')

    # 4. Replace NotesPanel textarea with structured notes UI
    notes_ui = """
      <div className="transform-gpu flex-1 p-8 flex flex-col h-full overflow-hidden">
        <div className="transform-gpu flex gap-2 mb-4">
          {['CONCEPT', 'QUESTION', 'INSIGHT', 'REVISION'].map(cat => (
            <button
              key={cat}
              onClick={() => setCurrentCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest transition-all ${currentCategory === cat ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="transform-gpu flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
          {Array.isArray(notes) && notes.map((note, idx) => (
            <div key={note.id || idx} className="transform-gpu bg-slate-50 border border-slate-100 p-4 rounded-2xl group hover:border-rose-200 transition-all">
              <div className="transform-gpu flex justify-between items-start mb-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${note.type === 'QUESTION' ? 'bg-amber-100 text-amber-700' : note.type === 'INSIGHT' ? 'bg-purple-100 text-purple-700' : note.type === 'REVISION' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-700'}`}>
                  {note.type}
                </span>
                <button 
                  onClick={() => {
                    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
                      playerRef.current.seekTo(note.timestampSeconds, true);
                    }
                  }}
                  className="transform-gpu flex items-center gap-1 text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded-md hover:bg-rose-100 transition-colors"
                >
                  <Play size={10} />
                  {Math.floor(note.timestampSeconds / 60)}:{(Math.floor(note.timestampSeconds) % 60).toString().padStart(2, '0')}
                </button>
              </div>
              <p className="transform-gpu text-sm text-slate-700 whitespace-pre-wrap">{note.content}</p>
            </div>
          ))}
        </div>
        <div className="transform-gpu shrink-0 relative mt-auto">
          <textarea
            className="transform-gpu w-full bg-slate-50 border border-slate-200 focus:border-rose-300 focus:ring-2 focus:ring-rose-100 rounded-2xl p-4 text-sm resize-none transition-all"
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
          <div className="transform-gpu absolute bottom-4 right-4 text-[10px] font-bold text-slate-400">
            Press Enter ↵
          </div>
        </div>
      </div>
    """

    content = re.sub(r'<div className="transform-gpu flex-1 p-8">.*?</div>', notes_ui, content, flags=re.DOTALL)

    # 5. Add playerRef and currentTime to instances of NotesPanel and VideoPanel
    content = content.replace('<VideoPanel', '<VideoPanel\n                  playerRef={playerRef}')
    content = content.replace('<NotesPanel', '<NotesPanel\n                  playerRef={playerRef}\n                  currentCategory={currentCategory}\n                  setCurrentCategory={setCurrentCategory}\n                  currentTime={seconds}') # Note: using seconds as approx currentTime if exact not available, or useVideoProgress currentTime

    # Update initialization of notes to read from unit
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
    content = content.replace('const [notes, setNotes] = useState<any[]>([]);', f'const [notes, setNotes] = useState<any[]>([]);\n{init_effect}')

    with open('apps/web/features/study/shared/views/StudyView.tsx', 'w') as f:
        f.write(content)

if __name__ == '__main__':
    main()
