import React, { useState } from "react";
import { CRAFT_RECIPES, MATERIAL_DEFS } from "@/lib/crafting";
import { canCraftRecipe } from "@/lib/craftingHelpers";
import { formatNumber } from "@/lib/formatNumber";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Lock } from "lucide-react";

function RecipeCard({ recipe, materials, craftedRecipeIds, progressContext, onCraft, canCraft }) {
  const check = canCraftRecipe(recipe.id, progressContext, craftedRecipeIds, materials);
  const isCraftable = check.canCraft;
  const alreadyCrafted = recipe.unique && craftedRecipeIds.includes(recipe.id);

  const getMaterialIcon = (materialId) => {
    const mat = MATERIAL_DEFS.find((m) => m.id === materialId);
    return mat?.icon || "?";
  };

  return (
    <motion.button
      onClick={() => isCraftable && onCraft(recipe.id)}
      className={`w-full flex items-start gap-3 p-3 rounded-xl border transition-all ${
        alreadyCrafted
          ? "bg-green-500/10 border-green-500/30 opacity-70 cursor-not-allowed"
          : isCraftable
            ? "bg-secondary/60 border-primary/30 hover:border-primary/60 hover:bg-secondary/80 cursor-pointer"
            : "bg-card/40 border-border/30 opacity-50 cursor-not-allowed"
      }`}
      whileTap={isCraftable ? { scale: 0.97 } : {}}
    >
      <div className="text-2xl flex-shrink-0">{recipe.icon}</div>
      <div className="flex-1 text-left min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-foreground truncate">{recipe.name}</span>
          {alreadyCrafted && (
            <span className="font-pixel text-[7px] text-green-400">✓ CRAFTED</span>
          )}
          {!isCraftable && !alreadyCrafted && (
            <Lock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
          )}
        </div>
        <p className="text-[10px] text-muted-foreground mb-2">{recipe.description}</p>

        {/* Material costs */}
        <div className="flex flex-wrap gap-2 text-[8px] font-pixel">
          {Object.entries(recipe.costs).map(([materialId, cost]) => {
            const have = materials[materialId] || 0;
            const isSufficient = have >= cost;
            return (
              <span
                key={materialId}
                className={isSufficient ? "text-foreground" : "text-muted-foreground/50"}
              >
                {getMaterialIcon(materialId)} {have}/{cost}
              </span>
            );
          })}
        </div>

        {/* Prerequisites */}
        {recipe.prerequisiteIds.length > 0 && (
          <p className="text-[7px] text-muted-foreground mt-1">
            Requires: {recipe.prerequisiteIds.map((id) => CRAFT_RECIPES.find((r) => r.id === id)?.name).join(", ")}
          </p>
        )}
      </div>
      {isCraftable && !alreadyCrafted && (
        <ChevronUp className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
      )}
    </motion.button>
  );
}

export default function ForgePanel({
  materials,
  craftedRecipeIds,
  progressContext,
  onCraft,
}) {
  const [open, setOpen] = useState(false);
  const craftableCount = CRAFT_RECIPES.filter(
    (r) => canCraftRecipe(r.id, progressContext, craftedRecipeIds, materials).canCraft
  ).length;
  const totalCount = CRAFT_RECIPES.length;

  return (
    <div className="mx-4 mb-4 rounded-xl border border-border/50 overflow-hidden">
      {/* Header toggle */}
      <button
        className="w-full flex items-center justify-between px-4 py-3 bg-card/60 hover:bg-card/80 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">⚒️</span>
          <span className="font-pixel text-[9px] text-primary">FORGE</span>
          <span className="font-pixel text-[8px] text-muted-foreground">
            {craftedRecipeIds.length}/{totalCount}
          </span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 space-y-2">
              {/* Material inventory preview */}
              <div className="mb-3 pb-3 border-b border-border/30">
                <p className="font-pixel text-[8px] text-muted-foreground mb-2">INVENTORY</p>
                <div className="flex flex-wrap gap-2">
                  {MATERIAL_DEFS.map((mat) => {
                    const count = materials[mat.id] || 0;
                    return (
                      <div
                        key={mat.id}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-muted/20 border border-border/30 text-[8px]"
                      >
                        <span>{mat.icon}</span>
                        <span className="font-pixel">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recipes grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CRAFT_RECIPES.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    materials={materials}
                    craftedRecipeIds={craftedRecipeIds}
                    progressContext={progressContext}
                    onCraft={onCraft}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}