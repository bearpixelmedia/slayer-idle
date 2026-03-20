import React, { useState } from "react";
import { SKILLS, canUnlockSkill } from "@/lib/skillTree";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Lock } from "lucide-react";
import { HUD_THEME } from "@/lib/hudTheme";

function SkillCard({ skill, unlocked, canUnlock, onUnlock }) {
  const pathColors = {
    neutral: "border-muted/60 bg-muted/15",
    damage: "border-red-500/50 bg-red-500/10",
    idle: "border-yellow-500/50 bg-yellow-500/10",
  };

  const pathLabels = {
    neutral: "Neutral",
    damage: "🔪 Damage",
    idle: "💰 Idle",
  };

  const borderColor = pathColors[skill.path] || pathColors.neutral;

  return (
    <motion.button
      onClick={() => canUnlock && !unlocked && onUnlock(skill.id)}
      className={`relative flex flex-col items-center p-3 rounded-lg border transition-all ${
        unlocked
          ? `${borderColor} opacity-100`
          : canUnlock
            ? `${borderColor} hover:brightness-125 cursor-pointer`
            : "bg-muted/20 border-border/30 cursor-not-allowed opacity-50"
      }`}
      whileTap={canUnlock && !unlocked ? { scale: 0.95 } : {}}
    >
      <span className="text-2xl mb-1">{skill.icon}</span>
      <span className="text-[8px] font-pixel text-foreground/90 text-center">{skill.name}</span>
      <p className="text-[7px] text-muted-foreground mt-1 text-center">{skill.description}</p>
      
      <div className="mt-2 flex flex-col items-center gap-1">
        <span className="text-[6px] font-pixel text-muted-foreground/70">{pathLabels[skill.path]}</span>
        <div className="flex items-center gap-1 text-[8px] font-pixel">
          {unlocked ? (
            <span className="text-primary">✓ UNLOCKED</span>
          ) : (
            <>
              <span>{skill.cost} SP</span>
              {!canUnlock && <Lock className="w-3 h-3 text-muted-foreground" />}
            </>
          )}
        </div>
      </div>

      {!canUnlock && skill.requires.length > 0 && (
        <div className="absolute -bottom-6 left-0 right-0 text-[7px] text-muted-foreground/60 text-center whitespace-nowrap">
          Requires previous skills
        </div>
      )}
    </motion.button>
  );
}

export default function SkillTree({ slayerPoints = 0, unlockedSkillIds = [], onUnlock }) {
  const [open, setOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState(1);

  const tiers = [1, 2, 3, 4];
  const skills = Array.isArray(SKILLS) ? SKILLS : [];
  const tierSkills = skills.filter((s) => s?.tier === selectedTier);
  const totalPoints = slayerPoints;
  const spentPoints = (Array.isArray(unlockedSkillIds) ? unlockedSkillIds : []).reduce((sum, id) => {
    const skill = skills.find((s) => s?.id === id);
    return sum + (skill?.cost || 0);
  }, 0);

  // Track specialization progress
  const damageSkills = (Array.isArray(unlockedSkillIds) ? unlockedSkillIds : []).reduce((count, id) => {
    const skill = skills.find(s => s?.id === id);
    return count + (skill?.path === "damage" ? 1 : 0);
  }, 0);
  const idleSkills = (Array.isArray(unlockedSkillIds) ? unlockedSkillIds : []).reduce((count, id) => {
    const skill = skills.find(s => s?.id === id);
    return count + (skill?.path === "idle" ? 1 : 0);
  }, 0);

  return (
    <div className={`mx-2 mb-2 rounded-xl ${HUD_THEME.panel.border} overflow-hidden`}>
      {/* Header toggle */}
      <button
        className={`w-full flex items-center justify-between px-4 py-3 ${HUD_THEME.panel.bg} hover:bg-card/80 transition-colors`}
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🌳</span>
          <span className={`${HUD_THEME.text.label} text-primary`}>SKILL TREE</span>
          <span className={`${HUD_THEME.text.small} text-muted-foreground`}>
            {spentPoints}/{totalPoints} SP
          </span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 py-2 space-y-2">
              {/* Specialization progress bar */}
              <div className="space-y-0.5">
                <div className="flex gap-2 text-[8px] font-pixel">
                  <div className="flex-1 flex items-center gap-1">
                    <span className="text-red-400">🔪</span>
                    <span className="text-muted-foreground">{damageSkills} damage nodes</span>
                  </div>
                  <div className="flex-1 flex items-center gap-1">
                    <span className="text-yellow-400">💰</span>
                    <span className="text-muted-foreground">{idleSkills} idle nodes</span>
                  </div>
                </div>
              </div>

              {/* Tier selector */}
              <div className="flex gap-1.5">
                {tiers.map((tier) => {
                  const tierUnlocked = skills.filter(
                    (s) => s?.tier === tier && unlockedSkillIds?.includes(s?.id)
                  ).length;
                  const tierTotal = skills.filter((s) => s?.tier === tier).length;

                  return (
                    <button
                      key={tier}
                      onClick={() => setSelectedTier(tier)}
                      className={`flex-1 py-2 rounded-lg ${HUD_THEME.text.small} transition-all ${
                        selectedTier === tier ? HUD_THEME.button.primary : HUD_THEME.button.muted
                      }`}
                    >
                      Tier {tier} {tierUnlocked}/{tierTotal}
                    </button>
                  );
                })}
              </div>

              {/* Skills grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {tierSkills.map((skill) => {
                  const unlocked = unlockedSkillIds?.includes(skill?.id);
                  const canUnlock = canUnlockSkill(skill?.id, unlockedSkillIds) && slayerPoints >= (skill?.cost || 0);

                  return (
                    <SkillCard
                      key={skill?.id}
                      skill={skill}
                      unlocked={unlocked}
                      canUnlock={canUnlock}
                      onUnlock={onUnlock}
                    />
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}