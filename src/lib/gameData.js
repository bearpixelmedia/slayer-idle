// --- ECONOMY TUNING CONSTANTS ---
const UPGRADE_COST_MILESTONE_INTERVAL = 10;
const UPGRADE_COST_MILESTONE_MULTIPLIER = 1.12;

const COIN_REWARD_BAND_1_THRESHOLD = 7;
const COIN_REWARD_BAND_1_MULTIPLIER = 1.05;
const COIN_REWARD_BAND_2_THRESHOLD = 16;
const COIN_REWARD_BAND_2_MULTIPLIER = 1.0;
const COIN_REWARD_BAND_3_MULTIPLIER = 0.90;

const SOUL_REWARD_BAND_3_THRESHOLD = 17;
// --- END ECONOMY TUNING CONSTANTS ---

export const ZONES = [
  {
    id: "realm-of-light",
    name: "Realm of Light",
    description: "The starting world where your journey begins",
    unlockedByDefault: true,
    stages: [
      { name: "Grassy Plains", color: "#4ade80", enemies: ["Slime", "Goblin", "Rat"], bgGradient: "from-green-900/30 to-emerald-900/20", soulBias: 0.3 },
      { name: "Dark Forest", color: "#22c55e", enemies: ["Wolf", "Spider", "Treant"], bgGradient: "from-emerald-900/40 to-green-950/30", soulBias: 0.5 },
      { name: "Haunted Caves", color: "#a78bfa", enemies: ["Bat", "Skeleton", "Ghost"], bgGradient: "from-purple-900/40 to-indigo-950/30", soulBias: 1.2 },
      { name: "Lava Fields", color: "#f97316", enemies: ["Fire Imp", "Magma Golem", "Phoenix"], bgGradient: "from-orange-900/40 to-red-950/30", soulBias: 0.7 },
      { name: "Frozen Peaks", color: "#38bdf8", enemies: ["Ice Wraith", "Frost Giant", "Yeti"], bgGradient: "from-blue-900/40 to-cyan-950/30", soulBias: 0.6 },
      { name: "Shadow Realm", color: "#c084fc", enemies: ["Demon", "Shadow Knight", "Dark Lord"], bgGradient: "from-violet-900/40 to-purple-950/40", soulBias: 1.5 },
      { name: "Celestial Void", color: "#fbbf24", enemies: ["Star Eater", "Void Walker", "Cosmic Dragon"], bgGradient: "from-yellow-900/30 to-amber-950/30", soulBias: 2.0 },
    ],
  },
  {
    id: "whispering-woods",
    name: "Whispering Woods",
    description: "An alternate path with higher soul yields",
    unlockedByDefault: false,
    unlockRequirement: { milestone: "stage_25", spCost: 15 },
    coinBias: 0.85,
    soulBias: 1.3,
    stages: [
      { name: "Emerald Grove", color: "#10b981", enemies: ["Forest Spirit", "Enchanted Hound", "Moss Guardian"], bgGradient: "from-emerald-900/50 to-teal-900/30", soulBias: 0.4 },
      { name: "Twilight Glade", color: "#6366f1", enemies: ["Shadow Fox", "Twilight Wraith", "Moon Cultist"], bgGradient: "from-indigo-900/40 to-purple-900/40", soulBias: 0.7 },
      { name: "Crystal Caverns", color: "#ec4899", enemies: ["Crystal Golem", "Prism Elemental", "Mirror Beast"], bgGradient: "from-pink-900/40 to-rose-900/30", soulBias: 1.4 },
      { name: "Whispering Crypt", color: "#8b5cf6", enemies: ["Spectral Knight", "Soul Eater", "Void Phantom"], bgGradient: "from-violet-900/50 to-indigo-950/40", soulBias: 2.0 },
      { name: "Ancient Shrine", color: "#14b8a6", enemies: ["Temple Guardian", "Cursed Priest", "Rune Keeper"], bgGradient: "from-teal-900/40 to-cyan-950/30", soulBias: 1.8 },
      { name: "Starfall Nexus", color: "#f59e0b", enemies: ["Celestial Sentinel", "Star Harvester", "Cosmic Herald"], bgGradient: "from-amber-900/40 to-yellow-950/30", soulBias: 2.2 },
    ],
  },
  {
    id: "shadowfell-citadel",
    name: "Shadowfell Citadel",
    description: "The ultimate challenge with superior rewards",
    unlockedByDefault: false,
    unlockRequirement: { milestone: "stage_50_any_zone", spCost: 50 },
    coinBias: 1.2,
    soulBias: 1.6,
    stages: [
      { name: "Obsidian Gates", color: "#1f2937", enemies: ["Abyssal Warden", "Shadowbound Brute", "Void Sentinel"], bgGradient: "from-gray-900/60 to-black/50", soulBias: 0.6 },
      { name: "Infernal Chasm", color: "#dc2626", enemies: ["Infernal Tyrant", "Lava Daemon", "Hellfire Reaver"], bgGradient: "from-red-900/50 to-black/50", soulBias: 1.2 },
      { name: "Throne of Chaos", color: "#7c3aed", enemies: ["Chaos Lord", "Reality Ripper", "Dimensional Rift"], bgGradient: "from-violet-900/60 to-black/50", soulBias: 1.8 },
      { name: "Nexus Core", color: "#06b6d4", enemies: ["Core Guardian", "Singularity Entity", "Existence Eater"], bgGradient: "from-cyan-900/50 to-black/60", soulBias: 2.2 },
      { name: "Crown of Shadows", color: "#a855f7", enemies: ["Shadow Emperor", "Void Sovereign", "The Eternal Dusk"], bgGradient: "from-purple-900/60 to-black/60", soulBias: 2.8 },
    ],
  },
];

