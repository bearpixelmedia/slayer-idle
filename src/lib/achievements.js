export const ACHIEVEMENTS = [
  { id: "first_kill",      name: "First Blood",       description: "Kill your first enemy.",          condition: (s) => (s.killCount ?? 0) >= 1 },
  { id: "kills_100",       name: "Century Slayer",     description: "Kill 100 enemies.",              condition: (s) => (s.killCount ?? 0) >= 100 },
  { id: "kills_1000",      name: "Thousand Blades",    description: "Kill 1,000 enemies.",            condition: (s) => (s.killCount ?? 0) >= 1000 },
  { id: "kills_10000",     name: "Undying Reaper",     description: "Kill 10,000 enemies.",           condition: (s) => (s.killCount ?? 0) >= 10000 },
  { id: "coins_1000",      name: "Coin Collector",     description: "Earn 1,000 coins total.",        condition: (s) => (s.totalCoinsEarned ?? 0) >= 1000 },
  { id: "coins_1m",        name: "Gold Hoarder",       description: "Earn 1,000,000 coins total.",    condition: (s) => (s.totalCoinsEarned ?? 0) >= 1_000_000 },
  { id: "prestige_1",      name: "Rebirth",            description: "Prestige for the first time.",   condition: (s) => (s.prestigeCount ?? 0) >= 1 },
  { id: "prestige_5",      name: "Eternal Warrior",    description: "Prestige 5 times.",              condition: (s) => (s.prestigeCount ?? 0) >= 5 },
  { id: "stage_10",        name: "Dungeon Diver",      description: "Reach stage 10.",                condition: (s) => (s.stage ?? 0) >= 10 },
  { id: "stage_50",        name: "Deep Delver",        description: "Reach stage 50.",                condition: (s) => (s.stage ?? 0) >= 50 },
  { id: "stage_100",       name: "Abyss Walker",       description: "Reach stage 100.",               condition: (s) => (s.stage ?? 0) >= 100 },
  { id: "upgrade_all",     name: "Arsenal",            description: "Purchase every upgrade.",        condition: (s) => Object.keys(s.upgradeLevels ?? {}).length >= 5 },
  { id: "souls_100",       name: "Soul Harvester",     description: "Collect 100 souls.",             condition: (s) => (s.souls ?? 0) >= 100 },
  { id: "boss_first",      name: "Boss Slayer",        description: "Defeat your first boss.",        condition: (s) => (s.bossKills ?? 0) >= 1 },
  { id: "boss_10",         name: "Boss Hunter",        description: "Defeat 10 bosses.",              condition: (s) => (s.bossKills ?? 0) >= 10 },
];

export function computeAchievementMultipliers(unlockedIds = []) {
  return {
    damageMultiplier: 1 + (unlockedIds.length * 0.05),
    offlineMultiplier: 1 + (unlockedIds.length * 0.02),
  };
}