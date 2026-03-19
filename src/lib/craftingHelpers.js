// src/lib/craftingHelpers.js

import { CRAFT_RECIPES, MATERIAL_DEFS, CRAFTING_DROP_CONFIG } from "./crafting";
import { canUnlock } from "./minionHelpers"; // Reuse unlock logic

/**
 * Get the zone-specific material ID for a given zone.
 * @param {string} zoneId
 * @returns {string | null}
 */
export function getZoneMaterialId(zoneId) {
  const zoneMaterialMap = {
    realm_of_light: "light_essence",
    whispering_woods: "verdant_shard",
    shadowfell_citadel: "shadow_core",
  };
  return zoneMaterialMap[zoneId] || null;
}

/**
 * Determine which materials drop from an enemy kill.
 * Returns an object { scrap?: number, zoneSpecific?: number }
 * @param {string} activeZoneId
 * @returns {{ scrap?: number, zoneSpecific?: string }}
 */
export function rollMaterialDrop(activeZoneId) {
  const drops = {};

  // Generic scrap drop
  if (Math.random() < CRAFTING_DROP_CONFIG.genericScrapDropChance) {
    drops.scrap = 1;
  }

  // Zone-specific material drop
  if (Math.random() < CRAFTING_DROP_CONFIG.zoneMaterialDropChance) {
    const zoneMat = getZoneMaterialId(activeZoneId);
    if (zoneMat) {
      drops.zoneSpecific = zoneMat;
    }
  }

  return drops;
}

/**
 * Check if a recipe can be crafted by the player.
 * @param {string} recipeId
 * @param {Object} progressContext - { unlockedZoneIds, highestStage }
 * @param {Array} craftedRecipeIds - List of already crafted recipe IDs
 * @param {Object} materials - Current material inventory
 * @returns {{ canCraft: boolean, reason?: string }}
 */
export function canCraftRecipe(recipeId, progressContext, craftedRecipeIds, materials) {
  const recipe = CRAFT_RECIPES.find((r) => r.id === recipeId);
  if (!recipe) return { canCraft: false, reason: "RECIPE_NOT_FOUND" };

  // Check if already crafted (unique items)
  if (recipe.unique && craftedRecipeIds.includes(recipeId)) {
    return { canCraft: false, reason: "ALREADY_CRAFTED" };
  }

  // Check unlock condition
  if (!canUnlock(recipe.unlock, progressContext)) {
    return { canCraft: false, reason: "NOT_UNLOCKED" };
  }

  // Check prerequisites
  if (recipe.prerequisiteIds.length > 0) {
    const hasAllPrereqs = recipe.prerequisiteIds.every((prereqId) =>
      craftedRecipeIds.includes(prereqId)
    );
    if (!hasAllPrereqs) {
      return { canCraft: false, reason: "MISSING_PREREQUISITES" };
    }
  }

  // Check material costs
  for (const [materialId, cost] of Object.entries(recipe.costs)) {
    const have = materials[materialId] || 0;
    if (have < cost) {
      return { canCraft: false, reason: "INSUFFICIENT_MATERIALS" };
    }
  }

  return { canCraft: true };
}

/**
 * Craft a recipe and return the new state.
 * @param {Object} params
 * @param {string} params.recipeId
 * @param {Array} params.craftedRecipeIds
 * @param {Object} params.materials
 * @param {Object} params.progressContext
 * @returns {{ ok: true, nextCraftedIds: Array, nextMaterials: Object } | { ok: false, reason: string }}
 */
export function craftRecipe(params) {
  const { recipeId, craftedRecipeIds, materials, progressContext } = params;

  const check = canCraftRecipe(recipeId, progressContext, craftedRecipeIds, materials);
  if (!check.canCraft) {
    return { ok: false, reason: check.reason };
  }

  const recipe = CRAFT_RECIPES.find((r) => r.id === recipeId);

  // Deduct materials
  const nextMaterials = { ...materials };
  for (const [materialId, cost] of Object.entries(recipe.costs)) {
    nextMaterials[materialId] = (nextMaterials[materialId] || 0) - cost;
  }

  // Add to crafted list
  const nextCraftedIds = [...craftedRecipeIds, recipeId];

  return {
    ok: true,
    nextCraftedIds,
    nextMaterials,
    recipe,
  };
}

/**
 * Compute cumulative crafting multipliers from crafted recipes.
 * @param {Array} craftedRecipeIds
 * @returns {Object} - Multiplier object (e.g., { tapDamageMultiplier: 1.15, ... })
 */
export function computeCraftingMultipliers(craftedRecipeIds) {
  const multipliers = {};

  craftedRecipeIds.forEach((recipeId) => {
    const recipe = CRAFT_RECIPES.find((r) => r.id === recipeId);
    if (!recipe) return;

    if (recipe.reward.type === "composite") {
      // Composite rewards apply multiple multipliers
      Object.entries(recipe.reward.values).forEach(([type, value]) => {
        multipliers[type] = (multipliers[type] || 1) * value;
      });
    } else {
      // Simple single-type rewards
      const type = recipe.reward.type;
      multipliers[type] = (multipliers[type] || 1) * recipe.reward.value;
    }
  });

  return multipliers;
}

/**
 * Award materials to inventory on enemy kill.
 * @param {Object} materials
 * @param {string} activeZoneId
 * @returns {Object} - Updated materials inventory
 */
export function awardMaterialsOnKill(materials, activeZoneId) {
  const drops = rollMaterialDrop(activeZoneId);
  const next = { ...materials };

  if (drops.scrap) {
    next.scrap = (next.scrap || 0) + drops.scrap;
  }
  if (drops.zoneSpecific) {
    next[drops.zoneSpecific] = (next[drops.zoneSpecific] || 0) + 1;
  }

  return next;
}