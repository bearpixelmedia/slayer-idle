import React from "react";
import { motion } from "framer-motion";

export default function WeaponMode({ currentMode, bowUnlocked, onModeChange }) {
  if (!bowUnlocked) return null;

  return (
    <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="font-pixel text-[9px] text-muted-foreground">WEAPON</span>
        <div className="flex gap-2">
          {["sword", "bow"].map((mode) => (
            <motion.button
              key={mode}
              onClick={() => onModeChange(mode)}
              className={`px-3 py-1 rounded-lg text-[8px] font-pixel transition-all ${
                currentMode === mode
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/60 text-foreground hover:bg-secondary/80"
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {mode === "sword" ? "⚔️ SWORD" : "🏹 BOW"}
            </motion.button>
          ))}
        </div>
      </div>
      <div className="text-[7px] text-muted-foreground/60">
        {currentMode === "bow" ? "+25% souls, -30% rate" : "Normal damage"}
      </div>
    </div>
  );
}