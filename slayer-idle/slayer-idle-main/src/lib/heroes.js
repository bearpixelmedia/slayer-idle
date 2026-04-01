/**
 * heroes.js
 *
 * The three recruitable heroes from the Pixel Crawler asset pack.
 * The player can have up to MAX_HEROES active at once.
 *
 * Each hero:
 *   - Has a unique idle DPS contribution
 *   - Has a unique passive ability that activates when recruited
 *   - Has a unique active ability on a cooldown
 *   - Levels up independently using coins
 *   - Is represented by their Pixel Crawler sprite
 *
 * Hero state lives in gameState.heroes: { [heroId]: { level, unlockedAt } }
 */

export const MAX_HEROES = 3;

// ─── Hero definitions ─────────────────────────────────────────────────────────

export const HEROES = [
  {
    id: "knight",
    name: "Knight",
    title: "Iron Guard",
    description: "A stalwart defender. Reduces damage taken and adds steady melee DPS.",
    spriteKey: "knight",          // → KNIGHT_SPRITES in sprites.js
    attackType: "melee",

    // Base stats at level 1
    baseDPS: 5,
    dpsPerLevel: 4,

    // Unlock cost (coins)
    unlockCost: 500,

    // Level-up cost formula: baseLevelCost * 1.18^level
    baseLevelCost: 150,
    levelCostGrowth: 1.18,

    // Passive: reduces all incoming damage while recruited
    passive: {
      id: "iron_guard",
      name: "Iron Guard",
      description: "Reduces incoming enemy damage by 5% per hero level (max 40%).",
      type: "damageReduction",
      valuePerLevel: 0.05,
      maxValue: 0.40,
    },

    // Active ability: burst taunt — locks all enemy attention for a short window
    ability: {
      id: "shield_wall",
      name: "Shield Wall",
      description: "Blocks all damage for 3 seconds. 30s cooldown.",
      icon: "🛡️",
      cooldown: 30,
      duration: 3,
      type: "invincibility",
    },
  },

  {
    id: "rogue",
    name: "Rogue",
    title: "Shadow Blade",
    description: "Fast and lethal. Boosts tap damage and lands critical hits.",
    spriteKey: "rogue",           // → ROGUE_SPRITES in sprites.js
    attackType: "melee",

    baseDPS: 4,
    dpsPerLevel: 5,

    unlockCost: 500,

    baseLevelCost: 150,
    levelCostGrowth: 1.18,

    // Passive: boosts tap damage while recruited
    passive: {
      id: "shadow_strike",
      name: "Shadow Strike",
      description: "Increases tap damage by 8% per hero level (max 60%).",
      type: "tapDamageBoost",
      valuePerLevel: 0.08,
      maxValue: 0.60,
    },

    // Active ability: critical burst — next 5 taps deal 5x damage
    ability: {
      id: "backstab",
      name: "Backstab",
      description: "Next 5 taps deal 5× damage. 25s cooldown.",
      icon: "🗡️",
      cooldown: 25,
      hits: 5,
      multiplier: 5,
      type: "critBurst",
    },
  },

  {
    id: "wizard",
    name: "Wizard",
    title: "Arcane Scholar",
    description: "Commands the arcane. Boosts soul gain and deals magic idle DPS.",
    spriteKey: "wizard",          // → WIZARD_SPRITES in sprites.js
    attackType: "magic",

    baseDPS: 3,
    dpsPerLevel: 6,

    unlockCost: 500,

    baseLevelCost: 150,
    levelCostGrowth: 1.18,

    // Passive: increases soul gain while recruited
    passive: {
      id: "arcane_attunement",
      name: "Arcane Attunement",
      description: "Increases soul gain by 10% per hero level (max 80%).",
      type: "soulGainBoost",
      valuePerLevel: 0.10,
      maxValue: 0.80,
    },

    // Active ability: arcane bomb — deals a burst of magic damage to all enemies
    ability: {
      id: "arcane_bomb",
      name: "Arcane Bomb",
      description: "Deals 20× your tap damage to all enemies on screen. 35s cooldown.",
      icon: "💥",
      cooldown: 35,
      multiplier: 20,
      type: "aoeBlast",
    },
  },
];

// ─── Lookup helpers ───────────────────────────────────────────────────────────

export const HERO_BY_ID = Object.fromEntries(HEROES.map((h) => [h.id, h]));

export const HERO_IDS = HEROES.map((h) => h.id);

/**
 * Get a hero's DPS at a given level.
 */
export function getHeroDPS(heroId, level) {
  const hero = HERO_BY_ID[heroId];
  if (!hero || level < 1) return 0;
  return hero.baseDPS + hero.dpsPerLevel * (level - 1);
}

/**
 * Coin cost to level a hero from its current level to the next.
 */
export function getHeroLevelCost(heroId, currentLevel) {
  const hero = HERO_BY_ID[heroId];
  if (!hero) return Infinity;
  return Math.floor(hero.baseLevelCost * Math.pow(hero.levelCostGrowth, currentLevel));
}

/**
 * Get the current value of a hero's passive at a given level.
 */
export function getHeroPassiveValue(heroId, level) {
  const hero = HERO_BY_ID[heroId];
  if (!hero || level < 1) return 0;
  return Math.min(hero.passive.valuePerLevel * level, hero.passive.maxValue);
}

/**
 * Compute the combined passive multiplier for all recruited heroes.
 * Returns an object: { damageReduction, tapDamageBoost, soulGainBoost }
 */
export function computeHeroPassives(heroLevels = {}) {
  const result = {
    damageReduction: 0,
    tapDamageBoost: 0,
    soulGainBoost: 0,
  };

  for (const [heroId, level] of Object.entries(heroLevels)) {
    if (!level || level < 1) continue;
    const hero = HERO_BY_ID[heroId];
    if (!hero) continue;
    const value = getHeroPassiveValue(heroId, level);
    result[hero.passive.type] = (result[hero.passive.type] || 0) + value;
  }

  // Cap damage reduction
  result.damageReduction = Math.min(result.damageReduction, 0.70);

  return result;
}

/**
 * Total idle DPS contributed by all recruited heroes.
 */
export function computeHeroDPS(heroLevels = {}) {
  let total = 0;
  for (const [heroId, level] of Object.entries(heroLevels)) {
    if (!level || level < 1) continue;
    total += getHeroDPS(heroId, level);
  }
  return total;
}
