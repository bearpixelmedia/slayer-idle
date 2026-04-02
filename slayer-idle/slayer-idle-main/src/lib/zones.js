/**
 * zones.js
 *
 * Stage and zone definitions fully grounded in the Pixel Crawler asset pack.
 *
 * World structure:
 *   Zone 1 — Whispering Forest  (Skeleton tier, wood weapons)
 *   Zone 2 — Bone Dungeon       (Skeleton tier, bone weapons, harder)
 *   Zone 3 — Orcish Caverns     (Orc tier, new weapon tier TBD)
 *   Zone 4 — Deep Mines         (Orc elite tier, boss encounters)
 *
 * Each stage within a zone uses a fixed enemy pool drawn from the PC roster.
 * Boss stages (every 5th stage) spawn the elite variant of the zone's tier.
 */

// ─── Stages ───────────────────────────────────────────────────────────────────
//
// enemies[]  — enemy IDs from ENEMY_ROSTER (enemies.js)
// bossEnemy  — enemy ID of this stage's boss (appears every BOSS_INTERVAL kills)
// bgGradient — Tailwind gradient classes for the combat lane background
// color      — accent color for UI highlights

export const STAGES = [
  // ── Zone 1: Whispering Forest (stages 0-4) ────────────────────────────────
  {
    name: "Forest Edge",
    zone: "whispering_forest",
    bgGradient: "from-green-950 to-green-900",
    color: "#4ade80",
    soulBias: 1.0,
    enemies: ["skeleton", "skeleton_rogue"],
    bossEnemy: "skeleton_warrior",
  },
  {
    name: "Overgrown Path",
    zone: "whispering_forest",
    bgGradient: "from-green-900 to-emerald-900",
    color: "#34d399",
    soulBias: 1.1,
    enemies: ["skeleton", "skeleton_rogue", "skeleton_warrior"],
    bossEnemy: "skeleton_warrior",
  },
  {
    name: "Mossy Ruins",
    zone: "whispering_forest",
    bgGradient: "from-emerald-900 to-teal-900",
    color: "#2dd4bf",
    soulBias: 1.2,
    enemies: ["skeleton_rogue", "skeleton_warrior", "skeleton_mage"],
    bossEnemy: "skeleton_mage",
  },
  {
    name: "Ancient Grove",
    zone: "whispering_forest",
    bgGradient: "from-teal-900 to-green-950",
    color: "#14b8a6",
    soulBias: 1.3,
    enemies: ["skeleton_warrior", "skeleton_mage"],
    bossEnemy: "skeleton_mage",
  },
  {
    name: "Cursed Clearing",
    zone: "whispering_forest",
    bgGradient: "from-green-950 to-slate-900",
    color: "#86efac",
    soulBias: 1.4,
    enemies: ["skeleton", "skeleton_warrior", "skeleton_mage"],
    bossEnemy: "skeleton_mage",
  },

  // ── Zone 2: Bone Dungeon (stages 5-9) ─────────────────────────────────────
  {
    name: "Dungeon Entrance",
    zone: "bone_dungeon",
    bgGradient: "from-slate-900 to-stone-900",
    color: "#a8a29e",
    soulBias: 1.5,
    enemies: ["skeleton", "skeleton_warrior"],
    bossEnemy: "skeleton_warrior",
  },
  {
    name: "Torchlit Halls",
    zone: "bone_dungeon",
    bgGradient: "from-stone-900 to-amber-950",
    color: "#d97706",
    soulBias: 1.6,
    enemies: ["skeleton_warrior", "skeleton_rogue"],
    bossEnemy: "skeleton_mage",
  },
  {
    name: "Crypt Depths",
    zone: "bone_dungeon",
    bgGradient: "from-amber-950 to-stone-950",
    color: "#b45309",
    soulBias: 1.7,
    enemies: ["skeleton_warrior", "skeleton_mage", "ghost"],
    bossEnemy: "skeleton_mage",
  },
  {
    name: "Ossuary",
    zone: "bone_dungeon",
    bgGradient: "from-stone-950 to-neutral-900",
    color: "#78716c",
    soulBias: 1.8,
    enemies: ["skeleton_mage", "skeleton_rogue", "skeleton_warrior", "ghost"],
    bossEnemy: "skeleton_mage",
  },
  {
    name: "The Bone Throne",
    zone: "bone_dungeon",
    bgGradient: "from-neutral-900 to-slate-950",
    color: "#e7e5e4",
    soulBias: 2.0,
    enemies: ["skeleton_warrior", "skeleton_mage"],
    bossEnemy: "skeleton_mage",
  },

  // ── Zone 3: Orcish Caverns (stages 10-14) ─────────────────────────────────
  {
    name: "Cave Mouth",
    zone: "orcish_caverns",
    bgGradient: "from-stone-950 to-red-950",
    color: "#ef4444",
    soulBias: 2.2,
    enemies: ["orc", "orc_rogue"],
    bossEnemy: "orc_warrior",
  },
  {
    name: "Orcish Camp",
    zone: "orcish_caverns",
    bgGradient: "from-red-950 to-orange-950",
    color: "#f97316",
    soulBias: 2.4,
    enemies: ["orc", "orc_warrior"],
    bossEnemy: "orc_warrior",
  },
  {
    name: "War Tunnels",
    zone: "orcish_caverns",
    bgGradient: "from-orange-950 to-stone-950",
    color: "#fb923c",
    soulBias: 2.6,
    enemies: ["orc_warrior", "orc_rogue", "spider"],
    bossEnemy: "orc_shaman",
  },
  {
    name: "Shamans' Den",
    zone: "orcish_caverns",
    bgGradient: "from-stone-950 to-purple-950",
    color: "#c084fc",
    soulBias: 2.8,
    enemies: ["orc_shaman", "orc_warrior"],
    bossEnemy: "orc_shaman",
  },
  {
    name: "The War Pit",
    zone: "orcish_caverns",
    bgGradient: "from-purple-950 to-red-950",
    color: "#a21caf",
    soulBias: 3.0,
    enemies: ["orc_warrior", "orc_shaman"],
    bossEnemy: "orc_shaman",
  },

  // ── Zone 4: Deep Mines (stages 15-19) ─────────────────────────────────────
  {
    name: "Flooded Shafts",
    zone: "deep_mines",
    bgGradient: "from-slate-950 to-blue-950",
    color: "#3b82f6",
    soulBias: 3.2,
    enemies: ["orc", "orc_warrior"],
    bossEnemy: "orc_warrior",
  },
  {
    name: "Collapsed Tunnels",
    zone: "deep_mines",
    bgGradient: "from-blue-950 to-slate-950",
    color: "#60a5fa",
    soulBias: 3.5,
    enemies: ["orc_warrior", "orc_rogue", "spider"],
    bossEnemy: "orc_shaman",
  },
  {
    name: "Magma Vents",
    zone: "deep_mines",
    bgGradient: "from-slate-950 to-orange-950",
    color: "#fdba74",
    soulBias: 3.8,
    enemies: ["orc_warrior", "orc_shaman", "dragon"],
    bossEnemy: "orc_shaman",
  },
  {
    name: "The Forge Cavern",
    zone: "deep_mines",
    bgGradient: "from-orange-950 to-red-950",
    color: "#fca5a5",
    soulBias: 4.2,
    enemies: ["orc_shaman", "orc_rogue", "orc_warrior"],
    bossEnemy: "orc_shaman",
  },
  {
    name: "Heart of the Mountain",
    zone: "deep_mines",
    bgGradient: "from-red-950 to-black",
    color: "#f87171",
    soulBias: 5.0,
    enemies: ["orc_warrior", "orc_shaman", "dragon"],
    bossEnemy: "dragon",
  },
];

