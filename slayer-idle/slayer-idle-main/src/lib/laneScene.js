/**
 * Lane / scene placement: shared road baseline, z-order, and per-entity vertical tweaks.
 * Combat path math stays in combatHitboxes.js; this module is the single place for “where on screen” lane rules.
 */

/**
 * Feet baseline (% from viewport bottom). Player + enemy row roots pin their stack bottom here.
 * ParallaxShrubOverlay tops out ~25% from bottom; keep this at/above that so the lane sits on the
 * pale path band, not in the shrub strip.
 */
export const ROAD_FEET_LINE_FROM_BOTTOM_PCT = 24;

/** @deprecated Alias — old name implied vertical center. */
export const ROAD_CENTER_FROM_BOTTOM_PCT = ROAD_FEET_LINE_FROM_BOTTOM_PCT;

/** @deprecated Use ROAD_FEET_LINE_FROM_BOTTOM_PCT */
export const CHARACTER_BASELINE_BOTTOM_PCT = ROAD_FEET_LINE_FROM_BOTTOM_PCT;

/** Back-to-front: shrubs (behind trees in parallax bg), then lane stack. */
export const Z_SHRUB_OVERLAY = 5;
export const Z_COMBAT_ROW = 30;
/** Air path coins: same z as combat so they sit in the lane layer (below player/enemy by paint order). */
export const Z_WORLD_COINS = Z_COMBAT_ROW;

/**
 * Flat ground shadow under lane combatants — one visual for hero + enemies.
 * Position with `left: calc(50% + ${characterCenterOffset}px)` to match body column.
 */
export const COMBAT_GROUND_SHADOW_REGULAR =
  "absolute -bottom-6 w-20 -translate-x-1/2 h-1 bg-black/30 rounded-full blur-sm";

/** Boss row: wider ellipse only; height, opacity, and blur match the player. */
export const COMBAT_GROUND_SHADOW_BOSS =
  "absolute -bottom-6 w-40 -translate-x-1/2 h-1 bg-black/30 rounded-full blur-sm";

/**
 * Shared hitbox shell for player + non-boss enemies (weapon-row mode). One class string so slot
 * size tracks the same Tailwind breakpoints as `combatSlotNominal` / `computeEnemyWeaponLayout`.
 */
export const COMBAT_HITBOX_SLOT_CLASS =
  "relative z-0 box-border flex h-16 w-16 shrink-0 flex-col justify-end items-center overflow-visible sm:h-20 sm:w-20 md:h-24 md:w-24";

/** Non-boss enemy, weapons hidden: row flex (no flex-col). */
export const COMBAT_HITBOX_SLOT_ROW_CLASS =
  "relative z-10 box-border flex h-16 w-16 shrink-0 items-end justify-center sm:h-20 sm:w-20 md:h-24 md:w-24";

/** Boss encounter slot — matches EnemyWeaponRig boss branch. */
export const COMBAT_HITBOX_BOSS_CLASS =
  "relative z-10 box-border flex h-36 w-36 shrink-0 flex-col justify-end items-center sm:h-40 sm:w-40 md:h-44 md:w-44";

/** Boss, weapons-off row (HitboxWithIdle flexCol false). */
export const COMBAT_HITBOX_BOSS_ROW_CLASS =
  "relative z-10 box-border flex h-36 w-36 shrink-0 items-end justify-center sm:h-40 sm:w-40 md:h-44 md:w-44";

/**
 * Player-only translateY inside the jump stack. Negative pulls art up when glyph feet sit low in the box.
 */
export const PLAYER_FEET_VISUAL_ALIGN_PX = -10;

export const LANE_CLUSTER_SCALE_ORIGIN = "bottom center";

/** Inner scale for boss row (applied at feet). */
export const BOSS_ROW_INNER_SCALE = 1.48;

/**
 * Whole boss rig nudge (px) after scale, origin bottom-center. Positive moves the rig down on screen
 * (feet toward the path); negative moves up. Tree / tall sprites were reading mid-air vs the lane.
 */
export const BOSS_ROW_VISUAL_LIFT_PX = 18;

/**
 * translateY(px) inside hitbox, outside idle keyframes. Negative = up; positive = down vs road line.
 */
const ENEMY_FEET_VISUAL_ALIGN_PX = {
  Zombie: -10,
  Skeleton: -6,
  Orc: -6,
  Ogre: -8,
  Goblin: 0,
  Ghost: 6,
  Pixie: 6,
  Sprite: 6,
  Fairy: 6,
  Genie: 4,
  Sorceress: 4,
  Sorcerer: 4,
  Mage: 4,
};

export function getEnemyFeetVisualAlignPx(enemyName) {
  if (!enemyName) return 0;
  return ENEMY_FEET_VISUAL_ALIGN_PX[enemyName] ?? 0;
}

/** Body art scale inside the shared combat slot — kept at 1 so enemies match the hero slot size. */
export function getLaneEnemyBodyScale() {
  return 1;
}

/** For inline style on wrappers; omit when 0. */
export function feetAlignInlineStyle(px) {
  if (px == null || Number(px) === 0) return undefined;
  return {
    transform: `translateY(${px}px)`,
    transformOrigin: "bottom center",
  };
}