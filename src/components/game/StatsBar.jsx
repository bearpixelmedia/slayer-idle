import React from "react";
import { Coins, Sword, Zap, Skull, Ghost } from "lucide-react";
import { formatNumber } from "@/lib/formatNumber";
import { STAGES } from "@/lib/gameData";

export default function StatsBar({ state, tapDamage, idleCPS }) {
  const stage = STAGES[state.stage];

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="text-lg">🪙</span>
          <span className="font-pixel text-primary text-xs sm:text-sm">{formatNumber(state.coins)}</span>
        </div>
        {state.souls > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-lg">👻</span>
            <span className="font-pixel text-accent text-xs">{formatNumber(state.souls)}</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Sword className="w-3.5 h-3.5 text-red-400" />
          <span>{formatNumber(tapDamage)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 text-yellow-400" />
          <span>{formatNumber(idleCPS)}/s</span>
        </div>
        <div className="flex items-center gap-1">
          <Skull className="w-3.5 h-3.5 text-purple-400" />
          <span>{formatNumber(state.totalKills)}</span>
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full bg-secondary/50 border border-border">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
        <span className="font-pixel text-[8px]" style={{ color: stage.color }}>{stage.name}</span>
      </div>
    </div>
  );
}