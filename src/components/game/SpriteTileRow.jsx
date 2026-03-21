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

  if (!spriteUrl) return fallback || null;

  if (animationData) {
    return <AnimatedTileRow animationData={animationData} imgRef={imgRef} currentFrame={currentFrame} tileWidth={tileWidth} tileHeight={tileHeight} count={count} />;
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