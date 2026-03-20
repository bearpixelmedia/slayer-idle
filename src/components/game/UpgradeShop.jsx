import React from "react";
import { UPGRADES, getUpgradeCost, TAP_UPGRADES, IDLE_UPGRADES } from "@/lib/gameData";
import { formatNumber } from "@/lib/formatNumber";
import { motion } from "framer-motion";
import { ChevronUp } from "lucide-react";

function UpgradeCard({ upgrade, level, coins, onBuy }) {
  const cost = getUpgradeCost(upgrade, level);
  const canAfford = (coins ?? 0) >= cost;
  const typeLabel = TAP_UPGRADES.includes(upgrade.id) ? "TAP" : IDLE_UPGRADES.includes(upgrade.id) ? "IDLE" : "ALL";
  const typeColor = TAP_UPGRADES.includes(upgrade.id) ? "text-red-400" : IDLE_UPGRADES.includes(upgrade.id) ? "text-yellow-400" : "text-purple-400";

  return (
    <motion.button
      onClick={() => canAfford && onBuy(upgrade.id)}
      className={`relative flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
        canAfford
          ? "bg-secondary/40 border-secondary/60 hover:border-primary/60 hover:bg-secondary/60 cursor-pointer"
          : "bg-muted/20 border-border/30 opacity-40 cursor-not-allowed"
      }`}
      whileTap={canAfford ? { scale: 0.95 } : {}}
    >
      <div className="text-2xl mb-1">{upgrade.icon}</div>
      <span className="font-pixel text-[7px] text-foreground truncate text-center max-w-[60px]">{upgrade.name}</span>
      <p className="text-[7px] text-muted-foreground text-center mt-0.5 max-w-[70px] leading-tight">{upgrade.description}</p>
      
      <div className="mt-2 w-full flex flex-col items-center gap-1 border-t border-border/30 pt-2">
        <span className={`font-pixel text-[6px] ${typeColor}`}>{typeLabel}</span>
        <span className="font-pixel text-[8px] text-primary">🪙 {formatNumber(cost)}</span>
        <span className="font-pixel text-[6px] text-muted-foreground">Lv.{level}</span>
      </div>
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