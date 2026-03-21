import React, { useRef, useEffect, useState } from "react";

const UPLOADED_FILES_KEY = "setting_uploaded_files";

function getJsonUrlForSprite(spriteUrl) {
  let jsonUrl = sessionStorage.getItem(`aseprite_json_${spriteUrl}`);
  if (!jsonUrl) {
    try {
      const saved = localStorage.getItem(UPLOADED_FILES_KEY);
      const list = saved ? JSON.parse(saved) : [];
      const entry = list.find(f => f.url === spriteUrl);
      if (entry?.jsonUrl) {
        jsonUrl = entry.jsonUrl;
        sessionStorage.setItem(`aseprite_json_${spriteUrl}`, jsonUrl);
      }
    } catch {}
  }
  return jsonUrl;
}

export default function PlayerRenderer({ spriteUrl, fallbackEmoji, className }) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [animationData, setAnimationData] = useState(null);
  const [currentFrame, setCurrentFrame] = useState(0);

  // Load image + animation data
  useEffect(() => {
    if (!spriteUrl) { setAnimationData(null); return; }

    imgRef.current = new Image();
    imgRef.current.src = spriteUrl;

    const jsonUrl = getJsonUrlForSprite(spriteUrl);
    if (jsonUrl) {
      fetch(jsonUrl)
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data) setAnimationData(data); })
        .catch(() => setAnimationData(null));
    } else {
      setAnimationData(null);
    }
  }, [spriteUrl]);

  // Animation loop
  useEffect(() => {
    if (!animationData) return;
    const frames = animationData.frames;
    const frameCount = Array.isArray(frames) ? frames.length : Object.keys(frames).length;
    const duration = animationData.meta?.frameTags?.[0]?.duration || 100;
    const interval = setInterval(() => {
      setCurrentFrame(prev => (prev + 1) % frameCount);
    }, duration);
    return () => clearInterval(interval);
  }, [animationData]);

  // Draw frame
  useEffect(() => {
    if (!canvasRef.current || !animationData || !imgRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const frames = animationData.frames;
    const frameKeys = Array.isArray(frames) ? frames.map((_, i) => i) : Object.keys(frames);
    const frameKey = frameKeys[currentFrame % frameKeys.length];
    const frame = Array.isArray(frames) ? frames[frameKey] : frames[frameKey];
    if (!frame) return;

    canvas.width = 64;
    canvas.height = 64;
    ctx.clearRect(0, 0, 64, 64);

    const draw = () => {
      const scale = Math.min(64 / frame.frame.w, 64 / frame.frame.h);
      const sw = frame.frame.w * scale;
      const sh = frame.frame.h * scale;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        imgRef.current,
        frame.frame.x, frame.frame.y, frame.frame.w, frame.frame.h,
        (64 - sw) / 2, (64 - sh) / 2, sw, sh
      );
    };

    if (imgRef.current.complete) draw();
    else imgRef.current.onload = draw;
  }, [animationData, currentFrame]);

  if (!spriteUrl) return <span className={className}>{fallbackEmoji}</span>;

  if (animationData) {
    return <canvas ref={canvasRef} className={className} style={{ imageRendering: "pixelated" }} />;
  }

  // No animation data — show full spritesheet as static image
  return <img src={spriteUrl} alt="player" className={className} style={{ objectFit: "contain", imageRendering: "pixelated" }} />;
}