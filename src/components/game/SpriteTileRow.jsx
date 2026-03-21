import React, { useEffect, useRef, useState } from "react";

const UPLOADED_FILES_KEY = "setting_uploaded_files";

function getJsonUrl(spriteUrl) {
  let url = sessionStorage.getItem(`aseprite_json_${spriteUrl}`);
  if (!url) {
    try {
      const list = JSON.parse(localStorage.getItem(UPLOADED_FILES_KEY) || "[]");
      const entry = list.find(f => f.url === spriteUrl);
      if (entry?.jsonUrl) {
        url = entry.jsonUrl;
        sessionStorage.setItem(`aseprite_json_${spriteUrl}`, url);
      }
    } catch {}
  }
  return url;
}

// Renders a row of tiles, each showing a single animated frame from a spritesheet
export default function SpriteTileRow({ spriteUrl, tileWidth, tileHeight, count, fallback }) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [animationData, setAnimationData] = useState(null);
  const [currentFrame, setCurrentFrame] = useState(0);

  useEffect(() => {
    if (!spriteUrl) return;

    const img = new Image();
    img.src = spriteUrl;
    imgRef.current = img;

    const jsonUrl = getJsonUrl(spriteUrl);
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

  // Draw tiled frames onto canvas
  useEffect(() => {
    if (!canvasRef.current || !animationData || !imgRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const frames = animationData.frames;
    const frameKeys = Array.isArray(frames) ? frames.map((_, i) => i) : Object.keys(frames);
    const frame = Array.isArray(frames) ? frames[currentFrame % frameKeys.length] : frames[frameKeys[currentFrame % frameKeys.length]];
    if (!frame) return;

    const tw = tileWidth;
    const th = tileHeight || canvas.height;
    canvas.width = tw * count;
    canvas.height = th;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;

    const draw = () => {
      const scale = Math.min(tw / frame.frame.w, th / frame.frame.h);
      const sw = frame.frame.w * scale;
      const sh = frame.frame.h * scale;

      for (let i = 0; i < count; i++) {
        const offsetX = i * tw + (tw - sw) / 2;
        const offsetY = th - sh; // align to bottom
        ctx.drawImage(
          imgRef.current,
          frame.frame.x, frame.frame.y, frame.frame.w, frame.frame.h,
          offsetX, offsetY, sw, sh
        );
      }
    };

    if (imgRef.current.complete) draw();
    else imgRef.current.onload = draw;
  }, [animationData, currentFrame, tileWidth, tileHeight, count]);

  if (!spriteUrl) return fallback || null;

  if (animationData) {
    return (
      <canvas
        ref={canvasRef}
        style={{ width: "200%", height: "100%", imageRendering: "pixelated", display: "block" }}
      />
    );
  }

  // No JSON — show the image as a single tile repeated (best effort)
  return (
    <div style={{ display: "flex", width: "200%", height: "100%", alignItems: "flex-end" }}>
      {Array.from({ length: count }).map((_, i) => (
        <img
          key={i}
          src={spriteUrl}
          alt=""
          style={{
            flex: `0 0 ${tileWidth}px`,
            height: tileHeight || "100%",
            objectFit: "contain",
            objectPosition: "bottom",
            imageRendering: "pixelated",
          }}
        />
      ))}
    </div>
  );
}