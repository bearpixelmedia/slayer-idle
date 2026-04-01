import React from "react";
import { motion } from "framer-motion";
import { weaponIconStyle } from "@/lib/sprites";

// Map weapon mode → sprite tier/key
// `tier` defaults to 'wood' for now — swap to player's equipped tier later
const WEAPON_MODE_ICONS = {
  sword: { tier: "wood", key: "sword" },
  bow:   { tier: "wood", key: "bow_f1" },
};

function WeaponIcon({ mode, size = 3 }) {
  const def = WEAPON_MODE_ICONS[mode];
  if (!def) return null;
  const style = weaponIconStyle(def.tier, def.key, size);
  if (!style.backgroundImage) return null;
  return <div style={style} className="flex-shrink-0" />;
}

export default function WeaponMode({ currentMode, bowUnlocked, onModeChange, className }) {
  if (!bowUnlocked) return null;

  return (
    <div className={`px-4 py-3 border-b border-border/50 flex items-center justify-between ${className || ""}`}>
      <div className="flex items-center gap-2">
        <span className="font-pixel text-[9px] text-muted-foreground">WEAPON</span>
        <div className="flex gap-2">
          {["sword", "bow"].map((mode) => (
            <motion.button
              key={mode}
              onClick={() => onModeChange(mode)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[8px] font-pixel transition-all ${
                currentMode === mode
                  ? "bg-primary text-primary-foreground ring-1 ring-amber-400/60"
                  : "bg-secondary/60 text-foreground hover:bg-secondary/80"
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <WeaponIcon mode={mode} size={2} />
              <span>{mode === "sword" ? "SWORD" : "BOW"}</span>
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
