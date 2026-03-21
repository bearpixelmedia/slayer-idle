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

/** heightTier 0 = lane (hidden). Air coins sit at max-jump apex above the hero road center. */
function coinBottomStyle(coin) {
  const tier =
    typeof coin.heightTier === "number" && coin.heightTier > 0
      ? Math.min(3, Math.floor(coin.heightTier))
      : 0;
  const jitterPx =
    (typeof coin.heightJitterRem === "number" ? coin.heightJitterRem : 0) * 5;
  if (tier <= 0) return `${ROAD_CENTER_FROM_BOTTOM_PCT}%`;
  const apexPx = PLAYER_JUMP_APEX_OFFSET_PX + jitterPx;
  return `calc(${ROAD_CENTER_FROM_BOTTOM_PCT}% + ${apexPx}px)`;
}

function WorldCoins({ worldCoins, playerWorldPos = 0 }) {
  const displayWorldPos = useDisplayWorldProgress(playerWorldPos);
  const raw = Array.isArray(worldCoins) ? worldCoins : [];
  const coins = raw.filter((c) => (c?.heightTier ?? 0) > 0);

  return (
    <>
      {coins.map((coin) => {
        const gap = coin.worldPos - displayWorldPos;
        const relativeDistance = gap * PATH_GAP_TO_SCREEN_PCT;
        const screenX = PLAYER_ANCHOR_LEFT_PCT + relativeDistance;
        const leftPct = Math.max(-22, screenX);
        const opacity = Math.max(0.35, 1 - Math.abs(relativeDistance) / 160);
        const bottom = coinBottomStyle(coin);

        return (
          <div
            key={coin.id}
            data-world-coin
            data-coin-id={coin.id}
            className="absolute z-[27] flex flex-col items-center pointer-events-none will-change-[left,opacity,bottom]"
            style={{
              left: `${leftPct}%`,
              bottom,
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
    </>
  );
}

export default React.memo(WorldCoins);
