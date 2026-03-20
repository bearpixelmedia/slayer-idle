import React from "react";
import { UPGRADES, getUpgradeCost, TAP_UPGRADES, IDLE_UPGRADES } from "@/lib/gameData";
import { formatNumber } from "@/lib/formatNumber";
import { motion } from "framer-motion";
import { ChevronUp } from "lucide-react";

function UpgradeCard({ upgrade, level, coins, onBuy }) {
  const cost = getUpgradeCost(upgrade, level);
  const canAfford = coins >= cost;
  const typeLabel = TAP_UPGRADES.includes(upgrade.id) ? "TAP" : IDLE_UPGRADES.includes(upgrade.id) ? "IDLE" : "ALL";
  const typeColor = TAP_UPGRADES.includes(upgrade.id) ? "text-red-400" : IDLE_UPGRADES.includes(upgrade.id) ? "text-yellow-400" : "text-purple-400";

  return (
    <motion.button
      onClick={() => canAfford && onBuy(upgrade.id)}
      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
        canAfford
          ? "bg-secondary/60 border-primary/30 hover:border-primary/60 hover:bg-secondary/80 cursor-pointer"
          : "bg-card/40 border-border/30 opacity-50 cursor-not-allowed"
      }`}
      whileTap={canAfford ? { scale: 0.97 } : {}}
    >
      <div className="text-2xl flex-shrink-0">{upgrade.icon}</div>
      <div className="flex-1 text-left min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground truncate">{upgrade.name}</span>
          <span className={`font-pixel text-[7px] ${typeColor}`}>{typeLabel}</span>
        </div>
        <p className="text-[10px] text-muted-foreground">{upgrade.description}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="font-pixel text-[8px] text-primary">🪙 {formatNumber(cost)}</span>
          <span className="font-pixel text-[8px] text-muted-foreground">Lv.{level}</span>
        </div>
      </div>
      {canAfford && (
        <ChevronUp className="w-4 h-4 text-primary flex-shrink-0" />
      )}
    </motion.button>
  );
}

export default function UpgradeShop({ state, onBuy }) {
  return (
    <div className="px-4 py-4">
      <h2 className="font-pixel text-xs text-primary mb-3">⬆ UPGRADES</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {UPGRADES.map((upgrade) => (
          <UpgradeCard
            key={upgrade.id}
            upgrade={upgrade}
            level={state?.upgradeLevels?.[upgrade.id] || 0}
            coins={state?.coins || 0}
            onBuy={onBuy}
          />
        ))}
      </div>
    </div>
  );
}