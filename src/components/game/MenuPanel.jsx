import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import GameTabs from "@/components/game/GameTabs";
import UpgradeShop from "@/components/game/UpgradeShop";
import { HUD_THEME } from "@/lib/hudTheme";
import { motion } from "framer-motion";

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
    <motion.div 
      className={`flex flex-col h-full ${HUD_THEME.menuPanel.container}`}
      initial={{ x: 400 }}
      animate={{ x: 0 }}
      exit={{ x: 400 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className={`${HUD_THEME.menuPanel.header} px-2 py-2 hidden`} style={{ boxSizing: "border-box" }}>
        <button
          onClick={onRunnerClick}
          className={`flex-1 py-2.5 rounded-lg text-[10px] sm:text-[11px] transition-colors border-2 ${HUD_THEME.button.primary} border-primary/60 min-h-[36px] flex items-center justify-center`}
        >
          🏃 RUNNER
        </button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className={`flex-shrink-0 p-2 rounded-lg ${HUD_THEME.button.primary} transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center`}
        >
          <X className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Upgrades - Outside the scrollable area */}
      {activeTab === "combat" && (
        <div className="px-3 py-2 flex-shrink-0 border-b border-border/30">
          <UpgradeShop state={state} onBuy={onBuyUpgrade} />
        </div>
      )}

      {/* Tabs content */}
      <ScrollArea className={`${HUD_THEME.menuPanel.content} flex-1`}>
        <div className="px-3 py-2">
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

      {/* Bottom tab navigation */}
      <div className={`${HUD_THEME.menuPanel.footer} pointer-events-auto`}>
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
            className={`flex-1 py-2 rounded-lg text-lg transition-colors cursor-pointer ${activeTab === tab ? HUD_THEME.button.primary : HUD_THEME.button.muted}`}
            style={{ pointerEvents: "auto" }}
            title={label}
          >{icon}</button>
        ))}
      </div>
    </motion.div>
  );
}