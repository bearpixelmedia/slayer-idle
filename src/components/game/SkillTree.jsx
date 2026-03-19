import React, { useState } from "react";
import { SKILLS, canUnlockSkill } from "@/lib/skillTree";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Lock } from "lucide-react";

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
  const tierSkills = SKILLS.filter((s) => s.tier === selectedTier);
  const totalPoints = slayerPoints;
  const spentPoints = unlockedSkillIds.reduce((sum, id) => {
    const skill = SKILLS.find((s) => s.id === id);
    return sum + (skill ? skill.cost : 0);
  }, 0);

  // Track specialization progress
  const damageSkills = unlockedSkillIds.filter(id => {
    const skill = SKILLS.find(s => s.id === id);
    return skill?.path === "damage";
  }).length;
  const idleSkills = unlockedSkillIds.filter(id => {
    const skill = SKILLS.find(s => s.id === id);
    return skill?.path === "idle";
  }).length;

  return (
    <div className="mx-4 mb-4 rounded-xl border border-border/50 overflow-hidden">
      {/* Header toggle */}
      <button
        className="w-full flex items-center justify-between px-4 py-3 bg-card/60 hover:bg-card/80 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🌳</span>
          <span className="font-pixel text-[9px] text-primary">SKILL TREE</span>
          <span className="font-pixel text-[8px] text-muted-foreground">
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
            <div className="px-4 py-4 space-y-4">
              {/* Tier selector */}
              <div className="flex gap-2">
                {tiers.map((tier) => {
                  const tierUnlocked = SKILLS.filter(
                    (s) => s.tier === tier && unlockedSkillIds.includes(s.id)
                  ).length;
                  const tierTotal = SKILLS.filter((s) => s.tier === tier).length;

                  return (
                    <button
                      key={tier}
                      onClick={() => setSelectedTier(tier)}
                      className={`flex-1 py-2 rounded-lg text-[8px] font-pixel transition-all ${
                        selectedTier === tier
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                      }`}
                    >
                      Tier {tier} {tierUnlocked}/{tierTotal}
                    </button>
                  );
                })}
              </div>

              {/* Skills grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {tierSkills.map((skill) => {
                  const unlocked = unlockedSkillIds.includes(skill.id);
                  const canUnlock = canUnlockSkill(skill.id, unlockedSkillIds) && slayerPoints >= skill.cost;

                  return (
                    <SkillCard
                      key={skill.id}
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