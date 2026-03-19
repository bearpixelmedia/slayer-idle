import React from "react";
import { motion } from "framer-motion";

const ABILITIES = [
  {
    id: "magnet",
    name: "Magnet",
    icon: "🧲",
    description: "Auto-collects massive coins",
    duration: 10,
    cooldown: 45,
    color: "from-blue-500/30 to-cyan-500/20",
    borderActive: "border-cyan-400/80",
    borderReady: "border-blue-500/40",
  },
  {
    id: "doubleDamage",
    name: "Double Dmg",
    icon: "⚡",
    description: "2x all damage output",
    duration: 8,
    cooldown: 60,
    color: "from-yellow-500/30 to-orange-500/20",
    borderActive: "border-yellow-400/80",
    borderReady: "border-yellow-500/40",
  },
  {
    id: "autoClicker",
    name: "Auto Click",
    icon: "🖱️",
    description: "Auto-deals tap damage",
    duration: 10,
    cooldown: 75,
    color: "from-red-500/30 to-pink-500/20",
    borderActive: "border-red-400/80",
    borderReady: "border-red-500/40",
  },
];

function AbilityButton({ ability, abilityState, onActivate }) {
  const { active, cooldownRemaining, durationRemaining } = abilityState;
  const isReady = !active && cooldownRemaining === 0;
  const onCooldown = cooldownRemaining > 0;

  const cooldownPct = ability.cooldown > 0 ? (cooldownRemaining / ability.cooldown) * 100 : 0;
  const durationPct = ability.duration > 0 ? (durationRemaining / ability.duration) * 100 : 0;

  return (
    <motion.button
      onClick={() => isReady && onActivate(ability.id)}
      className={`relative flex flex-col items-center gap-1 p-3 rounded-xl border bg-gradient-to-b transition-all overflow-hidden
        ${active ? `${ability.color} ${ability.borderActive} shadow-lg` :
          isReady ? `${ability.color} ${ability.borderReady} hover:brightness-125 cursor-pointer` :
          "bg-muted/20 border-border/30 cursor-not-allowed opacity-60"}
      `}
      whileTap={isReady ? { scale: 0.94 } : {}}
      style={{ minWidth: 80 }}
    >
      {/* Cooldown overlay */}
      {onCooldown && (
        <div
          className="absolute bottom-0 left-0 w-full bg-black/50 transition-all"
          style={{ height: `${cooldownPct}%` }}
        />
      )}

      {/* Duration bar */}
      {active && (
        <div className="absolute bottom-0 left-0 h-1 bg-white/60 transition-all rounded-b-xl"
          style={{ width: `${durationPct}%` }}
        />
      )}

      <span className="text-2xl relative z-10">{ability.icon}</span>
      <span className="font-pixel text-[7px] text-foreground/90 relative z-10 text-center leading-tight">
        {ability.name}
      </span>

      {active && (
        <span className="font-pixel text-[8px] text-white relative z-10">
          {durationRemaining}s
        </span>
      )}
      {onCooldown && !active && (
        <span className="font-pixel text-[8px] text-muted-foreground relative z-10">
          {cooldownRemaining}s
        </span>
      )}
      {isReady && (
        <span className="font-pixel text-[7px] text-green-400 relative z-10">READY</span>
      )}

      {active && (
        <motion.div
          className="absolute inset-0 rounded-xl"
          animate={{ opacity: [0.15, 0.35, 0.15] }}
          transition={{ repeat: Infinity, duration: 1 }}
          style={{ background: "white" }}
        />
      )}
    </motion.button>
  );
}

export default function AbilityBar({ abilities, onActivate }) {
  return (
    <div className="px-4 py-3 border-b border-border/50">
      <div className="flex items-center gap-2 mb-2">
        <span className="font-pixel text-[8px] text-muted-foreground">ABILITIES</span>
        {Object.values(abilities).some(a => a.active) && (
          <span className="font-pixel text-[8px] text-yellow-400 animate-pulse">● ACTIVE</span>
        )}
      </div>
      <div className="flex gap-3">
        {ABILITIES.map((ability) => (
          <AbilityButton
            key={ability.id}
            ability={ability}
            abilityState={abilities[ability.id] || { active: false, cooldownRemaining: 0, durationRemaining: 0 }}
            onActivate={onActivate}
          />
        ))}
        <div className="flex-1 flex items-center px-2">
          <p className="text-[10px] text-muted-foreground/50 leading-relaxed">
            {Object.values(abilities).find(a => a.active)
              ? "Buff active! Keep slaying..."
              : "Tap an ability to activate it"}
          </p>
        </div>
      </div>
    </div>
  );
}