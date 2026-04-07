import { useState, useRef, useCallback, useEffect } from 'react';

export function useVideoProgress(totalDurationSeconds: number) {
  const [watchedSeconds, setWatchedSeconds] = useState<Set<number>>(new Set());
  const [percentage, setPercentage] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const prevTimeRef = useRef<number>(0);

  // Mark a second as watched
  const markWatched = useCallback((second: number) => {
    if (totalDurationSeconds <= 0) return;
    
    setWatchedSeconds(prev => {
      if (prev.has(second)) return prev;
      const next = new Set(prev);
      next.add(second);
      return next;
    });
  }, [totalDurationSeconds]);

  // Update real-time percentage
  useEffect(() => {
    if (totalDurationSeconds > 0) {
      const p = (watchedSeconds.size / totalDurationSeconds) * 100;
      setPercentage(Math.min(p, 100));
    }
  }, [watchedSeconds.size, totalDurationSeconds]);

  const onProgress = useCallback((time: number) => {
    setCurrentTime(time);
    const roundedTime = Math.floor(time);
    
    // Logic to handle scrubbing vs normal play
    // We only mark as watched if the movement is incremental (normal play)
    const diff = Math.abs(time - prevTimeRef.current);
    if (diff < 2) { // Allow up to 2 seconds jump for slight jitter/speed changes
      markWatched(roundedTime);
    }
    prevTimeRef.current = time;
  }, [markWatched]);

  const reset = useCallback(() => {
    setWatchedSeconds(new Set());
    setPercentage(0);
    prevTimeRef.current = 0;
  }, []);

  // Helper to set manual percentage (for overrides)
  const manualSetPercentage = useCallback((p: number) => {
    setPercentage(Math.max(0, Math.min(100, p)));
  }, []);

  return {
    percentage,
    currentTime,
    isReady,
    setIsReady,
    onProgress,
    reset,
    manualSetPercentage,
    watchedCount: watchedSeconds.size
  };
}
