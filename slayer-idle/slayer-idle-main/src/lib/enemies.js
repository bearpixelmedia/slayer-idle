/**
 * enemies.js
 *
 * Everything about enemies as display/game entities:
 * names, emojis, animation classes, weapon flags, idle variants.
 * No scaling math — that lives in zones.js.
 */

// ─── Emoji display ────────────────────────────────────────────────────────────

export const ENEMY_EMOJIS = {
  "Goblin":      "👺",
  "Orc":         "🧌",
  "Ogre":        "👹",
  "Skeleton":    "💀",
  "Vampire":     "🧛",
  "Dragon":      "🐉",
  "Lich":        "☠️",
  "Zombie":      "🧟",
  "Ghost":       "👻",
  "Spider":      "🕷️",
  "Genie":       "🧞",
  "Princess":    "👸",
  "Prince":      "🫅",
  "Merchant":    "👲",
  "Sorceress":   "🧙‍♀️",
  "Sorcerer":    "🧙‍♂️",
  "Mage":        "🧙",
  "Pixie":       "🧚‍♀️",
  "Sprite":      "🧚‍♂️",
  "Fairy":       "🧚",
  "Mermaid":     "🧜‍♀️",
  "Merman":      "🧜‍♂️",
  "Merfolk":     "🧜",
  "Elf Archer":  "🧝‍♀️",
  "Elf Ranger":  "🧝‍♂️",
  "Elf":         "🧝",
};

/** Zombie variants — picked per spawn via `instanceId`. */
export const ZOMBIE_EMOJI_VARIANTS = ["🧟", "🧟‍♂️", "🧟‍♀️"];

/** Vampire variants — same. */
export const VAMPIRE_EMOJI_VARIANTS = ["🧛‍♀️", "🧛‍♂️", "🧛"];

// ─── Weapon flags ─────────────────────────────────────────────────────────────

/** Enemies that don't render a sword/shield weapon rig. */
export const ENEMIES_WITHOUT_WEAPONS = new Set([
  "Zombie",
  "Spider",
  "Ghost",
  "Genie",
  "Pixie",
  "Sprite",
  "Fairy",
  "Mermaid",
  "Merman",
  "Merfolk",
  "Sorceress",
  "Sorcerer",
  "Mage",
]);

export function enemyHasWeapons(enemyName) {
  if (!enemyName) return true;
  return !ENEMIES_WITHOUT_WEAPONS.has(enemyName);
}

// ─── Idle animation classes ───────────────────────────────────────────────────

export const ENEMY_IDLE_ANIM_CLASS = {
  Goblin:        "animate-enemy-idle-sway",
  Orc:           "animate-enemy-idle-march",
  Ogre:          "animate-enemy-idle-heavy",
  Skeleton:      "animate-enemy-idle-bob",
  Vampire:       "animate-enemy-idle-glide",
  Dragon:        "animate-enemy-idle-slither",
  Lich:          "animate-enemy-idle-loom",
  Zombie:        "animate-enemy-idle-shamble",
  Ghost:         "animate-enemy-idle-float",
  Genie:         "animate-enemy-idle-hover",
  Princess:      "animate-enemy-idle-march",
  Prince:        "animate-enemy-idle-march",
  Merchant:      "animate-enemy-idle-march",
  Sorceress:     "animate-enemy-idle-hover",
  Sorcerer:      "animate-enemy-idle-hover",
  Mage:          "animate-enemy-idle-hover",
  Pixie:         "animate-enemy-idle-flutter",
  Sprite:        "animate-enemy-idle-flutter",
  Fairy:         "animate-enemy-idle-flutter",
  Mermaid:       "animate-enemy-idle-bob",
  Merman:        "animate-enemy-idle-bob",
  Merfolk:       "animate-enemy-idle-bob",
  "Elf Archer":  "animate-enemy-idle-march",
  "Elf Ranger":  "animate-enemy-idle-march",
  Elf:           "animate-enemy-idle-march",
};

const DEFAULT_IDLE_CLASS = "animate-enemy-idle-march";

export function getEnemyIdleAnimClass(enemyName) {
  if (!enemyName) return DEFAULT_IDLE_CLASS;
  return ENEMY_IDLE_ANIM_CLASS[enemyName] ?? DEFAULT_IDLE_CLASS;
}
