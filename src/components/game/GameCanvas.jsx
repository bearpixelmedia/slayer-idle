import React, { useRef } from "react";
import { STAGES, ENEMY_EMOJIS } from "@/lib/gameData";
import { formatNumber } from "@/lib/formatNumber";
import { motion, AnimatePresence } from "framer-motion";

function HealthBar({ current, max }) {
  const pct = Math.max(0, (current / max) * 100);
  return (
    <div className="w-32 sm:w-48 h-2.5 bg-muted rounded-full overflow-hidden border border-border/50">
      <motion.div
        className="h-full rounded-full"
        style={{
          background: pct > 50 ? "linear-gradient(90deg, #22c55e, #4ade80)" :
                     pct > 25 ? "linear-gradient(90deg, #eab308, #facc15)" :
                     "linear-gradient(90deg, #dc2626, #ef4444)"
        }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.15 }}
      />
    </div>
  );
}

function GroundLayer({ stageColor }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      <div className="animate-ground-scroll flex whitespace-nowrap absolute bottom-0 left-0 w-[200%]">
        {Array.from({ length: 40 }).map((_, i) => (
          <span
            key={i}
            className="inline-block mx-1 text-muted-foreground/20"
            style={{ fontSize: `${8 + (i % 3) * 4}px` }}
          >
            {["▲", "◆", "●", "■"][i % 4]}
          </span>
        ))}
      </div>
    </div>
  );
}

import ParticleEffect from "./ParticleEffect";

export default function GameCanvas({
  state,
  enemyDying,
  floatingCoins,
  floatingSouls,
  floatingDamage,
  slashEffects,
  particles,
  onTap,
  enemyHit,
  weaponMode,
}) {
  const canvasRef = useRef(null);
  const stage = STAGES[state.stage];
  const enemyEmoji = ENEMY_EMOJIS[state.currentEnemyName] || "👾";

  const handleClick = (e) => {
    if (state.isDead) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    onTap(x, y);
  };

  return (
    <div
      ref={canvasRef}
      className={`relative w-full h-56 sm:h-72 md:h-80 bg-gradient-to-b ${stage.bgGradient} cursor-pointer select-none overflow-hidden`}
      onClick={handleClick}
    >
      {/* Stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/20"
            style={{
              width: `${1 + (i % 3)}px`,
              height: `${1 + (i % 3)}px`,
              top: `${(i * 7) % 60}%`,
              left: `${(i * 13 + 5) % 100}%`,
              animation: `float ${2 + (i % 3)}s ease-in-out ${i * 0.3}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Player character */}
      <div className="absolute bottom-16 left-[15%] sm:left-[20%] flex flex-col items-center gap-2">
        <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden border border-border/50">
          <motion.div
            className="h-full bg-green-500"
            animate={{ width: `${(state.playerHP / state.playerMaxHP) * 100}%` }}
            transition={{ duration: 0.15 }}
          />
        </div>
        <div className="animate-run-cycle text-3xl sm:text-4xl md:text-5xl">
          {weaponMode === "bow" ? "🏹" : "⚔️"}
        </div>
      </div>

      {/* Enemy */}
      <div className="absolute bottom-16 right-[15%] sm:right-[25%] flex flex-col items-center gap-2">
        <div className="text-center mb-1">
          {state.isBossActive && (
            <p className="font-pixel text-[8px] text-red-400 mb-1 animate-pulse">⚔️ BOSS ENCOUNTER ⚔️</p>
          )}
          <p className="font-pixel text-[7px] sm:text-[8px] text-foreground/80 mb-1">{state.currentEnemyName}</p>
          <HealthBar current={state.enemyHP} max={state.enemyMaxHP} />
          <p className="font-pixel text-[6px] text-muted-foreground mt-0.5">
            {formatNumber(state.enemyHP)} / {formatNumber(state.enemyMaxHP)}
          </p>
        </div>
        <motion.div
          className={`text-4xl sm:text-5xl md:text-6xl ${
            state.isBossActive ? "scale-125" : ""
          }`}
          animate={{
            filter: enemyHit ? "brightness(1.8)" : "brightness(1)",
          }}
          transition={{ duration: 0.1 }}
          style={{
            animation: enemyDying ? "enemy-die 0.3s ease-out forwards" : 
                       (state.isBossActive && !enemyDying) ? "float 3s ease-in-out infinite" :
                       !enemyDying && !state.isBossActive ? "float 3s ease-in-out infinite" : "none"
          }}
        >
          {enemyEmoji}
        </motion.div>
      </div>

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
      <AnimatePresence>
        {floatingCoins.map((c) => (
          <motion.div
            key={c.id}
            className="absolute pointer-events-none font-pixel text-primary text-xs sm:text-sm font-bold"
            style={{ left: `${c.x}%`, top: `${c.y}%` }}
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -50 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            +{formatNumber(c.amount)} 🪙
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Floating soul rewards */}
      <AnimatePresence>
        {floatingSouls?.map((s) => (
          <motion.div
            key={s.id}
            className="absolute pointer-events-none font-pixel text-accent text-xs sm:text-sm font-bold"
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
            initial={{ opacity: 1, y: 0, scale: 0.8 }}
            animate={{ opacity: 0, y: -60, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            +{s.amount.toFixed(1)} 👻
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Particle effects */}
      <ParticleEffect particles={particles} />

      <GroundLayer stageColor={stage.color} />

      {/* Stage indicator mobile */}
      <div className="sm:hidden absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm border border-white/10">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
        <span className="font-pixel text-[7px]" style={{ color: stage.color }}>{stage.name}</span>
      </div>

      {/* Kill counter for next stage */}
      {state.stage < 6 && (
        <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm border border-white/10">
          <span className="font-pixel text-[7px] text-muted-foreground">
            Stage {state.killCount % 25}/25
          </span>
        </div>
      )}

      {/* Tap hint */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
        <span className="font-pixel text-[7px] text-muted-foreground/50 animate-pulse">TAP TO ATTACK</span>
      </div>
    </div>
  );
}