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
    <div className="fixed inset-0 bg-background flex flex-col lg:flex-row">
      {/* Portrait/Mobile: Full screen */}
      <div className="lg:hidden w-full h-full relative">
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

        <div className="w-full h-full">
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

          {!showRunner && (
            <div className="absolute inset-0 pointer-events-none">
              <ScrollArea className="absolute inset-0 pointer-events-auto">
                <div className="px-4 py-2">
                  <button
                    onClick={() => setShowRunner(true)}
                    className="w-full py-2 rounded-lg bg-secondary/60 hover:bg-secondary/80 text-foreground font-pixel text-[9px] transition-colors"
                  >
                    🏃 RUNNER MINIGAME
                  </button>
                </div>
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
              </ScrollArea>
            </div>
          )}

          {showRunner && (
            <div className="absolute bottom-4 left-4 right-4 z-10">
              <button
                onClick={() => setShowRunner(false)}
                className="w-full py-2 rounded-lg bg-secondary/60 hover:bg-secondary/80 text-foreground font-pixel text-[9px] transition-colors"
              >
                ← BACK TO SLAYER
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Landscape: Side-by-side layout */}
      <div className="hidden lg:flex flex-1 overflow-hidden relative">
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

        {/* Game on left */}
        <div className="flex-1 overflow-hidden">
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
        </div>

        {/* Menu on right */}
        {!showRunner && (
          <div className="w-96 border-l border-border overflow-hidden flex flex-col bg-card">
            <ScrollArea className="flex-1 overflow-hidden">
              <div className="p-4 space-y-3">
                <button
                  onClick={() => setShowRunner(true)}
                  className="w-full py-2 rounded-lg bg-secondary/60 hover:bg-secondary/80 text-foreground font-pixel text-[9px] transition-colors"
                >
                  🏃 RUNNER MINIGAME
                </button>
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
              </div>
            </ScrollArea>
            
            {/* Bottom icon bar */}
            <div className="bg-red-900 border-t border-yellow-700 px-2 py-2 flex justify-around items-center gap-1">
              <button className="p-2 hover:opacity-80 text-lg">⚔️</button>
              <button className="p-2 hover:opacity-80 text-lg">⬆️</button>
              <button className="p-2 hover:opacity-80 text-lg">🧑</button>
              <button className="p-2 hover:opacity-80 text-lg">💎</button>
              <button className="p-2 hover:opacity-80 text-lg">⋮</button>
              <button className="p-2 hover:opacity-80 text-lg">✕</button>
            </div>
          </div>
        )}

        {showRunner && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-10">
            <button
              onClick={() => setShowRunner(false)}
              className="px-6 py-2 rounded-lg bg-secondary/60 hover:bg-secondary/80 text-foreground font-pixel text-[9px] transition-colors"
            >
              ← BACK TO SLAYER
            </button>
          </div>
        )}
      </div>

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