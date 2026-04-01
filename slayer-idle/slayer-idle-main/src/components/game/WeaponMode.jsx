import React from "react";
import { motion } from "framer-motion";
import { weaponIconStyle } from "@/lib/sprites";

const WEAPON_MODE_ICONS = {
  sword: { tier: "wood", key: "sword" },
  bow:   { tier: "wood", key: "bow_f1" },
};

const WEAPON_LABELS = {
  sword: "SWORD",
  bow:   "BOW",
};

function WeaponIcon({ mode, boxPx = 18 }) {
  const def = WEAPON_MODE_ICONS[mode];
  if (!def) return null;
  try {
    const { outer, inner } = weaponIconStyle(def.tier, def.key, boxPx);
    if (!inner?.backgroundImage) return <span className="text-sm">{mode === "sword" ? "🗡️" : "🏹"}</span>;
    return (
      <div style={outer}>
        <div style={inner} />
      </div>
    );
  } catch {
    return <span className="text-sm">{mode === "sword" ? "🗡️" : "🏹"}</span>;
  }
}

/**
 * WeaponMode — compact floating toggle, only visible when bow is unlocked.
 * Sits below the stats bar as a slim row of two pill buttons.
 */
export default function WeaponMode({ currentMode, bowUnlocked, onModeChange, className }) {
  if (!bowUnlocked) return null;

  return (
    <div
      className={`flex items-center gap-1.5 pointer-events-auto ${className || ""}`}
    >
      {["sword", "bow"].map((mode) => (
        <motion.button
          key={mode}
          onClick={() => onModeChange(mode)}
          whileTap={{ scale: 0.93 }}
          className={`
            flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[8px] font-pixel
            border transition-all whitespace-nowrap
            ${currentMode === mode
              ? "bg-amber-600/80 border-amber-400/80 text-white shadow-md shadow-amber-900/40"
              : "bg-black/50 border-white/10 text-foreground/70 hover:bg-black/60"
            }
          `}
        >
          <WeaponIcon mode={mode} boxPx={16} />
          {WEAPON_LABELS[mode]}
        </motion.button>
      ))}
    </div>
  );
}