// Legacy STAGES export for compatibility (Zone 1 stages)
export const STAGES = ZONES[0].stages;

export const ENEMY_EMOJIS = {
  "Slime": "🟢", "Goblin": "👺", "Rat": "🐀",
  "Wolf": "🐺", "Spider": "🕷️", "Treant": "🌳",
  "Bat": "🦇", "Skeleton": "💀", "Ghost": "👻",
  "Fire Imp": "👿", "Magma Golem": "🗿", "Phoenix": "🔥",
  "Ice Wraith": "❄️", "Frost Giant": "🧊", "Yeti": "⛄",
  "Demon": "😈", "Shadow Knight": "🖤", "Dark Lord": "👑",
  "Star Eater": "⭐", "Void Walker": "🌀", "Cosmic Dragon": "🐉",
  "Slime King": "👑", "Forest Guardian": "🌲", "Spectral King": "👻",
  "Infernal Lord": "🔥", "Frost Sovereign": "❄️", "Shadow Overlord": "🖤",
  "Cosmic Titan": "🌌",
  "Forest Spirit": "🌿", "Enchanted Hound": "🐕", "Moss Guardian": "🪨",
  "Shadow Fox": "🦊", "Twilight Wraith": "👤", "Moon Cultist": "🌙",
  "Crystal Golem": "💎", "Prism Elemental": "✨", "Mirror Beast": "🪞",
  "Spectral Knight": "⚔️", "Soul Eater": "💀", "Void Phantom": "👻",
  "Temple Guardian": "🏛️", "Cursed Priest": "⛪", "Rune Keeper": "📜",
  "Celestial Sentinel": "👁️", "Star Harvester": "🌟", "Cosmic Herald": "📯",
  "Abyssal Warden": "🌑", "Shadowbound Brute": "💪", "Void Sentinel": "⚫",
  "Infernal Tyrant": "👹", "Lava Daemon": "🔥", "Hellfire Reaver": "⚔️",
  "Chaos Lord": "👿", "Reality Ripper": "🌀", "Dimensional Rift": "🌌",
  "Core Guardian": "🔮", "Singularity Entity": "⭐", "Existence Eater": "🐉",
  "Shadow Emperor": "👑", "Void Sovereign": "🖤", "The Eternal Dusk": "🌑",
};

export const UPGRADES = [
  { id: "sword", name: "Sharper Sword", icon: "⚔️", baseCost: 10, costMultiplier: 1.15, basePower: 1, description: "Increases tap damage" },
  { id: "boots", name: "Swift Boots", icon: "👢", baseCost: 50, costMultiplier: 1.2, basePower: 2, description: "Increases idle coins/sec" },
  { id: "armor", name: "Battle Armor", icon: "🛡️", baseCost: 200, costMultiplier: 1.25, basePower: 5, description: "Increases idle coins/sec" },
  { id: "pet", name: "Attack Pet", icon: "🐉", baseCost: 1000, costMultiplier: 1.3, basePower: 15, description: "Increases idle coins/sec" },
  { id: "ring", name: "Power Ring", icon: "💍", baseCost: 5000, costMultiplier: 1.35, basePower: 50, description: "Increases tap damage" },
  { id: "scroll", name: "Ancient Scroll", icon: "📜", baseCost: 25000, costMultiplier: 1.4, basePower: 150, description: "Increases idle coins/sec" },
  { id: "bow", name: "Enchanted Bow", icon: "🏹", baseCost: 15000, costMultiplier: 1.38, basePower: 80, description: "Bow damage & soul farming" },
  { id: "crown", name: "Kings Crown", icon: "👑", baseCost: 100000, costMultiplier: 1.45, basePower: 500, description: "Increases all earnings" },
  { id: "orb", name: "Soul Orb", icon: "🔮", baseCost: 500000, costMultiplier: 1.5, basePower: 2000, description: "Increases all earnings" },
];

