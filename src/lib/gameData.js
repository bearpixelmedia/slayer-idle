export const STAGES = [
  { name: "Grassy Plains", color: "#4ade80", enemies: ["Slime", "Goblin", "Rat"], bgGradient: "from-green-900/30 to-emerald-900/20" },
  { name: "Dark Forest", color: "#22c55e", enemies: ["Wolf", "Spider", "Treant"], bgGradient: "from-emerald-900/40 to-green-950/30" },
  { name: "Haunted Caves", color: "#a78bfa", enemies: ["Bat", "Skeleton", "Ghost"], bgGradient: "from-purple-900/40 to-indigo-950/30" },
  { name: "Lava Fields", color: "#f97316", enemies: ["Fire Imp", "Magma Golem", "Phoenix"], bgGradient: "from-orange-900/40 to-red-950/30" },
  { name: "Frozen Peaks", color: "#38bdf8", enemies: ["Ice Wraith", "Frost Giant", "Yeti"], bgGradient: "from-blue-900/40 to-cyan-950/30" },
  { name: "Shadow Realm", color: "#c084fc", enemies: ["Demon", "Shadow Knight", "Dark Lord"], bgGradient: "from-violet-900/40 to-purple-950/40" },
  { name: "Celestial Void", color: "#fbbf24", enemies: ["Star Eater", "Void Walker", "Cosmic Dragon"], bgGradient: "from-yellow-900/30 to-amber-950/30" },
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
  return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, level));
}

export function getEnemyHP(stage, killCount) {
  const base = 3 + stage * 10;
  // Intentional wall: scaling accelerates every 25 kills (stage boundary)
  const wallPhase = Math.floor(killCount / 25);
  const scaling = Math.floor(killCount / 10) * (2 + stage) + (wallPhase * wallPhase * (stage + 1) * 5);
  return base + scaling;
}

export function getEnemyReward(stage, killCount) {
  const base = 1 + stage * 3;
  // Rewards scale slower than HP, creating intentional friction
  const scaling = Math.floor(killCount / 5) * (1 + stage * 0.5);
  return Math.floor(base + scaling);
}

export function getSoulsOnPrestige(totalCoinsEarned) {
  return Math.floor(Math.sqrt(totalCoinsEarned / 1000));
}

export function getSlayerPointsOnPrestige(souls) {
  // Convert total souls earned to slayer points
  return Math.floor(Math.sqrt(souls));
}