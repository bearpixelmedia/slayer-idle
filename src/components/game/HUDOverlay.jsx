import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StatsBar from "./StatsBar";
import AbilityHUD from "./AbilityHUD";
import ActiveBuffsDisplay from "./ActiveBuffsDisplay";
import GameTabs from "./GameTabs";
import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HUDOverlay({
  state,
  getTapDamage,
  getIdleCPS,
  activeBuffs,
  currentWeapon,
  onWeaponChange,
  abilities,
  onActivateAbility,
  hudMenuOpen,
  onMenuToggle,
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
  onRunnerClick,
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

  const tapDmg = getTapDamage?.() ?? 1;
  const cps = getIdleCPS?.() ?? 0;

  return (
    <>
      {/* Ability HUD — left side floating */}
      <AbilityHUD abilities={abilities} onActivate={onActivateAbility} />

      {/* Active buffs */}
      {activeBuffs?.length > 0 && (
        <div className="fixed top-2 right-2 z-30 pointer-events-none">
          <ActiveBuffsDisplay activeBuffs={activeBuffs} />
        </div>
      )}

      {/* Stats bar — always visible at the top */}
      <div className="fixed top-0 left-0 right-0 z-40">
        <StatsBar state={state} tapDamage={tapDmg} idleCPS={cps} />
      </div>

      {/* Desktop side panel (lg+) */}
      <div className="hidden lg:flex fixed right-0 top-0 bottom-0 z-40 w-[340px] xl:w-[380px] flex-col bg-background/95 border-l border-border shadow-2xl">
        <div className="flex items-center justify-between px-3 pt-2 pb-1 border-b border-border/50">
          <p className="font-pixel text-[9px] text-muted-foreground">SLAYER IDLE</p>
          <button
            onClick={() => navigate("/GameSettings")}
            className="p-1.5 rounded hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
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
            weaponMode={currentWeapon}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      </div>

      {/* Mobile slide-up HUD menu (button is in Game.jsx — opens hudMenuOpen) */}
      <AnimatePresence>
        {hudMenuOpen && (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden bg-black/50 backdrop-blur-sm"
            onClick={() => onMenuToggle(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 max-h-[88vh] flex flex-col bg-background rounded-t-2xl border-t-2 border-border shadow-2xl overflow-hidden"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 flex-shrink-0">
                <p className="font-pixel text-[9px] text-muted-foreground">MENU</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate("/GameSettings")}
                    className="p-1.5 rounded hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onMenuToggle(false)}
                    className="text-muted-foreground hover:text-foreground text-xl leading-none px-1"
                  >
                    ×
                  </button>
                </div>
              </div>
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
                  weaponMode={currentWeapon}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}