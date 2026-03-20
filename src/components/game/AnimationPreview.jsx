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
      ctx.drawImage(
        imgRef.current,
        frame.frame.x,
        frame.frame.y,
        frame.frame.w,
        frame.frame.h,
        0,
        0,
        frame.frame.w,
        frame.frame.h
      );
    }
  }, [animationData, currentFrame]);

  if (animationData) {
    return <canvas ref={canvasRef} className="w-full h-full" />;
  }

  return <img src={spriteUrl} alt="preview" className="w-full h-full object-cover" />;
}