import React, { useRef } from "react";
import ParallaxBackground from "./ParallaxBackground";
import EnemyCluster from "./EnemyCluster";
import PlayerDisplay from "./PlayerDisplay";
import FloatingElements from "./FloatingElements";
import WorldCoins from "./WorldCoins";
import { loadGameSettings } from "@/lib/gameSettings";
import { ROAD_FEET_LINE_FROM_BOTTOM_PCT } from "@/lib/laneScene";

export default function GameCanvas({
  state,
  enemyDying,
  floatingCoins,
  floatingSouls,
  floatingDamage,
  particles,
  slashEffects,
  onTap,
  attackTick,
  enemyHit,
  playerHit,
  weaponMode,
  tickWorldCoinCollection,
  onWorldCoinPickup,
  onJump,
}) {
  if (!state) return null;

  const enemyHitboxRef = useRef(null);
  const enemyCombatGlyphRef = useRef(null);
  const playerHitboxRef = useRef(null);
  const combatGlyphRef = useRef(null);

  const gameSettings = loadGameSettings();

  const handleTap = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    onTap?.(e.clientX - rect.left, e.clientY - rect.top);
  };

  return (
    <div
      className="relative flex-1 w-full overflow-hidden cursor-pointer select-none"
      style={{ minHeight: 0, paddingTop: "2.5rem" }}
      onClick={handleTap}
    >
      {/* Parallax background */}
      <div className="absolute inset-0">
        <ParallaxBackground />
      </div>

      {/* Road feet line + combat row */}
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{ bottom: `${ROAD_FEET_LINE_FROM_BOTTOM_PCT}%` }}
      >
        {/* Ground line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/5" />
      </div>

      {/* Combat entities */}
      <div className="absolute inset-0 pointer-events-none overflow-visible">
        <EnemyCluster
          cluster={state.enemyCluster}
          currentIndex={state.currentClusterIndex ?? 0}
          isBossActive={state.isBossActive}
          enemyHP={state.enemyHP}
          enemyMaxHP={state.enemyMaxHP}
          currentEnemyName={state.currentEnemyName}
          enemyHit={enemyHit}
          enemyDying={enemyDying}
          boss={state.currentBoss}
          shieldActive={state.shieldActive}
          playerWorldPos={state.worldProgress}
          nextEnemyWorldPos={state.nextEnemyWorldPos}
          enemyHitboxRef={enemyHitboxRef}
          enemyCombatGlyphRef={enemyCombatGlyphRef}
          playerHit={playerHit}
        />

        <PlayerDisplay
          playerHP={state.playerHP ?? state.maxPlayerHP ?? 100}
          playerMaxHP={state.maxPlayerHP ?? 100}
          enemyHit={enemyHit}
          playerHit={playerHit}
          weaponMode={weaponMode}
          gameSettings={gameSettings}
          attackTick={attackTick}
          playerHitboxRef={playerHitboxRef}
          combatGlyphRef={combatGlyphRef}
        />
      </div>

      {/* World coins */}
      {tickWorldCoinCollection && (
        <WorldCoins
          worldCoins={state.worldCoins}
          playerWorldPos={state.worldProgress}
          onCollect={onWorldCoinPickup}
          tickCollection={tickWorldCoinCollection}
        />
      )}

      {/* Floating text (damage, coins, souls) */}
      <FloatingElements
        floatingCoins={floatingCoins}
        floatingSouls={floatingSouls}
        floatingDamage={floatingDamage}
        particles={particles}
        slashEffects={slashEffects}
      />

      {/* Tap hint when no enemies */}
      {!state.currentEnemyName && (
        <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 pointer-events-none">
          <p className="font-pixel text-[9px] text-white/40">TAP TO ATTACK</p>
        </div>
      )}
    </div>
  );
}