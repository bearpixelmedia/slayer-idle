// Game stages data
export const STAGES = [
  { name: "Goblin Warren", bgGradient: "from-green-900 to-green-800", color: "#22c55e" },
  { name: "Dark Forest", bgGradient: "from-blue-900 to-blue-800", color: "#3b82f6" },
  { name: "Crystal Caverns", bgGradient: "from-cyan-900 to-cyan-800", color: "#06b6d4" },
  { name: "Volcanic Peak", bgGradient: "from-orange-900 to-red-900", color: "#f97316" },
  { name: "Celestial Realm", bgGradient: "from-purple-900 to-indigo-900", color: "#a855f7" },
  { name: "Abyss", bgGradient: "from-slate-900 to-black", color: "#64748b" },
];

// Zone definitions
export const ZONES = [
  {
    id: "realm_of_light",
    name: "Realm of Light",
    description: "The starting zone with gentle enemies",
    emoji: "☀️",
    unlockRequirement: null, // Starting zone, always unlocked
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

// Enemy emojis
export const ENEMY_EMOJIS = {
  "Goblin": "👹",
  "Orc": "🗡️",
  "Skeleton": "💀",
  "Vampire": "🧛",
  "Dragon": "🐉",
  "Lich": "👻",
};

// Helper to check if a zone can be unlocked
export function canUnlockZone(zoneId, unlockedZoneIds, zoneProgress, slayerPoints) {
  const zone = ZONES.find(z => z.id === zoneId);
  if (!zone || unlockedZoneIds.includes(zoneId)) return false;
  if (!zone.unlockRequirement) return true;

  const cost = zone.unlockRequirement.spCost;
  if (slayerPoints < cost) return false;

  // Check progress milestone
  if (zoneId === "whispering_woods") {
    const realmProgress = zoneProgress["realm_of_light"];
    return realmProgress && realmProgress.highestStage >= 2;
  }
  if (zoneId === "shadowfell_citadel") {
    const woodsProgress = zoneProgress["whispering_woods"];
    return woodsProgress && woodsProgress.highestStage >= 4;
  }

  return true;
}