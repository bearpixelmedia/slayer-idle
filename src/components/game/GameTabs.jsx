import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UpgradeShop from "@/components/game/UpgradeShop";
import SkillTree from "@/components/game/SkillTree";
import AchievementsPanel from "@/components/game/AchievementsPanel";
import PrestigePanel from "@/components/game/PrestigePanel";
import VillagePanel from "@/components/game/VillagePanel";
import QuestLog from "@/components/game/QuestLog";
import ZoneSelector from "@/components/game/ZoneSelector";

export default function GameTabs({ state, onBuyUpgrade, onUnlockSkill, onPrestige, onRevive, unlockedIds, damageMultiplier, offlineMultiplier, onSwitchZone, onUnlockZone, onClaimQuestReward, onRepeatQuest, questProgress, onUpgradeBuilding, abilities, onActivateAbility, weaponMode, activeTab, onTabChange }) {
  if (!state || typeof state !== 'object') {
    return <div className="p-4 text-muted-foreground text-xs">Loading game state...</div>;
  }

  return (
    <Tabs value={activeTab || "combat"} onValueChange={onTabChange} className="w-full">
      <TabsList className="w-full grid grid-cols-5 gap-2 px-2 py-3 bg-card/60">
        <TabsTrigger value="combat" className="font-pixel text-[8px] sm:text-[9px]">⚔️ Combat</TabsTrigger>
        <TabsTrigger value="progression" className="font-pixel text-[8px] sm:text-[9px]">📈 Progress</TabsTrigger>
        <TabsTrigger value="village" className="font-pixel text-[8px] sm:text-[9px]">🏘️ Village</TabsTrigger>
        <TabsTrigger value="quests" className="font-pixel text-[8px] sm:text-[9px]">📜 Quests</TabsTrigger>
        <TabsTrigger value="zones" className="font-pixel text-[8px] sm:text-[9px]">🗺️ Zones</TabsTrigger>
      </TabsList>

      <TabsContent value="combat" className="px-4 py-3 space-y-3">
        <UpgradeShop state={state} onBuy={onBuyUpgrade} />
      </TabsContent>

      <TabsContent value="progression" className="px-4 py-3 space-y-3">
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

      <TabsContent value="village" className="px-4 py-3">
        <VillagePanel state={state} onUpgradeBuilding={onUpgradeBuilding} />
      </TabsContent>

      <TabsContent value="quests" className="px-4 py-3">
        <QuestLog
          questProgress={questProgress}
          onClaimReward={onClaimQuestReward}
          onRepeatQuest={onRepeatQuest}
          unlockedZoneIds={state.unlockedZoneIds}
        />
      </TabsContent>

      <TabsContent value="zones" className="px-4 py-3">
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