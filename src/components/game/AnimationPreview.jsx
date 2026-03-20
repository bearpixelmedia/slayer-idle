import React, { useEffect, useRef } from "react";

export default function AnimationPreview({ spriteUrl, animationData, currentFrame }) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!animationData) return;
    
    // Preload image once
    if (!imgRef.current) {
      imgRef.current = new Image();
      imgRef.current.src = spriteUrl;
    }
  }, [spriteUrl, animationData]);

  useEffect(() => {
    if (!canvasRef.current || !animationData || !imgRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const frames = animationData.frames;
    const frameKeys = Array.isArray(frames) ? Object.keys(frames) : Object.keys(frames);
    const frameKey = frameKeys[currentFrame % frameKeys.length];
    const frame = frames[frameKey];

    if (!frame) return;

    canvas.width = 48;
    canvas.height = 48;
    ctx.clearRect(0, 0, 48, 48);

    if (imgRef.current.complete) {
      // Calculate scaling to fit frame within canvas while maintaining aspect ratio
      const scale = Math.min(canvas.width / frame.frame.w, canvas.height / frame.frame.h);
      const scaledW = frame.frame.w * scale;
      const scaledH = frame.frame.h * scale;
      const offsetX = (canvas.width - scaledW) / 2;
      const offsetY = (canvas.height - scaledH) / 2;
      
      ctx.drawImage(
        imgRef.current,
        frame.frame.x,
        frame.frame.y,
        frame.frame.w,
        frame.frame.h,
        offsetX,
        offsetY,
        scaledW,
        scaledH
      );
    }
  }, [animationData, currentFrame]);

  if (animationData) {
    return <canvas ref={canvasRef} className="w-full h-full pointer-events-none" />;
  }

  return <img src={spriteUrl} alt="preview" className="w-full h-full object-cover pointer-events-none" />;
}