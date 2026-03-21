import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatNumber } from "@/lib/formatNumber";

function FloatingElements({ floatingCoins, floatingSouls, floatingDamage, slashEffects }) {
  return (
    <>
      {/* Slash effects */}
      <AnimatePresence>
        {slashEffects.map((s) => (
          <motion.div
            key={s.id}
            className="absolute pointer-events-none text-primary font-bold text-3xl"
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
            initial={{ scale: 0, rotate: -45, opacity: 1 }}
            animate={{ scale: 1.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            ✦
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Floating coin rewards */}
      <AnimatePresence mode="popLayout">
        {floatingCoins.map((c) => (
          <motion.div
            key={c.id}
            className="absolute pointer-events-none font-pixel text-primary text-xs sm:text-sm font-bold"
            style={{ left: `${c.x}%`, top: `${c.y}%` }}
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -50, scale: 0.8 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            +{formatNumber(c.amount)} 🪙
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Floating soul rewards */}
      <AnimatePresence mode="popLayout">
        {floatingSouls?.map((s) => (
          <motion.div
            key={s.id}
            className="absolute pointer-events-none font-pixel text-accent text-xs sm:text-sm font-bold"
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
            initial={{ opacity: 1, y: 0, scale: 0.8 }}
            animate={{ opacity: 0, y: -60, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            +{s.amount.toFixed(1)} 👻
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Floating damage numbers */}
      <AnimatePresence mode="popLayout">
        {floatingDamage?.map((d) => (
          <motion.div
            key={d.id}
            className={`absolute pointer-events-none font-pixel font-bold text-sm sm:text-base ${
              d.isCritical ? "text-red-400 drop-shadow-lg" : "text-orange-400"
            }`}
            style={{ left: `${d.x}%`, top: `${d.y}%` }}
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -60, scale: d.isCritical ? 1.3 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {d.isCritical ? "⚡" : ""}{formatNumber(d.amount)}
          </motion.div>
        ))}
      </AnimatePresence>
    </>
  );
}

export default React.memo(FloatingElements);