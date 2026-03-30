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

// ─── PLAYER BODY_A (raw layered body from pack — no equipment overlay) ───────
// These are the bare Body_A sheets. They are designed to be composed with
// equipment/hand layers on top. Frame size is always 64×64.
//
// Frame counts:
//   idle   → 4f   run    → 6f   walk   → 6f   hit    → 4f
//   death  → 8f   slice  → 8f   pierce → 8f   crush  → 8f
export const PLAYER_BODY_A = {
  idle:   sheet("/sprites/player/body_a/idle.png",   F64, { idle:   anim(6,  true,  4) }),
  run:    sheet("/sprites/player/body_a/run.png",    F64, { run:    anim(10, true,  6) }),
  walk:   sheet("/sprites/player/body_a/walk.png",   F64, { walk:   anim(8,  true,  6) }),
  hit:    sheet("/sprites/player/body_a/hit.png",    F64, { hit:    anim(10, false, 4) }),
  death:  sheet("/sprites/player/body_a/death.png",  F64, { death:  anim(8,  false, 8) }),
  slice:  sheet("/sprites/player/body_a/slice.png",  F64, { slice:  anim(14, false, 8) }),
  pierce: sheet("/sprites/player/body_a/pierce.png", F64, { pierce: anim(14, false, 8) }),
  crush:  sheet("/sprites/player/body_a/crush.png",  F64, { crush:  anim(14, false, 8) }),
};

// ─── WEAPONS & HANDS ─────────────────────────────────────────────────────────
// Hands.png: 32×96 — 3 rows of 32×32, each row is a different skin tone.
//   Row 0 (y=0)  → skin tone A (light)
//   Row 1 (y=32) → skin tone B (medium)
//   Row 2 (y=64) → skin tone C (dark)
//
// Bone.png / Wood.png: static weapon sprites (tilesheets, not animated).
export const WEAPON_SPRITES = {
  hands: "/sprites/weapons/hands.png",   // 32×96, 3 skin variants stacked vertically
  bone:  "/sprites/weapons/bone.png",    // 224×144 static tilesheet
  wood:  "/sprites/weapons/wood.png",    // 192×112 static tilesheet
};

// ─── ENVIRONMENT ─────────────────────────────────────────────────────────────
// Station sprites — used in Village / Forge panels as decorative art.
// All are static PNGs (no animation), various sizes from the pack.
export const STATION_SPRITES = {
  anvil:      "/sprites/environment/stations/anvil.png",      // 272×160
  bonfire:    "/sprites/environment/stations/bonfire.png",    // 64×384  (multi-frame static sheet)
  workbench:  "/sprites/environment/stations/workbench.png",  // 192×352
  furnace:    "/sprites/environment/stations/furnace.png",    // 192×384
};

// Animated station sheets — horizontal strips for use with AnimatedSprite.
export const STATION_ANIM_SPRITES = {
  bonfire: sheet("/sprites/environment/animated/bonfire_anim.png", F32, { idle: anim(8, true, 4) }),
  fire:    sheetNS("/sprites/environment/animated/fire.png", 32, 48,     { idle: anim(8, true, 4) }),
  alchemy: sheetNS("/sprites/environment/animated/alchemy.png", 32, 32,  { idle: anim(6, true, 6) }),
  anvil:   sheetNS("/sprites/environment/animated/anvil_anim.png", 64, 80, { idle: anim(8, true, 8) }),
};

// Props — trees, rocks, vegetation for parallax layers.
export const PROP_SPRITES = {
  rocks:      "/sprites/environment/props/rocks.png",
  vegetation: "/sprites/environment/props/vegetation.png",
  tree_a:     "/sprites/environment/props/tree_a.png",
  tree_b:     "/sprites/environment/props/tree_b.png",
  tree_c:     "/sprites/environment/props/tree_c.png",
};

