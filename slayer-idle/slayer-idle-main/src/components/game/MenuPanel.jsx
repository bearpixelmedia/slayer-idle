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
  onWeaponModeChange,
  onRunnerClick,
  onClose,          // null = desktop (no close btn), fn = mobile (show close btn)
  appTitle,         // optional title override (e.g. "SLAYER IDLE" on desktop)
  // Hero props
  heroAbilities,
  heroPassives,
  heroDPS,
  onRecruitHero,
  onLevelHero,
  onActivateHeroAbility,
}) {
  const [activeTab, setActiveTab] = useState("combat");

  return (
    <div className={`flex flex-col h-full ${HUD_THEME.menuPanel.container}`}>

      {/* ── Header ────────────────────────────────────────────────── */}
      <div
        className={`${HUD_THEME.menuPanel.header} px-3 py-2 flex items-center gap-2 flex-shrink-0`}
      >
        <span className="font-pixel text-[10px] text-foreground/90 tracking-widest flex-1">
          {appTitle || "MENU"}
        </span>
        {onClose && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="flex-shrink-0 p-2 rounded-lg bg-red-900/60 hover:bg-red-700/80 border border-red-600/50 text-foreground transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
            title="Close menu"
          >
            <X className="w-4 h-4" />
          </motion.button>
        )}
      </div>

      {/* ── Upgrades pinned — combat tab only ─────────────────────── */}
      {activeTab === "combat" && (
        <div className="px-3 py-2 flex-shrink-0 border-b border-border/30">
          <UpgradeShop state={state} onBuy={onBuyUpgrade} />
        </div>
      )}

      {/* ── Scrollable tab content ─────────────────────────────────── */}
      <ScrollArea className={`${HUD_THEME.menuPanel.content} flex-1 min-h-0`}>
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
            onWeaponModeChange={onWeaponModeChange}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            heroAbilities={heroAbilities}
            heroPassives={heroPassives}
            heroDPS={heroDPS}
            onRecruitHero={onRecruitHero}
            onLevelHero={onLevelHero}
            onActivateHeroAbility={onActivateHeroAbility}
          />
        </div>
      </ScrollArea>

      {/* ── Bottom tab nav ─────────────────────────────────────────── */}
      <div className={`${HUD_THEME.menuPanel.footer} flex-shrink-0 pointer-events-auto`}>
        {[
          { tab: "combat",      icon: "⚔️",  label: "COMBAT"   },
          { tab: "heroes",      icon: "🧙",  label: "HEROES"   },
          { tab: "progression", icon: "📈",  label: "PROGRESS" },
          { tab: "village",     icon: "🏘️",  label: "VILLAGE"  },
          { tab: "quests",      icon: "📜",  label: "QUESTS"   },
          { tab: "zones",       icon: "🗺️",  label: "ZONES"    },
        ].map(({ tab, icon, label }) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 flex flex-col items-center gap-0.5 rounded-lg text-xs transition-colors cursor-pointer ${
              activeTab === tab ? HUD_THEME.button.primary : HUD_THEME.button.muted
            }`}
            title={label}
          >
            <span className="text-base leading-none">{icon}</span>
            <span className="font-pixel text-[6px] leading-none hidden sm:block">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
