import React, { useEffect, useRef, useState } from "react";
import { getAsepriteJsonUrlForSprite } from "@/lib/gameSettings";

// Single animated tile canvas
function AnimatedTile({ animationData, imgRef, currentFrame, tileWidth, tileHeight }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !animationData || !imgRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const frames = animationData.frames;
    const frameKeys = Array.isArray(frames) ? frames.map((_, i) => i) : Object.keys(frames);
    const frame = Array.isArray(frames)
      ? frames[currentFrame % frameKeys.length]
      : frames[frameKeys[currentFrame % frameKeys.length]];
    if (!frame) return;

    const tw = tileWidth;
    const th = tileHeight || tileWidth;
    canvas.width = tw;
    canvas.height = th;
    ctx.clearRect(0, 0, tw, th);
    ctx.imageSmoothingEnabled = false;

    const draw = () => {
      const scale = Math.min(tw / frame.frame.w, th / frame.frame.h);
      const sw = frame.frame.w * scale;
      const sh = frame.frame.h * scale;
      const ox = (tw - sw) / 2;
      const oy = th - sh;
      ctx.drawImage(imgRef.current, frame.frame.x, frame.frame.y, frame.frame.w, frame.frame.h, ox, oy, sw, sh);
    };

    if (imgRef.current.complete) draw();
    else imgRef.current.onload = draw;
  }, [animationData, currentFrame, tileWidth, tileHeight]);

  return <canvas ref={canvasRef} style={{ width: `${tileWidth}px`, height: "100%", imageRendering: "pixelated", flexShrink: 0 }} />;
}

function AnimatedTileRow({ animationData, imgRef, currentFrame, tileWidth, tileHeight, count }) {
  return (
    <div style={{ display: "flex", width: "200%", height: "100%", alignItems: "flex-end" }}>
      {Array.from({ length: count }).map((_, i) => (
        <AnimatedTile key={i} animationData={animationData} imgRef={imgRef} currentFrame={currentFrame} tileWidth={tileWidth} tileHeight={tileHeight} />
      ))}
    </div>
  );
}

/** Full sheet per tile until Aseprite JSON loads — avoids empty parallax / ground / shrubs. */
function StaticSpriteTileRow({ spriteUrl, tileWidth, tileHeight, count }) {
  const th = tileHeight || tileWidth;
  return (
    <div style={{ display: "flex", width: "200%", height: "100%", alignItems: "flex-end" }}>
      {Array.from({ length: count }).map((_, i) => (
        <img
          key={i}
          src={spriteUrl}
          alt=""
          decoding="async"
          fetchPriority="low"
          style={{
            width: `${tileWidth}px`,
            height: "100%",
            minHeight: `${th}px`,
            objectFit: "contain",
            objectPosition: "bottom",
            flexShrink: 0,
            imageRendering: "pixelated",
          }}
        />
      ))}
    </div>
  );
}

// Renders a row of tiles, each showing a single animated frame from a spritesheet
export default function SpriteTileRow({ spriteUrl, tileWidth, tileHeight, count, fallback }) {
  const imgRef = useRef(null);
  const [animationData, setAnimationData] = useState(null);
  const [currentFrame, setCurrentFrame] = useState(0);

  useEffect(() => {
    if (!spriteUrl) return;

    const img = new Image();
    img.src = spriteUrl;
    imgRef.current = img;

    const jsonUrl = getAsepriteJsonUrlForSprite(spriteUrl);
    if (jsonUrl) {
      fetch(jsonUrl)
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data) setAnimationData(data); })
        .catch(() => {});
    } else {
      setAnimationData(null);
    }
  }, [spriteUrl]);

  // Animation loop — slow for seasonal feel (e.g. 800ms per frame)
  useEffect(() => {
    if (!animationData) return;
    const frames = animationData.frames;
    const frameCount = Array.isArray(frames) ? frames.length : Object.keys(frames).length;
    if (frameCount <= 1) return;
    const duration = animationData.meta?.frameTags?.[0]?.duration || 800;
    const interval = setInterval(() => {
      setCurrentFrame(prev => (prev + 1) % frameCount);
    }, duration);
    return () => clearInterval(interval);
  }, [animationData]);

  if (!spriteUrl) return fallback || null;

  if (animationData) {
    return <AnimatedTileRow animationData={animationData} imgRef={imgRef} currentFrame={currentFrame} tileWidth={tileWidth} tileHeight={tileHeight} count={count} />;
  }

  if (fallback != null) return fallback;

  return <StaticSpriteTileRow spriteUrl={spriteUrl} tileWidth={tileWidth} tileHeight={tileHeight} count={count} />;
}