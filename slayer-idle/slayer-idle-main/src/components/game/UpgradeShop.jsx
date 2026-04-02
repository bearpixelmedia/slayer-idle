import React, { useState } from "react";
import { UPGRADES, getUpgradeCost, TAP_UPGRADES, IDLE_UPGRADES } from "@/lib/gameData";
import { formatNumber } from "@/lib/formatNumber";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { HUD_THEME } from "@/lib/hudTheme";
import { PixelCoin } from "@/components/game/PixelCoin";

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
          <span className="text-primary font-pixel"><><PixelCoin size={10} className="inline-block align-middle mr-0.5" />{formatNumber(cost)}</></span>
        </div>
      </div>
      <div className="flex gap-1 flex-shrink-0">
        <motion.button
          onClick={() => canAfford1 && onBuy(upgrade.id, 1)}
          disabled={!canAfford1}
          className={`min-w-[2.25rem] px-2.5 py-1.5 rounded-md font-pixel text-[9px] font-bold transition-all min-h-[36px] flex items-center justify-center ${
            canAfford1
              ? "bg-primary text-primary-foreground shadow-md shadow-amber-900/40 ring-2 ring-amber-400/70 hover:brightness-110 hover:ring-amber-300/90"
              : "bg-muted/30 text-muted-foreground/50"
          }`}
          whileTap={canAfford1 ? { scale: 0.95 } : {}}
        >
          1
        </motion.button>
        <motion.button
          onClick={() => canAfford10 && onBuy(upgrade.id, 10)}
          disabled={!canAfford10}
          className={`min-w-[2.25rem] px-2.5 py-1.5 rounded-md font-pixel text-[9px] font-bold transition-all min-h-[36px] flex items-center justify-center ${
            canAfford10
              ? "bg-primary text-primary-foreground shadow-md shadow-amber-900/40 ring-2 ring-amber-400/70 hover:brightness-110 hover:ring-amber-300/90"
              : "bg-muted/30 text-muted-foreground/50"
          }`}
          whileTap={canAfford10 ? { scale: 0.95 } : {}}
        >
          10
        </motion.button>
        <motion.button
          onClick={() => canAfford50 && onBuy(upgrade.id, 50)}
          disabled={!canAfford50}
          className={`min-w-[2.25rem] px-2.5 py-1.5 rounded-md font-pixel text-[9px] font-bold transition-all min-h-[36px] flex items-center justify-center ${
            canAfford50
              ? "bg-primary text-primary-foreground shadow-md shadow-amber-900/40 ring-2 ring-amber-400/70 hover:brightness-110 hover:ring-amber-300/90"
              : "bg-muted/30 text-muted-foreground/50"
          }`}
          whileTap={canAfford50 ? { scale: 0.95 } : {}}
        >
          50
        </motion.button>
        <motion.button
          onClick={handleBuyMax}
          disabled={!canAfford1}
          className={`min-w-[2.5rem] px-2.5 py-1.5 rounded-md font-pixel text-[9px] font-bold transition-all min-h-[36px] flex items-center justify-center ${
            canAfford1
              ? "bg-accent text-accent-foreground shadow-md shadow-amber-900/40 ring-2 ring-amber-300/80 hover:brightness-110 hover:ring-amber-200/90"
              : "bg-muted/30 text-muted-foreground/50"
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
        type="button"
        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-gradient-to-r from-amber-600/35 via-primary/25 to-amber-700/30 hover:from-amber-500/45 hover:via-primary/35 border-2 border-amber-500/70 shadow-lg shadow-amber-950/40 ring-1 ring-amber-400/30 transition-all text-left`}
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl shrink-0 drop-shadow-sm" aria-hidden>
            ⬆️
          </span>
          <span className="font-pixel text-[10px] sm:text-[11px] text-amber-100 font-bold tracking-wide uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            Upgrades
          </span>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-amber-200 shrink-0" strokeWidth={2.5} aria-hidden />
        ) : (
          <ChevronDown className="w-4 h-4 text-amber-200 shrink-0" strokeWidth={2.5} aria-hidden />
        )}
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