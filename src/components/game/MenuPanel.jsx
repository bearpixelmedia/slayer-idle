import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import GameTabs from "@/components/game/GameTabs";
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
      <div className={HUD_THEME.menuPanel.header}>
        <button
          onClick={onRunnerClick}
          className={`flex-1 py-2 rounded-lg font-pixel text-[9px] transition-colors border-2 bg-green-600 hover:bg-green-700 text-white border-green-800`}
        >
          🏃 RUNNER
        </button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="flex-shrink-0 p-2 rounded-lg bg-destructive hover:bg-destructive/90 text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Tabs content */}
      <ScrollArea className={HUD_THEME.menuPanel.content}>
        <div className="px-2 py-1">
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
      <div className={HUD_THEME.menuPanel.footer}
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
            className={`flex-1 py-2 rounded-lg text-lg transition-colors ${activeTab === tab ? "bg-primary text-primary-foreground" : "bg-muted/30 text-foreground hover:bg-muted/50"}`}
            title={label}
          >{icon}</button>
        ))}
      </div>
    </motion.div>
  );
}