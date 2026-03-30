/**
 * upgrades.js
 *
 * Upgrade definitions, category helpers, cost formula,
 * and the tap damage / idle CPS computation functions.
 *
 * Keeping the math here means useGameState and useCombatEngine
 * import a single clean function instead of duplicating logic.
 */

import { getBuffMultiplier } from "./buffs";

// ─── Upgrade definitions ──────────────────────────────────────────────────────

export const UPGRADES = [
  // Tap damage
  { id: "sharp_blade",   name: "Sharp Blade",   icon: "⚔️",  type: "tap",  description: "+5 tap damage per level",       basePower: 5,   baseCost: 50,   effect: { tapDamage: 5   } },
  { id: "iron_gauntlet", name: "Iron Gauntlet", icon: "🥊",  type: "tap",  description: "+10 tap damage per level",      basePower: 10,  baseCost: 150,  effect: { tapDamage: 10  } },
  { id: "war_axe",       name: "War Axe",       icon: "🪓",  type: "tap",  description: "+20 tap damage per level",      basePower: 20,  baseCost: 400,  effect: { tapDamage: 20  } },
  { id: "soul_blade",    name: "Soul Blade",    icon: "🗡️",  type: "tap",  description: "+50 tap damage per level",      basePower: 50,  baseCost: 1200, effect: { tapDamage: 50  } },
  { id: "fire_sword",    name: "Fire Sword",    icon: "🔥",  type: "tap",  description: "+100 tap damage per level",     basePower: 100, baseCost: 4000, effect: { tapDamage: 100 } },
  // Idle DPS
  { id: "imp_familiar",  name: "Imp Familiar",  icon: "👿",  type: "idle", description: "+3 idle DPS per level",         basePower: 3,   baseCost: 100,  effect: { idleDPS: 3  } },
  { id: "shadow_wolf",   name: "Shadow Wolf",   icon: "🐺",  type: "idle", description: "+8 idle DPS per level",         basePower: 8,   baseCost: 300,  effect: { idleDPS: 8  } },
  { id: "golem_guard",   name: "Golem Guard",   icon: "🪨",  type: "idle", description: "+18 idle DPS per level",        basePower: 18,  baseCost: 800,  effect: { idleDPS: 18 } },
  { id: "dragon_pet",    name: "Dragon Pet",    icon: "🐲",  type: "idle", description: "+40 idle DPS per level",        basePower: 40,  baseCost: 2500, effect: { idleDPS: 40 } },
  // Universal
  { id: "ancient_rune",  name: "Ancient Rune",  icon: "🔮",  type: "all",  description: "+15 to all damage per level",   basePower: 15,  baseCost: 600,  effect: { tapDamage: 15, idleDPS: 15 } },
  { id: "chaos_gem",     name: "Chaos Gem",     icon: "💎",  type: "all",  description: "+35 to all damage per level",   basePower: 35,  baseCost: 2000, effect: { tapDamage: 35, idleDPS: 35 } },
  // Bow
  { id: "bow",           name: "Elven Bow",     icon: "🏹",  type: "bow",  description: "Unlocks bow mode (+25% souls)", basePower: 0,   baseCost: 500,  effect: { tapDamage: 0 } },
  // Cluster
  { id: "pack_size",     name: "Pack Size",     icon: "👥",  type: "misc", description: "+1 max enemy cluster size",     basePower: 1,   baseCost: 800,  effect: {} },
];

// ─── Category helpers ─────────────────────────────────────────────────────────

/** IDs only — for cheap includes() checks in UI */
export const TAP_UPGRADE_IDS  = UPGRADES.filter(u => u.type === "tap").map(u => u.id);
export const IDLE_UPGRADE_IDS = UPGRADES.filter(u => u.type === "idle").map(u => u.id);
export const ALL_UPGRADE_IDS  = UPGRADES.filter(u => u.type === "all").map(u => u.id);
export const BOW_UPGRADE_IDS  = UPGRADES.filter(u => u.type === "bow").map(u => u.id);

/** Aliases for backward compat with existing import names */
export const TAP_UPGRADES  = TAP_UPGRADE_IDS;
export const IDLE_UPGRADES = IDLE_UPGRADE_IDS;
export const ALL_UPGRADES  = ALL_UPGRADE_IDS;
export const BOW_UPGRADES  = BOW_UPGRADE_IDS;

/** Full upgrade objects by category — used in damage calculations */
export const TAP_UPGRADE_OBJECTS  = UPGRADES.filter(u => u.type === "tap" || u.type === "all");
export const IDLE_UPGRADE_OBJECTS = UPGRADES.filter(u => u.type === "idle" || u.type === "all");
export const BOW_UPGRADE_OBJECTS  = UPGRADES.filter(u => u.type === "bow" || u.type === "all");

// ─── Cost formula ─────────────────────────────────────────────────────────────

/** Accepts an upgrade object OR a raw base price number. */
export function getUpgradeCost(upgradeOrBasePrice, level) {
  const base = typeof upgradeOrBasePrice === "object"
    ? upgradeOrBasePrice.baseCost
    : upgradeOrBasePrice;
  return Math.floor(base * Math.pow(1.15, level));
}

// ─── Bow soul multiplier ──────────────────────────────────────────────────────

export function getBowSoulMultiplier(bowLevel) {
  return 1 + bowLevel * 0.05;
}

// ─── Damage & CPS computations ───────────────────────────────────────────────
// Pure functions — accept pre-computed multipliers, no hooks.

/**
 * Compute tap damage for a given game state snapshot.
 *
 * @param {object}  s                 - game state snapshot
 * @param {string}  weapon            - "sword" | "bow"
 * @param {Array}   buffs             - active buff array
 * @param {object}  skillMults        - from getSkillMultipliers()
 * @param {object}  villageMultipliers - from computeVillageMultipliers()
 * @param {number}  damageMultiplier  - external multiplier (default 1)
 */
export function computeTapDamage(s, weapon, buffs, skillMults, villageMultipliers, damageMultiplier = 1) {
  const upgradeLevels = s.upgradeLevels || {};
  const upgradeList = weapon === "bow" ? BOW_UPGRADE_OBJECTS : TAP_UPGRADE_OBJECTS;

  let damage = 1;
  upgradeList.forEach((u) => {
    const level = upgradeLevels[u.id] || 0;
    if (level > 0 && u.effect?.tapDamage) damage += u.effect.tapDamage * level;
  });

  const souls = typeof s.souls === "number" ? s.souls : 0;
  const soulBonus = 1 + souls * 0.05;
  const buffMult = getBuffMultiplier(Array.isArray(buffs) ? buffs : [], "tapDamageMultiplier");
  const raw = damage * soulBonus * damageMultiplier * (skillMults?.damageMultiplier || 1) * buffMult;
  return Math.max(0.5, raw);
}

/**
 * Compute idle coins-per-second for a given game state snapshot.
 */
export function computeIdleCPS(s, skillMults, villageMultipliers) {
  const upgradeLevels = s.upgradeLevels || {};
  let cps = 0;
  IDLE_UPGRADE_OBJECTS.forEach((u) => {
    const level = upgradeLevels[u.id] || 0;
    if (level > 0 && u.effect?.idleDPS) cps += u.effect.idleDPS * level;
  });
  const souls = typeof s.souls === "number" ? s.souls : 0;
  const soulBonus = 1 + souls * 0.05;
  return cps * soulBonus * (skillMults?.idleMultiplier || 1) * (villageMultipliers?.idleMultiplier || 1);
}
