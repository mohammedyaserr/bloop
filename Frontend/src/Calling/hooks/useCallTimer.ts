import { useState, useEffect, useRef, useCallback } from 'react';

export function useCallTimer() {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const start = useCallback(() => {
    setIsActive(true);
  }, []);

  const stop = useCallback(() => {
    setIsActive(false);
  }, []);

  const reset = useCallback(() => {
    setSeconds(0);
    setIsActive(false);
  }, []);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = window.setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive]);

  const formatTime = useCallback((totalSeconds: number): string => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    const formattedMins = mins < 10 ? `0${mins}` : mins;
    const formattedSecs = secs < 10 ? `0${secs}` : secs;

    if (hrs > 0) {
      const formattedHrs = hrs < 10 ? `0${hrs}` : hrs;
      return `${formattedHrs}:${formattedMins}:${formattedSecs}`;
    }

    return `${formattedMins}:${formattedSecs}`;
  }, []);

  return {
    seconds,
    formattedTime: formatTime(seconds),
    start,
    stop,
    reset,
  };
}
export type UseCallTimerReturn = ReturnType<typeof useCallTimer>;
