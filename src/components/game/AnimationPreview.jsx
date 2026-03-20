import React, { useEffect, useRef } from "react";

export default function AnimationPreview({ spriteUrl, animationData, currentFrame, defaultEmoji }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !animationData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const frames = animationData.frames;
    const frameKey = Array.isArray(frames) ? currentFrame : Object.keys(frames)[currentFrame];
    const frame = frames[frameKey];

    if (!frame) return;

    canvas.width = 48;
    canvas.height = 48;
    
    const img = new Image();
    img.src = spriteUrl;
    img.onload = () => {
      ctx.clearRect(0, 0, 48, 48);
      ctx.drawImage(
        img,
        frame.frame.x,
        frame.frame.y,
        frame.frame.w,
        frame.frame.h,
        0,
        0,
        frame.frame.w,
        frame.frame.h
      );
    };
  }, [spriteUrl, animationData, currentFrame]);

  if (animationData) {
    return <canvas ref={canvasRef} className="w-full h-full" />;
  }

  return <img src={spriteUrl} alt="preview" className="w-full h-full object-cover" />;
}