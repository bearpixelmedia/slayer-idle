/**
 * sprites.js — Single source of truth for all sprite sheet definitions.
 *
 * Frame layout: all sheets are horizontal strips, one row.
 * frameSize is always square (frameW === frameH === the sheet's pixel height).
 *
 * Animation definition:
 *   fps      — playback speed
 *   loop     — true = loop forever, false = play once then hold last frame
 *   frames   — number of frames (defaults to all frames on the sheet)
 */

// ─── Frame size constants ────────────────────────────────────────────────────
const F64 = 64; // most player & mob run/death sheets
const F32 = 32; // all idle sheets + some NPC death sheets

// ─── Helper ──────────────────────────────────────────────────────────────────
/**
 * sheet() — standard square frames
 * sheetNS() — non-square frames (different width and height)
 */
function sheet(url, frameSize, animations) {
  return { url, frameW: frameSize, frameH: frameSize, frameSize, animations };
}

function sheetNS(url, frameW, frameH, animations) {
  return { url, frameW, frameH, frameSize: frameW, animations };
}

function anim(fps, loop, frames) {
  return { fps, loop, frames };
}

// ─── PLAYER (Body_A, Side-facing) ────────────────────────────────────────────
export const PLAYER_SPRITES = {
  idle:         sheet("/sprites/player/idle.png",         F64, { idle:   anim(6,  true,  4) }),
  run:          sheet("/sprites/player/run.png",          F64, { run:    anim(10, true,  6) }),
  walk:         sheet("/sprites/player/walk.png",         F64, { walk:   anim(8,  true,  6) }),
  attack_sword: sheet("/sprites/player/attack_sword.png", F64, { attack: anim(14, false, 8) }),
  attack_bow:   sheet("/sprites/player/attack_bow.png",   F64, { attack: anim(14, false, 8) }),
  hit:          sheet("/sprites/player/hit.png",          F64, { hit:    anim(10, false, 4) }),
  death:        sheet("/sprites/player/death.png",        F64, { death:  anim(8,  false, 8) }),
};

// ─── ENEMIES ─────────────────────────────────────────────────────────────────

/** Orc variants */
export const ORC_SPRITES = {
  idle:  sheet("/sprites/enemies/orc/idle.png",  F32, { idle:  anim(6, true,  4) }),
  run:   sheet("/sprites/enemies/orc/run.png",   F64, { run:   anim(10, true,  6) }),
  death: sheet("/sprites/enemies/orc/death.png", F64, { death: anim(8, false, 6) }),
};

export const ORC_WARRIOR_SPRITES = {
  idle:  sheet("/sprites/enemies/orc_warrior/idle.png",  F32, { idle:  anim(6, true,  4) }),
  run:   sheet("/sprites/enemies/orc_warrior/run.png",   F64, { run:   anim(10, true,  6) }),
  death: sheetNS("/sprites/enemies/orc_warrior/death.png", 72, 80, { death: anim(8, false, 8) }),
};

export const ORC_ROGUE_SPRITES = {
  idle:  sheet("/sprites/enemies/orc_rogue/idle.png",  F32, { idle:  anim(6, true,  4) }),
  run:   sheet("/sprites/enemies/orc_rogue/run.png",   F64, { run:   anim(10, true,  6) }),
  death: sheet("/sprites/enemies/orc_rogue/death.png", F64, { death: anim(8, false, 6) }),
};

export const ORC_SHAMAN_SPRITES = {
  idle:  sheet("/sprites/enemies/orc_shaman/idle.png",  F32, { idle:  anim(6, true,  4) }),
  run:   sheet("/sprites/enemies/orc_shaman/run.png",   F64, { run:   anim(10, true,  6) }),
  death: sheet("/sprites/enemies/orc_shaman/death.png", F64, { death: anim(8, false, 7) }),
};

