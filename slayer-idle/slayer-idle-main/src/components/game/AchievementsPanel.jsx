import React, { useState } from "react";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, ChevronDown, ChevronUp } from "lucide-react";
import { HUD_THEME } from "@/lib/hudTheme";

const CATEGORIES = [
  { id: "coins", label: "Coins", icon: "🪙" },
  { id: "kills", label: "Kills", icon: "⚔️" },
  { id: "prestige", label: "Prestige", icon: "👻" },
  { id: "stages", label: "Stages", icon: "🗺️" },
];

function AchievementRow({ achievement, unlocked }) {
  return (
    <div className={`flex items-center gap-2 p-1.5 rounded-lg border transition-all ${
      unlocked
        ? "bg-primary/10 border-primary/30"
        : "bg-muted/20 border-border/20 opacity-50"
    }`}>
      <span className="text-lg sm:text-xl flex-shrink-0">{achievement.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-[9px] sm:text-sm font-semibold truncate ${unlocked ? "text-foreground" : "text-muted-foreground"}`}>
               {achievement.name}
              </span>
              {unlocked && <span className="text-[7px] font-pixel text-primary">✓</span>}
            </div>
            <p className="text-[8px] sm:text-[10px] text-muted-foreground truncate">{achievement.description}</p>
      </div>
      <div className={`text-right flex-shrink-0 px-2 py-1 rounded-md text-[8px] font-pixel ${
        unlocked
          ? achievement.reward.type === "damageMultiplier"
            ? "bg-red-500/20 text-red-400"
            : "bg-yellow-500/20 text-yellow-400"
          : "bg-muted/30 text-muted-foreground"
      }`}>
        {achievement.rewardLabel}
      </div>
    </div>
  );
}

export default function AchievementsPanel({ unlockedIds, damageMultiplier, offlineMultiplier }) {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("coins");

  const unlockedCount = Array.isArray(unlockedIds) ? unlockedIds.length : 0;
  const achievements = Array.isArray(ACHIEVEMENTS) ? ACHIEVEMENTS : [];
  const totalCount = achievements.length;

  const filtered = achievements.filter((a) => a?.category === activeCategory);

  return (
    <div className={`rounded-lg ${HUD_THEME.panel.border} overflow-hidden`}>
      {/* Header toggle */}
      <button
        className={`w-full flex items-center justify-between px-3 py-2 ${HUD_THEME.panel.bg} hover:bg-card/80 transition-colors`}
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-primary" />
          <span className={`${HUD_THEME.text.label} text-primary`}>ACHIEVEMENTS</span>
          <span className={`${HUD_THEME.text.small} text-muted-foreground`}>{unlockedCount}/{totalCount}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 text-[9px] font-pixel">
           <span className="text-red-400">⚔ ×{isFinite(damageMultiplier) ? damageMultiplier.toFixed(2) : "∞"}</span>
           <span className="text-yellow-400">🌙 ×{isFinite(offlineMultiplier) ? offlineMultiplier.toFixed(2) : "∞"}</span>
          </div>
          {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
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
            {/* Active multipliers summary */}
            <div className="flex gap-2 px-3 pt-2 pb-1.5">
              <div className="flex-1 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
                <p className="font-pixel text-[7px] text-muted-foreground">DAMAGE BONUS</p>
                <p className="font-pixel text-xs text-red-400">×{isFinite(damageMultiplier) ? damageMultiplier.toFixed(2) : "∞"}</p>
              </div>
              <div className="flex-1 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-center">
                <p className="font-pixel text-[7px] text-muted-foreground">OFFLINE BONUS</p>
                <p className="font-pixel text-xs text-yellow-400">×{isFinite(offlineMultiplier) ? offlineMultiplier.toFixed(2) : "∞"}</p>
              </div>
            </div>

            {/* Category tabs */}
            <div className="flex gap-1 px-3 pb-1.5">
              {CATEGORIES.map((cat) => {
                const catUnlocked = achievements.filter(a => a?.category === cat?.id && unlockedIds?.includes(a?.id)).length;
                const catTotal = achievements.filter(a => a?.category === cat?.id).length;
                return (
                 <button
                   key={cat.id}
                   onClick={() => setActiveCategory(cat.id)}
                   className={`flex-1 py-1.5 rounded-lg ${HUD_THEME.text.small} transition-all ${
                     activeCategory === cat.id ? HUD_THEME.button.primary : HUD_THEME.button.muted
                   }`}
                 >
                   {cat.icon} {catUnlocked}/{catTotal}
                 </button>
                );
              })}
            </div>

            {/* Achievement list */}
            <div className="px-3 pb-3 flex flex-col gap-1.5">
              {filtered.map((ach) => (
                <AchievementRow
                  key={ach?.id}
                  achievement={ach}
                  unlocked={unlockedIds?.includes(ach?.id)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}