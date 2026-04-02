// src/lib/crafting.js

/**
 * Material definitions used by crafting recipes.
 */
export const MATERIAL_DEFS = [
  {
    id: "scrap",
    name: "Ancient Scrap",
    icon: "🔩",
    description: "Common salvage found in all zones.",
    rarity: "common",
  },
  {
    id: "light_essence",
    name: "Light Essence",
    icon: "✨",
    description: "Radiant residue from Realm of Light foes.",
    rarity: "uncommon",
  },
  {
    id: "verdant_shard",
    name: "Verdant Shard",
    icon: "🌿",
    description: "Living crystal harvested in Whispering Woods.",
    rarity: "rare",
  },
  {
    id: "shadow_core",
    name: "Shadow Core",
    icon: "🖤",
    description: "Condensed void matter from Shadowfell Citadel.",
    rarity: "epic",
  },
];

/**
 * Crafting recipes (permanent upgrades for v1).
 * reward types are intentionally simple and map to existing multipliers.
 */
export const CRAFT_RECIPES = [
  {
    id: "light_charm_i",
    name: "Light Charm I",
    icon: "📿",
    description: "+5% tap damage.",
    costs: { scrap: 20, light_essence: 12 },
    reward: { type: "tapDamageMultiplier", value: 1.05 },
    unlock: { type: "zone_unlocked", zoneId: "realm_of_light" },
    prerequisiteIds: [],
    category: "damage",
    unique: true,
    order: 10,
  },
  {
    id: "light_charm_ii",
    name: "Light Charm II",
    icon: "📿",
    description: "+10% tap damage.",
    costs: { scrap: 40, light_essence: 28, verdant_shard: 8 },
    reward: { type: "tapDamageMultiplier", value: 1.1 },
    unlock: { type: "zone_unlocked", zoneId: "whispering_woods" },
    prerequisiteIds: ["light_charm_i"],
    category: "damage",
    unique: true,
    order: 20,
  },
  {
    id: "verdant_totem_i",
    name: "Verdant Totem I",
    icon: "🗿",
    description: "+8% idle CPS.",
    costs: { scrap: 35, verdant_shard: 20 },
    reward: { type: "idleMultiplier", value: 1.08 },
    unlock: { type: "zone_unlocked", zoneId: "whispering_woods" },
    prerequisiteIds: [],
    category: "idle",
    unique: true,
    order: 30,
  },
  {
    id: "shadow_sigil_i",
    name: "Shadow Sigil I",
    icon: "🔮",
    description: "+10% soul gain.",
    costs: { scrap: 50, verdant_shard: 20, shadow_core: 10 },
    reward: { type: "soulGainMultiplier", value: 1.1 },
    unlock: { type: "zone_unlocked", zoneId: "shadowfell_citadel" },
    prerequisiteIds: [],
    category: "souls",
    unique: true,
    order: 40,
  },
  {
    id: "forge_core_i",
    name: "Forge Core I",
    icon: "⚙️",
    description: "+8% coin drops.",
    costs: { scrap: 60, light_essence: 20, shadow_core: 8 },
    reward: { type: "coinDropMultiplier", value: 1.08 },
    unlock: { type: "zone_unlocked", zoneId: "shadowfell_citadel" },
    prerequisiteIds: [],
    category: "coins",
    unique: true,
    order: 50,
  },
  {
    id: "ascendant_relic",
    name: "Ascendant Relic",
    icon: "👑",
    description: "+5% global damage and +5% idle CPS.",
    costs: { scrap: 100, light_essence: 35, verdant_shard: 30, shadow_core: 25 },
    reward: { type: "composite", values: { tapDamageMultiplier: 1.05, idleMultiplier: 1.05 } },
    unlock: {
      type: "all",
      conditions: [
        { type: "zone_unlocked", zoneId: "shadowfell_citadel" },
        { type: "highest_stage_at_least", value: 5 },
      ],
    },
    prerequisiteIds: ["light_charm_ii", "verdant_totem_i", "shadow_sigil_i", "forge_core_i"],
    category: "hybrid",
    unique: true,
    order: 60,
  },
];

/**
 * Optional tunable constants for drop rates.
 * (Wire these into enemy kill reward logic later.)
 */
export const CRAFTING_DROP_CONFIG = {
  genericScrapDropChance: 0.2, // 20% from any enemy
  zoneMaterialDropChance: 0.08, // 8% zone-specific drop chance
};