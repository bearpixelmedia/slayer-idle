import React from "react";
import { loadGameSettings } from "@/lib/gameSettings";
import AnimatedSprite from "./AnimatedSprite";

/**
 * PlayerSprite
 * Renders the player character either as a sprite sheet or emoji fallback.
 *
 * Props:
 *   isDead       — show death state
 *   isAttacking  — show attack state
 *   isHit        — flash when taking damage
 *   isRunning    — default idle/run animation
 *   weaponMode   — "sword" | "bow"
 *   scale        — display scale multiplier
 *   flipX        — mirror horizontally
 */
export default function PlayerSprite({
  isDead = false,
  isAttacking = false,
  isHit = false,
  isRunning = true,
  weaponMode = "sword",
  scale = 2,
  flipX = false,
}) {
  const settings = loadGameSettings();
  const spriteUrl = weaponMode === "bow" ? settings?.player_bow : settings?.player_sword;

  if (spriteUrl) {
    return (
      <AnimatedSprite
        url={spriteUrl}
        frameSize={32}
        frames={4}
        fps={8}
        loop={true}
        playing={!isDead}
        scale={scale}
        flipX={flipX}
        style={{
          filter: isHit ? "brightness(3)" : isDead ? "grayscale(1) opacity(0.5)" : undefined,
          transition: "filter 0.1s",
        }}
      />
    );
  }

  // Emoji fallback
  const emoji = weaponMode === "bow" ? "🧝" : "🤴";
  const size = 32 * scale;

  return (
    <span
      style={{
        fontSize: size * 0.75,
        lineHeight: 1,
        display: "inline-block",
        filter: isHit ? "brightness(3)" : isDead ? "grayscale(1) opacity(0.5)" : undefined,
        transition: "filter 0.1s",
        imageRendering: "pixelated",
      }}
      aria-hidden
    >
      {emoji}
    </span>
  );
}