/**
 * zones.js
 *
 * Stage and zone definitions, all scaling formulas (HP, rewards, souls,
 * prestige, pack size), and zone unlock logic.
 */

// ─── Stages ───────────────────────────────────────────────────────────────────

export const STAGES = [
  { name: "Goblin Warren",   bgGradient: "from-green-900 to-green-800",   color: "#22c55e", soulBias: 1.0, enemies: ["Goblin", "Orc", "Ogre", "Zombie", "Ghost", "Spider"] },
  { name: "Dark Forest",     bgGradient: "from-blue-900 to-blue-800",     color: "#3b82f6", soulBias: 1.1, enemies: ["Orc", "Ogre", "Skeleton", "Zombie", "Genie", "Princess"] },
  { name: "Crystal Caverns", bgGradient: "from-cyan-900 to-cyan-800",     color: "#06b6d4", soulBias: 1.2, enemies: ["Skeleton", "Vampire", "Zombie", "Sorceress", "Mage"] },
  { name: "Volcanic Peak",   bgGradient: "from-orange-900 to-red-900",    color: "#f97316", soulBias: 1.4, enemies: ["Vampire", "Dragon", "Prince", "Sorcerer"] },
  { name: "Celestial Realm", bgGradient: "from-purple-900 to-indigo-900", color: "#a855f7", soulBias: 1.6, enemies: ["Dragon", "Lich", "Pixie", "Sprite", "Fairy", "Elf Archer", "Elf Ranger", "Elf"] },
  { name: "Abyss",           bgGradient: "from-slate-900 to-black",       color: "#64748b", soulBias: 2.0, enemies: ["Lich", "Mermaid", "Merman", "Merfolk", "Merchant"] },
];

// ─── Zones ────────────────────────────────────────────────────────────────────

export const ZONES = [
  {
    id: "realm_of_light",
    name: "Realm of Light",
    description: "The starting zone with gentle enemies",
    emoji: "☀️",
    unlockRequirement: null,
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

// ─── Zone helpers ─────────────────────────────────────────────────────────────

/** Returns global STAGES indices covered by this zone. */
export function getZoneStages(zoneId) {
  const zone = ZONES.find((z) => z?.id === zoneId);
  if (!zone || !zone.stagesRange) return STAGES.map((_, i) => i);
  const [start, end] = zone.stagesRange;
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export function canUnlockZone(zoneId, unlockedZoneIds, zoneProgress, slayerPoints) {
  const zone = ZONES.find((z) => z?.id === zoneId);
  if (!zone || unlockedZoneIds?.includes(zoneId)) return false;
  if (!zone.unlockRequirement) return true;

  const cost = zone.unlockRequirement.spCost;
  if (slayerPoints < cost) return false;

  if (zoneId === "whispering_woods") {
    const p = zoneProgress["realm_of_light"];
    return p && p.highestStage >= 2;
  }
  if (zoneId === "shadowfell_citadel") {
    const p = zoneProgress["whispering_woods"];
    return p && p.highestStage >= 4;
  }

  return true;
}

// ─── Scaling formulas ─────────────────────────────────────────────────────────

export function getEnemyHP(stage, killCount) {
  return Math.ceil(10 + stage * 15 + killCount * 0.5);
}

export function getEnemyReward(stage, killCount) {
  return Math.ceil(10 + stage * 20 + killCount * 2);
}

export function getEnemySouls(stage) {
  return stage > 0 ? 0.1 + stage * 0.05 : 0;
}

export function getSoulsOnPrestige(totalCoinsEarned) {
  return Math.floor(Math.sqrt(totalCoinsEarned) / 10);
}

export function getSlayerPointsOnPrestige(souls) {
  return Math.floor(souls / 5);
}

export function getPackSize(packSizeLevel) {
  if (packSizeLevel === 0) return 1;
  return 3 + packSizeLevel - 1;
}
