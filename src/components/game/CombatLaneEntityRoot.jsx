import React from "react";
import {
  ROAD_FEET_LINE_FROM_BOTTOM_PCT,
  Z_COMBAT_ROW,
} from "@/lib/laneScene";

/**
 * Absolute anchor for any combat row entity (player, enemy cluster slot).
 * Pass extra `style` for cluster distance scale, opacity, etc.
 */
function CombatLaneEntityRoot({ anchorLeftPct, children, className = "", style = {} }) {
  return (
    <div
      className={`absolute ${className}`.trim()}
      style={{
        left: `${anchorLeftPct}%`,
        bottom: `${ROAD_FEET_LINE_FROM_BOTTOM_PCT}%`,
        zIndex: Z_COMBAT_ROW,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default React.memo(CombatLaneEntityRoot);
