import React, { useEffect } from "react";
import { Play, Pause, RotateCcw, Youtube, VideoOff, Timer as TimerIcon } from "lucide-react";
import { Unit } from "@planner/study-core";
import { motion } from "framer-motion";
import YouTube, { YouTubeProps } from "react-youtube";

interface VideoPanelProps {
  unit: Unit | undefined;
  youtubeId: string | null;
  hasMounted: boolean;
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
  seconds: number;
  setSeconds: (seconds: number) => void;
  formatTime: (s: number) => string;
  onProgress: (time: number) => void;
  watchPercentage: number;
}

export const VideoPanel = ({
  unit,
  youtubeId,
  hasMounted,
  isPaused,
  setIsPaused,
  seconds,
  setSeconds,
  formatTime,
  onProgress,
  watchPercentage
}: VideoPanelProps) => {
  const playerRef = React.useRef<any>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!isPaused && playerRef.current) {
      interval = setInterval(() => {
        const time = playerRef.current.getCurrentTime();
        if (time) onProgress(time);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPaused, onProgress]);

  const onPlayerStateChange: YouTubeProps["onStateChange"] = (event) => {
    const state = event.data;
    if (state === 1) setIsPaused(false);
    if (state === 2 || state === 0) setIsPaused(true);
  };

  const onPlayerReady: YouTubeProps["onReady"] = (event) => {
    playerRef.current = event.target;
    try {
      const iframe = event.target.getIframe ? event.target.getIframe() : null;
      if (iframe && iframe.style) {
        iframe.style.pointerEvents = "auto";
      }
    } catch {}
  };

  return (
    <div className="flex flex-col bg-slate-950 rounded-[2.5rem] overflow-hidden border border-rose-100/10 shadow-2xl relative h-full">
      <div className="aspect-video w-full bg-black relative z-0">
        {youtubeId && hasMounted ? (
          <div className="absolute inset-0 z-10 pointer-events-auto">
            <YouTube
              videoId={youtubeId}
              className="w-full h-full"
              opts={{
                width: "100%",
                height: "100%",
                playerVars: {
                  autoplay: 0,
                  rel: 0,
                  modestbranding: 1,
                  iv_load_policy: 3,
                },
              }}
              onReady={onPlayerReady}
              onStateChange={onPlayerStateChange}
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/20">
            <div className="text-center p-8">
              <VideoOff size={48} className="mx-auto mb-6 opacity-20" />
              <p className="font-black uppercase tracking-[0.3em] text-[10px] mb-8">
                Video stream unavailable
              </p>
              {unit?.metadata && (JSON.parse(unit.metadata as any)?.youtubeId) && (
                <a
                  href={`https://youtube.com/watch?v=${JSON.parse(unit.metadata as any).youtubeId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-3 bg-rose-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-900/40"
                >
                  <Youtube size={16} /> Open Study Source
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="p-8 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="bg-rose-600 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                Lesson Active
              </span>
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                {unit?.durationMinutes}m duration
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${watchPercentage}%` }}
                  className="h-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                />
              </div>
              <span className="text-[10px] font-black text-rose-500 font-mono w-8 text-right">
                {Math.round(watchPercentage)}%
              </span>
            </div>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white mb-4 line-clamp-2">
            {unit?.title}
          </h1>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center text-rose-400">
              <TimerIcon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                Study Timer
              </p>
              <p className="text-2xl font-black text-white font-mono">{formatTime(seconds)}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsPaused(!isPaused)}
              title={isPaused ? "Resume study session" : "Pause study session"}
              className={`p-4 rounded-2xl transition-all active:scale-95 ${
                isPaused ? "bg-rose-600 text-white shadow-lg shadow-rose-900/40" : "bg-white/10 text-white"
              }`}
            >
              {isPaused ? <Play size={20} fill="currentColor" /> : <Pause size={20} fill="currentColor" />}
            </button>
            <button
              onClick={() => setSeconds(0)}
              title="Reset session timer"
              className="p-4 bg-white/5 text-slate-400 rounded-2xl hover:text-white transition-all active:scale-95"
            >
              <RotateCcw size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
