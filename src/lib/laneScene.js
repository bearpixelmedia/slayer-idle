// Lane scene layout constants — positioning, z-indices, ground shadows, slot sizing

// ── Vertical anchor lines ────────────────────────────────────────────────────
/** Road feet line: characters stand here (% from viewport bottom) */
export const ROAD_FEET_LINE_FROM_BOTTOM_PCT = 22;
/** Slightly above feet — visual centre of the road lane */
export const ROAD_CENTER_FROM_BOTTOM_PCT = 26;
/** Character baseline used by enemy / player shadow centering */
export const CHARACTER_BASELINE_BOTTOM_PCT = ROAD_FEET_LINE_FROM_BOTTOM_PCT;

// ── Z-indices ────────────────────────────────────────────────────────────────
export const Z_COMBAT_ROW   = 20;
export const Z_SHRUB_OVERLAY = 30;
export const Z_WORLD_COINS  = 25;

// ── Hitbox slot Tailwind classes ─────────────────────────────────────────────
export const COMBAT_HITBOX_SLOT_CLASS     = "relative flex items-end justify-center overflow-visible w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24";
export const COMBAT_HITBOX_SLOT_ROW_CLASS = "relative flex items-end justify-center overflow-visible w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24";
export const COMBAT_HITBOX_BOSS_CLASS     = "relative flex items-end justify-center overflow-visible w-36 h-36 sm:w-40 sm:h-40";
export const COMBAT_HITBOX_BOSS_ROW_CLASS = "relative flex items-end justify-center overflow-visible w-36 h-36 sm:w-40 sm:h-40";

// ── Lane / cluster helpers ───────────────────────────────────────────────────
export const LANE_CLASS = "relative flex items-end justify-between w-full h-full overflow-visible";
export const PLAYER_SLOT_CLASS = "flex items-end justify-center overflow-visible";
export const ENEMY_SLOT_CLASS  = "flex items-end justify-center overflow-visible";

/** transform-origin for boss / cluster scale animations */
export const LANE_CLUSTER_SCALE_ORIGIN = "bottom center";

// ── Boss row sizing ──────────────────────────────────────────────────────────
/** Visual scale applied to the boss entity row so it reads larger than normal enemies */
export const BOSS_ROW_INNER_SCALE = 1.3;
/** Upward translation (px) that keeps the boss feet on the road line after scaling */
export const BOSS_ROW_VISUAL_LIFT_PX = -12;

// ── Ground shadow classes ────────────────────────────────────────────────────
export const COMBAT_GROUND_SHADOW_REGULAR =
  "absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-2 rounded-full bg-black/30 blur-[3px] pointer-events-none";
export const COMBAT_GROUND_SHADOW_BOSS =
  "absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-3 rounded-full bg-black/40 blur-[5px] pointer-events-none";

// ── Player visual alignment ──────────────────────────────────────────────────
/** Feet nudge (px) so the player's optical baseline aligns with ROAD_FEET_LINE */
export const PLAYER_FEET_VISUAL_ALIGN_PX = 0;

/** Per-enemy feet nudge lookup (px) — positive shifts sprite upward */
const ENEMY_FEET_ALIGN = {
  Spider: 6,
  Bat: 10,
  Ghost: 8,
  Vampire: 4,
};

export function getEnemyFeetVisualAlignPx(enemyName) {
  return ENEMY_FEET_ALIGN[enemyName] ?? 0;
}

/** Inline style helper that applies the feet-align nudge as a translateY */
export function feetAlignInlineStyle(px) {
  if (!px) return {};
  return { transform: `translateY(${px}px)` };
}