// Boss encounter system
export const BOSSES = [
  {
    id: "stage_0_boss",
    name: "Slime King",
    icon: "👑",
    stage: 0,
    hpMultiplier: 25,
    rewardMultiplier: 100,
  },
  {
    id: "stage_1_boss",
    name: "Forest Guardian",
    icon: "🌲",
    stage: 1,
    hpMultiplier: 30,
    rewardMultiplier: 150,
  },
  {
    id: "stage_2_boss",
    name: "Spectral King",
    icon: "👻",
    stage: 2,
    hpMultiplier: 35,
    rewardMultiplier: 200,
  },
  {
    id: "stage_3_boss",
    name: "Infernal Lord",
    icon: "🔥",
    stage: 3,
    hpMultiplier: 40,
    rewardMultiplier: 250,
  },
  {
    id: "stage_4_boss",
    name: "Frost Sovereign",
    icon: "❄️",
    stage: 4,
    hpMultiplier: 45,
    rewardMultiplier: 300,
  },
  {
    id: "stage_5_boss",
    name: "Shadow Overlord",
    icon: "🖤",
    stage: 5,
    hpMultiplier: 50,
    rewardMultiplier: 350,
  },
  {
    id: "stage_6_boss",
    name: "Cosmic Titan",
    icon: "🌌",
    stage: 6,
    hpMultiplier: 55,
    rewardMultiplier: 400,
  },
];

export const BOSS_ENCOUNTER_INTERVAL = 50; // Every 50 kills

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