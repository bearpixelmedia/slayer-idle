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
  const [initMultipliers] = React.useState(() => loadSavedMultipliers());
  const [showRunner, setShowRunner] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

  const handleClaimQuestReward = (questId) => { claimReward(questId); soundManager.play('coin-collect'); };
  const handleRepeatQuest = (questId) => { resetQuestForRepeat(questId); soundManager.play('ui-click'); };
  const handleBuyUpgrade = (upgradeId, quantity) => { buyUpgrade(upgradeId, quantity); soundManager.play('upgrade'); };
  const handleUnlockSkill = (skillId) => { unlockSkill(skillId); soundManager.play('upgrade'); };
  const handlePrestige = () => { prestige(); soundManager.play('prestige'); };
  const handleActivateAbility = (abilityId) => { activateAbility(abilityId); soundManager.play('upgrade'); };
  const handleJumpFeedback = () => { soundManager.play("tap"); };
  const handleWorldCoinPickup = () => { soundManager.play("coin-collect"); };
  const handleTapGame = (x, y, opts) => { handleTap(x, y, opts); };

  // Shared props for the MenuPanel
  const menuPanelProps = {
    state,
    onBuyUpgrade: handleBuyUpgrade,
    onUnlockSkill: handleUnlockSkill,
    onPrestige: handlePrestige,
    onRevive: revive,
    unlockedIds,
    damageMultiplier,
    offlineMultiplier,
    onSwitchZone: switchZone,
    onUnlockZone: unlockZone,
    onClaimQuestReward: handleClaimQuestReward,
    onRepeatQuest: handleRepeatQuest,
    questProgress,
    onUpgradeBuilding: upgradeBuilding,
    abilities,
    onActivateAbility: handleActivateAbility,
    weaponMode: currentWeapon,
    onWeaponModeChange: setCurrentWeapon,
    onRunnerClick: () => setShowRunner(!showRunner),
    heroAbilities,
    heroPassives,
    heroDPS,
    onRecruitHero: recruitHero,
    onLevelHero: levelHero,
    onActivateHeroAbility: activateHeroAbility,
  };

  const gameCanvasProps = {
    state,
    enemyDying,
    floatingCoins,
    floatingSouls,
    floatingDamage,
    particles,
    slashEffects,
    onTap: handleTapGame,
    onJump: handleJumpFeedback,
    tickWorldCoinCollection,
    onWorldCoinPickup: handleWorldCoinPickup,
    attackTick,
    enemyHit,
    playerHit,
    weaponMode: currentWeapon,
  };

  return (
    <div className="fixed inset-0 bg-background flex overflow-hidden">

      {/* ── Desktop (landscape ≥ 1024px): game left + panel right ──────────── */}
      <div className="hidden lg:flex w-full h-full overflow-hidden">
        {/* Left: Game canvas */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden">
          {!showRunner ? (
            <GameCanvas {...gameCanvasProps} />
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

        {/* Right: Always-visible menu panel */}
        <div className="w-[360px] xl:w-[400px] flex-shrink-0 h-full overflow-hidden border-l border-border/50 bg-card/95">
          <MenuPanel
            {...menuPanelProps}
            onClose={null}
            appTitle="SLAYER IDLE"
          />
        </div>
      </div>

      {/* ── Mobile (portrait < 1024px): full screen game + FAB ──────────────── */}
      <div className="lg:hidden w-full h-full flex flex-col relative overflow-hidden">
        <div className="w-full flex-1 overflow-hidden flex flex-col min-h-0">
          {!showRunner ? (
            <GameCanvas {...gameCanvasProps} />
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

        {/* Mobile FAB */}
        {!showRunner && (
          <motion.button
            type="button"
            title={hasAffordableUpgrade ? "Menu — you can buy an upgrade!" : "Open menu"}
            onClick={() => setMenuOpen(!menuOpen)}
            animate={
              hasAffordableUpgrade
                ? { boxShadow: ["0 0 0 0 rgba(251,191,36,0.95)", "0 0 0 18px rgba(251,191,36,0)"], scale: [1, 1.06, 1] }
                : {}
            }
            transition={hasAffordableUpgrade ? { duration: 1.1, repeat: Infinity } : {}}
            className={`fixed bottom-20 right-4 z-[45] flex h-14 w-14 items-center justify-center rounded-full text-2xl shadow-lg transition-all active:scale-95 sm:h-16 sm:w-16 sm:text-3xl border-[3px] ${
              hasAffordableUpgrade
                ? "border-amber-400 bg-gradient-to-br from-amber-500/50 to-primary/45 ring-2 ring-amber-300/50 hover:brightness-110"
                : "border-amber-600/80 bg-gradient-to-br from-amber-900/50 to-card/90 ring-1 ring-amber-500/30 hover:brightness-125"
            }`}
          >
            📖
          </motion.button>
        )}

        {/* Mobile slide-in menu */}
        <AnimatePresence>
          {menuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[46] bg-black/60 backdrop-blur-sm"
                onClick={() => setMenuOpen(false)}
              />
              {/* Panel */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}
                className="fixed right-0 top-0 bottom-0 w-[min(360px,92vw)] z-[47] shadow-2xl"
              >
                <MenuPanel
                  {...menuPanelProps}
                  onClose={() => setMenuOpen(false)}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* ── HUD overlay (stats bar, buffs, abilities) — all screen sizes ──── */}
      <HUDOverlay
        state={state}
        getTapDamage={getTapDamage}
        getIdleCPS={getIdleCPS}
        activeBuffs={activeBuffs}
        currentWeapon={currentWeapon}
        onWeaponChange={setCurrentWeapon}
        abilities={abilities}
        onActivateAbility={handleActivateAbility}
        heroAbilities={heroAbilities}
        heroPassives={heroPassives}
        heroDPS={heroDPS}
        onRecruitHero={recruitHero}
        onLevelHero={levelHero}
        onActivateHeroAbility={activateHeroAbility}
      />

      {/* ── Modals ──────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {offlineEarnings && (
          <OfflineEarningsModal
            earnings={offlineEarnings}
            onClose={() => setOfflineEarnings(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {state?.isDead && (
          <DeathModal onRevive={revive} souls={state?.souls} />
        )}
      </AnimatePresence>

      <AchievementToast newUnlock={newUnlock} />
    </div>
  );
}
