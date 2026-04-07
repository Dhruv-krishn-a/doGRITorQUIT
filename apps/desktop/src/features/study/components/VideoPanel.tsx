import React, { useEffect } from"react";
import { Play, Pause, RotateCcw, Youtube, VideoOff, Timer as TimerIcon } from"lucide-react";
import { Unit } from"@gritorquit/study-core";
import { motion } from"framer-motion";

interface VideoPanelProps {
 playerRef: React.MutableRefObject<any>;
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
 isDeepWork?: boolean;
}

function safeParse(str: any, fallback: any = null) {
 if (!str) return fallback;
 if (typeof str !== 'string') return str;
 try {
  return JSON.parse(str);
 } catch (e) {
  return fallback;
 }
}

declare global {
 interface Window {
  onYouTubeIframeAPIReady: () => void;
  YT: any;
 }
}

export const VideoPanel = React.memo(({
 playerRef,
 unit,
 youtubeId,
 hasMounted,
 isPaused,
 setIsPaused,
 seconds,
 setSeconds,
 formatTime,
 onProgress,
 watchPercentage,
 isDeepWork
}: VideoPanelProps) => {
 const containerRef = React.useRef<HTMLDivElement>(null);
 const playerInstance = React.useRef<any>(null);

 // origin should be strictly protocol + host
 const origin = React.useMemo(() => {
  try {
   return `${window.location.protocol}//${window.location.host}`;
  } catch {
   return 'http://localhost:1420';
  }
 }, []);

 const initPlayer = React.useCallback(() => {
  if (!youtubeId || !containerRef.current || !window.YT || !window.YT.Player) return;

  // Destroy existing instance if any
  if (playerInstance.current) {
   try {
    playerInstance.current.destroy();
   } catch (e) {}
   playerInstance.current = null;
  }

  // Clear container and create insertion point
  containerRef.current.innerHTML = '<div id="yt-internal-player"></div>';

  playerInstance.current = new window.YT.Player('yt-internal-player', {
   height: '100%',
   width: '100%',
   videoId: youtubeId,
   playerVars: {
    autoplay: 0,
    rel: 0,
    modestbranding: 1,
    iv_load_policy: 3,
    origin: origin,
    enablejsapi: 1,
    widget_referrer: origin,
   },
   events: {
    onReady: (event: any) => {
     playerRef.current = event.target;
     
     // Aggressive iframe cleanup right after ready
     try {
      const iframe = event.target.getIframe();
      if (iframe) {
       let allow = iframe.getAttribute('allow') || '';
       if (allow.includes('web-share')) {
        iframe.setAttribute('allow', allow.replace(/web-share;? ?/g, '').trim());
       }
      }
     } catch (e) {}
    },
    onStateChange: (event: any) => {
     const state = event.data;
     if (state === 1) setIsPaused(false);
     else if (state === 2 || state === 0) setIsPaused(true);
    },
    onError: (e: any) => {
     console.warn("YouTube Player Error:", e.data);
    }
   }
  });
 }, [youtubeId, origin, setIsPaused, playerRef]);

 useEffect(() => {
  if (!hasMounted) return;

  // Ensure API is loaded once
  if (!window.YT) {
   const tag = document.createElement('script');
   tag.src ="https://www.youtube.com/iframe_api";
   const firstScriptTag = document.getElementsByTagName('script')[0];
   if (firstScriptTag && firstScriptTag.parentNode) {
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
   } else {
    document.head.appendChild(tag);
   }
   window.onYouTubeIframeAPIReady = () => initPlayer();
  } else {
   initPlayer();
  }

  return () => {
   if (playerInstance.current) {
    try {
     playerInstance.current.destroy();
    } catch (e) {}
    playerInstance.current = null;
    playerRef.current = null;
   }
  };
 }, [hasMounted, initPlayer, playerRef]);

 const metadata = React.useMemo(() => safeParse(unit?.metadata, {}), [unit?.metadata]);

 useEffect(() => {
  let interval: NodeJS.Timeout;
  if (!isPaused && playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
   interval = setInterval(() => {
    try {
     if (playerRef.current && typeof playerRef.current.getIframe === 'function') {
      const time = playerRef.current.getCurrentTime();
      if (typeof time === 'number') onProgress(time);
     }
    } catch (e) {
     clearInterval(interval);
    }
   }, 1000);
  }
  return () => clearInterval(interval);
 }, [isPaused, onProgress, playerRef]);

 return (
  <div className={`flex flex-col bg-slate-950 overflow-hidden border shadow-2xl relative h-full ${isDeepWork ?"rounded-none border-none" :"rounded-[2.5rem] border-rose-100/10"}`}>
   <div className="aspect-video w-full bg-black relative z-0">
    <div 
     ref={containerRef}
     className="absolute inset-0 z-10 pointer-events-auto"
    />
    {!youtubeId && (
     <div className="absolute inset-0 flex items-center justify-center text-white/20">
      <div className="text-center p-8">
       <VideoOff size={48} className="mx-auto mb-6 opacity-20" />
       <p className="font-bold uppercase tracking-[0.3em] text-[10px] mb-8">
        Video stream unavailable
       </p>
       {metadata?.youtubeId && (
        <a
         href={`https://youtube.com/watch?v=${metadata.youtubeId}`}
         target="_blank"
         rel="noreferrer"
         className="inline-flex items-center gap-3 bg-rose-600 text-white px-8 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-900/40"
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
       <span className="bg-rose-600 text-white text-[8px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
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
       <span className="text-[10px] font-bold text-rose-500 font-mono w-8 text-right">
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
       <p className="text-2xl font-bold text-white font-mono">{formatTime(seconds)}</p>
      </div>
     </div>
     <div className="flex gap-2">
      <button
       onClick={() => setIsPaused(!isPaused)}
       title={isPaused ?"Resume study session" :"Pause study session"}
       className={`p-4 rounded-2xl transition-all active:scale-95 ${
        isPaused ?"bg-rose-600 text-white shadow-lg shadow-rose-900/40" :"bg-white/10 text-white"
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
});