// ─── Zones ────────────────────────────────────────────────────────────────────

export const ZONES = [
  {
    id: "whispering_forest",
    name: "Whispering Forest",
    description: "Skeleton-haunted woods. Bone and wood weapons litter the ground.",
    emoji: "🌲",
    unlockRequirement: null,
    stagesRange: [0, 4],
    weaponTier: "wood",
  },
  {
    id: "bone_dungeon",
    name: "Bone Dungeon",
    description: "Ancient dungeon. Veteran skeletons guard every corridor.",
    emoji: "🏚️",
    unlockRequirement: {
      progressMilestone: "Clear Stage 4 in Whispering Forest",
      spCost: 5,
    },
    stagesRange: [5, 9],
    weaponTier: "bone",
  },
  {
    id: "orcish_caverns",
    name: "Orcish Caverns",
    description: "Orc clans have carved out a stronghold in these caves.",
    emoji: "⛏️",
    unlockRequirement: {
      progressMilestone: "Clear Stage 9 in Bone Dungeon",
      spCost: 15,
    },
    stagesRange: [10, 14],
    weaponTier: "bone", // placeholder until next weapon tier is added
  },
  {
    id: "deep_mines",
    name: "Deep Mines",
    description: "The deepest reaches. Elite orcs and shamans rule here.",
    emoji: "🌋",
    unlockRequirement: {
      progressMilestone: "Clear Stage 14 in Orcish Caverns",
      spCost: 30,
    },
    stagesRange: [15, 19],
    weaponTier: "bone", // placeholder
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

  if (zoneId === "bone_dungeon") {
    const p = zoneProgress?.["whispering_forest"];
    return p && p.highestStage >= 4;
  }
  if (zoneId === "orcish_caverns") {
    const p = zoneProgress?.["bone_dungeon"];
    return p && p.highestStage >= 9;
  }
  if (zoneId === "deep_mines") {
    const p = zoneProgress?.["orcish_caverns"];
    return p && p.highestStage >= 14;
  }
  return true;
}

// ─── Scaling formulas ─────────────────────────────────────────────────────────

// Enemy HP — exponential per stage, gentle kill-count ramp.
// Stage 0: ~15 HP  →  Stage 19: ~7,500 HP  (base 1.65 per stage)
export function getEnemyHP(stage, killCount = 0) {
  const base = Math.ceil(15 * Math.pow(1.65, stage));
  return Math.ceil(base * (1 + killCount * 0.003));
}

// Enemy coin reward — mirrors HP so reward-per-hit stays roughly constant.
export function getEnemyReward(stage, killCount = 0) {
  const base = Math.ceil(12 * Math.pow(1.65, stage));
  return Math.ceil(base * (1 + killCount * 0.004));
}

// Soul drop — higher zones are worth farming for prestige.
export function getEnemySouls(stage) {
  return stage > 0 ? 0.05 * Math.pow(1.4, stage) : 0;
}

// Prestige souls — log10 curve feels rewarding at every scale.
export function getSoulsOnPrestige(totalCoinsEarned) {
  if (totalCoinsEarned < 100) return 0;
  return Math.floor(Math.pow(Math.log10(totalCoinsEarned + 1), 3.5));
}

export function getSlayerPointsOnPrestige(souls) {
  return Math.floor(souls / 5);
}

export function getPackSize(packSizeLevel) {
  if (packSizeLevel === 0) return 1;
  return 3 + packSizeLevel - 1;
}
