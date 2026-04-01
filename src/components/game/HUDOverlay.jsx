import React from "react";

export default function HUDOverlay({
  state, getTapDamage, getIdleCPS, activeBuffs, currentWeapon, onWeaponChange,
  abilities, onActivateAbility, hudMenuOpen, onMenuToggle,
  onBuyUpgrade, onUnlockSkill, onPrestige, onRevive,
  unlockedIds, damageMultiplier, offlineMultiplier,
  onSwitchZone, onUnlockZone, onClaimQuestReward, onRepeatQuest, questProgress,
  onUpgradeBuilding, onRunnerClick,
  heroAbilities, heroPassives, heroDPS, onRecruitHero, onLevelHero, onActivateHeroAbility,
}) {
  if (!state) return null;
  const tapDmg = getTapDamage?.() ?? 1;
  const cps = getIdleCPS?.() ?? 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
      <div className="pointer-events-auto flex items-center justify-between px-4 py-2 bg-slate-900/90 border-t border-slate-700">
        <div className="flex gap-4">
          <p className="font-pixel text-[9px] text-amber-400">🪙 {Math.floor(state.coins || 0)}</p>
          <p className="font-pixel text-[9px] text-slate-400">⚔️ {tapDmg.toFixed(1)}</p>
          <p className="font-pixel text-[9px] text-slate-400">⏱ {cps.toFixed(1)}/s</p>
        </div>
        <p className="font-pixel text-[9px] text-purple-400">💀 {state.souls || 0}</p>
      </div>
    </div>
  );
}