import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getEnemySprite } from "@/lib/gameSettings";

export default function EnemyRenderer({ enemyName, enemyHit, enemyDying, isBoss, isAnimating }) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [animationData, setAnimationData] = useState(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [emoji, setEmoji] = useState("👾");

  // Load sprite and animation data
  useEffect(() => {
    const loadSprite = async () => {
      const enemyType = enemyName?.toLowerCase().replace(/\s+/g, "_") || "default";
      const sprite = await getEnemySprite(enemyType);
      
      if (sprite) {
        setAnimationData(sprite.animationData);
        imgRef.current = new Image();
        imgRef.current.src = sprite.spriteUrl;
      } else {
        // Fallback to emoji - get from settings or use default
        const { getSetting } = await import("@/lib/gameSettings");
        const customEmoji = getSetting(`enemy_${enemyType}_emoji`, "👾");
        setEmoji(customEmoji);
      }
    };

    loadSprite();
  }, [enemyName]);

  // Animation loop
  useEffect(() => {
    if (!animationData) return;

    const frames = animationData.frames;
    const frameCount = Array.isArray(frames) ? frames.length : Object.keys(frames).length;
    
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frameCount);
    }, animationData.meta?.frameTags?.[0]?.duration || 100);

    return () => clearInterval(interval);
  }, [animationData]);

  // Draw animation frame
  useEffect(() => {
    if (!canvasRef.current || !animationData || !imgRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const frames = animationData.frames;
    const frameKeys = Array.isArray(frames) ? Object.keys(frames) : Object.keys(frames);
    const frameKey = frameKeys[currentFrame % frameKeys.length];
    const frame = frames[frameKey];

    if (!frame) return;

    canvas.width = isBoss ? 96 : 64;
    canvas.height = isBoss ? 96 : 64;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (imgRef.current.complete) {
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
  }, [animationData, currentFrame, isBoss]);

  if (animationData) {
    return <canvas ref={canvasRef} className={`${isBoss ? "w-24 h-24" : "w-16 h-16"}`} />;
  }

  return (
    <motion.div
      className={`${isBoss ? "text-6xl scale-125" : "text-4xl sm:text-5xl md:text-6xl"} drop-shadow-lg`}
      animate={{
        filter: enemyHit ? "brightness(1.8)" : "brightness(1)",
      }}
      transition={{ duration: 0.1 }}
      style={{
        animation: enemyDying
          ? "enemy-die 0.3s ease-out forwards"
          : !enemyDying
          ? "float 3s ease-in-out infinite"
          : "none",
      }}
    >
      {emoji}
    </motion.div>
  );
}