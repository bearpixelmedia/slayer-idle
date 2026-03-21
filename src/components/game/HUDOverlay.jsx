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
    <div className="fixed inset-0 pointer-events-none">
      {/* Stats Bar - Top Left */}
      <StatsBar
        state={state}
        tapDamage={getTapDamage()}
        idleCPS={getIdleCPS()}
        className={`${HUD_THEME.statsBar.container} ${HUD_THEME.statsBar.bg} ${HUD_THEME.statsBar.border} ${HUD_THEME.statsBar.rounded} ${HUD_THEME.statsBar.pointerEvents}`}
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
        className="hidden lg:flex fixed top-32 left-2 right-2 z-10 pointer-events-auto"
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
            onRunnerClick={onRunnerClick}
            onClose={() => onMenuToggle(false)}
          />
        </div>
      )}

      {/* Menu Toggle Button */}
      {!hudMenuOpen && (
        <motion.button
          onClick={() => onMenuToggle(true)}
          animate={hasAffordableUpgrade ? { boxShadow: ["0 0 0 0 rgba(217, 119, 6, 0.9)", "0 0 0 20px rgba(217, 119, 6, 0)"], scale: [1, 1.1, 1] } : {}}
          transition={hasAffordableUpgrade ? { duration: 1, repeat: Infinity } : {}}
          className={`hidden lg:flex fixed right-4 bottom-4 z-50 w-12 h-12 rounded-full pointer-events-auto items-center justify-center text-2xl transition-all active:scale-95 border-2 border-primary/60 hover:brightness-125 ${hasAffordableUpgrade ? 'bg-primary/40 border-primary' : 'bg-primary/15'}`}
        >
          📖
        </motion.button>
      )}
    </div>
  );
}