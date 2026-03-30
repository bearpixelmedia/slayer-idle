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
  // Tap damage — powers cut ~60% so early upgrades don't immediately trivialise stage 0
  { id: "sharp_blade",   name: "Sharp Blade",   icon: "⚔️",  type: "tap",  description: "+2 tap damage per level",       basePower: 2,   baseCost: 50,   effect: { tapDamage: 2   } },
  { id: "iron_gauntlet", name: "Iron Gauntlet", icon: "🥊",  type: "tap",  description: "+4 tap damage per level",       basePower: 4,   baseCost: 150,  effect: { tapDamage: 4   } },
  { id: "war_axe",       name: "War Axe",       icon: "🪓",  type: "tap",  description: "+8 tap damage per level",       basePower: 8,   baseCost: 500,  effect: { tapDamage: 8   } },
  { id: "soul_blade",    name: "Soul Blade",    icon: "🗡️",  type: "tap",  description: "+18 tap damage per level",      basePower: 18,  baseCost: 2000, effect: { tapDamage: 18  } },
  { id: "fire_sword",    name: "Fire Sword",    icon: "🔥",  type: "tap",  description: "+45 tap damage per level",      basePower: 45,  baseCost: 8000, effect: { tapDamage: 45  } },
  // Idle DPS
  { id: "imp_familiar",  name: "Imp Familiar",  icon: "👿",  type: "idle", description: "+2 idle DPS per level",         basePower: 2,   baseCost: 120,  effect: { idleDPS: 2  } },
  { id: "shadow_wolf",   name: "Shadow Wolf",   icon: "🐺",  type: "idle", description: "+5 idle DPS per level",         basePower: 5,   baseCost: 500,  effect: { idleDPS: 5  } },
  { id: "golem_guard",   name: "Golem Guard",   icon: "🪨",  type: "idle", description: "+12 idle DPS per level",        basePower: 12,  baseCost: 1500, effect: { idleDPS: 12 } },
  { id: "dragon_pet",    name: "Dragon Pet",    icon: "🐲",  type: "idle", description: "+30 idle DPS per level",        basePower: 30,  baseCost: 8000, effect: { idleDPS: 30 } },
  // Universal
  { id: "ancient_rune",  name: "Ancient Rune",  icon: "🔮",  type: "all",  description: "+6 to all damage per level",    basePower: 6,   baseCost: 800,  effect: { tapDamage: 6, idleDPS: 6 } },
  { id: "chaos_gem",     name: "Chaos Gem",     icon: "💎",  type: "all",  description: "+15 to all damage per level",   basePower: 15,  baseCost: 6000, effect: { tapDamage: 15, idleDPS: 15 } },
  // Bow
  { id: "bow",              name: "Elven Bow",        icon: "🏹",  type: "bow",  description: "Unlocks bow mode (+25% souls)",   basePower: 0,   baseCost: 500,    effect: { tapDamage: 0 } },
  // Cluster
  { id: "pack_size",        name: "Pack Size",        icon: "👥",  type: "misc", description: "+1 max enemy cluster size",       basePower: 1,   baseCost: 800,    effect: {} },
  // ── Tier 4 — Stage 3 gate (~25k to unlock) ───────────────────────────────
  { id: "void_dagger",      name: "Void Dagger",      icon: "🌑",  type: "tap",  description: "+90 tap damage per level",        basePower: 90,  baseCost: 25000,  effect: { tapDamage: 90  } },
  { id: "mana_wisp",        name: "Mana Wisp",        icon: "🔵",  type: "idle", description: "+60 idle DPS per level",          basePower: 60,  baseCost: 25000,  effect: { idleDPS: 60 } },
  // ── Tier 5 — Stage 4 gate (~100k to unlock) ──────────────────────────────
  { id: "storm_lance",      name: "Storm Lance",      icon: "⚡",  type: "tap",  description: "+200 tap damage per level",       basePower: 200, baseCost: 100000, effect: { tapDamage: 200 } },
  { id: "nightmare_hound",  name: "Nightmare Hound",  icon: "🐾",  type: "idle", description: "+140 idle DPS per level",         basePower: 140, baseCost: 100000, effect: { idleDPS: 140 } },
  // ── Tier 6 — Stage 5 gate (~400k to unlock) ──────────────────────────────
  { id: "abyssal_edge",     name: "Abyssal Edge",     icon: "🌀",  type: "tap",  description: "+450 tap damage per level",       basePower: 450, baseCost: 400000, effect: { tapDamage: 450 } },
  { id: "lich_servant",     name: "Lich Servant",     icon: "💀",  type: "idle", description: "+320 idle DPS per level",         basePower: 320, baseCost: 400000, effect: { idleDPS: 320 } },
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

  let damage = 10; // Base tap — new player should feel capable from the start
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
