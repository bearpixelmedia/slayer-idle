// Skill tree structure with permanent bonuses and branching specialization paths
export const SKILLS = [
  // Tier 1 - Base foundation (choose starting direction)
  {
    id: "sharpened_blades",
    name: "Sharpened Blades",
    icon: "⚔️",
    tier: 1,
    path: "neutral",
    cost: 1,
    description: "+10% tap damage",
    type: "damageMultiplier",
    value: 0.1,
    requires: [],
  },
  {
    id: "steady_income",
    name: "Steady Income",
    icon: "🪙",
    tier: 1,
    path: "neutral",
    cost: 1,
    description: "+10% idle earnings",
    type: "idleMultiplier",
    value: 0.1,
    requires: [],
  },
  {
    id: "hunters_instinct",
    name: "Hunter's Instinct",
    icon: "🎯",
    tier: 1,
    path: "neutral",
    cost: 2,
    description: "+5% coin drops",
    type: "coinDropMultiplier",
    value: 0.05,
    requires: [],
  },

  // Tier 2 - Specialization fork: DAMAGE PATH
  {
    id: "critical_strike",
    name: "Critical Strike",
    icon: "⚡",
    tier: 2,
    path: "damage",
    cost: 6,
    description: "Unlock crit damage (5% of taps crit for 3x)",
    type: "critMultiplier",
    value: 0.05,
    requires: ["sharpened_blades"],
  },
  {
    id: "bloodlust",
    name: "Bloodlust",
    icon: "🩸",
    tier: 2,
    path: "damage",
    cost: 5,
    description: "+30% tap damage",
    type: "damageMultiplier",
    value: 0.3,
    requires: ["sharpened_blades"],
  },

  // Tier 2 - Specialization fork: IDLE PATH
  {
    id: "passive_automation",
    name: "Passive Automation",
    icon: "⚙️",
    tier: 2,
    path: "idle",
    cost: 6,
    description: "Idle earnings work 20% faster per tier",
    type: "idleSpeedMultiplier",
    value: 0.2,
    requires: ["steady_income"],
  },
  {
    id: "compounding_wealth",
    name: "Compounding Wealth",
    icon: "💎",
    tier: 2,
    path: "idle",
    cost: 5,
    description: "+25% idle earnings",
    type: "idleMultiplier",
    value: 0.25,
    requires: ["steady_income"],
  },

  // Tier 2 - Hybrid/neutral
  {
    id: "soul_seeker",
    name: "Soul Seeker",
    icon: "👻",
    tier: 2,
    path: "neutral",
    cost: 7,
    description: "+20% soul drops",
    type: "soulMultiplier",
    value: 0.2,
    requires: [],
  },

  // Tier 3 - Damage specialization capstone
  {
    id: "executioner",
    name: "Executioner",
    icon: "💀",
    tier: 3,
    path: "damage",
    cost: 15,
    description: "+50% crit damage (5% crits now deal 5x)",
    type: "critDamageMultiplier",
    value: 5,
    requires: ["critical_strike"],
  },

  // Tier 3 - Idle specialization capstone
  {
    id: "economic_powerhouse",
    name: "Economic Powerhouse",
    icon: "🏦",
    tier: 3,
    path: "idle",
    cost: 15,
    description: "+40% idle earnings, coins earned offline too",
    type: "idleMultiplier",
    value: 0.4,
    requires: ["passive_automation", "compounding_wealth"],
  },

  // Tier 4 - Late-game unlocks (spec-gated)
  {
    id: "assassin_mark",
    name: "Assassin's Mark",
    icon: "🎯",
    tier: 4,
    path: "damage",
    cost: 25,
    description: "Consecutive crits build combo (3x → 4x → 5x)",
    type: "specialMechanic",
    value: 1,
    requires: ["executioner"],
  },
  {
    id: "golden_touch",
    name: "Golden Touch",
    icon: "✨",
    tier: 4,
    path: "idle",
    cost: 25,
    description: "Every 10 coins earned → auto-buy cheapest upgrade",
    type: "specialMechanic",
    value: 1,
    requires: ["economic_powerhouse"],
  },

  // Tier 3 - Neutral powerful bonus
  {
    id: "gods_blessing",
    name: "God's Blessing",
    icon: "✨",
    tier: 3,
    path: "neutral",
    cost: 18,
    description: "+50% all earnings (caps all paths)",
    type: "allMultiplier",
    value: 0.5,
    requires: ["soul_seeker"],
  },
];

export function getSkillMultipliers(unlockedSkillIds) {
  let damageMultiplier = 1;
  let idleMultiplier = 1;
  let coinDropMultiplier = 1;
  let soulMultiplier = 1;
  let allMultiplier = 1;

  (unlockedSkillIds || []).forEach((skillId) => {
    const skill = SKILLS.find((s) => s.id === skillId);
    if (!skill) return;

    switch (skill.type) {
      case "damageMultiplier":
        damageMultiplier += skill.value;
        break;
      case "idleMultiplier":
        idleMultiplier += skill.value;
        break;
      case "coinDropMultiplier":
        coinDropMultiplier += skill.value;
        break;
      case "soulMultiplier":
        soulMultiplier += skill.value;
        break;
      case "allMultiplier":
        allMultiplier += skill.value;
        break;
    }
  });

  // Apply all multiplier to specific ones
  return {
    damageMultiplier: damageMultiplier * allMultiplier,
    idleMultiplier: idleMultiplier * allMultiplier,
    coinDropMultiplier,
    soulMultiplier,
  };
}

export function canUnlockSkill(skillId, unlockedSkillIds) {
  const skill = SKILLS.find((s) => s.id === skillId);
  if (!skill) return false;
  if (unlockedSkillIds.includes(skillId)) return false;
  return skill.requires.every((req) => unlockedSkillIds.includes(req));
}