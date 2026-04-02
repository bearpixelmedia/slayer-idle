import React, { useState } from "react";
import GameTabs from "./GameTabs";
import WeaponMode from "./WeaponMode";
import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * MenuPanel — used in the mobile full-screen slide-up overlay (Game.jsx).
 * Renders the full GameTabs panel with a header close button.
 */
export default function MenuPanel({
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
  weaponMode,
  onWeaponModeChange,
  onClose,
  heroAbilities,
  heroPassives,
  heroDPS,
  onRecruitHero,
  onLevelHero,
  onActivateHeroAbility,
}) {
  const [activeTab, setActiveTab] = useState("combat");
  const navigate = useNavigate();

  if (!state) return null;

  return (
    <div className="bg-background flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 flex-shrink-0">
        <p className="font-pixel text-[10px] text-foreground">MENU</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { navigate("/GameSettings"); onClose?.(); }}
            className="p-1.5 rounded hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-2xl leading-none px-1"
          >
            ×
          </button>
        </div>
      </div>

      {/* Weapon toggle */}
      <WeaponMode
        currentMode={weaponMode}
        bowUnlocked={state.upgradeLevels?.bow > 0}
        onModeChange={onWeaponModeChange}
      />

      {/* Tabs */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <GameTabs
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
          weaponMode={weaponMode}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
    </div>
  );
}