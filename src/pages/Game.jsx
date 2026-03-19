import React from "react";
import useGameState from "@/hooks/useGameState";
import useAchievements from "@/hooks/useAchievements";
import StatsBar from "@/components/game/StatsBar";
import GameCanvas from "@/components/game/GameCanvas";
import UpgradeShop from "@/components/game/UpgradeShop";
import PrestigePanel from "@/components/game/PrestigePanel";
import AbilityBar from "@/components/game/AbilityBar";
import AchievementsPanel from "@/components/game/AchievementsPanel";
import AchievementToast from "@/components/game/AchievementToast";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Game() {
  // Two-pass: first load state to feed achievements, then get multipliers back
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

  const { unlockedIds, newUnlock, damageMultiplier, offlineMultiplier } = useAchievements(state);

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
        <AchievementsPanel
          unlockedIds={unlockedIds}
          damageMultiplier={damageMultiplier}
          offlineMultiplier={offlineMultiplier}
        />
        <UpgradeShop state={state} onBuy={buyUpgrade} />
        <div className="px-4 py-6 text-center">
          <p className="font-pixel text-[7px] text-muted-foreground/30">
            IDLE SLAYER CLONE • TAP & IDLE RPG
          </p>
        </div>
      </ScrollArea>
      <AchievementToast achievement={newUnlock} />
    </div>
  );
}