/**
 * gameData.js — re-export barrel
 *
 * All game data is split into focused modules:
 *   enemies.js  — enemy roster, sprites, weapon flags, anim classes
 *   heroes.js   — recruitable hero definitions (Knight, Rogue, Wizard)
 *   upgrades.js — upgrade defs, cost/damage/CPS formulas
 *   zones.js    — stages, zones, HP/reward/soul scaling, unlock logic
 *
 * Import directly from source modules in new code.
 * This barrel exists so legacy imports keep working with zero changes.
 */

export {
  ENEMY_ROSTER,
  ENEMY_IDS,
  ENEMY_BY_ID,
  ENEMY_EMOJIS,
  ZOMBIE_EMOJI_VARIANTS,
  VAMPIRE_EMOJI_VARIANTS,
  ENEMIES_WITHOUT_WEAPONS,
  enemyHasWeapons,
  ENEMY_IDLE_ANIM_CLASS,
  getEnemyIdleAnimClass,
} from "./enemies";

export {
  HEROES,
  HERO_IDS,
  HERO_BY_ID,
  MAX_HEROES,
  getHeroDPS,
  getHeroLevelCost,
  getHeroPassiveValue,
  computeHeroPassives,
  computeHeroDPS,
} from "./heroes";

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
