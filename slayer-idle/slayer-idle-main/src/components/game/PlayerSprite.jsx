import React, { useEffect, useState, useRef } from "react";
import AnimatedSprite from "./AnimatedSprite";
import { PLAYER_SPRITES, resolveAnim } from "@/lib/sprites";

/**
 * PlayerSprite
 *
 * State-driven player animation controller.
 * Picks the correct sheet+animation based on game state.
 *
 * Priority (highest → lowest):
 *   death > hit > attack > run/walk > idle
 *
 * Props:
 *   isDead       {boolean}
 *   isAttacking  {boolean}  — set true for one swing, auto-clears
 *   isHit        {boolean}  — flash when player takes damage
 *   isRunning    {boolean}  — moving forward
 *   weaponMode   {string}   — "sword" | "bow"
 *   scale        {number}   — display scale (default: 3)
 *   flipX        {boolean}  — face left
 *   style        {object}
 *   className    {string}
 */
export default function PlayerSprite({
  isDead = false,
  isAttacking = false,
  isHit = false,
  isRunning = true,
  weaponMode = "sword",
  scale = 3,
  flipX = false,
  style,
  className,
}) {
  const [animState, setAnimState] = useState("run");
  const attackPendingRef = useRef(false);
  const hitPendingRef = useRef(false);

  // Determine current animation priority
  useEffect(() => {
    if (isDead) {
      setAnimState("death");
      return;
    }
    if (isHit && !hitPendingRef.current) {
      hitPendingRef.current = true;
      setAnimState("hit");
      return;
    }
    if (isAttacking && !attackPendingRef.current) {
      attackPendingRef.current = true;
      setAnimState("attack");
      return;
    }
    if (!isDead && !isHit && !isAttacking) {
      setAnimState(isRunning ? "run" : "idle");
    }
  }, [isDead, isAttacking, isHit, isRunning]);

  const handleComplete = () => {
    if (animState === "attack") {
      attackPendingRef.current = false;
      setAnimState(isRunning ? "run" : "idle");
    }
    if (animState === "hit") {
      hitPendingRef.current = false;
      setAnimState(isRunning ? "run" : "idle");
    }
    // death holds last frame — do nothing
  };

  // Resolve which sheet to use
  let sheetKey;
  switch (animState) {
    case "death":  sheetKey = "death"; break;
    case "hit":    sheetKey = "hit"; break;
    case "attack": sheetKey = weaponMode === "bow" ? "attack_bow" : "attack_sword"; break;
    case "run":    sheetKey = "run"; break;
    default:       sheetKey = "idle";
  }

  const anim = resolveAnim(PLAYER_SPRITES, sheetKey);
  if (!anim) return null;

  return (
    <AnimatedSprite
      url={anim.url}
      frameW={anim.frameW}
      frameH={anim.frameH}
      frames={anim.frames}
      fps={anim.fps}
      loop={anim.loop}
      playing={true}
      scale={scale}
      flipX={flipX}
      onComplete={handleComplete}
      style={style}
      className={className}
    />
  );
}
