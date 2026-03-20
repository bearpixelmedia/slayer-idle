// Village building system
export const VILLAGE_BUILDINGS = [
  {
    id: "town_hall",
    name: "Town Hall",
    icon: "🏛️",
    description: "Gateway to village expansion. Unlock new buildings.",
    category: "core",
    unlock: { type: "default" }, // Always available
    maxLevel: 5,
    costs: (level) => ({
      coins: Math.floor(1000 * Math.pow(1.5, level)),
      souls: Math.floor(10 * Math.pow(1.3, level)),
    }),
    bonus: (level) => ({
      unlocksNewTiers: level >= 2, // At level 2+, unlock more buildings
    }),
  },
  {
    id: "forge",
    name: "Forge",
    icon: "🔨",
    description: "+% tap damage per level",
    category: "combat",
    unlock: { type: "townHallLevel", minLevel: 1 },
    maxLevel: 10,
    costs: (level) => ({
      coins: Math.floor(800 * Math.pow(1.4, level)),
      souls: Math.floor(5 * Math.pow(1.2, level)),
    }),
    bonus: (level) => ({
      tapDamageMultiplier: 1 + level * 0.06, // 6% per level
    }),
  },
  {
    id: "sanctum",
    name: "Sanctum",
    icon: "⛪",
    description: "+% soul gain per level",
    category: "prestige",
    unlock: { type: "zoneUnlocked", zoneId: "whispering_woods" },
    maxLevel: 10,
    costs: (level) => ({
      coins: Math.floor(1200 * Math.pow(1.4, level)),
      souls: Math.floor(8 * Math.pow(1.2, level)),
    }),
    bonus: (level) => ({
      soulMultiplier: 1 + level * 0.05, // 5% per level
    }),
  },
  {
    id: "market",
    name: "Market",
    icon: "🏪",
    description: "+% coin income and offline earnings per level",
    category: "economy",
    unlock: { type: "killsMilestone", minKills: 50 },
    maxLevel: 10,
    costs: (level) => ({
      coins: Math.floor(1500 * Math.pow(1.45, level)),
      souls: Math.floor(7 * Math.pow(1.2, level)),
    }),
    bonus: (level) => ({
      coinMultiplier: 1 + level * 0.05, // 5% per level
      offlineMultiplier: 1 + level * 0.04, // 4% per level
    }),
  },
  {
    id: "barracks",
    name: "Barracks",
    icon: "⚔️",
    description: "+% minion mission efficiency per level",
    category: "minions",
    unlock: { type: "zoneUnlocked", zoneId: "shadowfell_citadel" },
    maxLevel: 8,
    costs: (level) => ({
      coins: Math.floor(2000 * Math.pow(1.5, level)),
      souls: Math.floor(15 * Math.pow(1.2, level)),
    }),
    bonus: (level) => ({
      minionSpeedBonus: 1 + level * 0.08, // 8% speed per level (faster missions)
      minionRewardBonus: 1 + level * 0.06, // 6% reward per level
    }),
  },
];

/**
 * Check if a building can be unlocked based on game state
 */
export function canUnlockBuilding(building, gameState) {
  const unlock = building.unlock;

  if (unlock.type === "default") {
    return true;
  }
  if (unlock.type === "townHallLevel") {
    const townHallLevel = gameState.villageBuildings?.town_hall || 0;
    return townHallLevel >= unlock.minLevel;
  }
  if (unlock.type === "zoneUnlocked") {
    return gameState.unlockedZoneIds?.includes(unlock.zoneId);
  }
  if (unlock.type === "killsMilestone") {
    return gameState.totalKills >= unlock.minKills;
  }
  return false;
}

/**
 * Get cost to upgrade building to next level
 */
export function getBuildingUpgradeCost(building, currentLevel) {
  if (currentLevel >= building.maxLevel) {
    return null; // Max level reached
  }
  return building.costs(currentLevel);
}

/**
 * Compute aggregated bonuses from all buildings
 */
export function computeVillageMultipliers(villageBuildings) {
  const multipliers = {
    tapDamageMultiplier: 1,
    soulMultiplier: 1,
    coinMultiplier: 1,
    offlineMultiplier: 1,
    minionSpeedBonus: 1,
    minionRewardBonus: 1,
  };

  if (!villageBuildings) return multipliers;

  VILLAGE_BUILDINGS.forEach((building) => {
    const level = villageBuildings[building.id] || 0;
    if (level > 0) {
      const bonus = building.bonus(level);
      Object.entries(bonus).forEach(([key, value]) => {
        if (key in multipliers && typeof value === "number") {
          multipliers[key] *= value;
        }
      });
    }
  });

  return multipliers;
}

/**
 * Check if player can afford upgrade
 */
export function canAffordUpgrade(cost, gameState) {
  if (!cost) return false;
  return gameState.coins >= cost.coins && gameState.souls >= cost.souls;
}