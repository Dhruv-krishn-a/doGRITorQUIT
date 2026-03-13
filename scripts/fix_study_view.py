import re

with open('apps/web/features/study/shared/views/StudyView.tsx', 'r') as f:
    content = f.read()

# Fix 1: Add seekTo to YouTubePlayer interface
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

# Fix 2: Define playerRef inside StudyView
content = content.replace(
'''export function StudyView() {
  const { trackId, unitId } = useParams();''',
'''export function StudyView() {
  const { trackId, unitId } = useParams();
  const playerRef = React.useRef<YouTubePlayer | null>(null);''')

# Fix 3: Move the unit reference before useEffect
content = content.replace(
'''  const [notes, setNotes] = useState<any[]>([]);

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

  const [currentCategory, setCurrentCategory] = useState<"CONCEPT" | "QUESTION" | "INSIGHT" | "REVISION">("CONCEPT");
  
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (trackId) fetchTrack(trackId as string);
  }, [trackId, fetchTrack]);

  const unit = activeTrack?.track?.units?.find((u) => u.id === unitId);''',
'''  const [notes, setNotes] = useState<any[]>([]);
  const [currentCategory, setCurrentCategory] = useState<"CONCEPT" | "QUESTION" | "INSIGHT" | "REVISION">("CONCEPT");
  const [isSaving, setIsSaving] = useState(false);

  const unit = activeTrack?.track?.units?.find((u) => u.id === unitId);

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

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (trackId) fetchTrack(trackId as string);
  }, [trackId, fetchTrack]);''')

with open('apps/web/features/study/shared/views/StudyView.tsx', 'w') as f:
    f.write(content)
