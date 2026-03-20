import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import GameTabs from "@/components/game/GameTabs";

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
  onRunnerClick,
  onClose,
}) {
  const [activeTab, setActiveTab] = React.useState("combat");

  return (
    <div className="w-96 flex flex-col relative" style={{
      background: "linear-gradient(135deg, #8B7355 0%, #A0826D 100%)",
      border: "8px solid #D4AF37",
      borderRadius: "4px",
      boxShadow: "inset 0 0 0 2px #6B5344, 0 0 0 4px #1a1a1a"
    }}>
      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute -top-8 -right-8 z-50 w-8 h-8 rounded-full bg-destructive hover:bg-destructive/90 flex items-center justify-center text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      
      {/* Inner frame */}
      <div style={{
        background: "linear-gradient(135deg, #4A4A4A 0%, #2D2D2D 100%)",
        border: "2px solid #8B7355",
        margin: "8px",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }}>
        <ScrollArea className="flex-1 overflow-hidden">
          <div className="px-3 py-2 space-y-2">
            <button
              onClick={onRunnerClick}
              className="w-full py-2 rounded-sm bg-green-600 hover:bg-green-700 text-white font-pixel text-[9px] transition-colors border-2 border-green-800"
            >
              🏃 RUNNER
            </button>
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
        {[
          { tab: "combat", icon: "⚔️", label: "Combat" },
          { tab: "progression", icon: "📈", label: "Progress" },
          { tab: "village", icon: "🏘️", label: "Village" },
          { tab: "quests", icon: "📜", label: "Quests" },
          { tab: "zones", icon: "🗺️", label: "Zones" },
        ].map(({ tab, icon, label }) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`p-1.5 text-lg transition-opacity ${activeTab === tab ? "opacity-100" : "opacity-50 hover:opacity-80"}`}
            title={label}
          >{icon}</button>
        ))}
      </div>
    </div>
  );
}