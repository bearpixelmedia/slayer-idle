// Game stages data
export const STAGES = [
  { name: "Goblin Warren", bgGradient: "from-green-900 to-green-800", color: "#22c55e", enemies: ["Goblin", "Orc"] },
  { name: "Dark Forest", bgGradient: "from-blue-900 to-blue-800", color: "#3b82f6", enemies: ["Orc", "Skeleton"] },
  { name: "Crystal Caverns", bgGradient: "from-cyan-900 to-cyan-800", color: "#06b6d4", enemies: ["Skeleton", "Vampire"] },
  { name: "Volcanic Peak", bgGradient: "from-orange-900 to-red-900", color: "#f97316", enemies: ["Vampire", "Dragon"] },
  { name: "Celestial Realm", bgGradient: "from-purple-900 to-indigo-900", color: "#a855f7", enemies: ["Dragon", "Lich"] },
  { name: "Abyss", bgGradient: "from-slate-900 to-black", color: "#64748b", enemies: ["Lich"] },
];

// Zone definitions
export const ZONES = [
  {
    id: "realm_of_light",
    name: "Realm of Light",
    description: "The starting zone with gentle enemies",
    emoji: "☀️",
    unlockRequirement: null, // Starting zone, always unlocked
    stagesRange: [0, 2],
  },
  {
    id: "whispering_woods",
    name: "Whispering Woods",
    description: "A farmable zone for steady progression",
    emoji: "🌲",
    unlockRequirement: {
      progressMilestone: "Clear Stage 2 in Realm of Light",
      spCost: 5,
    },
    stagesRange: [1, 4],
  },
  {
    id: "shadowfell_citadel",
    name: "Shadowfell Citadel",
    description: "Endgame challenges and rare drops",
    emoji: "🏰",
    unlockRequirement: {
      progressMilestone: "Clear Stage 4 in Whispering Woods",
      spCost: 15,
    },
    stagesRange: [3, 5],
  },
];

// Enemy emojis
export const ENEMY_EMOJIS = {
  "Goblin": "👹",
  "Orc": "🗡️",
  "Skeleton": "💀",
  "Vampire": "🧛",
  "Dragon": "🐉",
  "Lich": "👻",
};

// Upgrade definitions
export const UPGRADES = [
  { id: "sharp_blade",    name: "Sharp Blade",    icon: "⚔️",  description: "+5 tap damage per level",      basePower: 5,   baseCost: 50  },
  { id: "iron_gauntlet",  name: "Iron Gauntlet",  icon: "🥊",  description: "+10 tap damage per level",     basePower: 10,  baseCost: 150 },
  { id: "war_axe",        name: "War Axe",        icon: "🪓",  description: "+20 tap damage per level",     basePower: 20,  baseCost: 400 },
  { id: "soul_blade",     name: "Soul Blade",     icon: "🗡️",  description: "+50 tap damage per level",     basePower: 50,  baseCost: 1200 },
  { id: "fire_sword",     name: "Fire Sword",     icon: "🔥",  description: "+100 tap damage per level",    basePower: 100, baseCost: 4000 },
  { id: "imp_familiar",   name: "Imp Familiar",   icon: "👿",  description: "+3 idle DPS per level",        basePower: 3,   baseCost: 100 },
  { id: "shadow_wolf",    name: "Shadow Wolf",    icon: "🐺",  description: "+8 idle DPS per level",        basePower: 8,   baseCost: 300 },
  { id: "golem_guard",    name: "Golem Guard",    icon: "🪨",  description: "+18 idle DPS per level",       basePower: 18,  baseCost: 800 },
  { id: "dragon_pet",     name: "Dragon Pet",     icon: "🐲",  description: "+40 idle DPS per level",       basePower: 40,  baseCost: 2500 },
  { id: "ancient_rune",   name: "Ancient Rune",   icon: "🔮",  description: "+15 to all damage per level",  basePower: 15,  baseCost: 600 },
  { id: "chaos_gem",      name: "Chaos Gem",      icon: "💎",  description: "+35 to all damage per level",  basePower: 35,  baseCost: 2000 },
  { id: "bow",            name: "Elven Bow",      icon: "🏹",  description: "Unlocks bow mode (+25% souls)", basePower: 0,  baseCost: 500 },
  { id: "pack_size",      name: "Pack Size",      icon: "👥",  description: "+1 max enemy cluster size",     basePower: 1,  baseCost: 800 },
];

// Upgrade category IDs
export const TAP_UPGRADES  = ["sharp_blade", "iron_gauntlet", "war_axe", "soul_blade", "fire_sword"];
export const IDLE_UPGRADES = ["imp_familiar", "shadow_wolf", "golem_guard", "dragon_pet"];
export const ALL_UPGRADES  = ["ancient_rune", "chaos_gem"];
export const BOW_UPGRADES  = ["bow"];

// Upgrade cost formula — accepts an upgrade object or a base price number
export function getUpgradeCost(upgradeOrBasePrice, level) {
  const base = typeof upgradeOrBasePrice === "object" ? upgradeOrBasePrice.baseCost : upgradeOrBasePrice;
  return Math.floor(base * Math.pow(1.15, level));
}

// Enemy HP calculation
export function getEnemyHP(stage, killCount) {
  const baseHP = 10 + stage * 15;
  const killBonus = killCount * 0.5;
  return Math.ceil(baseHP + killBonus);
}

// Enemy reward (coins)
export function getEnemyReward(stage, killCount) {
  const baseReward = 10 + stage * 20;
  const killBonus = killCount * 2;
  return Math.ceil(baseReward + killBonus);
}

// Enemy soul reward
export function getEnemySouls(stage) {
  return stage > 0 ? 0.1 + stage * 0.05 : 0;
}

// Prestige soul calculation
export function getSoulsOnPrestige(totalCoinsEarned) {
  return Math.floor(Math.sqrt(totalCoinsEarned) / 10);
}

// Slayer points on prestige
export function getSlayerPointsOnPrestige(souls) {
  return Math.floor(souls / 5);
}

// Bow soul multiplier
export function getBowSoulMultiplier(bowLevel) {
  return 1 + bowLevel * 0.05;
}

// Get available stage indices for a zone (returns an array of stage indices)
export function getZoneStages(zoneId) {
  const zone = ZONES.find(z => z?.id === zoneId);
  if (!zone || !zone.stagesRange) return STAGES.map((_, i) => i);
  const [start, end] = zone.stagesRange;
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

// Helper to check if a zone can be unlocked
export function canUnlockZone(zoneId, unlockedZoneIds, zoneProgress, slayerPoints) {
  const zone = ZONES.find(z => z?.id === zoneId);
  if (!zone || unlockedZoneIds?.includes(zoneId)) return false;
  if (!zone.unlockRequirement) return true;

  const cost = zone.unlockRequirement.spCost;
  if (slayerPoints < cost) return false;

  // Check progress milestone
  if (zoneId === "whispering_woods") {
    const realmProgress = zoneProgress["realm_of_light"];
    return realmProgress && realmProgress.highestStage >= 2;
  }
  if (zoneId === "shadowfell_citadel") {
    const woodsProgress = zoneProgress["whispering_woods"];
    return woodsProgress && woodsProgress.highestStage >= 4;
  }

  return true;
}