export const TAP_UPGRADES = ["sword", "ring", "bow"];
export const IDLE_UPGRADES = ["boots", "armor", "pet", "scroll"];
export const ALL_UPGRADES = ["crown", "orb"];
export const BOW_UPGRADES = ["bow"];

export function getUpgradeCost(upgrade, level) {
  let cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, level));
  
  if (level > 0 && level % UPGRADE_COST_MILESTONE_INTERVAL === 0) {
    cost = Math.floor(cost * UPGRADE_COST_MILESTONE_MULTIPLIER);
  }
  
  return cost;
}

export function getEnemyHP(stage, killCount) {
  const base = 4 + stage * 8;
  const killsInStage = killCount % 25;
  const wallPhase = Math.floor(killCount / 25);
  const linearScaling = killsInStage * (1.5 + stage * 0.8);
  const wallPenalty = wallPhase * wallPhase * (15 + stage * 20);
  return base + Math.floor(linearScaling + wallPenalty);
}

export function getEnemyReward(stage, killCount) {
  const base = 2 + stage * 2;
  const scaling = Math.floor(killCount / 8) * (0.8 + stage * 0.3);
  let reward = Math.floor(base + scaling);
  
  const killsInStage = killCount % 25;
  if (killsInStage <= COIN_REWARD_BAND_1_THRESHOLD) {
    reward = Math.floor(reward * COIN_REWARD_BAND_1_MULTIPLIER);
  } else if (killsInStage <= COIN_REWARD_BAND_2_THRESHOLD) {
    reward = Math.floor(reward * COIN_REWARD_BAND_2_MULTIPLIER);
  } else {
    reward = Math.floor(reward * COIN_REWARD_BAND_3_MULTIPLIER);
  }
  
  return reward;
}

export function getEnemySouls(stage, killCount) {
  const base = 0.5 + stage * 0.3;
  let soulScaling = 0;
  
  const killsInStage = killCount % 25;
  if (killsInStage < SOUL_REWARD_BAND_3_THRESHOLD) {
    soulScaling = killsInStage * 0.02;
  }
  
  return base + soulScaling;
}

export function getSoulsOnPrestige(totalCoinsEarned) {
  const sqrtCoins = Math.sqrt(totalCoinsEarned / 500);
  return Math.floor(sqrtCoins * (1 + sqrtCoins * 0.1));
}

export function getSlayerPointsOnPrestige(souls) {
  return Math.floor(Math.sqrt(souls) + Math.floor(souls / 50));
}

export function getBowSoulMultiplier() {
  return 1.3;
}

// Zone unlock helper
export function canUnlockZone(zoneId, unlockedZoneIds, highestStagesByZone, slayerPoints) {
  const zone = ZONES.find(z => z.id === zoneId);
  if (!zone) return false;
  if (zone.unlockedByDefault) return true;
  if (unlockedZoneIds.includes(zoneId)) return true;

  const req = zone.unlockRequirement;
  if (!req) return false;

  const enoughSP = slayerPoints >= req.spCost;
  
  if (req.milestone === "stage_25") {
    const zone1Reached = (highestStagesByZone["realm-of-light"] || 0) >= 25;
    return enoughSP && zone1Reached;
  } else if (req.milestone === "stage_50_any_zone") {
    const anyZone50 = Object.values(highestStagesByZone || {}).some(s => s >= 50);
    return enoughSP && anyZone50;
  }

  return false;
}

export function getZoneStages(zoneId) {
  const zone = ZONES.find(z => z.id === zoneId);
  return zone ? zone.stages : STAGES;
}

export function getZone(zoneId) {
  return ZONES.find(z => z.id === zoneId);
}