/** Skeleton variants */
export const SKELETON_SPRITES = {
  idle:  sheet("/sprites/enemies/skeleton/idle.png",  F32, { idle:  anim(6, true,  4) }),
  run:   sheet("/sprites/enemies/skeleton/run.png",   F64, { run:   anim(10, true,  6) }),
  death: sheet("/sprites/enemies/skeleton/death.png", F64, { death: anim(6, false, 12) }),
};

export const SKELETON_WARRIOR_SPRITES = {
  idle:  sheet("/sprites/enemies/skeleton_warrior/idle.png",  F32, { idle:  anim(6, true,  4) }),
  run:   sheet("/sprites/enemies/skeleton_warrior/run.png",   F64, { run:   anim(10, true,  6) }),
  death: sheetNS("/sprites/enemies/skeleton_warrior/death.png", 48, 48, { death: anim(8, false, 8) }),
};

export const SKELETON_MAGE_SPRITES = {
  idle:  sheet("/sprites/enemies/skeleton_mage/idle.png",  F32, { idle:  anim(6, true,  4) }),
  run:   sheet("/sprites/enemies/skeleton_mage/run.png",   F64, { run:   anim(10, true,  6) }),
  death: sheet("/sprites/enemies/skeleton_mage/death.png", F64, { death: anim(8, false, 6) }),
};

export const SKELETON_ROGUE_SPRITES = {
  idle:  sheet("/sprites/enemies/skeleton_rogue/idle.png",  F32, { idle:  anim(6, true,  4) }),
  run:   sheet("/sprites/enemies/skeleton_rogue/run.png",   F64, { run:   anim(10, true,  6) }),
  death: sheet("/sprites/enemies/skeleton_rogue/death.png", F64, { death: anim(8, false, 6) }),
};

// ─── NPCs (usable as alternate player skins or boss variants) ────────────────
export const KNIGHT_SPRITES = {
  idle:  sheet("/sprites/npcs/knight/idle.png",  F32, { idle:  anim(6, true,  4) }),
  run:   sheet("/sprites/npcs/knight/run.png",   F64, { run:   anim(10, true,  6) }),
  death: sheet("/sprites/npcs/knight/death.png", F32, { death: anim(8, false, 9) }),
};

export const ROGUE_SPRITES = {
  idle:  sheet("/sprites/npcs/rogue/idle.png",  F32, { idle:  anim(6, true,  4) }),
  run:   sheet("/sprites/npcs/rogue/run.png",   F64, { run:   anim(10, true,  6) }),
  death: sheet("/sprites/npcs/rogue/death.png", F32, { death: anim(8, false, 12) }),
};

export const WIZARD_SPRITES = {
  idle:  sheet("/sprites/npcs/wizard/idle.png",  F32, { idle:  anim(6, true,  4) }),
  run:   sheet("/sprites/npcs/wizard/run.png",   F64, { run:   anim(10, true,  6) }),
  death: sheet("/sprites/npcs/wizard/death.png", F32, { death: anim(8, false, 12) }),
};


// ─── NEW GENERATED ENEMIES ────────────────────────────────────────────────────

export const DRAGON_SPRITES = {
  idle:  sheet("/sprites/enemies/dragon/idle.png",  F32, { idle:  anim(6, true,  4) }),
  run:   sheet("/sprites/enemies/dragon/run.png",   F64, { run:   anim(10, true,  6) }),
  death: sheet("/sprites/enemies/dragon/death.png", F64, { death: anim(8, false, 6) }),
};

export const GHOST_SPRITES = {
  idle:  sheet("/sprites/enemies/ghost/idle.png",  F32, { idle:  anim(5, true,  4) }),
  run:   sheet("/sprites/enemies/ghost/run.png",   F64, { run:   anim(8,  true,  6) }),
  death: sheet("/sprites/enemies/ghost/death.png", F64, { death: anim(8, false, 6) }),
};

