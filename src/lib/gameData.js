// ── Enemy emoji variants ─────────────────────────────────────────────────────
export const ZOMBIE_EMOJI_VARIANTS = ["🧟", "🧟‍♂️", "🧟‍♀️"];
export const VAMPIRE_EMOJI_VARIANTS = ["🧛", "🧛‍♂️", "🧛‍♀️"];

export const ENEMY_EMOJIS = {
  Slime:    "🟢",
  Bat:      "🦇",
  Spider:   "🕷️",
  Skeleton: "💀",
  Zombie:   "🧟",
  Vampire:  "🧛",
  Ghost:    "👻",
  Demon:    "😈",
  Dragon:   "🐉",
  Goblin:   "👺",
  Orc:      "👹",
  Troll:    "🧌",
  Wolf:     "🐺",
  Witch:    "🧙",
  Lich:     "☠️",
};

// ── Enemy helpers ─────────────────────────────────────────────────────────────
const WEAPON_ENEMIES = new Set(["Skeleton", "Zombie", "Vampire", "Orc", "Goblin", "Troll"]);
export function enemyHasWeapons(enemyName) {
  return WEAPON_ENEMIES.has(enemyName);
}

const IDLE_ANIM_CLASSES = {
  Bat:   "animate-bounce",
  Ghost: "animate-pulse",
  Slime: "animate-bounce",
};
export function getEnemyIdleAnimClass(enemyName) {
  return IDLE_ANIM_CLASSES[enemyName] ?? "";
}

// ── Zones ─────────────────────────────────────────────────────────────────────
export const ZONES = [
  { id: "forest",   name: "Dark Forest",   description: "A haunted woodland teeming with undead.", unlockRequirement: null },
  { id: "crypt",    name: "Ancient Crypt",  description: "Crumbling tombs hide terrible secrets.",  unlockRequirement: { spCost: 5 } },
  { id: "volcano",  name: "Volcano Lair",  description: "Fiery demons guard molten treasure.",       unlockRequirement: { spCost: 15 } },
  { id: "abyss",    name: "The Abyss",     description: "Darkness beyond imagination.",              unlockRequirement: { spCost: 40 } },
];

export function canUnlockZone(zoneId, unlockedZoneIds, zoneProgress, slayerPoints) {
  const zone = ZONES.find(z => z.id === zoneId);
  if (!zone) return false;
  if (unlockedZoneIds.includes(zoneId)) return true;
  const req = zone.unlockRequirement;
  if (!req) return true;
  return (slayerPoints ?? 0) >= (req.spCost ?? 0);
}

// ── Upgrade helpers ───────────────────────────────────────────────────────────
export const TAP_UPGRADES  = ["sword_1", "bow_1"];
export const IDLE_UPGRADES = ["shield_1", "armor_1", "magic_1"];

export const UPGRADES = [
  { id: "sword_1",   name: "Iron Sword",    baseCost: 10,  cps: 0.5,  description: "A basic iron sword." },
  { id: "shield_1",  name: "Wooden Shield", baseCost: 50,  cps: 1,    description: "Blocks some damage." },
  { id: "armor_1",   name: "Leather Armor", baseCost: 150, cps: 2.5,  description: "Basic protection." },
  { id: "bow_1",     name: "Short Bow",     baseCost: 400, cps: 5,    description: "Ranged attacks." },
  { id: "magic_1",   name: "Magic Staff",   baseCost: 900, cps: 10,   description: "Channels magic." },
];

export function getUpgradeCost(upgrade, currentLevel) {
  return Math.floor(upgrade.baseCost * Math.pow(1.15, currentLevel));
}