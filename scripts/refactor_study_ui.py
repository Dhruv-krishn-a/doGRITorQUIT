import re

def update_file(path, is_desktop=False):
    with open(path, 'r') as f:
        content = f.read()
    
    # 1. Add Settings/MoreVertical icon import
    if "MoreVertical" not in content:
        content = content.replace('Target,\n} from "lucide-react";', 'Target,\n  MoreVertical,\n} from "lucide-react";')
        if is_desktop and "MoreVertical" not in content:
            content = content.replace('Zap, Activity, Brain, Play, Pause', 'Zap, Activity, Brain, Play, Pause, MoreVertical, Loader2, Save, Timer as TimerIcon, CheckCircle')

    # 2. Add isDeepWork prop to VideoPanel & NotesPanel interfaces safely
    content = content.replace('watchPercentage: number;', 'watchPercentage: number;\n  isDeepWork?: boolean;')

    # 3. Add isDeepWork to VideoPanel & NotesPanel parameters
    content = content.replace('watchPercentage\n}: VideoPanelProps) => {', 'watchPercentage,\n  isDeepWork\n}: VideoPanelProps) => {')
    content = content.replace('watchPercentage\n}: NotesPanelProps) => {', 'watchPercentage,\n  isDeepWork\n}: NotesPanelProps) => {')

    # 4. Modify VideoPanel rounded corners based on isDeepWork
    if is_desktop:
        content = content.replace('className="transform-gpu flex flex-col bg-slate-950 rounded-[2.5rem] overflow-hidden border border-rose-100/10 shadow-2xl relative h-full"', 'className={`transform-gpu flex flex-col bg-slate-950 overflow-hidden border shadow-2xl relative h-full ${isDeepWork ? "rounded-none border-none" : "rounded-[2.5rem] border-rose-100/10"}`}')
    else:
        content = content.replace('className="transform-gpu flex flex-col bg-white rounded-[2.5rem] overflow-hidden border border-rose-100/50 shadow-xl relative h-full"', 'className={`transform-gpu flex flex-col bg-white overflow-hidden border shadow-xl relative h-full ${isDeepWork ? "rounded-none border-none" : "rounded-[2.5rem] border-rose-100/50"}`}')

    # 5. NotesPanel dropdown menu & rounded corners
    content = content.replace('className="transform-gpu h-full flex flex-col bg-white rounded-[2.5rem] border border-rose-100 shadow-xl overflow-hidden"', 'className={`transform-gpu h-full flex flex-col bg-white border shadow-xl overflow-hidden ${isDeepWork ? "rounded-none border-none" : "rounded-[2.5rem] border-rose-100"}`}')
    
    dropdown_ui_web = """
        <div className="transform-gpu flex items-center gap-2 relative group">
          <button
            title="Menu"
            className="transform-gpu p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <MoreVertical size={18} />
          </button>
          
          <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden flex flex-col">
            <button
              onClick={() => handleSaveNotes()}
              disabled={isSaving}
              className="flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 text-xs text-slate-700 font-bold uppercase tracking-widest transition-colors"
            >
              {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
              Save
            </button>
            <button
              onClick={handleEndTimer}
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
              }}
              className="flex items-center gap-3 px-4 py-3 text-left hover:bg-rose-50 text-xs text-rose-600 font-bold uppercase tracking-widest transition-colors border-t border-slate-50"
            >
              <CheckCircle size={14} />
              Complete
            </button>
          </div>
        </div>
"""

    # Replace old buttons with dropdown in web
    old_buttons = r'<div className="transform-gpu flex items-center gap-2">\s*<button\s+onClick=\{handleSaveNotes\}.*?</button>\s*</div>'
    content = re.sub(old_buttons, dropdown_ui_web, content, flags=re.DOTALL)

    # 6. Resizer state and Auto-Save in StudyView
    # Add videoWidth state
    content = content.replace(
        'const [currentTab, setCurrentTab] = useState<"NOTES" | "QUESTIONS">("NOTES");',
        'const [currentTab, setCurrentTab] = useState<"NOTES" | "QUESTIONS">("NOTES");\n  const [videoWidth, setVideoWidth] = useState(50);\n  const [isDragging, setIsDragging] = useState(false);'
    )

    # Add Auto-Save useEffect
    auto_save_effect = """
  // Auto-save debounced
  useEffect(() => {
    if (!unitId || !hasMounted) return;
    const timer = setTimeout(() => {
      saveNotes(unitId as string, JSON.stringify({ freeform: freeformNotes, questions })).catch(() => {});
    }, 2000);
    return () => clearTimeout(timer);
  }, [freeformNotes, questions, unitId, saveNotes, hasMounted]);
"""
    content = content.replace('const [isSaving, setIsSaving] = useState(false);', 'const [isSaving, setIsSaving] = useState(false);\n' + auto_save_effect)
    
    # 7. Add isDeepWork prop to component calls
    content = content.replace('youtubeId={youtubeId}', 'youtubeId={youtubeId}\n                  isDeepWork={isDeepWork}')
    content = content.replace('watchPercentage={percentage}\n                />\n              </div>', 'watchPercentage={percentage}\n                  isDeepWork={isDeepWork}\n                />\n              </div>')

    # 8. Implement Draggable Resizer
    resizer_ui = """
              <div 
                className={`w-2 h-full cursor-col-resize group flex items-center justify-center -mx-3 z-10 relative ${isDragging ? 'bg-rose-500/10' : 'hover:bg-slate-100'}`}
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
                <div className={`w-1 h-12 rounded-full transition-colors ${isDragging ? 'bg-rose-500' : 'bg-slate-300 group-hover:bg-rose-400'}`} />
              </div>
    """

    # In SPLIT layout, change w-[45%] to style={{ width: `${videoWidth}%` }}
    content = re.sub(
        r'<div className="transform-gpu w-\[45%\] h-full">',
        r'<div className="transform-gpu h-full shrink-0" style={{ width: `${transpose ? 100 - videoWidth : videoWidth}%` }}>',
        content
    )
    
    # Inject resizer between VideoPanel div and NotesPanel div in SPLIT mode
    split_divider_regex = r'(</VideoPanel>\s*</div>)\s*<div className="transform-gpu flex-1 h-full">'
    content = re.sub(split_divider_regex, r'\1' + '\n' + resizer_ui + '\n' + '<div className="transform-gpu flex-1 h-full min-w-0">', content)

    with open(path, 'w') as f:
        f.write(content)

update_file('apps/web/features/study/shared/views/StudyView.tsx', False)
update_file('apps/desktop/src/features/study/views/StudyView.tsx', True)
