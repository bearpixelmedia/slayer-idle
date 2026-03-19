import React, { useState } from "react";
import useGameState from "@/hooks/useGameState";
import useAchievements from "@/hooks/useAchievements";
import useQuests from "@/hooks/useQuests";
import useRunnerState from "@/hooks/useRunnerState";
import { computeAchievementMultipliers } from "@/lib/achievements";
import StatsBar from "@/components/game/StatsBar";
import GameCanvas from "@/components/game/GameCanvas";
import RunnerCanvas from "@/components/game/RunnerCanvas";
import AchievementToast from "@/components/game/AchievementToast";
import OfflineEarningsModal from "@/components/game/OfflineEarningsModal";
import DeathModal from "@/components/game/DeathModal";
import { ScrollArea } from "@/components/ui/scroll-area";
import WeaponMode from "@/components/game/WeaponMode";
import ActiveBuffsDisplay from "@/components/game/ActiveBuffsDisplay";
import GameTabs from "@/components/game/GameTabs";

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
    floatingDamage,
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
    currentWeapon,
    setCurrentWeapon,
    switchZone,
    unlockZone,
    activeBuffs,
    upgradeBuilding,
  } = useGameState(initMultipliers);

  const { unlockedIds, newUnlock, damageMultiplier, offlineMultiplier } = useAchievements(state);

  const { questProgress, claimReward, resetQuestForRepeat } = useQuests(state, state.unlockedZoneIds);

  const handleClaimQuestReward = (questId) => {
    const reward = claimReward(questId);
    if (!reward) return;

    setState(prev => ({
      ...prev,
      coins: prev.coins + (reward.coins || 0),
      souls: prev.souls + (reward.souls || 0),
      slayerPoints: prev.slayerPoints + (reward.slayerPoints || 0),
    }));
  };

  const handleRepeatQuest = (questId) => {
    resetQuestForRepeat(questId);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <StatsBar
        state={state}
        tapDamage={getTapDamage()}
        idleCPS={getIdleCPS()}
      />
      <ActiveBuffsDisplay activeBuffs={activeBuffs} />
      <WeaponMode
        currentMode={currentWeapon}
        bowUnlocked={state.upgradeLevels["bow"] > 0}
        onModeChange={setCurrentWeapon}
      />
      {!showRunner ? (
        <GameCanvas
          state={state}
          enemyDying={enemyDying}
          floatingCoins={floatingCoins}
          floatingSouls={floatingSouls}
          floatingDamage={floatingDamage}
          particles={particles}
          slashEffects={slashEffects}
          onTap={handleTap}
          enemyHit={enemyHit}
          weaponMode={currentWeapon}
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
            <GameTabs
              state={state}
              onBuyUpgrade={buyUpgrade}
              onUnlockSkill={unlockSkill}
              onPrestige={prestige}
              onRevive={revive}
              unlockedIds={unlockedIds}
              damageMultiplier={damageMultiplier}
              offlineMultiplier={offlineMultiplier}
              onSwitchZone={switchZone}
              onUnlockZone={unlockZone}
              onClaimQuestReward={handleClaimQuestReward}
              onRepeatQuest={handleRepeatQuest}
              questProgress={questProgress}
              onUpgradeBuilding={upgradeBuilding}
              abilities={abilities}
              onActivateAbility={activateAbility}
              weaponMode={currentWeapon}
            />
            <div className="px-4 py-6 text-center">
              <p className="font-pixel text-[7px] text-muted-foreground/30">
                SLAYER IDLE • TAP & PRESTIGE RPG
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