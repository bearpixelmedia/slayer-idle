import React, { useMemo } from "react";
import { formatNumber } from "@/lib/formatNumber";
import { enemyHasWeapons } from "@/lib/gameData";
import { PATH_GAP_TO_SCREEN_PCT, PLAYER_ANCHOR_LEFT_PCT } from "@/lib/combatHitboxes";
import { useCombatSlotNominalPx } from "@/hooks/useCombatSlotNominalPx";
import { useDisplayWorldProgress } from "@/hooks/useDisplayWorldProgress";
import {
  combatRowCharacterCenterOffsetPx,
  computeEnemyWeaponLayout,
} from "@/lib/weaponTriColumnLayout";
import {
  BOSS_ROW_INNER_SCALE,
  BOSS_ROW_VISUAL_LIFT_PX,
  COMBAT_GROUND_SHADOW_BOSS,
  COMBAT_GROUND_SHADOW_REGULAR,
  LANE_CLUSTER_SCALE_ORIGIN,
} from "@/lib/laneScene";
import CombatLaneEntityRoot from "./CombatLaneEntityRoot";
import EnemyRenderer from "./EnemyRenderer";
import HealthBar from "./HealthBar";

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
  const slotPx = useCombatSlotNominalPx();
  const enemyWeaponLayout = useMemo(
    () => computeEnemyWeaponLayout(Boolean(isBossActive), isBossActive ? null : slotPx),
    [isBossActive, slotPx]
  );
  const weaponRowCenterOffsetPx = useMemo(
    () => combatRowCharacterCenterOffsetPx(enemyWeaponLayout, { gaitPadding: false }),
    [enemyWeaponLayout]
  );

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
        // Only draw the current foe + one “next in line” ghost — the rest of the pack stays off-screen
        // until it becomes active (avoids a crowd that looked like extra parallax layers).
        if (!isBossActive) {
          const isNextInPack = idx === currentIndex + 1;
          if (idx !== currentIndex && !isNextInPack) return null;
        }

        // Screen X shares the player anchor (PLAYER_ANCHOR_LEFT_PCT). Path gap maps to horizontal
        // offset so the enemy visibly approaches as worldProgress catches up (was 85 + … which
        // left the enemy stuck on the right while the player never "met" them).
        const gap = enemy.worldPos - displayWorldPos;
        const relativeDistance = gap * PATH_GAP_TO_SCREEN_PCT;
        const screenX = PLAYER_ANCHOR_LEFT_PCT + relativeDistance;
        const isActive = idx === currentIndex;
        const isNextPreview = !isBossActive && idx === currentIndex + 1;
        /** Weaponless rigs are single-column; only weapon-row enemies need center correction. */
        const enemyCharacterCenterOffsetPx = enemyHasWeapons(enemy.name) ? weaponRowCenterOffsetPx : 0;
        // Same opacity as the active foe — low alpha read as a separate parallax layer; use brightness instead.
        const scale = 1;
        const opacity = 1;
        // No upper clamp: far-ahead enemies sit past the viewport; canvas overflow-hidden clips them until you close in.
        const leftPct = Math.max(-22, screenX);
        
        return (
        <CombatLaneEntityRoot
          key={enemy.id ?? `${enemy.worldPos}-${idx}`}
          anchorLeftPct={leftPct}
          className="will-change-[left,opacity,transform]"
          style={{
            opacity,
            transform: `scale(${scale})`,
            transformOrigin: LANE_CLUSTER_SCALE_ORIGIN,
            filter: isNextPreview ? "brightness(0.88) saturate(0.92)" : undefined,
          }}
        >
          {idx === currentIndex && (
            <div
              className="absolute bottom-full z-10 mb-2 w-max max-w-[min(92vw,220px)] -translate-x-1/2 text-center"
              style={{ left: `calc(50% + ${enemyCharacterCenterOffsetPx}px)` }}
            >
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
          <div
            className="relative"
            style={
              isBossActive && isActive
                ? {
                    transform: `scale(${BOSS_ROW_INNER_SCALE}) translateY(${BOSS_ROW_VISUAL_LIFT_PX}px)`,
                    transformOrigin: LANE_CLUSTER_SCALE_ORIGIN,
                  }
                : undefined
            }
          >
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
            />
            <div
              className={
                isBossActive && isActive ? COMBAT_GROUND_SHADOW_BOSS : COMBAT_GROUND_SHADOW_REGULAR
              }
              style={{ left: `calc(50% + ${enemyCharacterCenterOffsetPx}px)` }}
            />
          </div>
        </CombatLaneEntityRoot>
      );
      })}
    </>
  );
}

export default React.memo(EnemyCluster);