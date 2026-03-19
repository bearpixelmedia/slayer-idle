// Boss encounter system with unique mechanics
export const BOSSES = [
  {
    id: "stage_0_boss",
    name: "Slime King",
    icon: "👑",
    stage: 0,
    hpMultiplier: 25,
    rewardMultiplier: 100,
    mechanic: {
      type: "shield_window",
      name: "Shield Window",
      description: "Blocks damage every 8 seconds for 3 seconds",
      interval: 8,
      duration: 3,
      damageReduction: 0.95,
    },
  },
  {
    id: "stage_1_boss",
    name: "Forest Guardian",
    icon: "🌲",
    stage: 1,
    hpMultiplier: 30,
    rewardMultiplier: 150,
    mechanic: {
      type: "thorns",
      name: "Thorns",
      description: "Reflects 20% damage back to player",
      reflectPct: 0.2,
    },
  },
  {
    id: "stage_2_boss",
    name: "Spectral King",
    icon: "👻",
    stage: 2,
    hpMultiplier: 35,
    rewardMultiplier: 200,
    mechanic: {
      type: "enrage",
      name: "Enrage Stack",
      description: "Gains 5% damage per 10 hits, resets at 50% HP",
      stackPerHits: 10,
      damagePerStack: 0.05,
      resetThreshold: 0.5,
    },
  },
  {
    id: "stage_3_boss",
    name: "Infernal Lord",
    icon: "🔥",
    stage: 3,
    hpMultiplier: 40,
    rewardMultiplier: 250,
    mechanic: {
      type: "shield_window",
      name: "Shield Window",
      description: "Blocks damage every 6 seconds for 4 seconds",
      interval: 6,
      duration: 4,
      damageReduction: 0.95,
    },
  },
  {
    id: "stage_4_boss",
    name: "Frost Sovereign",
    icon: "❄️",
    stage: 4,
    hpMultiplier: 45,
    rewardMultiplier: 300,
    mechanic: {
      type: "thorns",
      name: "Thorns",
      description: "Reflects 25% damage back to player",
      reflectPct: 0.25,
    },
  },
  {
    id: "stage_5_boss",
    name: "Shadow Overlord",
    icon: "🖤",
    stage: 5,
    hpMultiplier: 50,
    rewardMultiplier: 350,
    mechanic: {
      type: "enrage",
      name: "Enrage Stack",
      description: "Gains 5% damage per 8 hits, resets at 50% HP",
      stackPerHits: 8,
      damagePerStack: 0.05,
      resetThreshold: 0.5,
    },
  },
  {
    id: "stage_6_boss",
    name: "Cosmic Titan",
    icon: "🌌",
    stage: 6,
    hpMultiplier: 55,
    rewardMultiplier: 400,
    mechanic: {
      type: "shield_window",
      name: "Shield Window",
      description: "Blocks damage every 5 seconds for 5 seconds",
      interval: 5,
      duration: 5,
      damageReduction: 0.95,
    },
  },
];

export const BOSS_ENCOUNTER_INTERVAL = 25; // Every 25 kills

export function isBossEncounter(killCount) {
  return killCount > 0 && killCount % BOSS_ENCOUNTER_INTERVAL === 0;
}

export function getBossForStage(stage) {
  return BOSSES.find(b => b.stage === stage);
}

export function getBossHP(stage, kills) {
  const boss = getBossForStage(stage);
  if (!boss) return 100;
  const baseEnemyHP = 3 + stage * 10;
  return Math.floor(baseEnemyHP * boss.hpMultiplier);
}

export function getBossReward(stage) {
  const boss = getBossForStage(stage);
  if (!boss) return 100;
  const baseCoinReward = 1 + stage * 3;
  const baseMultiplier = boss.rewardMultiplier;
  const coins = Math.floor(baseCoinReward * baseMultiplier);
  const souls = Math.floor(boss.rewardMultiplier / 50);
  return { coins, souls };
}

// Helper to check if boss shield is currently active
export function isBossShieldActive(bossElapsedMs, boss) {
  if (!boss || boss.mechanic.type !== "shield_window") return false;
  
  const cycleMs = (boss.mechanic.interval + boss.mechanic.duration) * 1000;
  const posInCycle = bossElapsedMs % cycleMs;
  const shieldStartMs = boss.mechanic.interval * 1000;
  const shieldEndMs = (boss.mechanic.interval + boss.mechanic.duration) * 1000;
  
  return posInCycle >= shieldStartMs && posInCycle < shieldEndMs;
}

// Helper to get enrage damage multiplier
export function getBossEnrageMultiplier(bossHitsReceived, boss) {
  if (!boss || boss.mechanic.type !== "enrage") return 1;
  
  const stacks = Math.floor(bossHitsReceived / boss.mechanic.stackPerHits);
  return 1 + (stacks * boss.mechanic.damagePerStack);
}