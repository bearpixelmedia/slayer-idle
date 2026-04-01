import React from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import SkillTree from "@/components/game/SkillTree";
import AchievementsPanel from "@/components/game/AchievementsPanel";
import PrestigePanel from "@/components/game/PrestigePanel";
import VillagePanel from "@/components/game/VillagePanel";
import QuestLog from "@/components/game/QuestLog";
import ZoneSelector from "@/components/game/ZoneSelector";
import UpgradeShop from "@/components/game/UpgradeShop";
import EquipmentPanel from "@/components/game/EquipmentPanel";
import HeroPanel from "@/components/game/HeroPanel";
import { HUD_THEME } from "@/lib/hudTheme";

const TAB_LIST = ["combat", "heroes", "equip", "progression", "village", "quests", "zones"];

const TAB_LABELS = {
  combat:      "⚔️ COMBAT",
  heroes:      "🧑‍🤝‍🧑 HEROES",
  equip:       "🗡️ EQUIP",
  progression: "📈 PROGRESS",
  village:     "🏘️ VILLAGE",
  quests:      "📜 QUESTS",
  zones:       "🗺️ ZONES",
};

export default function GameTabs({
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
  activeTab,
  onTabChange,
  // Hero props
  heroAbilities,
  heroPassives,
  heroDPS,
  onRecruitHero,
  onLevelHero,
  onActivateHeroAbility,
}) {
  if (!state || typeof state !== "object") {
    return <div className="p-4 text-muted-foreground text-xs">Loading game state...</div>;
  }

  return (
    <Tabs value={activeTab || "combat"} onValueChange={onTabChange} className="w-full">
      {/* Tab bar */}
      <div
        className={`px-1 py-1 border-b ${HUD_THEME.panel.border} ${HUD_THEME.panel.bg} overflow-x-auto`}
        style={{ boxSizing: "border-box" }}
      >
        <div className="flex gap-0.5 px-1">
          {TAB_LIST.map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`px-1.5 py-1 rounded-md font-pixel text-[6px] sm:text-[7px] md:text-[8px] whitespace-nowrap transition-all flex-1 sm:flex-none min-h-[28px] flex items-center justify-center ${
                activeTab === tab ? HUD_THEME.button.primary : HUD_THEME.button.muted
              }`}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>
      </div>

      {/* Combat */}
      <TabsContent
        value="combat"
        className={`px-2 py-1.5 space-y-1.5 ${HUD_THEME.panel.bg} ${HUD_THEME.panel.border} rounded-lg border`}
      >
        <UpgradeShop state={state} onBuy={onBuyUpgrade} />
      </TabsContent>

      {/* Heroes */}
      <TabsContent
        value="heroes"
        className={`px-2 py-1.5 space-y-1.5 ${HUD_THEME.panel.bg} ${HUD_THEME.panel.border} rounded-lg border`}
      >
        <HeroPanel
          state={state}
          heroAbilities={heroAbilities}
          heroPassives={heroPassives}
          heroDPS={heroDPS}
          onRecruit={onRecruitHero}
          onLevel={onLevelHero}
          onActivateAbility={onActivateHeroAbility}
        />
      </TabsContent>

      {/* Equipment */}
      <TabsContent
        value="equip"
        className={`px-2 py-1.5 ${HUD_THEME.panel.bg} ${HUD_THEME.panel.border} rounded-lg border`}
      >
        <EquipmentPanel
          weaponMode={weaponMode}
          onModeChange={onWeaponModeChange}
        />
      </TabsContent>

      {/* Progression */}
      <TabsContent
        value="progression"
        className={`px-2 py-1.5 space-y-1.5 ${HUD_THEME.panel.bg} ${HUD_THEME.panel.border} rounded-lg border`}
      >
        <PrestigePanel
          canPrestige={state.totalCoinsEarned > 0}
          soulsOnPrestige={Math.max(1, Math.floor(Math.sqrt(state.totalCoinsEarned / 1000)))}
          slayerPointsOnPrestige={0}
          currentSouls={state.souls}
          onPrestige={onPrestige}
        />
        <SkillTree
          slayerPoints={state.slayerPoints}
          unlockedSkillIds={state.unlockedSkills}
          onUnlock={onUnlockSkill}
        />
        <AchievementsPanel
          unlockedIds={unlockedIds}
          damageMultiplier={damageMultiplier}
          offlineMultiplier={offlineMultiplier}
        />
      </TabsContent>

      {/* Village */}
      <TabsContent
        value="village"
        className={`px-2 py-1.5 ${HUD_THEME.panel.bg} ${HUD_THEME.panel.border} rounded-lg border`}
      >
        <VillagePanel state={state} onUpgradeBuilding={onUpgradeBuilding} />
      </TabsContent>

      {/* Quests */}
      <TabsContent
        value="quests"
        className={`px-2 py-1.5 ${HUD_THEME.panel.bg} ${HUD_THEME.panel.border} rounded-lg border`}
      >
        <QuestLog
          questProgress={questProgress}
          onClaimReward={onClaimQuestReward}
          onRepeatQuest={onRepeatQuest}
          unlockedZoneIds={state.unlockedZoneIds}
        />
      </TabsContent>

      {/* Zones */}
      <TabsContent
        value="zones"
        className={`px-2 py-1.5 ${HUD_THEME.panel.bg} ${HUD_THEME.panel.border} rounded-lg border`}
      >
        <ZoneSelector
          activeZoneId={state.activeZoneId}
          unlockedZoneIds={state.unlockedZoneIds}
          zoneProgress={state.zoneProgress}
          slayerPoints={state.slayerPoints}
          onSwitchZone={onSwitchZone}
          onUnlockZone={onUnlockZone}
        />
      </TabsContent>
    </Tabs>
  );
}
