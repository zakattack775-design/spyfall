import { useState, useEffect } from "react";

/**
 * Returns the time remaining (in ms) until `endTime`.
 * Updates every second. Returns 0 once the timer expires.
 * Returns null if no timer is active.
 */
export function useCountdown(endTime: number | null) {
  const [remaining, setRemaining] = useState<number | null>(() =>
    endTime ? Math.max(0, endTime - Date.now()) : null
  );

  useEffect(() => {
    if (endTime === null) {
      setRemaining(null);
      return;
    }

    const tick = () => setRemaining(Math.max(0, endTime - Date.now()));
    tick(); // sync immediately
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endTime]);

  return remaining;
}

/** Format milliseconds as "M:SS" */
export function formatTime(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
