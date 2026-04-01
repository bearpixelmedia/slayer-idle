export function computeAchievementMultipliers(unlockedIds = []) {
  return {
    damageMultiplier: 1 + (unlockedIds.length * 0.05),
    offlineMultiplier: 1 + (unlockedIds.length * 0.02),
  };
}