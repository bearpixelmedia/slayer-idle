import React, { useRef, useCallback } from "react";
import { getEnemyFeetVisualAlignPx } from "@/lib/laneScene";
import { enemyHasWeapons, getEnemyIdleAnimClass } from "@/lib/gameData";
import { EnemyWeaponRig } from "./EnemyWeaponRig";
import EnemySprite from "./EnemySprite";

function assignRef(ref, node) {
  if (ref == null) return;
  if (typeof ref === "function") ref(node);
  else ref.current = node;
}

/**
 * EnemyRenderer
 *
 * Renders an enemy using the sprite animation system.
 * Keeps the same external API so EnemyCluster / GameCanvas work unchanged.
 *
 * Props:
 *   enemyName          {string}   — e.g. "Orc", "Skeleton"
 *   enemyHit           {boolean}  — enemy was just hit (used by weapon rig)
 *   enemyDying         {boolean}  — play death animation
 *   isBoss             {boolean}
 *   bossId             {string}
 *   bossIcon           {string}   — (kept for API compat, unused)
 *   enemyHitboxRef     {ref}      — attached to hitbox slot
 *   enemyCombatGlyphRef{ref}      — attached to visible sprite element
 *   playerHit          {boolean}  — player was just hit (weapon rig state)
 *   instanceId         {string}   — stable ID for variant hashing (unused for sprites)
 */
export default function EnemyRenderer({
  enemyName,
  enemyHit,
  enemyDying,
  isBoss,
  bossId,
  bossIcon,
  enemyHitboxRef,
  enemyCombatGlyphRef,
  playerHit = false,
  instanceId,
}) {
  const showWeapons = enemyHasWeapons(enemyName);
  // During death animation, suppress the idle walk animation class
  const idleAnimClass = enemyDying ? "" : getEnemyIdleAnimClass(enemyName);
  const feetVisualAlignPx = isBoss ? 0 : getEnemyFeetVisualAlignPx(enemyName);

  const spriteWrapperRef = useRef(null);
  const setSpriteRef = useCallback(
    (node) => {
      spriteWrapperRef.current = node;
      assignRef(enemyCombatGlyphRef, node);
    },
    [enemyCombatGlyphRef]
  );

  // Boss scale is larger than regular enemy scale
  const spriteScale = isBoss ? 4 : 3;

  return (
    <EnemyWeaponRig
      enemyHit={enemyHit}
      enemyDying={enemyDying}
      playerHit={playerHit}
      enemyHitboxRef={enemyHitboxRef}
      isBoss={isBoss}
      showWeapons={showWeapons}
      idleAnimClass={idleAnimClass}
      feetVisualAlignPx={feetVisualAlignPx}
    >
      {/* Wrapper div gets the combat glyph ref for hitbox measurement */}
      <div ref={setSpriteRef} style={{ display: "inline-flex", alignItems: "flex-end" }}>
        <EnemySprite
          enemyName={enemyName}
          isDying={enemyDying}
          isRunning={!enemyDying}
          scale={spriteScale}
          flipX={true}
          hitFlash={enemyHit}
        />
      </div>
    </EnemyWeaponRig>
  );
}
