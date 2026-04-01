import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useGameState from "@/hooks/useGameState";
import useAchievements from "@/hooks/useAchievements";
import useQuests from "@/hooks/useQuests";
import useRunnerState from "@/hooks/useRunnerState";
import { computeAchievementMultipliers } from "@/lib/achievements";
import { soundManager } from "@/lib/soundManager";
import { musicManager } from "@/lib/musicManager";
import GameCanvas from "@/components/game/GameCanvas";
import RunnerCanvas from "@/components/game/RunnerCanvas";
import AchievementToast from "@/components/game/AchievementToast";
import OfflineEarningsModal from "@/components/game/OfflineEarningsModal";
import DeathModal from "@/components/game/DeathModal";
import MenuPanel from "@/components/game/MenuPanel";
import HUDOverlay from "@/components/game/HUDOverlay";
import { UPGRADES, getUpgradeCost } from "@/lib/gameData";

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

  // Initialize sound manager and music on first load
  React.useEffect(() => {
    soundManager.init();
    musicManager.init();
    musicManager.start('main');
  }, []);

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
    playerHit,
    attackTick,
    tickWorldCoinCollection,
    // Hero system
    heroAbilities,
    heroPassives,
    heroDPS,
    recruitHero,
    levelHero,
    activateHeroAbility,
  } = useGameState(initMultipliers);

  const { unlockedIds, newUnlock, damageMultiplier, offlineMultiplier } = useAchievements(state);

  const { questProgress, claimReward, resetQuestForRepeat } = useQuests(state, state?.unlockedZoneIds || []);

  const hasAffordableUpgrade = useMemo(() => {
    if (!state) return false;
    return UPGRADES.some((upgrade) => {
      const level = state.upgradeLevels?.[upgrade.id] || 0;
      const cost = getUpgradeCost(upgrade, level);
      return (state.coins || 0) >= cost;
    });
  }, [state]);

  const handleClaimQuestReward = (questId) => {
    claimReward(questId);
    soundManager.play('coin-collect');
  };

  const handleRepeatQuest = (questId) => {
    resetQuestForRepeat(questId);
    soundManager.play('ui-click');
  };

  const handleBuyUpgrade = (upgradeId, quantity) => {
    buyUpgrade(upgradeId, quantity);
    soundManager.play('upgrade');
  };

  const handleUnlockSkill = (skillId) => {
    unlockSkill(skillId);
    soundManager.play('upgrade');
  };

  const handlePrestige = () => {
    prestige();
    soundManager.play('prestige');
  };

  const handleActivateAbility = (abilityId) => {
    activateAbility(abilityId);
    soundManager.play('upgrade');
  };

  const handleJumpFeedback = () => {
    soundManager.play("tap");
  };

  const handleWorldCoinPickup = () => {
    soundManager.play("coin-collect");
  };

  const handleTapGame = (x, y, opts) => {
    handleTap(x, y, opts);
  };

  return (
    <div className="fixed inset-0 bg-background flex flex-col lg:flex-row overflow-hidden">
      {/* Portrait/Mobile: Full screen */}
      <div className="lg:hidden w-full h-full flex flex-col relative overflow-hidden">

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
              onTap={handleTapGame}
              onJump={handleJumpFeedback}
              tickWorldCoinCollection={tickWorldCoinCollection}
              onWorldCoinPickup={handleWorldCoinPickup}
              attackTick={attackTick}
              enemyHit={enemyHit}
              playerHit={playerHit}
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
          <motion.button
            type="button"
            title={hasAffordableUpgrade ? "Menu — you can buy an upgrade!" : "Open menu"}
            onClick={() => setMenuOpen(!menuOpen)}
            animate={
              hasAffordableUpgrade
                ? {
                    boxShadow: [
                      "0 0 0 0 rgba(251, 191, 36, 0.95)",
                      "0 0 0 18px rgba(251, 191, 36, 0)",
                    ],
                    scale: [1, 1.06, 1],
                  }
                : {}
            }
            transition={hasAffordableUpgrade ? { duration: 1.1, repeat: Infinity } : {}}
            className={`fixed bottom-20 right-4 z-[45] flex h-14 w-14 items-center justify-center rounded-full text-2xl shadow-lg transition-all active:scale-95 sm:h-16 sm:w-16 sm:text-3xl lg:hidden border-[3px] ${
              hasAffordableUpgrade
                ? "border-amber-400 bg-gradient-to-br from-amber-500/50 to-primary/45 ring-2 ring-amber-300/50 hover:brightness-110"
                : "border-amber-600/80 bg-gradient-to-br from-amber-900/50 to-card/90 ring-1 ring-amber-500/30 hover:brightness-125"
            }`}
          >
            📖
          </motion.button>
        )}
      </div>

      {/* Landscape: Side-by-side layout */}
      <div className="hidden lg:flex h-full w-full overflow-hidden">
        <div className="flex-1 flex flex-col min-h-0 w-0">
          
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
                onTap={handleTapGame}
                onJump={handleJumpFeedback}
                tickWorldCoinCollection={tickWorldCoinCollection}
                onWorldCoinPickup={handleWorldCoinPickup}
                attackTick={attackTick}
                enemyHit={enemyHit}
                playerHit={playerHit}
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

      </div>

      {/* Global HUD Overlay - All HUD elements in one parent */}
      <HUDOverlay
         state={state}
         getTapDamage={getTapDamage}
         getIdleCPS={getIdleCPS}
         activeBuffs={activeBuffs}
         currentWeapon={currentWeapon}
         onWeaponChange={setCurrentWeapon}
         abilities={abilities}
         onActivateAbility={handleActivateAbility}
         hudMenuOpen={hudMenuOpen}
         onMenuToggle={setHudMenuOpen}
         onBuyUpgrade={handleBuyUpgrade}
         onUnlockSkill={handleUnlockSkill}
         onPrestige={handlePrestige}
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
         onRunnerClick={() => setShowRunner(true)}
         heroAbilities={heroAbilities}
         heroPassives={heroPassives}
         heroDPS={heroDPS}
         onRecruitHero={recruitHero}
         onLevelHero={levelHero}
         onActivateHeroAbility={activateHeroAbility}
       />

      {/* Mobile menu — full-height slide-up panel using MenuPanel */}
      <AnimatePresence>
        {!showRunner && menuOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setMenuOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 max-h-[88vh] flex flex-col pointer-events-auto lg:hidden overflow-hidden rounded-t-2xl border-t-2 border-amber-600/60 shadow-2xl"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
            >
              <MenuPanel
                state={state}
                onBuyUpgrade={handleBuyUpgrade}
                onUnlockSkill={handleUnlockSkill}
                onPrestige={handlePrestige}
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
                onActivateAbility={handleActivateAbility}
                weaponMode={currentWeapon}
                onWeaponModeChange={setCurrentWeapon}
                onClose={() => setMenuOpen(false)}
                heroAbilities={heroAbilities}
                heroPassives={heroPassives}
                heroDPS={heroDPS}
                onRecruitHero={recruitHero}
                onLevelHero={levelHero}
                onActivateHeroAbility={activateHeroAbility}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
        <AchievementToast achievement={newUnlock} />
      </div>

      <OfflineEarningsModal
        earnings={offlineEarnings}
        onClose={() => setOfflineEarnings(null)}
      />
      <DeathModal
        isDead={state.isDead}
        souls={state.souls}
        onRevive={revive}
        onPrestige={() => {
          prestige({ fromDeath: true });
          soundManager.play("prestige");
        }}
        canRevive={state.souls >= 10}
      />
    </div>
  );
}