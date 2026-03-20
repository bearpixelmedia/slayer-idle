// src/lib/minions.js

/**
 * @typedef {import("./minionTypes").MinionTypeDef} MinionTypeDef
 * @typedef {import("./minionTypes").MissionDef} MissionDef
 */

export const MINION_TYPES = [
  {
    id: "scout",
    name: "Scout",
    icon: "🕵️",
    description: "Fast runner that excels at short missions.",
    baseSpeed: 1.15, // multiplies mission duration divisor
    carryingCapacity: 0.9, // multiplies reward
    unlock: { type: "default" }, // starts owned
    purchaseCostSouls: 0,
  },
  {
    id: "worker",
    name: "Worker",
    icon: "⛏️",
    description: "Balanced gatherer with steady returns.",
    baseSpeed: 1.0,
    carryingCapacity: 1.0,
    unlock: { type: "zone_unlocked", zoneId: "whispering_woods" },
    purchaseCostSouls: 25,
  },
  {
    id: "warden",
    name: "Warden",
    icon: "🛡️",
    description: "Slow but high-capacity specialist for long missions.",
    baseSpeed: 0.9,
    carryingCapacity: 1.2,
    unlock: { type: "zone_unlocked", zoneId: "shadowfell_citadel" },
    purchaseCostSouls: 80 || 0,
  },
];

export const MISSION_DEFS = [
  {
    id: "scout_run",
    name: "Scout Run",
    icon: "🏃",
    description: "Quick patrol through nearby ruins.",
    family: "short",
    baseDurationSec: 8 * 60, // 8 min
    baseSoulReward: 2,
    rewardMultiplier: 1.0,
    unlock: { type: "highest_stage_at_least", value: 1 }, // very early
    tags: ["quick", "starter"],
  },
  {
    id: "relic_sweep",
    name: "Relic Sweep",
    icon: "🧭",
    description: "Sweep old battlegrounds for soul fragments.",
    family: "medium",
    baseDurationSec: 35 * 60, // 35 min
    baseSoulReward: 7,
    rewardMultiplier: 1.0,
    unlock: { type: "zone_unlocked", zoneId: "whispering_woods" },
    tags: ["balanced", "zone2"],
  },
  {
    id: "forest_salvage",
    name: "Forest Salvage",
    icon: "🌲",
    description: "Recover cursed remains from the Whispering Woods.",
    family: "medium",
    baseDurationSec: 45 * 60, // 45 min
    baseSoulReward: 9,
    rewardMultiplier: 1.05,
    unlock: {
      type: "all",
      conditions: [
        { type: "zone_unlocked", zoneId: "whispering_woods" },
        { type: "highest_stage_at_least", value: 3 },
      ],
    },
    tags: ["zone2", "efficiency"],
  },
  {
    id: "abyss_expedition",
    name: "Abyss Expedition",
    icon: "🌌",
    description: "Dangerous deep run with high-end soul returns.",
    family: "long",
    baseDurationSec: 3 * 60 * 60, // 180 min
    baseSoulReward: 38,
    rewardMultiplier: 1.1,
    unlock: { type: "zone_unlocked", zoneId: "shadowfell_citadel" },
    tags: ["zone3", "offline"],
  },
  {
    id: "citadel_raid",
    name: "Citadel Raid",
    icon: "🏰",
    description: "Infiltrate Shadowfell caches for elite rewards.",
    family: "long",
    baseDurationSec: 4 * 60 * 60, // 240 min
    baseSoulReward: 46,
    rewardMultiplier: 1.15,
    unlock: {
      type: "all",
      conditions: [
        { type: "zone_unlocked", zoneId: "shadowfell_citadel" },
        { type: "highest_stage_at_least", value: 5 },
      ],
    },
    tags: ["zone3", "endgame"],
  },
];

export const MINION_SYSTEM_CONFIG = {
  maxOwnedMinions: 3,
  maxConcurrentMissions: 3,
  missionClaimMode: "manual",
  offlineProgressEnabled: true,
};