export const SPIDER_SPRITES = {
  idle:  sheet("/sprites/enemies/spider/idle.png",  F32, { idle:  anim(6, true,  4) }),
  run:   sheet("/sprites/enemies/spider/run.png",   F64, { run:   anim(12, true,  6) }),
  death: sheet("/sprites/enemies/spider/death.png", F64, { death: anim(8, false, 6) }),
};

export const ZOMBIE_SPRITES = {
  idle:  sheet("/sprites/enemies/zombie/idle.png",  F32, { idle:  anim(4, true,  4) }),
  run:   sheet("/sprites/enemies/zombie/run.png",   F64, { run:   anim(6,  true,  6) }),
  death: sheet("/sprites/enemies/zombie/death.png", F64, { death: anim(8, false, 6) }),
};

// ─── ENEMY ROSTER MAP ────────────────────────────────────────────────────────
// Maps game enemy names (from gameData.js) to their sprite sets.
// Enemies without a direct sprite fall back to the closest visual match.
export const ENEMY_SPRITE_MAP = {
  // Orcs
  "Orc":     ORC_SPRITES,
  "Ogre":    ORC_WARRIOR_SPRITES,   // Ogre → big orc warrior
  "Goblin":  ORC_ROGUE_SPRITES,     // Goblin → orc rogue (closest fast enemy)

  // Skeletons & undead
  "Skeleton": SKELETON_SPRITES,
  "Zombie":   ZOMBIE_SPRITES,
  "Ghost":    GHOST_SPRITES,
  "Lich":     SKELETON_ROGUE_SPRITES,
  "Vampire":  SKELETON_WARRIOR_SPRITES,

  // Mages / casters
  "Sorcerer":  SKELETON_MAGE_SPRITES,
  "Sorceress": SKELETON_MAGE_SPRITES,
  "Mage":      SKELETON_MAGE_SPRITES,
  "Genie":     ORC_SHAMAN_SPRITES,

  // Elves / rogues
  "Elf":          ROGUE_SPRITES,
  "Elf Archer":   ROGUE_SPRITES,
  "Elf Ranger":   ROGUE_SPRITES,
  "Princess":     ROGUE_SPRITES,
  "Prince":       KNIGHT_SPRITES,
  "Merchant":     KNIGHT_SPRITES,

  // Nature / beasts — no direct sprite, use orc rogue as placeholder
  "Spider":  SPIDER_SPRITES,
  "Dragon":  DRAGON_SPRITES,

  // Sea creatures — wizard as placeholder
  "Mermaid":  WIZARD_SPRITES,
  "Merman":   WIZARD_SPRITES,
  "Merfolk":  WIZARD_SPRITES,

  // Fae
  "Pixie":  WIZARD_SPRITES,
  "Sprite": WIZARD_SPRITES,
  "Fairy":  WIZARD_SPRITES,
};

/**
 * Get the sprite set for a given enemy name.
 * Always returns a valid sprite set (falls back to ORC_SPRITES).
 */
export function getEnemySprites(enemyName) {
  return ENEMY_SPRITE_MAP[enemyName] ?? ORC_SPRITES;
}

/**
 * Get the correct sheet + animation def for a given sprite set and action.
 * Returns { url, frameSize, fps, loop, frames } or null if not found.
 */
export function resolveAnim(spriteSet, action) {
  const s = spriteSet?.[action];
  if (!s) return null;
  const animKey = Object.keys(s.animations)[0];
  const animDef = s.animations[animKey];
  return {
    url: s.url,
    frameSize: s.frameSize,   // kept for compat
    frameW: s.frameW,
    frameH: s.frameH,
    fps: animDef.fps,
    loop: animDef.loop,
    frames: animDef.frames,
  };
}

