import React from "react";
import { PATH_GAP_TO_SCREEN_PCT, PLAYER_ANCHOR_LEFT_PCT } from "@/lib/combatHitboxes";
import { useDisplayWorldProgress } from "@/hooks/useDisplayWorldProgress";
import { ROAD_FEET_LINE_FROM_BOTTOM_PCT, Z_COMBAT_ROW } from "@/lib/laneScene";
import { PLAYER_JUMP_APEX_OFFSET_PX } from "@/lib/playerJumpPhysics";
import { PixelCoin } from "@/components/game/PixelCoin";

/** heightTier 0 = lane (hidden). Z + scroll match combat lane. */
const AIR_COIN_BOTTOM = `calc(${ROAD_FEET_LINE_FROM_BOTTOM_PCT}% + ${PLAYER_JUMP_APEX_OFFSET_PX}px)`;

function WorldCoins({ worldCoins, playerWorldPos = 0 }) {
  const gameWp = Number.isFinite(playerWorldPos) ? playerWorldPos : 0;
  const displayWorldPos = useDisplayWorldProgress(gameWp);
  const raw = Array.isArray(worldCoins) ? worldCoins : [];
  const coins = raw.filter((c) => (c?.heightTier ?? 0) > 0);

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: Z_COMBAT_ROW }}
    >
      {coins.map((coin) => {
        const gap = coin.worldPos - displayWorldPos;
        const relativeDistance = gap * PATH_GAP_TO_SCREEN_PCT;
        const screenX = PLAYER_ANCHOR_LEFT_PCT + relativeDistance;
        const leftPct = Math.max(-22, screenX);

        return (
          <div
            key={coin.id}
            data-world-coin
            data-coin-id={coin.id}
            className="absolute flex flex-col items-center will-change-[left]"
            style={{
              left: `${leftPct}%`,
              bottom: AIR_COIN_BOTTOM,
            }}
          >
            <span
              className="select-none text-xl sm:text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)]"
              aria-hidden
            >
              <PixelCoin size={10} className="inline-block align-middle" />
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default React.memo(WorldCoins);
