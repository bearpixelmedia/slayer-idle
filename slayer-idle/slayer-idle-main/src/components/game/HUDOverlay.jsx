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
 * HUDOverlay — single fixed overlay layer for all HUD chrome.
 *
 * Layout (mobile portrait):
 *   • Stats bar   — top-center, centered pill
 *   • WeaponMode  — top-left below stats, compact pill buttons (only when bow unlocked)
 *   • AbilityHUD  — left edge, compact 56×40 buttons
 *   • Menu button — bottom-right FAB
 *   • Menu panel  — slides in from right (desktop: fixed panel)
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
  // Hero props
  heroAbilities,
  heroPassives,
  heroDPS,
  onRecruitHero,
  onLevelHero,
  onActivateHeroAbility,
}) {
  const hasAffordableUpgrade = UPGRADES.some((upgrade) => {
    const level = state?.upgradeLevels?.[upgrade.id] || 0;
    const cost = getUpgradeCost(upgrade, level);
    return (state?.coins || 0) >= cost;
  });

  // Shared menu panel props
  const menuProps = {
    state,
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
    abilities,
    onActivateAbility,
    weaponMode: currentWeapon,
    onWeaponModeChange: onWeaponChange,
    onRunnerClick,
    heroAbilities,
    heroPassives,
    heroDPS,
    onRecruitHero,
    onLevelHero,
    onActivateHeroAbility,
  };

  return (
    <div className="fixed inset-0 z-30 pointer-events-none">
      {/* ── Stats bar — top-center ─────────────────────────── */}
      <StatsBar
        state={state}
        tapDamage={getTapDamage()}
        idleCPS={getIdleCPS()}
      />

      {/* ── Active buffs — below stats bar ────────────────── */}
      {activeBuffs && activeBuffs.length > 0 && (
        <div className={HUD_THEME.buffs.container}>
          <ActiveBuffsDisplay activeBuffs={activeBuffs} />
        </div>
      )}

      {/* ── Weapon Mode toggle — top-left, below stats ─────── */}
      <WeaponMode
        currentMode={currentWeapon}
        bowUnlocked={(state?.upgradeLevels?.["bow"] || 0) > 0}
        onModeChange={onWeaponChange}
        className="fixed top-[4.5rem] left-2 z-20 pointer-events-auto"
      />

      {/* ── Ability HUD — left edge ────────────────────────── */}
      <div className="pointer-events-auto">
        <AbilityHUD abilities={abilities} onActivate={onActivateAbility} />
      </div>

      {/* ── Desktop: side menu panel ──────────────────────── */}
      {hudMenuOpen && (
        <div className="hidden lg:block fixed right-0 top-0 bottom-0 w-96 z-40 pointer-events-auto shadow-2xl">
          <MenuPanel
            {...menuProps}
            onClose={() => onMenuToggle(false)}
          />
        </div>
      )}

      {/* ── Menu FAB — bottom-right ────────────────────────── */}
      {!hudMenuOpen && (
        <motion.button
          type="button"
          title={hasAffordableUpgrade ? "Menu — upgrade available!" : "Open menu"}
          onClick={() => onMenuToggle(true)}
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
          className={`
            hidden lg:flex fixed right-4 bottom-4 z-50 h-14 w-14
            pointer-events-auto items-center justify-center rounded-full text-2xl
            shadow-lg transition-all active:scale-95 border-[3px] hover:brightness-110
            ${hasAffordableUpgrade
              ? "border-amber-400 bg-gradient-to-br from-amber-500/50 to-primary/45 ring-2 ring-amber-300/50"
              : "border-amber-600/80 bg-gradient-to-br from-amber-900/50 to-card/90 ring-1 ring-amber-500/30"
            }
          `}
        >
          📖
        </motion.button>
      )}
    </div>
  );
}
