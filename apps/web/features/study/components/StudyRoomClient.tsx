'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Play, Save, CheckCircle, Clock, ArrowLeft } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { saveStudyProgress } from '@/app/actions/study';
import Link from 'next/link';

interface StudyRoomProps {
  video: {
    id: string;
    youtubeId: string;
    title: string;
    notes: unknown;
    durationSec: number;
    timeSpentSec: number;
    isCompleted: boolean;
  };
}

// Local lightweight interface for the player ref (we only rely on getCurrentTime here)
interface PlayerRef {
  getCurrentTime?: () => number;
}

// Dynamically import react-player to avoid SSR type mismatch and loosen strict prop typing.
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false }) as unknown as React.ComponentType<Record<string, unknown>>;

export function StudyRoomClient({ video }: StudyRoomProps) {
  const router = useRouter();
  const [playing, setPlaying] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // keep refs to avoid interval closures and stale values
  const playerRef = useRef<PlayerRef | null>(null);
  const sessionTimeRef = useRef<number>(0);
  const playingRef = useRef<boolean>(false);

  useEffect(() => setMounted(true), []);

  // keep refs in sync with state
  useEffect(() => {
    sessionTimeRef.current = sessionTime;
  }, [sessionTime]);

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  // safer interval for counting session seconds
  useEffect(() => {
    let id: number | undefined;
    if (playing) {
      id = window.setInterval(() => {
        setSessionTime((prev) => {
          const next = prev + 1;
          sessionTimeRef.current = next;
          return next;
        });
      }, 1000);
    }
    return () => {
      if (id) window.clearInterval(id);
    };
  }, [playing]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Type your notes here... (Use Markdown or /)' }),
    ],
    // If we're still on the server mount will be false; use an empty string to avoid SSR/hydration issues
    content: mounted ? ((video.notes as object) || '') : '',
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[500px] p-6 text-zinc-300',
      },
    },
    // Prevent immediate render so Tiptap won't detect SSR and throw during hydration
    // some versions of the types include immediatelyRender; if not, ts-ignore it
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    immediatelyRender: false,
  });

  // youtube config moved to variable with explicit types (avoids `any`)
  const youtubeConfig: { playerVars: Record<string, number> } = {
    playerVars: {
      showinfo: 0,
      modestbranding: 1,
      rel: 0,
    },
  };

  // handleSave reads from the sessionTimeRef by default so it remains stable for intervals
  const handleSave = useCallback(
    async (markCompleted = false, timeToSave?: number) => {
      if (!editor) return;
      setIsSaving(true);

      const json = editor.getJSON();
      const time = typeof timeToSave === 'number' ? timeToSave : sessionTimeRef.current;

      try {
        const result = await saveStudyProgress(video.id, json, time, markCompleted);

        if (result.success) {
          toast.success(markCompleted ? 'Video marked as complete!' : 'Progress saved');
          // reset session timer only when save succeeded
          sessionTimeRef.current = 0;
          setSessionTime(0);
          if (markCompleted) router.push('/study');
        } else {
          toast.error('Failed to save');
        }
      } catch (err) {       console.error(err);
        toast.error('Failed to save');
      } finally {
      console.error(err);
      }
    },
    [editor, video.id, router]
  );

  // autosave every 30s when playing and sessionTime > 5s.
  useEffect(() => {
    const id = window.setInterval(() => {
      if (playingRef.current && sessionTimeRef.current > 5) {
        // don't pass a time to let handleSave pick up sessionTimeRef.current
        handleSave(false);
      }
    }, 30000);

    return () => window.clearInterval(id);
  }, [handleSave]);

  const insertTimestamp = () => {
    if (!playerRef.current || !editor) return;
    const time = playerRef.current.getCurrentTime ? playerRef.current.getCurrentTime() : 0;
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');

    editor.chain().focus().insertContent(` **[${minutes}:${seconds}]** `).run();
  };

  if (!mounted)
    return (
      <div className="h-screen flex items-center justify-center text-zinc-500">Loading Studio...</div>
    );

  return (
    <div className="h-screen flex flex-col lg:flex-row overflow-hidden bg-black text-zinc-200">
      {/* LEFT: Video Player */}
      <div className="lg:w-3/5 h-[40vh] lg:h-full flex flex-col border-r border-zinc-800">
        <div className="p-4 border-b border-zinc-800 flex items-center gap-4 lg:hidden">
          <Link href="/study" className="text-zinc-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-semibold truncate">{video.title}</span>
        </div>

        <div className="relative w-full flex-1 bg-zinc-900">
          <ReactPlayer
            // assign the instance to the local ref safely; parameter typed as unknown to avoid `any`
            ref={(el: unknown) => {
              playerRef.current = el as PlayerRef | null;
            }}
            // props are loosely typed via the dynamic import cast above
            url={`https://www.youtube.com/watch?v=${video.youtubeId}`}
            width="100%"
            height="100%"
            playing={playing}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            controls={true}
            style={{ position: 'absolute', top: 0, left: 0 }}
            config={{ youtube: youtubeConfig }}
          />
        </div>

        <div className="hidden lg:flex p-4 bg-zinc-950 border-t border-zinc-800 justify-between items-center">
          <div>
            <h2 className="font-semibold text-white line-clamp-1 max-w-md">{video.title}</h2>
            <div className="flex items-center gap-4 text-xs text-zinc-400 mt-2 font-mono">
              <span className="flex items-center gap-1 text-green-400">
                <Play className="w-3 h-3" />
                Session: {Math.floor(sessionTime / 60)}m {sessionTime % 60}s
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Total: {Math.floor((video.timeSpentSec + sessionTime) / 60)}m
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={insertTimestamp}
              className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-2 rounded-md transition-colors border border-zinc-700"
            >
              + Timestamp
            </button>
            <button
              onClick={() => handleSave(false)}
              disabled={isSaving}
              className="flex items-center gap-2 bg-zinc-100 hover:bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : (
                <span className="flex items-center gap-2"><Save className="w-4 h-4" /> Save Notes</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT: Editor */}
      <div className="lg:w-2/5 h-[60vh] lg:h-full bg-zinc-950 flex flex-col relative">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950/50 backdrop-blur">
          <div className="flex items-center gap-3">
            <Link href="/study" className="hidden lg:block text-zinc-500 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="text-zinc-400 text-sm font-mono tracking-wider">STUDY NOTES</span>
          </div>
          <button
            onClick={() => handleSave(true)}
            className="flex items-center gap-2 text-xs bg-green-900/30 text-green-400 hover:bg-green-900/50 px-3 py-1.5 rounded-full transition-colors border border-green-900"
          >
            <CheckCircle className="w-3 h-3" /> Mark Complete
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#09090b]" onClick={() => editor?.chain().focus().run()}>
          {editor ? (
            <EditorContent editor={editor} />
          ) : (
            <div className="p-6 text-zinc-500">Loading editor...</div>
          )}
        </div>
      </div>
    </div>
  );
}
