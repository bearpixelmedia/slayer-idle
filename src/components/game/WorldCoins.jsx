import React, { useEffect, useState } from "react";
import {
  ROAD_CENTER_FROM_BOTTOM_PCT,
  PATH_GAP_TO_SCREEN_PCT,
  PLAYER_ANCHOR_LEFT_PCT,
} from "@/lib/combatHitboxes";
import { PLAYER_JUMP_APEX_OFFSET_PX } from "@/lib/playerJumpPhysics";

/** Matches EnemyCluster — visual path position. */
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

/** heightTier 0 = lane (hidden). All air coins share one path parallax plane + one jump-apex height. */
const AIR_COIN_BOTTOM = `calc(${ROAD_CENTER_FROM_BOTTOM_PCT}% + ${PLAYER_JUMP_APEX_OFFSET_PX}px)`;

function WorldCoins({ worldCoins, playerWorldPos = 0 }) {
  const displayWorldPos = useDisplayWorldProgress(playerWorldPos);
  const raw = Array.isArray(worldCoins) ? worldCoins : [];
  const coins = raw.filter((c) => (c?.heightTier ?? 0) > 0);

  return (
    <div className="absolute inset-0 z-[27] pointer-events-none">
      {coins.map((coin) => {
        const gap = coin.worldPos - displayWorldPos;
        const relativeDistance = gap * PATH_GAP_TO_SCREEN_PCT;
        const screenX = PLAYER_ANCHOR_LEFT_PCT + relativeDistance;
        const leftPct = Math.max(-22, screenX);
        const opacity = Math.max(0.35, 1 - Math.abs(relativeDistance) / 160);

        return (
          <div
            key={coin.id}
            data-world-coin
            data-coin-id={coin.id}
            className="absolute flex flex-col items-center will-change-[left,opacity]"
            style={{
              left: `${leftPct}%`,
              bottom: AIR_COIN_BOTTOM,
              opacity,
            }}
          >
            <span
              className="select-none text-xl sm:text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)]"
              aria-hidden
            >
              🪙
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default React.memo(WorldCoins);