// Tilesets — dungeon/floor/wall tiles for future use.
export const TILESET_SPRITES = {
  dungeon: "/sprites/environment/tilesets/dungeon_tiles.png",
  floors:  "/sprites/environment/tilesets/floors_tiles.png",
  walls:   "/sprites/environment/tilesets/wall_tiles.png",
  water:   "/sprites/environment/tilesets/water_tiles.png",
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

// ─── PLACEHOLDER ENEMIES (no unique sheet — use filter map below) ─────────────
export const DRAGON_SPRITES = {
  idle:  sheet("/sprites/enemies/orc_warrior/idle.png",  F32, { idle:  anim(6, true,  4) }),
  run:   sheet("/sprites/enemies/orc_warrior/run.png",   F64, { run:   anim(10, true,  6) }),
  death: sheetNS("/sprites/enemies/orc_warrior/death.png", 72, 80, { death: anim(8, false, 8) }),
};

export const GHOST_SPRITES = {
  idle:  sheet("/sprites/enemies/skeleton_mage/idle.png",  F32, { idle:  anim(5, true,  4) }),
  run:   sheet("/sprites/enemies/skeleton_mage/run.png",   F64, { run:   anim(8,  true,  6) }),
  death: sheet("/sprites/enemies/skeleton_mage/death.png", F64, { death: anim(8, false, 6) }),
};

export const SPIDER_SPRITES = {
  idle:  sheet("/sprites/enemies/orc_rogue/idle.png",  F32, { idle:  anim(6, true,  4) }),
  run:   sheet("/sprites/enemies/orc_rogue/run.png",   F64, { run:   anim(12, true,  6) }),
  death: sheet("/sprites/enemies/orc_rogue/death.png", F64, { death: anim(8, false, 6) }),
};

export const ZOMBIE_SPRITES = {
  idle:  sheet("/sprites/enemies/skeleton/idle.png",  F32, { idle:  anim(4, true,  4) }),
  run:   sheet("/sprites/enemies/skeleton/run.png",   F64, { run:   anim(6,  true,  6) }),
  death: sheet("/sprites/enemies/skeleton/death.png", F64, { death: anim(6, false, 12) }),
};

// ─── ENEMY ROSTER MAP ────────────────────────────────────────────────────────
export const ENEMY_SPRITE_MAP = {
  // Orcs
  "Orc":     ORC_SPRITES,
  "Ogre":    ORC_WARRIOR_SPRITES,
  "Goblin":  ORC_ROGUE_SPRITES,

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

  // Beasts
  "Spider":  SPIDER_SPRITES,
  "Dragon":  DRAGON_SPRITES,

  // Sea creatures
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
 * Returns { url, frameW, frameH, frameSize, fps, loop, frames } or null.
 */
export function resolveAnim(spriteSet, action) {
  const s = spriteSet?.[action];
  if (!s) return null;
  const animKey = Object.keys(s.animations)[0];
  const animDef = s.animations[animKey];
  return {
    url: s.url,
    frameSize: s.frameSize,
    frameW: s.frameW,
    frameH: s.frameH,
    fps: animDef.fps,
    loop: animDef.loop,
    frames: animDef.frames,
  };
}

// ─── ENEMY CSS FILTER MAP ────────────────────────────────────────────────────
// Applied via style={{ filter }} in EnemySprite to visually differentiate
// enemies that share the same base sprite sheet.
export const ENEMY_FILTER_MAP = {
  // ── Orcs ──────────────────────────────────────────────────────────────────
  "Orc":      "",
  "Ogre":     "hue-rotate(20deg) saturate(1.4) brightness(0.85)",
  "Goblin":   "hue-rotate(60deg) saturate(1.6) brightness(1.1)",

  // ── Skeletons & undead ────────────────────────────────────────────────────
  "Skeleton": "",
  "Zombie":   "hue-rotate(90deg) saturate(0.9) brightness(0.8)",
  "Ghost":    "hue-rotate(200deg) saturate(0.6) brightness(1.4)",
  "Lich":     "hue-rotate(260deg) saturate(1.4) brightness(0.7)",
  "Vampire":  "hue-rotate(320deg) saturate(0.8) brightness(0.75)",

  // ── Mages / casters ───────────────────────────────────────────────────────
  "Sorcerer":  "hue-rotate(240deg) saturate(1.5) brightness(0.9)",
  "Sorceress": "hue-rotate(300deg) saturate(1.6) brightness(0.95)",
  "Mage":      "hue-rotate(180deg) saturate(1.3) brightness(1.0)",
  "Genie":     "hue-rotate(170deg) saturate(1.8) brightness(1.2)",

  // ── Elves / rogues ────────────────────────────────────────────────────────
  "Elf":          "hue-rotate(100deg) saturate(1.4) brightness(1.1)",
  "Elf Archer":   "hue-rotate(110deg) saturate(1.3) brightness(1.0)",
  "Elf Ranger":   "hue-rotate(130deg) saturate(1.2) brightness(0.9)",
  "Princess":     "hue-rotate(330deg) saturate(1.5) brightness(1.2)",
  "Prince":       "hue-rotate(200deg) saturate(1.2) brightness(1.0)",
  "Merchant":     "sepia(0.6) saturate(1.2) brightness(0.95)",

  // ── Beasts ────────────────────────────────────────────────────────────────
  "Spider":  "brightness(0.4) contrast(1.4)",
  "Dragon":  "hue-rotate(0deg) saturate(1.8) brightness(1.1)",

  // ── Sea creatures ─────────────────────────────────────────────────────────
  "Mermaid":  "hue-rotate(160deg) saturate(1.6) brightness(1.1)",
  "Merman":   "hue-rotate(185deg) saturate(1.4) brightness(0.95)",
  "Merfolk":  "hue-rotate(175deg) saturate(1.5) brightness(1.0)",

  // ── Fae ───────────────────────────────────────────────────────────────────
  "Pixie":  "hue-rotate(280deg) saturate(1.8) brightness(1.3)",
  "Sprite": "hue-rotate(140deg) saturate(2.0) brightness(1.3)",
  "Fairy":  "hue-rotate(310deg) saturate(1.7) brightness(1.25)",
};

/**
 * Returns the CSS filter string for a given enemy name.
 * Safe to use directly in style={{ filter: getEnemyFilter(name) }}
 */
export function getEnemyFilter(enemyName) {
  return ENEMY_FILTER_MAP[enemyName] ?? "";
}
