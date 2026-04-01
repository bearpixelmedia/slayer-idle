import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const ABILITY_CONFIG = {
  magnet:       { name: "Attract",  color: "border-blue-500/70 bg-blue-900/40",   ready: "bg-blue-500",   icon: "🧲" },
  doubleDamage: { name: "Fury",     color: "border-red-500/70 bg-red-900/40",     ready: "bg-red-500",    icon: "⚡" },
  autoClicker:  { name: "Auto",     color: "border-purple-500/70 bg-purple-900/40", ready: "bg-purple-500", icon: "👁️" },
};

/**
 * AbilityHUD — compact vertical strip on the left edge.
 * Each ability is a small pill button: icon + name + cooldown bar.
 * Designed to be unobtrusive while still clearly communicating state.
 */
export default function AbilityHUD({ abilities, onActivate }) {
  const abilitiesArray = Array.isArray(abilities)
    ? abilities
    : Object.entries(abilities || {}).map(([id, data]) => ({ id, ...data }));

  if (!abilitiesArray || abilitiesArray.length === 0) return null;

  return (
    <motion.div
      className="fixed left-1 top-24 z-20 flex flex-col gap-1"
      initial={{ x: -120, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatePresence>
        {abilitiesArray.map((ability) => {
          const config = ABILITY_CONFIG[ability.id] || {
            name: ability.id,
            color: "border-muted/50 bg-muted/10",
            ready: "bg-primary",
            icon: "✨",
          };
          const cooldownMs = ability.cooldownRemaining || 0;
          const maxCooldownMs = ability.maxCooldown || 1;
          const isReady = cooldownMs <= 0;
          const cooldownSec = Math.ceil(cooldownMs / 1000);
          const progress = isReady ? 1 : 1 - cooldownMs / maxCooldownMs;

          return (
            <motion.button
              key={ability.id}
              onClick={() => isReady && onActivate(ability.id)}
              initial={{ x: -60, opacity: 0 }}
              animate={{ x: 0, opacity: isReady ? 1 : 0.65 }}
              exit={{ x: -60, opacity: 0 }}
              disabled={!isReady}
              title={`${config.name}${isReady ? " — READY" : ` — ${cooldownSec}s`}`}
              className={`
                relative w-14 h-10 rounded-lg border flex flex-col items-center justify-center
                transition-all cursor-pointer active:scale-95 overflow-hidden
                ${config.color}
                ${isReady ? "hover:brightness-125 shadow-lg" : "cursor-not-allowed"}
              `}
            >
              {/* Cooldown fill bar (bottom-up) */}
              {!isReady && (
                <div
                  className={`absolute bottom-0 left-0 right-0 ${config.ready} opacity-20 transition-all duration-200`}
                  style={{ height: `${progress * 100}%` }}
                />
              )}

              {/* Icon */}
              <span className="text-sm leading-none">{config.icon}</span>

              {/* Name / cooldown */}
              <span className="font-pixel text-[5px] text-foreground/80 leading-none mt-0.5">
                {isReady ? config.name.toUpperCase() : `${cooldownSec}s`}
              </span>

              {/* READY dot */}
              {isReady && (
                <div className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${config.ready} animate-pulse`} />
              )}
            </motion.button>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}
