import React, { useState, useRef, useEffect } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import GameTabs from "@/components/game/GameTabs";
import HUDOverlay from "@/components/game/HUDOverlay";

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
  const [activeTab, setActiveTab] = useState("combat");

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
  } = useGameState(initMultipliers);

  const { unlockedIds, newUnlock, damageMultiplier, offlineMultiplier } = useAchievements(state);

  const { questProgress, claimReward, resetQuestForRepeat } = useQuests(state, state?.unlockedZoneIds || []);

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

  const handleTapGame = (e) => {
    handleTap(e);
    soundManager.play('tap');
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

        <AnimatePresence>
          {!showRunner && menuOpen && (
            <motion.div 
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden" 
              onClick={() => setMenuOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="fixed bottom-0 left-0 right-0 flex flex-col pointer-events-auto lg:hidden max-h-[90vh]"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: "linear-gradient(135deg, #8B7355 0%, #A0826D 100%)",
                  border: "6px solid #D4AF37",
                  borderRadius: "12px 12px 0 0",
                  boxShadow: "inset 0 0 0 2px #6B5344",
                  margin: 0,
                  padding: 0,
                  boxSizing: "border-box",
                  maxWidth: "100vw",
                  overflow: "hidden"
                }}
              >
              {/* Inner frame */}
              <div style={{
                background: "linear-gradient(135deg, #4A4A4A 0%, #2D2D2D 100%)",
                border: "2px solid #8B7355",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                minHeight: 0,
                boxSizing: "border-box"
              }}>

                <ScrollArea className="flex-1 overflow-hidden min-h-0" style={{ boxSizing: "border-box" }}>
                   <div className="space-y-1 overflow-x-hidden">
                     <GameTabs
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
                       activeTab={activeTab}
                       onTabChange={setActiveTab}
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
              </motion.div>
              </motion.div>
              )}
              </AnimatePresence>

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
            onClick={() => setMenuOpen(!menuOpen)}
            animate={state?.coins > 0 ? { boxShadow: ["0 0 0 0 rgba(45, 212, 191, 0.7)", "0 0 0 12px rgba(45, 212, 191, 0)"] } : {}}
            transition={state?.coins > 0 ? { duration: 1.5, repeat: Infinity } : {}}
            className="fixed bottom-20 right-4 z-40 w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all active:scale-95 border-2 border-primary/60 bg-primary/15 hover:brightness-125 lg:hidden"
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
       />

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
        onPrestige={prestige}
        canRevive={state.souls >= 10}
      />
    </div>
  );
}