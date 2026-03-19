// Skill tree structure with permanent bonuses
export const SKILLS = [
  // Tier 1 - Basic bonuses (unlocked early)
  {
    id: "sharpened_blades",
    name: "Sharpened Blades",
    icon: "⚔️",
    tier: 1,
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
    cost: 2,
    description: "+5% coin drops",
    type: "coinDropMultiplier",
    value: 0.05,
    requires: [],
  },
  // Tier 2 - Stronger bonuses
  {
    id: "legendary_strength",
    name: "Legendary Strength",
    icon: "💪",
    tier: 2,
    cost: 5,
    description: "+25% tap damage",
    type: "damageMultiplier",
    value: 0.25,
    requires: ["sharpened_blades"],
  },
  {
    id: "gold_digger",
    name: "Gold Digger",
    icon: "⛏️",
    tier: 2,
    cost: 5,
    description: "+20% idle earnings",
    type: "idleMultiplier",
    value: 0.2,
    requires: ["steady_income"],
  },
  {
    id: "soul_seeker",
    name: "Soul Seeker",
    icon: "👻",
    tier: 2,
    cost: 8,
    description: "+15% soul drops",
    type: "soulMultiplier",
    value: 0.15,
    requires: [],
  },
  // Tier 3 - Powerful bonuses
  {
    id: "gods_blessing",
    name: "God's Blessing",
    icon: "✨",
    tier: 3,
    cost: 15,
    description: "+50% all earnings",
    type: "allMultiplier",
    value: 0.5,
    requires: ["legendary_strength", "gold_digger"],
  },
  {
    id: "ruthless_warrior",
    name: "Ruthless Warrior",
    icon: "⚔️",
    tier: 3,
    cost: 12,
    description: "+40% tap damage",
    type: "damageMultiplier",
    value: 0.4,
    requires: ["legendary_strength"],
  },
];

export function getSkillMultipliers(unlockedSkillIds) {
  let damageMultiplier = 1;
  let idleMultiplier = 1;
  let coinDropMultiplier = 1;
  let soulMultiplier = 1;
  let allMultiplier = 1;

  unlockedSkillIds.forEach((skillId) => {
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