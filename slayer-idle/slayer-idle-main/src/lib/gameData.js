/**
 * gameData.js — re-export barrel
 *
 * All game data has been split into focused modules:
 *   enemies.js  — enemy display, emojis, anim classes, weapon flags
 *   upgrades.js — upgrade defs, categories, cost/damage/CPS formulas
 *   zones.js    — stages, zones, HP/reward/soul scaling, unlock logic
 *
 * This file re-exports everything so existing imports keep working
 * with zero changes. New code should import directly from the source module.
 */

export {
  ENEMY_EMOJIS,
  ZOMBIE_EMOJI_VARIANTS,
  VAMPIRE_EMOJI_VARIANTS,
  ENEMIES_WITHOUT_WEAPONS,
  enemyHasWeapons,
  ENEMY_IDLE_ANIM_CLASS,
  getEnemyIdleAnimClass,
} from "./enemies";

export {
  UPGRADES,
  TAP_UPGRADES,
  IDLE_UPGRADES,
  ALL_UPGRADES,
  BOW_UPGRADES,
  TAP_UPGRADE_IDS,
  IDLE_UPGRADE_IDS,
  ALL_UPGRADE_IDS,
  BOW_UPGRADE_IDS,
  TAP_UPGRADE_OBJECTS,
  IDLE_UPGRADE_OBJECTS,
  BOW_UPGRADE_OBJECTS,
  getUpgradeCost,
  getBowSoulMultiplier,
  computeTapDamage,
  computeIdleCPS,
} from "./upgrades";

export {
  STAGES,
  ZONES,
  getZoneStages,
  canUnlockZone,
  getEnemyHP,
  getEnemyReward,
  getEnemySouls,
  getSoulsOnPrestige,
  getSlayerPointsOnPrestige,
  getPackSize,
} from "./zones";

// laneScene passthrough — kept for compat
export { getEnemyFeetVisualAlignPx, getLaneEnemyBodyScale } from "./laneScene";
