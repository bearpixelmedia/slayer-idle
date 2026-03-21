/**
 * 1D combat along the world path: `worldProgress` vs `enemy.worldPos`.
 * Each side has a half-width toward the other; when the gap between anchors is at most
 * playerHalf + enemyHalf, combat / mutual auto-attack engages.
 *
 * `PATH_GAP_TO_SCREEN_PCT`: path gap units → horizontal % between anchors (see EnemyCluster).
 * GameCanvas measures the visible character face (`window.__combat*HalfWorldGlyph` from emoji /
 * canvas nodes) when available; otherwise slot hitboxes (`__combat*HalfWorld`) with
 * `MEASURED_HITBOX_SCALE`. Fallback: HITBOX.
 * Coin pickup uses 2D overlap of player vs coin DOM rects (`data-world-coin`), not this 1D model.
 */
export const PATH_GAP_TO_SCREEN_PCT = 2.5;
/** Horizontal anchor for player / path-origin (% from left). Nudged left so the lane sits in the bush-heavy side of the frame. */
export const PLAYER_ANCHOR_LEFT_PCT = 14;

/**
 * Vertical center of the walkable road band (% of canvas height, measured from bottom).
 * Parallax: ground strip bottom 18%; front tree bases ~25% from bottom; shrub band from ~72% top.
 * Player / enemy stacks are centered on this line (see PlayerDisplay / EnemyCluster).
 */
export const ROAD_CENTER_FROM_BOTTOM_PCT = 28;

/** @deprecated Use ROAD_CENTER_FROM_BOTTOM_PCT — kept for any external references. */
export const CHARACTER_BASELINE_BOTTOM_PCT = ROAD_CENTER_FROM_BOTTOM_PCT;

/** Bow streak start height (% from bottom): slightly above body center so the arc reads from hands. */
export const BOW_ORIGIN_LEFT_PCT = PLAYER_ANCHOR_LEFT_PCT + 2.5;
export const BOW_ORIGIN_BOTTOM_PCT = ROAD_CENTER_FROM_BOTTOM_PCT + 6;

export const HITBOX = {
  playerHalfWidth: 0.48,
  enemyHalfWidth: 0.52,
};

/**
 * `getBoundingClientRect()` on the character wrappers is wider than the art (padding, flex,
 * run animation, emoji line boxes). Scale measured path half-widths down so contact matches
 * what you see; raise toward 1 if range feels too short (combat only when sprites overlap).
 */
export const MEASURED_HITBOX_SCALE = 0.68;

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

function readHalfWorld(key, fallback) {
  if (typeof window === "undefined") return fallback;
  const v = window[key];
  if (typeof v === "number" && Number.isFinite(v) && v > 0) {
    return clamp(v * MEASURED_HITBOX_SCALE, 0.04, 6);
  }
  return fallback;
}

/** Half-width along the path, derived from measured on-screen width: (widthPct/2) / PATH_GAP_TO_SCREEN_PCT */
export function getPlayerHalfWidthWorld() {
  if (
    typeof window !== "undefined" &&
    typeof window.__combatPlayerHalfWorldGlyph === "number" &&
    Number.isFinite(window.__combatPlayerHalfWorldGlyph) &&
    window.__combatPlayerHalfWorldGlyph > 0
  ) {
    return clamp(window.__combatPlayerHalfWorldGlyph, 0.04, 6);
  }
  return readHalfWorld("__combatPlayerHalfWorld", HITBOX.playerHalfWidth);
}

export function getEnemyHalfWidthWorld() {
  if (
    typeof window !== "undefined" &&
    typeof window.__combatEnemyHalfWorldGlyph === "number" &&
    Number.isFinite(window.__combatEnemyHalfWorldGlyph) &&
    window.__combatEnemyHalfWorldGlyph > 0
  ) {
    return clamp(window.__combatEnemyHalfWorldGlyph, 0.04, 6);
  }
  return readHalfWorld("__combatEnemyHalfWorld", HITBOX.enemyHalfWidth);
}

/** Gap along path: positive = player still behind enemy anchor, negative = overlapping/past */
export function pathGap(worldProgress, enemyWorldPos) {
  return enemyWorldPos - worldProgress;
}

export function contactDistanceAlongPath() {
  return getPlayerHalfWidthWorld() + getEnemyHalfWidthWorld();
}

/** Still “in this encounter” if slightly past anchor (cluster / kill transition) */
const MAX_PAST_ANCHOR = 4;

/**
 * World position used for combat / travel freeze.
 * For clustered fights, only the active enemy’s `worldPos` is valid. Do not fall back to
 * `nextEnemyWorldPos` — it is the spawn-queue cursor and often tens of units behind the
 * real enemy, which made combat logic think you were “in range” while the sprite was
 * still on the far right (movement stuck, auto-attack / idle in a bad state).
 */
export function resolveCombatEnemyWorldPos({
  isBossActive,
  enemyCluster,
  currentClusterIndex,
  nextEnemyWorldPos,
}) {
  if (isBossActive) return nextEnemyWorldPos;
  const e = enemyCluster?.[currentClusterIndex];
  if (e && typeof e.worldPos === "number" && Number.isFinite(e.worldPos)) {
    return e.worldPos;
  }
  return undefined;
}

/**
 * Active enemy anchor on the playfield (% left, % bottom), matching EnemyCluster / PlayerDisplay.
 * Used for bow shots and UI. Returns null if no resolved enemy position.
 */
export function getEnemyScreenAnchorPercent(state) {
  if (!state) return null;
  const enemyWorldPos = resolveCombatEnemyWorldPos({
    isBossActive: state.isBossActive,
    enemyCluster: state.enemyCluster,
    currentClusterIndex: state.currentClusterIndex,
    nextEnemyWorldPos: state.nextEnemyWorldPos,
  });
  if (enemyWorldPos == null || !Number.isFinite(enemyWorldPos)) return null;
  const wp =
    typeof window !== "undefined" && typeof window.__gameDisplayWorldProgress === "number"
      ? window.__gameDisplayWorldProgress
      : state.worldProgress;
  const gap = pathGap(wp, enemyWorldPos);
  const leftPct = PLAYER_ANCHOR_LEFT_PCT + gap * PATH_GAP_TO_SCREEN_PCT;
  return {
    leftPct: Math.max(-15, Math.min(115, leftPct)),
    bottomPct: ROAD_CENTER_FROM_BOTTOM_PCT,
  };
}

export function isInCombatAlongPath(worldProgress, enemyWorldPos, isBoss) {
  if (enemyWorldPos == null || !Number.isFinite(enemyWorldPos)) return false;
  const gap = pathGap(worldProgress, enemyWorldPos);
  const contact = contactDistanceAlongPath();

  if (isBoss) {
    const bossContact = Math.max(contact, 1);
    return gap <= bossContact && gap >= -MAX_PAST_ANCHOR;
  }

  if (gap > contact) return false;
  return gap >= -MAX_PAST_ANCHOR;
}
