import React from "react";
import { Coins, Sword, Zap, Skull, Ghost } from "lucide-react";
import { formatNumber } from "@/lib/formatNumber";
import { STAGES } from "@/lib/gameData";

export default function StatsBar({ state, tapDamage, idleCPS, className }) {
  if (!state) return null;
  const stage = STAGES[state?.stage] || STAGES[0];

  return (
    <div className={className || "fixed top-2 left-2 right-2 z-20 flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-card/80 backdrop-blur-md rounded-lg border border-border pointer-events-none"}>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <span className="text-sm">🪙</span>
          <span className="font-pixel text-primary text-xs">{formatNumber(state.coins)}</span>
        </div>
        {state.souls > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-sm">👻</span>
            <span className="font-pixel text-accent text-xs">{formatNumber(state.souls)}</span>
          </div>
        )}
      </div>
      <div className="hidden sm:flex items-center gap-2 text-[10px] text-muted-foreground">
        <span>{formatNumber(tapDamage)} ⚔️</span>
        <span>{formatNumber(idleCPS)}/s ⚡</span>
      </div>
      {state.isBossActive && (
        <div className="text-[9px] font-pixel text-red-400 animate-pulse">⚔️ BOSS</div>
      )}
    </div>
  );
}