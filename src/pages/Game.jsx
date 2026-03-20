import React, { useState, useRef, useEffect } from "react";
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
import MenuPanel from "@/components/game/MenuPanel";
import GameTabs from "@/components/game/GameTabs";
import AbilityHUD from "@/components/game/AbilityHUD";

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
  const [initMultipliers] = React.useState(() => loadSavedMultipliers());
  const [showRunner, setShowRunner] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hudMenuOpen, setHudMenuOpen] = useState(false);

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

  const { questProgress, claimReward, resetQuestForRepeat } = useQuests(state, state?.unlockedZoneIds || []);

  const handleClaimQuestReward = (questId) => {
    claimReward(questId);
  };

  const handleRepeatQuest = (questId) => {
    resetQuestForRepeat(questId);
  };

  return (
    <div className="fixed inset-0 bg-background flex flex-col lg:flex-row overflow-hidden">
      {/* Portrait/Mobile: Full screen */}
      <div className="lg:hidden w-full h-full flex flex-col relative overflow-hidden">
        <StatsBar
          state={state}
          tapDamage={getTapDamage()}
          idleCPS={getIdleCPS()}
        />
        <ActiveBuffsDisplay activeBuffs={activeBuffs} />
        <WeaponMode
          currentMode={currentWeapon}
          bowUnlocked={(state?.upgradeLevels?.["bow"] || 0) > 0}
          onModeChange={setCurrentWeapon}
          className="hidden lg:flex flex-shrink-0"
        />

        <div className="w-full flex-1 overflow-hidden flex flex-col min-h-0">
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

        {!showRunner && menuOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden" onClick={() => setMenuOpen(false)}>
            <div 
              className="fixed bottom-0 left-0 right-0 max-h-[85vh] flex flex-col pointer-events-auto rounded-t-lg"
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "linear-gradient(135deg, #8B7355 0%, #A0826D 100%)",
                border: "6px solid #D4AF37",
                borderRadius: "12px 12px 0 0",
                boxShadow: "inset 0 0 0 2px #6B5344"
              }}
            >
              {/* Inner frame */}
              <div style={{
                background: "linear-gradient(135deg, #4A4A4A 0%, #2D2D2D 100%)",
                border: "2px solid #8B7355",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden"
              }}>
                <ScrollArea className="flex-1 overflow-hidden">
                  <div className="px-3 py-2 space-y-2">
                    <button
                      onClick={() => setShowRunner(true)}
                      className="w-full py-2 rounded-sm bg-green-600 hover:bg-green-700 text-white font-pixel text-[9px] transition-colors border-2 border-green-800"
                    >
                      🏃 RUNNER
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
              </div>
              
              {/* Bottom icon bar */}
              <div style={{
                background: "linear-gradient(180deg, #8B4513 0%, #654321 100%)",
                border: "3px solid #D4AF37",
                borderTop: "4px solid #D4AF37",
                display: "flex",
                justifyContent: "space-around",
                alignItems: "center",
                padding: "4px 2px",
                gap: "2px"
              }}>
                <button className="p-1.5 hover:opacity-70 text-lg transition-opacity" title="Combat">⚔️</button>
                <button className="p-1.5 hover:opacity-70 text-lg transition-opacity" title="Upgrades">⬆️</button>
                <button className="p-1.5 hover:opacity-70 text-lg transition-opacity" title="Skills">🧑</button>
                <button className="p-1.5 hover:opacity-70 text-lg transition-opacity" title="Achievements">💎</button>
                <button className="p-1.5 hover:opacity-70 text-lg transition-opacity" title="More">⋮</button>
                <button 
                  className="p-1.5 hover:opacity-70 text-lg transition-opacity cursor-pointer"
                  title="Close"
                  onClick={() => setMenuOpen(false)}
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

        {showRunner && (
          <div className="w-full flex-shrink-0 p-4">
            <button
              onClick={() => setShowRunner(false)}
              className="w-full py-2 rounded-lg bg-secondary/60 hover:bg-secondary/80 text-foreground font-pixel text-[9px] transition-colors"
            >
              ← BACK TO SLAYER
            </button>
          </div>
        )}

        {!showRunner && (
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="fixed bottom-6 right-4 z-40 w-12 h-12 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center text-2xl transition-all active:scale-95 safe-area-inset-bottom"
            style={{ bottom: "max(1.5rem, calc(env(safe-area-inset-bottom) + 1rem))" }}
          >
            💼
          </button>
        )}
      </div>

      {/* Landscape: Side-by-side layout */}
      <div className="hidden lg:flex h-full w-full overflow-hidden">
        <div className="flex-1 flex flex-col min-h-0 w-0">
          <StatsBar
            state={state}
            tapDamage={getTapDamage()}
            idleCPS={getIdleCPS()}
          />
          <ActiveBuffsDisplay activeBuffs={activeBuffs} />
          <WeaponMode
            currentMode={currentWeapon}
            bowUnlocked={(state?.upgradeLevels?.["bow"] || 0) > 0}
            onModeChange={setCurrentWeapon}
          />
          
          <div className="flex-1 overflow-hidden relative flex flex-col min-h-0">
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
        </div>

        {/* HUD Menu Panel - Toggle */}
        {!showRunner && hudMenuOpen && (
          <div className="w-96 flex-shrink-0 border-l border-border overflow-hidden z-40">
            <MenuPanel
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
              onRunnerClick={() => setShowRunner(true)}
              onClose={() => setHudMenuOpen(false)}
            />
          </div>
        )}

        {/* Menu toggle button */}
        {!showRunner && !hudMenuOpen && (
          <button
            onClick={() => setHudMenuOpen(true)}
            className="fixed right-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center text-2xl transition-all active:scale-95"
          >
            💼
          </button>
        )}
      </div>

      <AbilityHUD abilities={abilities} onActivate={activateAbility} />
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