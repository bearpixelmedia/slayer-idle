import React from "react";
import { VILLAGE_BUILDINGS, getBuildingUpgradeCost, canUnlockBuilding, canAffordUpgrade } from "@/lib/village";
import { formatNumber } from "@/lib/formatNumber";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Lock } from "lucide-react";

function BuildingCard({ building, level, state, onUpgrade, maxLevel }) {
  const cost = getBuildingUpgradeCost(building, level);
  const unlocked = canUnlockBuilding(building, state);
  const canAfford = cost && canAffordUpgrade(cost, state);
  const isMaxed = level >= maxLevel;

  return (
    <motion.button
      onClick={() => canAfford && onUpgrade(building.id)}
      className={`w-full flex items-start gap-3 p-3 rounded-lg border transition-all ${
        !unlocked
          ? "bg-muted/20 border-border/30 opacity-50 cursor-not-allowed"
          : isMaxed
            ? "bg-green-900/20 border-green-500/30 cursor-default"
            : canAfford
              ? "bg-secondary/60 border-primary/30 hover:border-primary/60 hover:bg-secondary/80 cursor-pointer"
              : "bg-card/40 border-border/30 opacity-50 cursor-not-allowed"
      }`}
      whileTap={canAfford && !isMaxed ? { scale: 0.97 } : {}}
    >
      <div className="text-2xl flex-shrink-0">
        {!unlocked && <Lock className="w-5 h-5 text-muted-foreground" />}
        {unlocked && building.icon}
      </div>
      <div className="flex-1 text-left min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground truncate">{building.name}</span>
          {isMaxed && <span className="font-pixel text-[7px] text-green-400">MAX</span>}
        </div>
        <p className="text-[10px] text-muted-foreground mb-1">{building.description}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="font-pixel text-[8px] text-muted-foreground">Lv.{level}</span>
          {cost && !isMaxed && (
            <span className="font-pixel text-[8px]">
              <span className={canAfford ? "text-primary" : "text-muted-foreground/50"}>
                🪙 {formatNumber(cost.coins)} 👻 {cost.souls}
              </span>
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
}

export default function VillagePanel({ state, onUpgradeBuilding }) {
  const [open, setOpen] = React.useState(false);

  const upgradedCount = VILLAGE_BUILDINGS.filter((b) => (state.villageBuildings?.[b.id] || 0) > 0).length;

  return (
    <div className="mx-4 mb-4 rounded-xl border border-border/50 overflow-hidden">
      {/* Header toggle */}
      <button
        className="w-full flex items-center justify-between px-4 py-3 bg-card/60 hover:bg-card/80 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🏘️</span>
          <span className="font-pixel text-[9px] text-primary">VILLAGE</span>
          <span className="font-pixel text-[8px] text-muted-foreground">
            {upgradedCount}/{VILLAGE_BUILDINGS.length}
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
              {VILLAGE_BUILDINGS.map((building) => (
                <BuildingCard
                  key={building.id}
                  building={building}
                  level={state.villageBuildings?.[building.id] || 0}
                  state={state}
                  onUpgrade={onUpgradeBuilding}
                  maxLevel={building.maxLevel}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}