"use client";
import { useEffect, useState } from "react";

/**
 * Returns the current time and re-renders every second while `active` is true.
 * Starts from `initialNow` (sent by the server) so the first client render matches the server HTML.
 */
export function useNow(initialNow: number, active = true): number {
  const [now, setNow] = useState(initialNow);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id); // stop the interval when the component unmounts
  }, [active]);

  return now;
}
