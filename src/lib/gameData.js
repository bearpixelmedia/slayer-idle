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

export const STAGES = [
  { name: "Grassy Plains", color: "#4ade80", enemies: ["Slime", "Goblin", "Rat"], bgGradient: "from-green-900/30 to-emerald-900/20", soulBias: 0.3 },
  { name: "Dark Forest", color: "#22c55e", enemies: ["Wolf", "Spider", "Treant"], bgGradient: "from-emerald-900/40 to-green-950/30", soulBias: 0.5 },
  { name: "Haunted Caves", color: "#a78bfa", enemies: ["Bat", "Skeleton", "Ghost"], bgGradient: "from-purple-900/40 to-indigo-950/30", soulBias: 1.2 },
  { name: "Lava Fields", color: "#f97316", enemies: ["Fire Imp", "Magma Golem", "Phoenix"], bgGradient: "from-orange-900/40 to-red-950/30", soulBias: 0.7 },
  { name: "Frozen Peaks", color: "#38bdf8", enemies: ["Ice Wraith", "Frost Giant", "Yeti"], bgGradient: "from-blue-900/40 to-cyan-950/30", soulBias: 0.6 },
  { name: "Shadow Realm", color: "#c084fc", enemies: ["Demon", "Shadow Knight", "Dark Lord"], bgGradient: "from-violet-900/40 to-purple-950/40", soulBias: 1.5 },
  { name: "Celestial Void", color: "#fbbf24", enemies: ["Star Eater", "Void Walker", "Cosmic Dragon"], bgGradient: "from-yellow-900/30 to-amber-950/30", soulBias: 2.0 },
];

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
};

export const UPGRADES = [
  { id: "sword", name: "Sharper Sword", icon: "⚔️", baseCost: 10, costMultiplier: 1.15, basePower: 1, description: "Increases tap damage" },
  { id: "boots", name: "Swift Boots", icon: "👢", baseCost: 50, costMultiplier: 1.2, basePower: 2, description: "Increases idle coins/sec" },
  { id: "armor", name: "Battle Armor", icon: "🛡️", baseCost: 200, costMultiplier: 1.25, basePower: 5, description: "Increases idle coins/sec" },
  { id: "pet", name: "Attack Pet", icon: "🐉", baseCost: 1000, costMultiplier: 1.3, basePower: 15, description: "Increases idle coins/sec" },
  { id: "ring", name: "Power Ring", icon: "💍", baseCost: 5000, costMultiplier: 1.35, basePower: 50, description: "Increases tap damage" },
  { id: "scroll", name: "Ancient Scroll", icon: "📜", baseCost: 25000, costMultiplier: 1.4, basePower: 150, description: "Increases idle coins/sec" },
  { id: "crown", name: "Kings Crown", icon: "👑", baseCost: 100000, costMultiplier: 1.45, basePower: 500, description: "Increases all earnings" },
  { id: "orb", name: "Soul Orb", icon: "🔮", baseCost: 500000, costMultiplier: 1.5, basePower: 2000, description: "Increases all earnings" },
];

export const TAP_UPGRADES = ["sword", "ring"];
export const IDLE_UPGRADES = ["boots", "armor", "pet", "scroll"];
export const ALL_UPGRADES = ["crown", "orb"];

export function getUpgradeCost(upgrade, level) {
  let cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, level));
  
  // Apply upgrade cost wall every 10 levels
  if (level > 0 && level % UPGRADE_COST_MILESTONE_INTERVAL === 0) {
    cost = Math.floor(cost * UPGRADE_COST_MILESTONE_MULTIPLIER);
  }
  
  return cost;
}

export function getEnemyHP(stage, killCount) {
  const base = 4 + stage * 8;
  // Intentional wall: HP scales linearly until wall, then quadratically at boundaries (every 25 kills)
  const killsInStage = killCount % 25;
  const wallPhase = Math.floor(killCount / 25);
  // Linear growth within stage + sharp quadratic jump at walls
  const linearScaling = killsInStage * (1.5 + stage * 0.8);
  const wallPenalty = wallPhase * wallPhase * (15 + stage * 20);
  return base + Math.floor(linearScaling + wallPenalty);
}

export function getEnemyReward(stage, killCount) {
  const base = 2 + stage * 2;
  const scaling = Math.floor(killCount / 8) * (0.8 + stage * 0.3);
  let reward = Math.floor(base + scaling);
  
  // Apply coin reward bands within stage
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
  // Base soul drop that scales with stage
  const base = 0.5 + stage * 0.3;
  let soulScaling = 0;
  
  // Remove per-kill scaling in final band (kills 17-24)
  const killsInStage = killCount % 25;
  if (killsInStage < SOUL_REWARD_BAND_3_THRESHOLD) {
    soulScaling = killsInStage * 0.02;
  }
  
  return base + soulScaling;
}

export function getSoulsOnPrestige(totalCoinsEarned) {
  // Aggressive early thresholds; prestige becomes more valuable the farther you go
  const sqrtCoins = Math.sqrt(totalCoinsEarned / 500);
  return Math.floor(sqrtCoins * (1 + sqrtCoins * 0.1)); // bonus multiplier for deep runs
}

export function getSlayerPointsOnPrestige(souls) {
  // SP gains accelerate with more souls (incentivizes chaining prestiges for skill unlocks)
  return Math.floor(Math.sqrt(souls) + Math.floor(souls / 50));
}