// ─── ENEMY CSS FILTER MAP ────────────────────────────────────────────────────
// CSS filter strings applied on top of the base sprite to visually differentiate
// enemies that share the same sprite sheet.
//
// Filters reference:
//   hue-rotate(Xdeg)  — shift the hue wheel
//   saturate(X)       — 0=greyscale, 1=normal, 2=vivid
//   brightness(X)     — 0=black, 1=normal, 2=white
//   sepia(X)          — 0=normal, 1=full sepia (warm brown)
//   invert(X)         — 0=normal, 1=full invert
//   contrast(X)       — 1=normal, higher=more contrast
//
export const ENEMY_FILTER_MAP = {
  // ── Orcs ──────────────────────────────────────────────────────────────────
  "Orc":      "",                                                   // base green orc — no filter
  "Ogre":     "hue-rotate(20deg) saturate(1.4) brightness(0.85)",  // darker, more aggressive red-brown
  "Goblin":   "hue-rotate(60deg) saturate(1.6) brightness(1.1)",   // yellow-green goblin tint

  // ── Skeletons & undead ────────────────────────────────────────────────────
  "Skeleton": "",                                                   // base white-bone — no filter
  "Zombie":   "hue-rotate(90deg) saturate(0.9) brightness(0.8)",   // grey-green rotting tint
  "Ghost":    "hue-rotate(200deg) saturate(0.6) brightness(1.4)",  // pale blue ethereal glow
  "Lich":     "hue-rotate(260deg) saturate(1.4) brightness(0.7)",  // dark purple death lord
  "Vampire":  "hue-rotate(320deg) saturate(0.8) brightness(0.75)", // dark crimson undead

  // ── Mages / casters ───────────────────────────────────────────────────────
  "Sorcerer":  "hue-rotate(240deg) saturate(1.5) brightness(0.9)", // deep blue arcane
  "Sorceress": "hue-rotate(300deg) saturate(1.6) brightness(0.95)",// magenta-purple
  "Mage":      "hue-rotate(180deg) saturate(1.3) brightness(1.0)", // cyan mage
  "Genie":     "hue-rotate(170deg) saturate(1.8) brightness(1.2)", // vivid teal genie

  // ── Elves / rogues ────────────────────────────────────────────────────────
  "Elf":          "hue-rotate(100deg) saturate(1.4) brightness(1.1)", // forest green elf
  "Elf Archer":   "hue-rotate(110deg) saturate(1.3) brightness(1.0)", // slightly darker green
  "Elf Ranger":   "hue-rotate(130deg) saturate(1.2) brightness(0.9)", // deep forest
  "Princess":     "hue-rotate(330deg) saturate(1.5) brightness(1.2)", // pink/rose royalty
  "Prince":       "hue-rotate(200deg) saturate(1.2) brightness(1.0)", // royal blue
  "Merchant":     "sepia(0.6) saturate(1.2) brightness(0.95)",         // warm earthy tones

  // ── Nature / beasts ───────────────────────────────────────────────────────
  "Spider":  "brightness(0.4) contrast(1.4)",                      // near-black dark spider
  "Dragon":  "hue-rotate(0deg) saturate(1.8) brightness(1.1)",     // vivid red dragon pop

  // ── Sea creatures ─────────────────────────────────────────────────────────
  "Mermaid":  "hue-rotate(160deg) saturate(1.6) brightness(1.1)",  // aqua/teal mermaid
  "Merman":   "hue-rotate(185deg) saturate(1.4) brightness(0.95)", // deeper sea blue
  "Merfolk":  "hue-rotate(175deg) saturate(1.5) brightness(1.0)",  // mid ocean teal

  // ── Fae ───────────────────────────────────────────────────────────────────
  "Pixie":  "hue-rotate(280deg) saturate(1.8) brightness(1.3)",    // bright violet fairy
  "Sprite": "hue-rotate(140deg) saturate(2.0) brightness(1.3)",    // vivid lime sprite
  "Fairy":  "hue-rotate(310deg) saturate(1.7) brightness(1.25)",   // pink-purple fairy
};

/**
 * Returns the CSS filter string for a given enemy name.
 * Safe to use directly in style={{ filter: getEnemyFilter(name) }}
 */
export function getEnemyFilter(enemyName) {
  return ENEMY_FILTER_MAP[enemyName] ?? "";
}
