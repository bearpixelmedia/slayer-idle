import React, { useState } from "react";
import { QUESTS, getQuestById } from "@/lib/quests";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, CheckCircle2, Lock } from "lucide-react";
import { HUD_THEME } from "@/lib/hudTheme";

function QuestCard({ quest, questProgress, onClaim, onRepeat }) {
  const { progress, completed, claimed } = questProgress;
  const progressPct = Math.min((progress / quest.target) * 100, 100);
  const isRepeatable = quest.repeatable;
  const canClaim = completed && !claimed;
  const canRepeat = isRepeatable && claimed;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`p-3 rounded-lg border transition-all ${
        claimed
          ? "bg-green-500/10 border-green-500/30"
          : completed
            ? "bg-primary/10 border-primary/30"
            : "bg-card/60 border-border/30"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Status icon */}
        <div className="flex-shrink-0 mt-0.5">
          {claimed ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : completed ? (
            <div className="w-5 h-5 rounded-full bg-primary/60 flex items-center justify-center">
              <span className="text-[8px] font-bold">✓</span>
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/40" />
          )}
        </div>

        {/* Quest info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-pixel text-[9px] text-foreground mb-0.5">{quest.title}</h4>
          <p className="text-[8px] text-muted-foreground mb-2">{quest.description}</p>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mb-1">
            <motion.div
              className={`h-full rounded-full transition-all ${
                claimed
                  ? "bg-green-500"
                  : completed
                    ? "bg-primary"
                    : "bg-secondary"
              }`}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Progress text */}
          <div className="flex items-center justify-between">
            <span className="text-[7px] text-muted-foreground">
              {progress} / {quest.target}
            </span>
            <div className="flex items-center gap-1.5">
              {/* Reward preview */}
              <div className="flex gap-1 text-[8px] font-pixel">
                {quest.reward.coins > 0 && (
                  <span className="text-primary">+{quest.reward.coins}🪙</span>
                )}
                {quest.reward.souls > 0 && (
                  <span className="text-accent">+{quest.reward.souls}👻</span>
                )}
                {quest.reward.slayerPoints > 0 && (
                  <span className="text-yellow-400">+{quest.reward.slayerPoints}🌳</span>
                )}
              </div>

              {/* Action button */}
              {canClaim ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onClaim(quest.id)}
                  className="px-2 py-0.5 rounded-md text-[7px] font-pixel bg-primary text-primary-foreground hover:brightness-110 transition-all"
                >
                  CLAIM
                </motion.button>
              ) : canRepeat ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onRepeat(quest.id)}
                  className="px-2 py-0.5 rounded-md text-[7px] font-pixel bg-secondary text-foreground hover:brightness-110 transition-all"
                >
                  REPEAT
                </motion.button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function QuestLog({ questProgress, onClaimReward, onRepeatQuest, unlockedZoneIds = [] }) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("active"); // active, completed, all

  const quests = Array.isArray(QUESTS) ? QUESTS : [];
  const filtered = quests.filter((quest) => {
    const qp = questProgress?.[quest?.id];
    if (!qp) return false;

    // Check prerequisites
    const meetsPrereqs = Array.isArray(quest?.prerequisiteIds) && quest.prerequisiteIds.every((prereqId) => {
      const prereqQp = questProgress[prereqId];
      return prereqQp && prereqQp.completed;
    });
    if (!meetsPrereqs) return false;

    if (filter === "active") return !qp.claimed;
    if (filter === "completed") return qp.claimed;
    return true;
  }).sort((a, b) => (a?.order || 0) - (b?.order || 0));

  const completedCount = quests.filter((q) => questProgress[q?.id]?.claimed).length;
  const totalCount = quests.length;

  return (
    <div className={`mx-2 mb-2 rounded-xl ${HUD_THEME.panel.border} overflow-hidden`}>
      {/* Header toggle */}
      <button
        className={`w-full flex items-center justify-between px-4 py-3 ${HUD_THEME.panel.bg} hover:bg-card/80 transition-colors`}
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">📜</span>
          <span className={`${HUD_THEME.text.label} text-primary`}>QUEST LOG</span>
          <span className={`${HUD_THEME.text.small} text-muted-foreground`}>
            {completedCount}/{totalCount}
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
            <div className="px-3 py-2 space-y-1.5">
              {/* Filter tabs */}
              <div className="flex gap-1.5 mb-2">
                {["active", "completed", "all"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`flex-1 py-1.5 rounded-lg ${HUD_THEME.text.small} transition-all ${
                        filter === f ? HUD_THEME.button.primary : HUD_THEME.button.muted
                      }`}
                    >
                      {f === "active" ? "Active" : f === "completed" ? "Claimed" : "All"}
                    </button>
                  ))}
                </div>

              {/* Quest list */}
              <div className="space-y-1.5 max-h-80 overflow-y-auto">
                <AnimatePresence>
                  {filtered.length > 0 ? (
                    filtered.map((quest) => (
                      <QuestCard
                        key={quest?.id}
                        quest={quest}
                        questProgress={questProgress?.[quest?.id] || { progress: 0, completed: false, claimed: false }}
                        onClaim={onClaimReward}
                        onRepeat={onRepeatQuest}
                      />
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-[8px] text-muted-foreground">
                        {filter === "active" ? "No active quests" : "No completed quests"}
                      </p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}