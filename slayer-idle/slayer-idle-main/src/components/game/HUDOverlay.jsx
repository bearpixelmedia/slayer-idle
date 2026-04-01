import React from "react";
import { motion } from "framer-motion";
import StatsBar from "./StatsBar";
import ActiveBuffsDisplay from "./ActiveBuffsDisplay";
import WeaponMode from "./WeaponMode";
import AbilityHUD from "./AbilityHUD";
import MenuPanel from "./MenuPanel";
import { HUD_THEME } from "@/lib/hudTheme";
import { UPGRADES, getUpgradeCost } from "@/lib/gameData";

/**
 * HUDOverlay - Single parent container for all HUD UI elements
 * Pulls from global HUD_THEME for consistent styling
 */
export default function HUDOverlay({
  state,
  getTapDamage,
  getIdleCPS,
  activeBuffs,
  currentWeapon,
  onWeaponChange,
  abilities,
  onActivateAbility,
  hudMenuOpen,
  onMenuToggle,
  // Menu panel props
  onBuyUpgrade,
  onUnlockSkill,
  onPrestige,
  onRevive,
  unlockedIds,
  damageMultiplier,
  offlineMultiplier,
  onSwitchZone,
  onUnlockZone,
  onClaimQuestReward,
  onRepeatQuest,
  questProgress,
  onUpgradeBuilding,
  onRunnerClick,
}) {
  // Check if any upgrade is affordable
  const hasAffordableUpgrade = UPGRADES.some(upgrade => {
    const level = state?.upgradeLevels?.[upgrade.id] || 0;
    const cost = getUpgradeCost(upgrade, level);
    return (state?.coins || 0) >= cost;
  });

  return (
    <div className="fixed inset-0 z-30 pointer-events-none">
      {/* Stats Bar - Top Left */}
      <StatsBar
        state={state}
        tapDamage={getTapDamage()}
        idleCPS={getIdleCPS()}
      />

      {/* Active Buffs - Below Stats Bar */}
      {activeBuffs && activeBuffs.length > 0 && (
        <div className={HUD_THEME.buffs.container}>
          <ActiveBuffsDisplay activeBuffs={activeBuffs} />
        </div>
      )}

      {/* Weapon Mode - Below Buffs */}
      <WeaponMode
        currentMode={currentWeapon}
        bowUnlocked={(state?.upgradeLevels?.["bow"] || 0) > 0}
        onModeChange={onWeaponChange}
        className="flex fixed top-28 left-2 right-2 z-10 pointer-events-auto sm:top-32 max-w-[min(100vw-1rem,28rem)]"
      />

      {/* Ability HUD - Left side */}
      <div className="pointer-events-auto">
        <AbilityHUD abilities={abilities} onActivate={onActivateAbility} />
      </div>

      {/* Menu Panel - Right side (Desktop) */}
      {hudMenuOpen && (
        <div className="hidden lg:block fixed right-2 top-20 bottom-20 w-96 overflow-hidden z-40 pointer-events-auto">
          <MenuPanel
            state={state}
            onBuyUpgrade={onBuyUpgrade}
            onUnlockSkill={onUnlockSkill}
            onPrestige={onPrestige}
            onRevive={onRevive}
            unlockedIds={unlockedIds}
            damageMultiplier={damageMultiplier}
            offlineMultiplier={offlineMultiplier}
            onSwitchZone={onSwitchZone}
            onUnlockZone={onUnlockZone}
            onClaimQuestReward={onClaimQuestReward}
            onRepeatQuest={onRepeatQuest}
            questProgress={questProgress}
            onUpgradeBuilding={onUpgradeBuilding}
            abilities={abilities}
            onActivateAbility={onActivateAbility}
            weaponMode={currentWeapon}
            onWeaponModeChange={onWeaponChange}
            onRunnerClick={onRunnerClick}
            onClose={() => onMenuToggle(false)}
          />
        </div>
      )}

      {/* Menu Toggle Button */}
      {!hudMenuOpen && (
        <motion.button
          type="button"
          title={hasAffordableUpgrade ? "Menu — you can buy an upgrade!" : "Open menu"}
          onClick={() => onMenuToggle(true)}
          animate={
            hasAffordableUpgrade
              ? {
                  boxShadow: [
                    "0 0 0 0 rgba(251, 191, 36, 0.95)",
                    "0 0 0 22px rgba(251, 191, 36, 0)",
                  ],
                  scale: [1, 1.06, 1],
                }
              : {}
          }
          transition={hasAffordableUpgrade ? { duration: 1.1, repeat: Infinity } : {}}
          className={`hidden lg:flex fixed right-4 bottom-4 z-50 h-14 w-14 pointer-events-auto items-center justify-center rounded-full text-2xl shadow-lg transition-all active:scale-95 border-[3px] hover:brightness-110 ${
            hasAffordableUpgrade
              ? "border-amber-400 bg-gradient-to-br from-amber-500/50 to-primary/45 ring-2 ring-amber-300/50"
              : "border-amber-600/80 bg-gradient-to-br from-amber-900/50 to-card/90 ring-1 ring-amber-500/30"
          }`}
        >
          📖
        </motion.button>
      )}
    </div>
  );
}