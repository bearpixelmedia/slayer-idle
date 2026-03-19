import React from "react";
import useGameState from "@/hooks/useGameState";
import StatsBar from "@/components/game/StatsBar";
import GameCanvas from "@/components/game/GameCanvas";
import UpgradeShop from "@/components/game/UpgradeShop";
import PrestigePanel from "@/components/game/PrestigePanel";
import AbilityBar from "@/components/game/AbilityBar";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Game() {
  const {
    state,
    floatingCoins,
    enemyDying,
    slashEffects,
    handleTap,
    buyUpgrade,
    prestige,
    canPrestige,
    soulsOnPrestige,
    abilities,
    activateAbility,
    getTapDamage,
    getIdleCPS,
  } = useGameState();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <StatsBar
        state={state}
        tapDamage={getTapDamage()}
        idleCPS={getIdleCPS()}
      />
      <GameCanvas
        state={state}
        enemyDying={enemyDying}
        floatingCoins={floatingCoins}
        slashEffects={slashEffects}
        onTap={handleTap}
      />
      <ScrollArea className="flex-1">
        <AbilityBar abilities={abilities} onActivate={activateAbility} />
        <PrestigePanel
          canPrestige={canPrestige}
          soulsOnPrestige={soulsOnPrestige}
          currentSouls={state.souls}
          onPrestige={prestige}
        />
        <UpgradeShop
          state={state}
          onBuy={buyUpgrade}
        />
        <div className="px-4 py-6 text-center">
          <p className="font-pixel text-[7px] text-muted-foreground/30">
            IDLE SLAYER CLONE • TAP & IDLE RPG
          </p>
        </div>
      </ScrollArea>
    </div>
  );
}