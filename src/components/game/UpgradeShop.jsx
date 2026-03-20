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
    <div className="flex items-start gap-2 p-2 rounded-lg border border-border/50 bg-card/40">
      <div className="flex-shrink-0 text-2xl">{upgrade.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div>
            <span className="font-pixel text-[8px] text-foreground">{upgrade.name}</span>
            <p className="text-[7px] text-muted-foreground mt-0.5">{upgrade.description}</p>
          </div>
          <span className="font-pixel text-[6px] text-muted-foreground flex-shrink-0">Lv.{level}</span>
        </div>
        <div className="flex items-center gap-2 mb-2 text-[7px]">
          <span className={`font-pixel ${typeColor}`}>{typeLabel}</span>
          <span className="text-primary font-pixel">🪙 {formatNumber(cost)}</span>
        </div>
        <div className="flex gap-1">
          <motion.button
            onClick={() => canAfford1 && onBuy(upgrade.id, 1)}
            disabled={!canAfford1}
            className={`flex-1 py-1 rounded-md font-pixel text-[7px] transition-all ${
              canAfford1 ? "bg-primary text-primary-foreground hover:brightness-110" : "bg-muted/30 text-muted-foreground/50"
            }`}
            whileTap={canAfford1 ? { scale: 0.95 } : {}}
          >
            x1
          </motion.button>
          <motion.button
            onClick={() => canAfford10 && onBuy(upgrade.id, 10)}
            disabled={!canAfford10}
            className={`flex-1 py-1 rounded-md font-pixel text-[7px] transition-all ${
              canAfford10 ? "bg-primary text-primary-foreground hover:brightness-110" : "bg-muted/30 text-muted-foreground/50"
            }`}
            whileTap={canAfford10 ? { scale: 0.95 } : {}}
          >
            x10
          </motion.button>
          <motion.button
            onClick={() => canAfford50 && onBuy(upgrade.id, 50)}
            disabled={!canAfford50}
            className={`flex-1 py-1 rounded-md font-pixel text-[7px] transition-all ${
              canAfford50 ? "bg-primary text-primary-foreground hover:brightness-110" : "bg-muted/30 text-muted-foreground/50"
            }`}
            whileTap={canAfford50 ? { scale: 0.95 } : {}}
          >
            x50
          </motion.button>
          <motion.button
            onClick={handleBuyMax}
            disabled={!canAfford1}
            className={`flex-1 py-1 rounded-md font-pixel text-[7px] transition-all ${
              canAfford1 ? "bg-accent text-accent-foreground hover:brightness-110" : "bg-muted/30 text-muted-foreground/50"
            }`}
            whileTap={canAfford1 ? { scale: 0.95 } : {}}
          >
            MAX
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default function UpgradeShop({ state, onBuy }) {
  const [open, setOpen] = useState(true);

  return (
    <div className={`rounded-lg ${HUD_THEME.panel.border} overflow-hidden`}>
      {/* Header toggle */}
      <button
        className={`w-full flex items-center justify-between px-3 py-2 ${HUD_THEME.panel.bg} hover:bg-card/80 transition-colors`}
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">⬆️</span>
          <span className={`${HUD_THEME.text.label} text-primary`}>UPGRADES</span>
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
            <div className="px-3 py-2 space-y-1.5">
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