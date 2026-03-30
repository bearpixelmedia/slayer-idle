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
function sheet(url, frameSize, animations) {
  return { url, frameSize, animations };
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
  death: sheet("/sprites/enemies/orc_warrior/death.png", F64, { death: anim(8, false, 7) }),
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
  death: sheet("/sprites/enemies/skeleton_warrior/death.png", F64, { death: anim(8, false, 8) }),
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
  "Zombie":   SKELETON_SPRITES,     // Zombie → skeleton (undead)
  "Ghost":    SKELETON_MAGE_SPRITES, // Ghost → skeleton mage (caster)
  "Lich":     SKELETON_MAGE_SPRITES,
  "Vampire":  SKELETON_WARRIOR_SPRITES,

  // Mages / casters
  "Sorcerer":  SKELETON_MAGE_SPRITES,
  "Sorceress": SKELETON_MAGE_SPRITES,
  "Mage":      SKELETON_MAGE_SPRITES,
  "Genie":     SKELETON_MAGE_SPRITES,

  // Elves / rogues
  "Elf":          ROGUE_SPRITES,
  "Elf Archer":   ROGUE_SPRITES,
  "Elf Ranger":   ROGUE_SPRITES,
  "Princess":     ROGUE_SPRITES,
  "Prince":       KNIGHT_SPRITES,
  "Merchant":     KNIGHT_SPRITES,

  // Nature / beasts — no direct sprite, use orc rogue as placeholder
  "Spider":  ORC_ROGUE_SPRITES,
  "Dragon":  ORC_WARRIOR_SPRITES,

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
  const sheet = spriteSet?.[action];
  if (!sheet) return null;
  const animKey = Object.keys(sheet.animations)[0]; // each sheet has one anim key
  const animDef = sheet.animations[animKey];
  return {
    url: sheet.url,
    frameSize: sheet.frameSize,
    fps: animDef.fps,
    loop: animDef.loop,
    frames: animDef.frames,
  };
}
