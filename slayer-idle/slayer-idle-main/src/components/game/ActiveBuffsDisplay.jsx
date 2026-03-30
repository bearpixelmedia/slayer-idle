import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ActiveBuffsDisplay({ activeBuffs }) {
  if (!activeBuffs || activeBuffs.length === 0) return null;

  // Sort by expiry (soonest first)
  const sorted = [...activeBuffs].sort((a, b) => a.endTime - b.endTime);

  return (
    <div className="fixed top-16 right-2 z-20 flex flex-col gap-1">
      <AnimatePresence>
        {sorted.map((buff) => {
          const timeRemaining = Math.max(0, buff.endTime - Date.now());
          const totalDuration = buff.duration * 1000;
          const pct = (timeRemaining / totalDuration) * 100;
          const isExpiring = timeRemaining < 1500;

          return (
            <motion.div
              key={buff.id + buff.startTime}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`relative flex items-center gap-1.5 px-2 py-1 rounded-full border backdrop-blur-sm transition-all ${
                buff.id === "frenzy"
                  ? "bg-red-500/20 border-red-400/60"
                  : buff.id === "coin_surge"
                    ? "bg-yellow-500/20 border-yellow-400/60"
                    : "bg-purple-500/20 border-purple-400/60"
              } ${isExpiring ? "animate-pulse" : ""}`}
            >
              <span className="text-sm">{buff.icon}</span>
              <span className="font-pixel text-[7px] text-foreground whitespace-nowrap">
                {buff.name}
              </span>
              <span className="font-pixel text-[6px] text-muted-foreground">
                {(timeRemaining / 1000).toFixed(1)}s
              </span>
              <div className="absolute bottom-0 left-0 h-0.5 bg-white/40 rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}