import React, { useEffect, useState, useRef } from "react";
import AnimatedSprite from "./AnimatedSprite";
import { PLAYER_SPRITES, PLAYER_BODY_A, resolveAnim } from "@/lib/sprites";

/**
 * PlayerSprite
 *
 * State-driven player animation controller.
 * Uses PLAYER_BODY_A for hit/death (clean pack sheets),
 * and PLAYER_SPRITES for idle/run/walk/attack (existing customised sheets).
 *
 * Priority (highest → lowest):
 *   death > hit > attack > run/walk > idle
 *
 * Props:
 *   isDead       {boolean}
 *   isAttacking  {boolean}
 *   isHit        {boolean}
 *   isRunning    {boolean}
 *   weaponMode   {string}   "sword" | "bow"
 *   scale        {number}   default 3
 *   flipX        {boolean}
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

  useEffect(() => {
    if (isDead) { setAnimState("death"); return; }
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
    // death holds last frame
  };

  // Resolve sheet — prefer Body_A for hit/death, PLAYER_SPRITES for everything else
  let anim = null;
  switch (animState) {
    case "death":
      anim = resolveAnim(PLAYER_BODY_A, "death") ?? resolveAnim(PLAYER_SPRITES, "death");
      break;
    case "hit":
      anim = resolveAnim(PLAYER_BODY_A, "hit") ?? resolveAnim(PLAYER_SPRITES, "hit");
      break;
    case "attack":
      anim = resolveAnim(PLAYER_SPRITES, weaponMode === "bow" ? "attack_bow" : "attack_sword");
      break;
    case "run":
      anim = resolveAnim(PLAYER_SPRITES, "run");
      break;
    default:
      anim = resolveAnim(PLAYER_SPRITES, "idle");
  }

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
