import React, { useEffect, useState, useRef } from "react";
import AnimatedSprite from "./AnimatedSprite";
import { getEnemySprites, resolveAnim } from "@/lib/sprites";

/**
 * EnemySprite
 *
 * State-driven enemy animation controller.
 * Resolves sprite set from enemy name, then picks the right animation.
 *
 * Priority: death > run > idle
 * (enemies don't have a hit flash in this pack — we handle that with a CSS filter instead)
 *
 * Props:
 *   enemyName  {string}   — matches ENEMY_SPRITE_MAP keys (e.g. "Orc", "Skeleton")
 *   isDying    {boolean}  — play death anim once
 *   isRunning  {boolean}  — approaching player (default: true)
 *   scale      {number}   — display scale (default: 3)
 *   flipX      {boolean}  — face left (default: true — enemies face the player)
 *   hitFlash   {boolean}  — white flash on damage hit
 *   style      {object}
 *   className  {string}
 *   onDeathComplete {function} — called when death anim finishes
 */
export default function EnemySprite({
  enemyName,
  isDying = false,
  isRunning = true,
  scale = 3,
  flipX = true,
  hitFlash = false,
  style,
  className,
  onDeathComplete,
}) {
  const [animState, setAnimState] = useState("run");
  const dyingStartedRef = useRef(false);
  const onDeathRef = useRef(onDeathComplete);
  onDeathRef.current = onDeathComplete;

  useEffect(() => {
    if (isDying && !dyingStartedRef.current) {
      dyingStartedRef.current = true;
      setAnimState("death");
      return;
    }
    if (!isDying) {
      dyingStartedRef.current = false;
      setAnimState(isRunning ? "run" : "idle");
    }
  }, [isDying, isRunning]);

  const handleComplete = () => {
    if (animState === "death") {
      onDeathRef.current?.();
    }
  };

  const spriteSet = getEnemySprites(enemyName);
  const anim = resolveAnim(spriteSet, animState);

  // Fallback: if this state has no sheet (e.g. no death sheet), try idle
  const fallbackAnim = anim ?? resolveAnim(spriteSet, "idle");
  if (!fallbackAnim) return null;

  const hitFlashStyle = hitFlash
    ? { filter: "brightness(0) invert(1)", transition: "filter 0.05s" }
    : { filter: "none", transition: "filter 0.15s" };

  return (
    <AnimatedSprite
      url={fallbackAnim.url}
      frameSize={fallbackAnim.frameSize}
      frames={fallbackAnim.frames}
      fps={fallbackAnim.fps}
      loop={fallbackAnim.loop}
      playing={true}
      scale={scale}
      flipX={flipX}
      onComplete={handleComplete}
      style={{ ...hitFlashStyle, ...style }}
      className={className}
    />
  );
}
