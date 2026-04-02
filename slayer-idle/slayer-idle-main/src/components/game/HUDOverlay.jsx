import React from "react";
import StatsBar from "./StatsBar";
import ActiveBuffsDisplay from "./ActiveBuffsDisplay";
import WeaponMode from "./WeaponMode";
import AbilityHUD from "./AbilityHUD";
import { HUD_THEME } from "@/lib/hudTheme";

/**
 * HUDOverlay — fixed overlay for HUD chrome only.
 *
 * Renders:
 *   • Stats bar (top-center)
 *   • Active buffs (below stats)
 *   • WeaponMode toggle (top-left, only when bow unlocked)
 *   • AbilityHUD (left edge)
 *
 * The MenuPanel is NOT managed here — Game.jsx owns it:
 *   • Desktop: always-visible right sidebar
 *   • Mobile: slide-in drawer with FAB trigger
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
}) {
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
    </div>
  );
}
