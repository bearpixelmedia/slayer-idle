import React, { useEffect, useRef, useState } from "react";

/**
 * AnimatedSprite
 * Renders a single row of a sprite sheet as an animated sprite.
 *
 * Props:
 *   url        - path to the sprite sheet image
 *   frameSize  - size of each frame (square), used when frameW/frameH not given
 *   frameW     - frame width (overrides frameSize)
 *   frameH     - frame height (overrides frameSize)
 *   frames     - number of frames in the animation
 *   fps        - frames per second
 *   loop       - whether to loop (default true)
 *   playing    - whether the animation is playing (default true)
 *   scale      - display scale multiplier (default 1)
 *   flipX      - mirror horizontally (default false)
 */
export default function AnimatedSprite({
  url,
  frameSize,
  frameW,
  frameH,
  frames = 1,
  fps = 4,
  loop = true,
  playing = true,
  scale = 1,
  flipX = false,
  style = {},
  className = "",
}) {
  const fw = frameW ?? frameSize ?? 32;
  const fh = frameH ?? frameSize ?? 32;

  const [frame, setFrame] = useState(0);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(null);

  useEffect(() => {
    if (!playing || frames <= 1) return;

    const interval = 1000 / fps;

    const tick = (timestamp) => {
      if (lastTimeRef.current === null) lastTimeRef.current = timestamp;
      const elapsed = timestamp - lastTimeRef.current;
      if (elapsed >= interval) {
        lastTimeRef.current = timestamp;
        setFrame((prev) => {
          const next = prev + 1;
          if (next >= frames) return loop ? 0 : frames - 1;
          return next;
        });
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = null;
    };
  }, [playing, frames, fps, loop]);

  const displayW = fw * scale;
  const displayH = fh * scale;
  const sheetW = fw * frames * scale;

  return (
    <div
      className={className}
      style={{
        width: displayW,
        height: displayH,
        backgroundImage: `url(${url})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: `${sheetW}px ${displayH}px`,
        backgroundPosition: `-${frame * displayW}px 0px`,
        imageRendering: "pixelated",
        transform: flipX ? "scaleX(-1)" : undefined,
        display: "inline-block",
        flexShrink: 0,
        ...style,
      }}
    />
  );
}