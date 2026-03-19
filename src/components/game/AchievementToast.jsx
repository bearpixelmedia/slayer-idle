import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AchievementToast({ achievement }) {
  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          key={achievement.id}
          initial={{ opacity: 0, y: 60, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-primary text-primary-foreground shadow-2xl border border-primary/50"
        >
          <span className="text-2xl">{achievement.icon}</span>
          <div>
            <p className="font-pixel text-[8px] opacity-70 mb-0.5">ACHIEVEMENT UNLOCKED</p>
            <p className="font-pixel text-[10px]">{achievement.name}</p>
            <p className="text-[10px] opacity-80">{achievement.rewardLabel}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}