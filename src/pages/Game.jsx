import React, { useState } from "react";
import useGameState from "@/hooks/useGameState";
import useAchievements from "@/hooks/useAchievements";
import useRunnerState from "@/hooks/useRunnerState";
import { computeAchievementMultipliers } from "@/lib/achievements";
import StatsBar from "@/components/game/StatsBar";
import GameCanvas from "@/components/game/GameCanvas";
import RunnerCanvas from "@/components/game/RunnerCanvas";
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
  const [showRunner, setShowRunner] = useState(false);

  const runner = useRunnerState();

  const {
    state,
    floatingCoins,
    floatingSouls,
    particles,
    enemyDying,
    slashEffects,
    offlineEarnings,
    setOfflineEarnings,
    handleTap,
    buyUpgrade,
    prestige,
    revive,
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
      {!showRunner ? (
        <GameCanvas
          state={state}
          enemyDying={enemyDying}
          floatingCoins={floatingCoins}
          floatingSouls={floatingSouls}
          particles={particles}
          slashEffects={slashEffects}
          onTap={handleTap}
          enemyHit={enemyHit}
        />
      ) : (
        <RunnerCanvas
          playerY={runner.playerY}
          obstacles={runner.obstacles}
          score={runner.score}
          isGameOver={runner.isGameOver}
          gameStarted={runner.gameStarted}
          onTap={() => {
            if (!runner.gameStarted) runner.startGame();
            else if (runner.isGameOver) runner.resetGame();
            else runner.handleJump();
          }}
        />
      )}
      <ScrollArea className="flex-1">
        {!showRunner && (
          <div className="px-4 py-2">
            <button
              onClick={() => setShowRunner(true)}
              className="w-full py-2 rounded-lg bg-secondary/60 hover:bg-secondary/80 text-foreground font-pixel text-[9px] transition-colors"
            >
              🏃 RUNNER MINIGAME
            </button>
          </div>
        )}
        {showRunner && (
          <div className="px-4 py-2">
            <button
              onClick={() => setShowRunner(false)}
              className="w-full py-2 rounded-lg bg-secondary/60 hover:bg-secondary/80 text-foreground font-pixel text-[9px] transition-colors"
            >
              ← BACK TO SLAYER
            </button>
          </div>
        )}
        {!showRunner && (
          <>
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
          </>
        )}
      </ScrollArea>
      <AchievementToast achievement={newUnlock} />
      <OfflineEarningsModal
        earnings={offlineEarnings}
        onClose={() => setOfflineEarnings(null)}
      />
      <DeathModal
        isDead={state.isDead}
        souls={state.souls}
        onRevive={revive}
        onPrestige={prestige}
        canRevive={state.souls >= 10}
      />
    </div>
  );
}