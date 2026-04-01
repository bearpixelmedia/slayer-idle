/**
 * EquipmentPanel.jsx
 *
 * Displays the player's available weapons grouped by tier.
 * Uses sprite icons sourced directly from the tilesheet via weaponIconStyle().
 *
 * For now, "weapon mode" maps to sword vs bow. Tier selection is visual only
 * (foundation for a full equip system).
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { weaponIconStyle, WEAPON_ICONS } from "@/lib/sprites";

// ─── Config ────────────────────────────────────────────────────────────────
const TIERS = ["wood", "bone"];

const TIER_LABELS = {
  wood: "Wood",
  bone: "Bone",
};

const TIER_COLORS = {
  wood: "text-amber-600",
  bone: "text-stone-400",
};

// Which weapon keys are actually usable vs just displayed
const PLAYABLE_WEAPONS = ["sword", "bow_f1"];
const WEAPON_MODE_MAP = {
  sword:  "sword",
  bow_f1: "bow",
};

const WEAPON_DISPLAY_NAMES = {
  sword:    "Sword",
  dagger:   "Dagger",
  hammer:   "Hammer",
  mace:     "Mace",
  axe:      "Axe",
  pickaxe:  "Pickaxe",
  spear:    "Spear",
  sickle:   "Sickle",
  bow_f1:   "Bow",
  crossbow: "Crossbow",
  staff:    "Staff",
  wand:     "Wand",
  shield:   "Shield",
  book:     "Book",
  arrow:    "Arrow",
  arrow_h:  "Arrow",
  club:     "Club",
};

// ─── Sub-components ────────────────────────────────────────────────────────

function WeaponIconSprite({ tier, weaponKey, scale = 3, active = false, playable = false, onClick }) {
  const style = weaponIconStyle(tier, weaponKey, scale);
  if (!style.backgroundImage) return null;

  return (
    <motion.button
      onClick={playable ? onClick : undefined}
      whileTap={playable ? { scale: 0.9 } : {}}
      className={`
        relative flex items-center justify-center rounded-lg p-2 transition-all
        ${playable ? "cursor-pointer" : "cursor-default opacity-60"}
        ${active
          ? "bg-primary/20 ring-2 ring-amber-400/70 shadow-md shadow-amber-900/40"
          : playable
            ? "bg-secondary/40 hover:bg-secondary/70 ring-1 ring-border/40"
            : "bg-muted/20 ring-1 ring-border/20"
        }
      `}
      title={WEAPON_DISPLAY_NAMES[weaponKey] ?? weaponKey}
    >
      <div style={style} />
      {active && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full ring-1 ring-background" />
      )}
      {!playable && (
        <span className="absolute inset-0 flex items-end justify-center pb-1">
          <span className="font-pixel text-[6px] text-muted-foreground/60">soon</span>
        </span>
      )}
    </motion.button>
  );
}

function TierRow({ tier, weaponMode, onModeChange }) {
  const icons = WEAPON_ICONS[tier];
  if (!icons) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <span className={`font-pixel text-[8px] font-bold ${TIER_COLORS[tier]}`}>
          {TIER_LABELS[tier].toUpperCase()}
        </span>
        <div className="flex-1 h-px bg-border/30" />
      </div>
      <div className="flex flex-wrap gap-2">
        {Object.keys(icons).map((weaponKey) => {
          const isPlayable = PLAYABLE_WEAPONS.includes(weaponKey);
          const modeForKey  = WEAPON_MODE_MAP[weaponKey];
          const isActive    = isPlayable && weaponMode === modeForKey;

          return (
            <div key={weaponKey} className="flex flex-col items-center gap-0.5">
              <WeaponIconSprite
                tier={tier}
                weaponKey={weaponKey}
                scale={3}
                active={isActive}
                playable={isPlayable}
                onClick={() => isPlayable && onModeChange?.(modeForKey)}
              />
              <span className="font-pixel text-[6px] text-muted-foreground/70 max-w-[40px] text-center leading-tight">
                {WEAPON_DISPLAY_NAMES[weaponKey] ?? weaponKey}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export default function EquipmentPanel({ weaponMode, onModeChange }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-xl border border-border/50 overflow-hidden">
      {/* Header */}
      <button
        className="w-full flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-amber-900/30 via-card/60 to-amber-900/20 hover:from-amber-800/40 transition-colors border-b border-border/30"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-2">
          <span className="text-base">🗡️</span>
          <span className="font-pixel text-[9px] text-amber-200 font-bold tracking-wide">EQUIPMENT</span>
          <span className="font-pixel text-[7px] text-muted-foreground capitalize">
            {weaponMode === "bow" ? "🏹 Bow" : "⚔️ Sword"}
          </span>
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
          : <ChevronDown className="w-4 h-4 text-muted-foreground" />
        }
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
            <div className="px-4 py-3 space-y-4 bg-card/30">
              {TIERS.map((tier) => (
                <TierRow
                  key={tier}
                  tier={tier}
                  weaponMode={weaponMode}
                  onModeChange={onModeChange}
                />
              ))}
              <p className="font-pixel text-[7px] text-muted-foreground/50 text-center pt-1">
                Tap a weapon to equip · More tiers coming soon
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
