import React, { useEffect, useRef, useState, useCallback } from "react";

/**
 * AnimatedSprite
 *
 * Renders a single horizontal-strip spritesheet as a CSS-clipped animated frame.
 * No canvas — pure div + background-position for maximum mobile performance.
 *
 * Props:
 *   url        {string}   — path to the spritesheet PNG
 *   frameSize  {number}   — width AND height of a single frame in px (always square)
 *   frames     {number}   — total number of frames on the sheet
 *   fps        {number}   — playback speed
 *   loop       {boolean}  — loop or play once and hold last frame
 *   playing    {boolean}  — pause/resume without unmounting (default: true)
 *   scale      {number}   — CSS scale multiplier (default: 1)
 *   flipX      {boolean}  — mirror horizontally (face left)
 *   style      {object}   — extra styles on the outer wrapper
 *   className  {string}   — extra class on the outer wrapper
 *   onComplete {function} — called when a non-looping animation finishes
 *   pixelated  {boolean}  — use pixelated image rendering (default: true)
 */
export default function AnimatedSprite({
  url,
  frameSize,
  frames,
  fps = 8,
  loop = true,
  playing = true,
  scale = 1,
  flipX = false,
  style,
  className,
  onComplete,
  pixelated = true,
}) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const frameRef = useRef(0);
  const completedRef = useRef(false);
  const intervalRef = useRef(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Reset when animation source changes
  useEffect(() => {
    setCurrentFrame(0);
    frameRef.current = 0;
    completedRef.current = false;
  }, [url, frames]);

  const tick = useCallback(() => {
    if (completedRef.current) return;

    const next = frameRef.current + 1;

    if (next >= frames) {
      if (loop) {
        frameRef.current = 0;
        setCurrentFrame(0);
      } else {
        // Hold last frame
        frameRef.current = frames - 1;
        setCurrentFrame(frames - 1);
        completedRef.current = true;
        onCompleteRef.current?.();
      }
    } else {
      frameRef.current = next;
      setCurrentFrame(next);
    }
  }, [frames, loop]);

  useEffect(() => {
    if (!playing || !url) return;

    completedRef.current = false;
    intervalRef.current = setInterval(tick, 1000 / fps);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, url, fps, tick]);

  if (!url) return null;

  const displaySize = frameSize * scale;
  const bgX = -(currentFrame * frameSize * scale);

  return (
    <div
      className={className}
      style={{
        width: displaySize,
        height: displaySize,
        overflow: "hidden",
        flexShrink: 0,
        transform: flipX ? "scaleX(-1)" : undefined,
        ...style,
      }}
    >
      <div
        style={{
          width: frameSize * scale,
          height: frameSize * scale,
          backgroundImage: `url(${url})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: `${frames * frameSize * scale}px ${frameSize * scale}px`,
          backgroundPosition: `${bgX}px 0px`,
          imageRendering: pixelated ? "pixelated" : "auto",
        }}
      />
    </div>
  );
}
