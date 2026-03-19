import React from "react";
import useGameState from "@/hooks/useGameState";
import useAchievements from "@/hooks/useAchievements";
import { computeAchievementMultipliers } from "@/lib/achievements";
import StatsBar from "@/components/game/StatsBar";
import GameCanvas from "@/components/game/GameCanvas";
import UpgradeShop from "@/components/game/UpgradeShop";
import PrestigePanel from "@/components/game/PrestigePanel";
import SkillTree from "@/components/game/SkillTree";
import AbilityBar from "@/components/game/AbilityBar";
import AchievementsPanel from "@/components/game/AchievementsPanel";
import AchievementToast from "@/components/game/AchievementToast";
import OfflineEarningsModal from "@/components/game/OfflineEarningsModal";
import DeathModal from "@/components/game/DeathModal";
import { ScrollArea } from "@/components/ui/scroll-area";

function loadSavedMultipliers() {
  try {
    const saved = localStorage.getItem("idle_slayer_achievements");
    const ids = saved ? JSON.parse(saved) : [];
    return computeAchievementMultipliers(ids);
  } catch {
    return { damageMultiplier: 1, offlineMultiplier: 1 };
  }
}

export default function Game() {
  // Load saved achievement multipliers synchronously so gameState starts with them
  const [initMultipliers] = React.useState(loadSavedMultipliers);

  const {
    state,
    floatingCoins,
    particles,
    enemyDying,
    slashEffects,
    offlineEarnings,
    setOfflineEarnings,
    handleTap,
    buyUpgrade,
    prestige,
    canPrestige,
    soulsOnPrestige,
    slayerPointsOnPrestige,
    unlockSkill,
    abilities,
    activateAbility,
    getTapDamage,
    getIdleCPS,
    enemyHit,
  } = useGameState(initMultipliers);

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
        particles={particles}
        slashEffects={slashEffects}
        onTap={handleTap}
        enemyHit={enemyHit}
      />
      <ScrollArea className="flex-1">
        <AbilityBar abilities={abilities} onActivate={activateAbility} />
        <PrestigePanel
          canPrestige={canPrestige}
          soulsOnPrestige={soulsOnPrestige}
          slayerPointsOnPrestige={slayerPointsOnPrestige}
          currentSouls={state.souls}
          onPrestige={prestige}
        />
        <SkillTree
          slayerPoints={state.slayerPoints}
          unlockedSkillIds={state.unlockedSkills}
          onUnlock={unlockSkill}
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
      <OfflineEarningsModal
        earnings={offlineEarnings}
        onClose={() => setOfflineEarnings(null)}
      />
    </div>
  );
}