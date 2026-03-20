import React from "react";
import { Coins, Sword, Zap, Skull, Ghost } from "lucide-react";
import { formatNumber } from "@/lib/formatNumber";
import { STAGES } from "@/lib/gameData";
import { HUD_THEME } from "@/lib/hudTheme";

export default function StatsBar({ state, tapDamage, idleCPS, className }) {
  if (!state) return null;
  const stage = STAGES[state?.stage] || STAGES[0];

  return (
    <div className={className || `${HUD_THEME.statsBar.container} ${HUD_THEME.statsBar.bg} ${HUD_THEME.statsBar.border} ${HUD_THEME.statsBar.rounded} ${HUD_THEME.statsBar.pointerEvents}`}>
      <div className="flex items-center gap-3 flex-wrap">
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
        <div className="flex items-center gap-1 text-muted-foreground">
          <span className="font-pixel text-[10px]">{formatNumber(tapDamage)} ⚔️</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <span className="font-pixel text-[10px]">{state.itemDrops || 0}/5 🎁</span>
        </div>
        {state.stage < 6 && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <span className="font-pixel text-[10px]">⚔️ {state.killCount % 25}/25</span>
          </div>
        )}
        <div className="hidden sm:flex items-center gap-1 text-muted-foreground">
          <span className="font-pixel text-[10px]">{formatNumber(idleCPS)}/s 💰</span>
        </div>
      </div>
      {state.isBossActive && (
        <div className="text-[9px] font-pixel text-red-400 animate-pulse">⚔️ BOSS</div>
      )}
    </div>
  );
}