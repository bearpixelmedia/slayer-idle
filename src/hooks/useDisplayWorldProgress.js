import { useEffect, useState } from "react";

/**
 * Matches ParallaxBackground RAF lerp — visual scroll position for lane entities.
 * Gameplay logic should keep using raw `worldProgress`; use this for screen X only.
 */
function readSmoothedWorldProgress(fallback) {
  if (typeof window !== "undefined" && typeof window.__gameDisplayWorldProgress === "number") {
    return window.__gameDisplayWorldProgress;
  }
  return fallback;
}

export function useDisplayWorldProgress(gameWorldProgress) {
  const [display, setDisplay] = useState(() => readSmoothedWorldProgress(gameWorldProgress));
  useEffect(() => {
    let id;
    const tick = () => {
      const w = readSmoothedWorldProgress(gameWorldProgress);
      setDisplay(w);
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [gameWorldProgress]);
  return display;
}
