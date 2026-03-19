export const SKILLS = [
  // Tier 1
  {
    id: "slash_mastery",
    name: "Slash Mastery",
    icon: "⚔️",
    description: "+20% tap damage",
    cost: 5,
    tier: 1,
    path: "damage",
    requires: [],
  },
  {
    id: "steady_income",
    name: "Steady Income",
    icon: "💰",
    description: "+1 coin per second",
    cost: 5,
    tier: 1,
    path: "idle",
    requires: [],
  },
  {
    id: "resilience",
    name: "Resilience",
    icon: "🛡️",
    description: "Enemies have 10% less HP",
    cost: 5,
    tier: 1,
    path: "neutral",
    requires: [],
  },

  // Tier 2
  {
    id: "executioner",
    name: "Executioner",
    icon: "💢",
    description: "+50% damage against low HP enemies",
    cost: 10,
    tier: 2,
    path: "damage",
    requires: ["slash_mastery"],
  },
  {
    id: "passive_wealth",
    name: "Passive Wealth",
    icon: "📈",
    description: "+5% coins from idle",
    cost: 10,
    tier: 2,
    path: "idle",
    requires: ["steady_income"],
  },
  {
    id: "bow_mastery",
    name: "Bow Mastery",
    icon: "🏹",
    description: "Unlock Bow mode: +25% soul mult, -30% tap rate",
    cost: 15,
    tier: 2,
    path: "damage",
    requires: ["slash_mastery"],
  },

  // Tier 3
  {
    id: "critical_strike",
    name: "Critical Strike",
    icon: "⚡",
    description: "5% chance for 3x damage",
    cost: 15,
    tier: 3,
    path: "damage",
    requires: ["executioner"],
  },
  {
    id: "compounding_wealth",
    name: "Compounding Wealth",
    icon: "💎",
    description: "+10% coins from passive",
    cost: 15,
    tier: 3,
    path: "idle",
    requires: ["passive_wealth"],
  },
  {
    id: "soul_harvest",
    name: "Soul Harvest",
    icon: "👻",
    description: "+15% soul gain",
    cost: 20,
    tier: 3,
    path: "neutral",
    requires: [],
  },

  // Tier 4
  {
    id: "apex_predator",
    name: "Apex Predator",
    icon: "🦁",
    description: "All damage bonuses +25%",
    cost: 25,
    tier: 4,
    path: "damage",
    requires: ["critical_strike", "executioner"],
  },
  {
    id: "infinite_wealth",
    name: "Infinite Wealth",
    icon: "👑",
    description: "Passive income never stops increasing",
    cost: 25,
    tier: 4,
    path: "idle",
    requires: ["compounding_wealth", "passive_wealth"],
  },
  {
    id: "ascension",
    name: "Ascension",
    icon: "✨",
    description: "Gain 2x souls from prestige",
    cost: 30,
    tier: 4,
    path: "neutral",
    requires: ["soul_harvest"],
  },
];

export function canUnlockSkill(skillId, unlockedSkillIds) {
  const skill = SKILLS.find((s) => s.id === skillId);
  if (!skill) return false;
  if (skill.requires.length === 0) return true;
  return skill.requires.every((reqId) => unlockedSkillIds.includes(reqId));
}