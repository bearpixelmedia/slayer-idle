import React, { useEffect, useState, useMemo } from "react";
import { formatNumber } from "@/lib/formatNumber";
import {
  ROAD_CENTER_FROM_BOTTOM_PCT,
  PATH_GAP_TO_SCREEN_PCT,
  PLAYER_ANCHOR_LEFT_PCT,
} from "@/lib/combatHitboxes";
import EnemyRenderer from "./EnemyRenderer";
import HealthBar from "./HealthBar";

/** Matches ParallaxBackground RAF lerp — visual path position, not gameplay `worldProgress`. */
function useDisplayWorldProgress(gameWorldProgress) {
  const [display, setDisplay] = useState(gameWorldProgress);
  useEffect(() => {
    let id;
    const tick = () => {
      const w =
        typeof window !== "undefined" && typeof window.__gameDisplayWorldProgress === "number"
          ? window.__gameDisplayWorldProgress
          : gameWorldProgress;
      setDisplay(w);
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [gameWorldProgress]);
  return display;
}

function EnemyCluster({
  cluster,
  currentIndex,
  isBossActive,
  enemyHP,
  enemyMaxHP,
  currentEnemyName,
  enemyHit,
  enemyDying,
  boss,
  shieldActive,
  playerWorldPos = 0,
  nextEnemyWorldPos,
  enemyHitboxRef,
  enemyCombatGlyphRef,
  playerHit = false,
}) {
  const displayWorldPos = useDisplayWorldProgress(playerWorldPos);

  /** Boss fights clear `enemyCluster`; synthetic row only when there is no cluster (same as gameplay). */
  const enemiesToRender = useMemo(() => {
    const safeCluster = Array.isArray(cluster) ? cluster : [];
    if (isBossActive && safeCluster.length === 0) {
      const pos =
        typeof nextEnemyWorldPos === "number" && Number.isFinite(nextEnemyWorldPos)
          ? nextEnemyWorldPos
          : Number.isFinite(playerWorldPos)
            ? playerWorldPos
            : 0;
      return [
        {
          id: "__boss__",
          worldPos: pos,
          name: currentEnemyName || boss?.name || "Boss",
        },
      ];
    }
    return safeCluster;
  }, [isBossActive, cluster, nextEnemyWorldPos, currentEnemyName, boss?.name, playerWorldPos]);

  return (
    <>
      {enemiesToRender.map((enemy, idx) => {
        // Screen X shares the player anchor (PLAYER_ANCHOR_LEFT_PCT). Path gap maps to horizontal
        // offset so the enemy visibly approaches as worldProgress catches up (was 85 + … which
        // left the enemy stuck on the right while the player never "met" them).
        const gap = enemy.worldPos - displayWorldPos;
        const relativeDistance = gap * PATH_GAP_TO_SCREEN_PCT;
        const screenX = PLAYER_ANCHOR_LEFT_PCT + relativeDistance;
        const isActive = idx === currentIndex;
        const spiderMul = enemy.name === "Spider" ? 0.66 : 1;
        const scale =
          spiderMul *
          (isActive ? 1 : 0.7 + (0.3 * Math.max(0, 1 - Math.abs(relativeDistance) / 100)));
        const opacity = isActive ? 1 : Math.max(0.2, 1 - Math.abs(relativeDistance) / 150);
        // No upper clamp: far-ahead enemies sit past the viewport; canvas overflow-hidden clips them until you close in.
        const leftPct = Math.max(-22, screenX);
        
        return (
        <div 
          key={enemy.id ?? `${enemy.worldPos}-${idx}`}
          className="absolute z-[28] will-change-[left,opacity,transform]"
          style={{
            left: `${leftPct}%`,
            top: `calc(100% - ${ROAD_CENTER_FROM_BOTTOM_PCT}%)`,
            opacity,
            transform: `translateY(-50%) scale(${scale})`,
            transformOrigin: "center center",
          }}
        >
          {idx === currentIndex && (
            <div className="absolute left-1/2 bottom-full z-10 mb-1 w-max max-w-[min(92vw,220px)] -translate-x-1/2 text-center">
              {isBossActive && (
                <p className="font-pixel text-[8px] text-red-400 mb-1 animate-pulse">⚔️ BOSS ENCOUNTER ⚔️</p>
              )}
              <p className="font-pixel text-[7px] sm:text-[8px] text-foreground/80 mb-1">{currentEnemyName}</p>
              <HealthBar current={enemyHP} max={enemyMaxHP} isBoss={isBossActive} />
              <p className="font-pixel text-[6px] text-muted-foreground mt-0.5">
                {formatNumber(enemyHP)} / {formatNumber(enemyMaxHP)}
              </p>
            </div>
          )}
          <div className="relative">
            <EnemyRenderer
              key={enemy.id ?? `e-${enemy.worldPos}-${idx}`}
              enemyName={enemy.name}
              instanceId={enemy.id}
              enemyHit={enemyHit && idx === currentIndex}
              enemyDying={enemyDying && idx === currentIndex}
              isBoss={isBossActive}
              bossId={isBossActive ? boss?.id : undefined}
              bossIcon={isBossActive ? boss?.icon : undefined}
              enemyHitboxRef={isActive ? enemyHitboxRef : undefined}
              enemyCombatGlyphRef={isActive ? enemyCombatGlyphRef : undefined}
              playerHit={playerHit && idx === currentIndex}
              enemyScreenLeftPct={leftPct}
              playerScreenLeftPct={PLAYER_ANCHOR_LEFT_PCT}
            />
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-24 h-2 bg-black/25 rounded-full blur-md" />
          </div>
        </div>
      );
      })}
    </>
  );
}

export default React.memo(EnemyCluster);