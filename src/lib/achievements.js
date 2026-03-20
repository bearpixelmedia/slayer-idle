export const ACHIEVEMENTS = [
  // Total Coins Earned → offline income multiplier
  {
    id: "coins_1",
    name: "Penny Pincher",
    icon: "🪙",
    description: "Earn 1,000 total coins",
    condition: (stats) => stats.totalCoinsEarned >= 1000,
    reward: { type: "offlineMultiplier", value: 1.1 },
    rewardLabel: "+10% offline income",
    category: "coins",
  },
  {
    id: "coins_2",
    name: "Gold Hoarder",
    icon: "💰",
    description: "Earn 100,000 total coins",
    condition: (stats) => stats.totalCoinsEarned >= 100000,
    reward: { type: "offlineMultiplier", value: 1.25 },
    rewardLabel: "+25% offline income",
    category: "coins",
  },
  {
    id: "coins_3",
    name: "Treasure Lord",
    icon: "👑",
    description: "Earn 10,000,000 total coins",
    condition: (stats) => stats.totalCoinsEarned >= 10000000,
    reward: { type: "offlineMultiplier", value: 1.5 },
    rewardLabel: "+50% offline income",
    category: "coins",
  },
  {
    id: "coins_4",
    name: "Infinite Wealth",
    icon: "💎",
    description: "Earn 1,000,000,000 total coins",
    condition: (stats) => stats.totalCoinsEarned >= 1000000000,
    reward: { type: "offlineMultiplier", value: 2.0 },
    rewardLabel: "2x offline income",
    category: "coins",
  },

  // Total Kills → damage multiplier
  {
    id: "kills_1",
    name: "First Blood",
    icon: "⚔️",
    description: "Slay 10 enemies",
    condition: (stats) => stats.totalKills >= 10,
    reward: { type: "damageMultiplier", value: 1.1 },
    rewardLabel: "+10% all damage",
    category: "kills",
  },
  {
    id: "kills_2",
    name: "Slayer",
    icon: "🗡️",
    description: "Slay 500 enemies",
    condition: (stats) => stats.totalKills >= 500,
    reward: { type: "damageMultiplier", value: 1.25 },
    rewardLabel: "+25% all damage",
    category: "kills",
  },
  {
    id: "kills_3",
    name: "Monster Hunter",
    icon: "🏹",
    description: "Slay 5,000 enemies",
    condition: (stats) => stats.totalKills >= 5000,
    reward: { type: "damageMultiplier", value: 1.5 },
    rewardLabel: "+50% all damage",
    category: "kills",
  },
  {
    id: "kills_4",
    name: "Legendary Warrior",
    icon: "🛡️",
    description: "Slay 50,000 enemies",
    condition: (stats) => stats.totalKills >= 50000,
    reward: { type: "damageMultiplier", value: 2.0 },
    rewardLabel: "2x all damage",
    category: "kills",
  },

  // Prestige count → both
  {
    id: "prestige_1",
    name: "Reborn",
    icon: "👻",
    description: "Prestige for the first time",
    condition: (stats) => stats.prestigeCount >= 1,
    reward: { type: "damageMultiplier", value: 1.2 },
    rewardLabel: "+20% all damage",
    category: "prestige",
  },
  {
    id: "prestige_2",
    name: "Cycle Breaker",
    icon: "🔮",
    description: "Prestige 5 times",
    condition: (stats) => stats.prestigeCount >= 5,
    reward: { type: "offlineMultiplier", value: 1.5 },
    rewardLabel: "+50% offline income",
    category: "prestige",
  },
  {
    id: "prestige_3",
    name: "Eternal",
    icon: "🌀",
    description: "Prestige 20 times",
    condition: (stats) => stats.prestigeCount >= 20,
    reward: { type: "damageMultiplier", value: 2.0 },
    rewardLabel: "2x all damage",
    category: "prestige",
  },

  // Stages unlocked
  {
    id: "stage_3",
    name: "Cave Delver",
    icon: "🦇",
    description: "Reach the Haunted Caves",
    condition: (stats) => stats.highestStage >= 2,
    reward: { type: "damageMultiplier", value: 1.15 },
    rewardLabel: "+15% all damage",
    category: "stages",
  },
  {
    id: "stage_6",
    name: "Shadow Walker",
    icon: "😈",
    description: "Reach the Shadow Realm",
    condition: (stats) => stats.highestStage >= 5,
    reward: { type: "offlineMultiplier", value: 1.3 },
    rewardLabel: "+30% offline income",
    category: "stages",
  },
  {
    id: "stage_7",
    name: "Void Champion",
    icon: "🐉",
    description: "Reach the Celestial Void",
    condition: (stats) => stats.highestStage >= 6,
    reward: { type: "damageMultiplier", value: 1.5 },
    rewardLabel: "+50% all damage",
    category: "stages",
  },
];

export function computeAchievementMultipliers(unlockedIds) {
  let damageMultiplier = 1;
  let offlineMultiplier = 1;
  if (!Array.isArray(unlockedIds)) return { damageMultiplier, offlineMultiplier };
  for (const ach of ACHIEVEMENTS) {
    if (unlockedIds.includes(ach.id)) {
      if (ach.reward?.type === "damageMultiplier") damageMultiplier *= ach.reward.value;
      if (ach.reward?.type === "offlineMultiplier") offlineMultiplier *= ach.reward.value;
    }
  }
  return { damageMultiplier, offlineMultiplier };
}