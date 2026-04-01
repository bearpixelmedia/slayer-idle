/**
 * enemies.js
 *
 * Enemy roster built entirely around the Pixel Crawler asset pack by Anokolisa.
 * Two tiers: Skeleton (forest/dungeon) and Orc (cave/deep dungeon).
 * Each enemy maps to a real sprite from sprites.js.
 *
 * No emoji fallbacks — all enemies have proper sprite representations.
 */

// ─── Enemy roster ─────────────────────────────────────────────────────────────
//
// Each entry defines:
//   id          — unique key used throughout the game
//   name        — display name
//   tier        — "skeleton" | "orc"  (maps to sprite group)
//   variant     — "base" | "warrior" | "mage" | "rogue"
//   spriteKey   — key into ENEMY_SPRITES in sprites.js
//   isBoss      — true = this is a zone boss (bigger, more HP)
//   hasWeapon   — whether to render a weapon rig
//   attackType  — "melee" | "ranged" | "magic"

export const ENEMY_ROSTER = [
  // ── Skeleton tier ────────────────────────────────────────────────────────
  {
    id: "skeleton",
    name: "Skeleton",
    tier: "skeleton",
    variant: "base",
    spriteKey: "skeleton",
    isBoss: false,
    hasWeapon: true,
    attackType: "melee",
  },
  {
    id: "skeleton_rogue",
    name: "Skeleton Rogue",
    tier: "skeleton",
    variant: "rogue",
    spriteKey: "skeleton_rogue",
    isBoss: false,
    hasWeapon: true,
    attackType: "melee",
  },
  {
    id: "skeleton_warrior",
    name: "Skeleton Warrior",
    tier: "skeleton",
    variant: "warrior",
    spriteKey: "skeleton_warrior",
    isBoss: false,
    hasWeapon: true,
    attackType: "melee",
  },
  {
    id: "skeleton_mage",
    name: "Skeleton Mage",
    tier: "skeleton",
    variant: "mage",
    spriteKey: "skeleton_mage",
    isBoss: false,
    hasWeapon: false,
    attackType: "magic",
  },
  // ── Orc tier ─────────────────────────────────────────────────────────────
  {
    id: "orc",
    name: "Orc",
    tier: "orc",
    variant: "base",
    spriteKey: "orc",
    isBoss: false,
    hasWeapon: true,
    attackType: "melee",
  },
  {
    id: "orc_rogue",
    name: "Orc Rogue",
    tier: "orc",
    variant: "rogue",
    spriteKey: "orc_rogue",
    isBoss: false,
    hasWeapon: true,
    attackType: "melee",
  },
  {
    id: "orc_warrior",
    name: "Orc Warrior",
    tier: "orc",
    variant: "warrior",
    spriteKey: "orc_warrior",
    isBoss: false,
    hasWeapon: true,
    attackType: "melee",
  },
  {
    id: "orc_shaman",
    name: "Orc Shaman",
    tier: "orc",
    variant: "mage",
    spriteKey: "orc_shaman",
    isBoss: false,
    hasWeapon: false,
    attackType: "magic",
  },
];

// ─── Quick lookup maps ────────────────────────────────────────────────────────

/** All enemy IDs */
export const ENEMY_IDS = ENEMY_ROSTER.map((e) => e.id);

/** id → full enemy definition */
export const ENEMY_BY_ID = Object.fromEntries(ENEMY_ROSTER.map((e) => [e.id, e]));

/** Enemies that don't render a weapon rig */
export const ENEMIES_WITHOUT_WEAPONS = new Set(
  ENEMY_ROSTER.filter((e) => !e.hasWeapon).map((e) => e.id)
);

export function enemyHasWeapons(enemyId) {
  if (!enemyId) return true;
  return !ENEMIES_WITHOUT_WEAPONS.has(enemyId);
}

// ─── Idle animation classes ───────────────────────────────────────────────────

export const ENEMY_IDLE_ANIM_CLASS = {
  skeleton:         "animate-enemy-idle-bob",
  skeleton_rogue:   "animate-enemy-idle-sway",
  skeleton_warrior: "animate-enemy-idle-march",
  skeleton_mage:    "animate-enemy-idle-hover",
  orc:              "animate-enemy-idle-march",
  orc_rogue:        "animate-enemy-idle-sway",
  orc_warrior:      "animate-enemy-idle-heavy",
  orc_shaman:       "animate-enemy-idle-hover",
};

const DEFAULT_IDLE_CLASS = "animate-enemy-idle-march";

export function getEnemyIdleAnimClass(enemyId) {
  if (!enemyId) return DEFAULT_IDLE_CLASS;
  return ENEMY_IDLE_ANIM_CLASS[enemyId] ?? DEFAULT_IDLE_CLASS;
}

// ─── Legacy compat ────────────────────────────────────────────────────────────
// Keep ENEMY_EMOJIS alive so any component that hasn't been updated yet
// doesn't hard-crash. Maps enemy id → a safe fallback character.
export const ENEMY_EMOJIS = Object.fromEntries(
  ENEMY_ROSTER.map((e) => [
    e.id,
    e.tier === "skeleton" ? "💀" : "👹",
  ])
);

export const ZOMBIE_EMOJI_VARIANTS  = ["💀"];
export const VAMPIRE_EMOJI_VARIANTS = ["💀"];
