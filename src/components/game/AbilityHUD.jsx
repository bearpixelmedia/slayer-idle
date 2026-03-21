import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const ABILITY_CONFIG = {
  magnet: { name: "Attract", icon: "✨", color: "border-blue-600/60 bg-blue-600/15" },
  double_damage: { name: "Fury", icon: "⚔️", color: "border-red-600/60 bg-red-600/15" },
  auto_clicker: { name: "Ethereal", icon: "👻", color: "border-purple-600/60 bg-purple-600/15" },
};

export default function AbilityHUD({ abilities, onActivate }) {
  const abilitiesArray = Array.isArray(abilities) ? abilities : Object.entries(abilities || {}).map(([id, data]) => ({ id, ...data }));
  if (!abilitiesArray || abilitiesArray.length === 0) return null;

  return (
    <motion.div
      className="fixed left-2 top-20 z-20 flex flex-col gap-1"
      initial={{ x: -200, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="font-pixel text-[8px] text-muted-foreground px-2">ABILITIES</div>
      <AnimatePresence>
        {abilitiesArray.map((ability) => {
          const config = ABILITY_CONFIG[ability.id];
          const timeRemaining = ability.cooldownRemaining || 0;
          const isReady = timeRemaining <= 0;

          return (
            <motion.button
              key={ability.id}
              onClick={() => isReady && onActivate(ability.id)}
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              disabled={!isReady}
              className={`relative w-20 h-20 rounded-lg border-2 flex flex-col items-center justify-center transition-all cursor-pointer active:scale-95 ${
                config?.color || "border-muted/50 bg-muted/10"
              } ${isReady ? "hover:brightness-125" : "opacity-50 cursor-not-allowed"}`}
            >
              <span className="text-2xl">{config?.icon}</span>
              <span className="font-pixel text-[7px] text-foreground text-center leading-tight mt-1">
                {config?.name}
              </span>
              <span className="font-pixel text-[6px] text-primary mt-0.5">
                {isReady ? "READY" : `${timeRemaining}s`}
              </span>

              {!isReady && (
                <motion.div
                  className="absolute inset-0 rounded-lg bg-black/20 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <span className="font-pixel text-[6px] text-muted-foreground">
                    {(timeRemaining / 1000).toFixed(0)}s
                  </span>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}