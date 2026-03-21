import React from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import SkillTree from "@/components/game/SkillTree";
import AchievementsPanel from "@/components/game/AchievementsPanel";
import PrestigePanel from "@/components/game/PrestigePanel";
import VillagePanel from "@/components/game/VillagePanel";
import QuestLog from "@/components/game/QuestLog";
import ZoneSelector from "@/components/game/ZoneSelector";
import UpgradeShop from "@/components/game/UpgradeShop";
import { HUD_THEME } from "@/lib/hudTheme";

export default function GameTabs({ state, onBuyUpgrade, onUnlockSkill, onPrestige, onRevive, unlockedIds, damageMultiplier, offlineMultiplier, onSwitchZone, onUnlockZone, onClaimQuestReward, onRepeatQuest, questProgress, onUpgradeBuilding, abilities, onActivateAbility, weaponMode, activeTab, onTabChange }) {
  if (!state || typeof state !== 'object') {
    return <div className="p-4 text-muted-foreground text-xs">Loading game state...</div>;
  }

  const tabLabels = { combat: "⚔️ COMBAT", progression: "📈 PROGRESS", village: "🏘️ VILLAGE", quests: "📜 QUESTS", zones: "🗺️ ZONES" };

  return (
    <Tabs value={activeTab || "combat"} onValueChange={onTabChange} className="w-full">
      <div className={`px-1 py-1 border-b ${HUD_THEME.panel.border} ${HUD_THEME.panel.bg} overflow-x-auto`} style={{ boxSizing: "border-box" }}>
        <div className="flex gap-0.5 px-1">
          {["combat", "progression", "village", "quests", "zones"].map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`px-1.5 py-1 rounded-md font-pixel text-[6px] sm:text-[7px] md:text-[8px] whitespace-nowrap transition-all flex-1 sm:flex-none min-h-[28px] flex items-center justify-center ${
                activeTab === tab ? HUD_THEME.button.primary : HUD_THEME.button.muted
              }`}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>
      </div>

      <TabsContent value="combat" className={`px-2 py-1.5 space-y-1.5 ${HUD_THEME.panel.bg}`}>
         <UpgradeShop state={state} onBuy={onBuyUpgrade} />
       </TabsContent>

      <TabsContent value="progression" className={`px-2 py-1.5 space-y-1.5 ${HUD_THEME.panel.bg}`}>
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

      <TabsContent value="village" className={`px-2 py-1.5 ${HUD_THEME.panel.bg}`}>
        <VillagePanel state={state} onUpgradeBuilding={onUpgradeBuilding} />
      </TabsContent>

      <TabsContent value="quests" className={`px-2 py-1.5 ${HUD_THEME.panel.bg}`}>
        <QuestLog
          questProgress={questProgress}
          onClaimReward={onClaimQuestReward}
          onRepeatQuest={onRepeatQuest}
          unlockedZoneIds={state.unlockedZoneIds}
        />
      </TabsContent>

      <TabsContent value="zones" className={`px-2 py-1.5 ${HUD_THEME.panel.bg}`}>
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