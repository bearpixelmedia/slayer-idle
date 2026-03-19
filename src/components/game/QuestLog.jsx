import React, { useState } from "react";
import { QUESTS, getQuestById } from "@/lib/quests";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, CheckCircle2, Lock } from "lucide-react";

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

  const filtered = QUESTS.filter((quest) => {
    const qp = questProgress[quest.id];
    if (!qp) return false;

    // Check prerequisites
    const meetsPrereqs = quest.prerequisiteIds.every((prereqId) => {
      const prereqQp = questProgress[prereqId];
      return prereqQp && prereqQp.completed;
    });
    if (!meetsPrereqs) return false;

    if (filter === "active") return !qp.claimed;
    if (filter === "completed") return qp.claimed;
    return true;
  }).sort((a, b) => a.order - b.order);

  const completedCount = QUESTS.filter((q) => questProgress[q.id]?.claimed).length;
  const totalCount = QUESTS.length;

  return (
    <div className="mx-4 mb-4 rounded-xl border border-border/50 overflow-hidden">
      {/* Header toggle */}
      <button
        className="w-full flex items-center justify-between px-4 py-3 bg-card/60 hover:bg-card/80 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">📜</span>
          <span className="font-pixel text-[9px] text-primary">QUEST LOG</span>
          <span className="font-pixel text-[8px] text-muted-foreground">
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
            <div className="px-4 py-3 space-y-2">
              {/* Filter tabs */}
              <div className="flex gap-2 mb-3">
                {["active", "completed", "all"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`flex-1 py-1.5 rounded-lg text-[8px] font-pixel transition-all ${
                      filter === f
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    {f === "active" ? "Active" : f === "completed" ? "Claimed" : "All"}
                  </button>
                ))}
              </div>

              {/* Quest list */}
              <div className="space-y-2 max-h-80 overflow-y-auto">
                <AnimatePresence>
                  {filtered.length > 0 ? (
                    filtered.map((quest) => (
                      <QuestCard
                        key={quest.id}
                        quest={quest}
                        questProgress={questProgress[quest.id] || { progress: 0, completed: false, claimed: false }}
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