import React, { useState } from "react";
import { UPGRADES, getUpgradeCost, TAP_UPGRADES, IDLE_UPGRADES } from "@/lib/gameData";
import { formatNumber } from "@/lib/formatNumber";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { HUD_THEME } from "@/lib/hudTheme";

function UpgradeCard({ upgrade, level, coins, onBuy }) {
  const cost = getUpgradeCost(upgrade, level);
  const canAfford1 = (coins ?? 0) >= cost;
  const canAfford10 = (coins ?? 0) >= cost * 10;
  const canAfford50 = (coins ?? 0) >= cost * 50;
  const typeLabel = TAP_UPGRADES.includes(upgrade.id) ? "TAP" : IDLE_UPGRADES.includes(upgrade.id) ? "IDLE" : "ALL";
  const typeColor = TAP_UPGRADES.includes(upgrade.id) ? "text-red-400" : IDLE_UPGRADES.includes(upgrade.id) ? "text-yellow-400" : "text-purple-400";

  const handleBuyMax = () => {
    let count = 0;
    let currentLevel = level;
    let totalCost = 0;
    while ((coins ?? 0) >= totalCost + getUpgradeCost(upgrade, currentLevel)) {
      totalCost += getUpgradeCost(upgrade, currentLevel);
      currentLevel++;
      count++;
    }
    if (count > 0) onBuy(upgrade.id, count);
  };

  return (
    <div className="flex items-center gap-2 p-2 rounded-md border border-border/50 bg-card/40 text-[7px]">
      <div className="flex-shrink-0 text-2xl">{upgrade.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="font-pixel text-foreground">{upgrade.name}</span>
          <span className="font-pixel text-muted-foreground">L{level}</span>
        </div>
        <div className="flex items-center gap-1 text-[7px]">
          <span className={`font-pixel ${typeColor}`}>{typeLabel}</span>
          <span className="text-primary font-pixel">🪙 {formatNumber(cost)}</span>
        </div>
      </div>
      <div className="flex gap-1 flex-shrink-0">
        <motion.button
          onClick={() => canAfford1 && onBuy(upgrade.id, 1)}
          disabled={!canAfford1}
          className={`px-2 py-1 rounded font-pixel text-[7px] transition-all ${
            canAfford1 ? "bg-primary text-primary-foreground hover:brightness-110" : "bg-muted/30 text-muted-foreground/50"
          }`}
          whileTap={canAfford1 ? { scale: 0.95 } : {}}
        >
          1
        </motion.button>
        <motion.button
          onClick={() => canAfford10 && onBuy(upgrade.id, 10)}
          disabled={!canAfford10}
          className={`px-2 py-1 rounded font-pixel text-[7px] transition-all ${
            canAfford10 ? "bg-primary text-primary-foreground hover:brightness-110" : "bg-muted/30 text-muted-foreground/50"
          }`}
          whileTap={canAfford10 ? { scale: 0.95 } : {}}
        >
          10
        </motion.button>
        <motion.button
          onClick={() => canAfford50 && onBuy(upgrade.id, 50)}
          disabled={!canAfford50}
          className={`px-2 py-1 rounded font-pixel text-[7px] transition-all ${
            canAfford50 ? "bg-primary text-primary-foreground hover:brightness-110" : "bg-muted/30 text-muted-foreground/50"
          }`}
          whileTap={canAfford50 ? { scale: 0.95 } : {}}
        >
          50
        </motion.button>
        <motion.button
          onClick={handleBuyMax}
          disabled={!canAfford1}
          className={`px-2 py-1 rounded font-pixel text-[7px] transition-all ${
            canAfford1 ? "bg-accent text-accent-foreground hover:brightness-110" : "bg-muted/30 text-muted-foreground/50"
          }`}
          whileTap={canAfford1 ? { scale: 0.95 } : {}}
        >
          MAX
        </motion.button>
      </div>
    </div>
  );
}

export default function UpgradeShop({ state, onBuy }) {
  const [open, setOpen] = useState(true);

  return (
    <div className={`rounded-md ${HUD_THEME.panel.border} overflow-hidden`}>
      <button
        className={`w-full flex items-center justify-between px-2 py-1 ${HUD_THEME.panel.bg} hover:bg-card/80 transition-colors animate-pulse border-l-4 border-accent text-[9px]`}
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-1">
          <span>⬆️</span>
          <span className={`${HUD_THEME.text.label} text-accent font-bold`}>UPGRADE NOW!</span>
        </div>
        {open ? <ChevronUp className="w-3 h-3 text-accent" /> : <ChevronDown className="w-3 h-3 text-accent" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-y-auto max-h-80"
          >
            <div className="px-2 py-1 space-y-1">
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}