import React, { useRef } from "react";
import { STAGES, ENEMY_EMOJIS } from "@/lib/gameData";
import { formatNumber } from "@/lib/formatNumber";
import { motion, AnimatePresence } from "framer-motion";
import { getBossForStage, isBossShieldActive } from "@/lib/bosses";

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
    <div className="absolute bottom-0 left-0 right-0 h-80 overflow-hidden">
      {/* Back ground layer (slowest parallax) */}
      <div className="absolute bottom-32 left-0 right-0 h-12 animate-ground-scroll" style={{ opacity: 0.3 }}>
        <div className="flex whitespace-nowrap w-[200%]">
          {Array.from({ length: 40 }).map((_, i) => (
            <span key={`bg-${i}`} className="inline-block mx-2 text-muted-foreground/30 text-lg">
              {["🏔️", "⛰️"][i % 2]}
            </span>
          ))}
        </div>
      </div>

      {/* Mid ground layer */}
      <div className="absolute bottom-20 left-0 right-0 h-16 animate-ground-scroll" style={{ animationDuration: "3s", opacity: 0.5 }}>
        <div className="flex whitespace-nowrap w-[200%]">
          {Array.from({ length: 50 }).map((_, i) => (
            <span key={`mid-${i}`} className="inline-block mx-1 text-muted-foreground/40 text-2xl">
              {["🪨", "🌿", "🪨"][i % 3]}
            </span>
          ))}
        </div>
      </div>

      {/* Foreground layer (fastest parallax) */}
      <div className="absolute bottom-20 left-0 right-0 h-12 bg-gradient-to-t from-black/60 to-transparent flex whitespace-nowrap animate-ground-scroll" style={{ animationDuration: "2s" }}>
        <div className="flex whitespace-nowrap w-[200%]">
          {Array.from({ length: 60 }).map((_, i) => (
            <span key={`fg-${i}`} className="inline-block mx-0.5 text-foreground/80 text-sm font-bold">
              ▮
            </span>
          ))}
        </div>
      </div>

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
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
  const stage = STAGES[state?.stage] || STAGES[0];
  const enemyEmoji = ENEMY_EMOJIS[state?.currentEnemyName] || "👾";
  const boss = state?.isBossActive ? getBossForStage(state?.stage) : null;
  const showBossWarning = state?.bossWarning && Date.now() < state.bossWarning.warningEndTime;
  const shieldActive =
    state?.isBossActive &&
    boss?.mechanic?.type === "shield_window" &&
    state?.bossFightStartTime
      ? isBossShieldActive(Date.now() - state.bossFightStartTime, boss)
      : false;

  const handleClick = (e) => {
    if (!state || state.isDead) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    onTap(x, y);
  };

  return (
    <div
      ref={canvasRef}
      className={`relative w-full flex-1 bg-gradient-to-b ${stage.bgGradient} cursor-pointer select-none overflow-hidden`}
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
      <div className="absolute bottom-20 left-[15%] sm:left-[20%] flex flex-col items-center gap-2">
        <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden border border-border/50">
          <motion.div
            className="h-full bg-green-500"
            animate={{ width: `${(state.playerHP / state.playerMaxHP) * 100}%` }}
            transition={{ duration: 0.15 }}
          />
        </div>
        <motion.div 
          className="animate-run-cycle text-3xl sm:text-4xl md:text-5xl"
          animate={{ scale: enemyHit ? 1.15 : 1 }}
          transition={{ duration: 0.1 }}
        >
          {weaponMode === "bow" ? "🏹" : "⚔️"}
        </motion.div>
      </div>

      {/* Enemy */}
      <div className="absolute bottom-20 right-[15%] sm:right-[25%] flex flex-col items-center gap-2">
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

      {/* Floating damage numbers */}
      <AnimatePresence>
        {floatingDamage?.map((d) => (
          <motion.div
            key={d.id}
            className={`absolute pointer-events-none font-pixel font-bold text-sm sm:text-base ${
              d.isCritical ? "text-red-400" : "text-orange-400"
            }`}
            style={{ left: `${d.x}%`, top: `${d.y}%` }}
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -60, scale: d.isCritical ? 1.3 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            {d.isCritical ? "⚡" : ""}{formatNumber(d.amount)}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Boss warning banner */}
      <AnimatePresence>
        {showBossWarning && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="text-center"
              initial={{ scale: 0.5, y: -30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: -30 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <p className="font-pixel text-2xl sm:text-4xl text-red-500 font-bold mb-2 drop-shadow-lg [text-shadow:0_0_10px_#ef4444]">
                ⚠️ BOSS APPROACHING ⚠️
              </p>
              <p className="font-pixel text-sm sm:text-base text-yellow-400 drop-shadow-lg">
                Prepare for battle!
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Boss mechanic indicator */}
      {state?.isBossActive && boss?.mechanic && (
        <motion.div
          className="absolute top-12 left-1/2 -translate-x-1/2 px-3 py-2 rounded-lg bg-red-900/60 border border-red-500/40 backdrop-blur-sm z-30 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="font-pixel text-[8px] sm:text-[9px] text-red-300 text-center">
            <span className="text-yellow-400">{boss.mechanic.name}</span>
            <br />
            {boss.mechanic.description}
          </p>

          {/* Shield window indicator */}
          {boss.mechanic.type === "shield_window" && state.bossFightStartTime && (
            <>
              <motion.div
                className="mt-1 h-1 bg-red-950 rounded-full overflow-hidden border border-red-500/30"
                style={{ width: "100px" }}
              >
                <motion.div
                  className="h-full bg-blue-500"
                  animate={{
                    x: ["-100%", "0%", "100%"],
                  }}
                  transition={{
                    duration: boss.mechanic.interval + boss.mechanic.duration,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </motion.div>
              <p
                className={`mt-1 font-pixel text-[7px] text-center ${
                  shieldActive ? "text-cyan-300" : "text-red-300/70"
                }`}
              >
                {shieldActive ? "SHIELD ACTIVE" : "Shield down"}
              </p>
            </>
          )}

          {/* Enrage stack indicator */}
          {boss.mechanic.type === "enrage" && (
            <p className="mt-1 font-pixel text-[7px] text-orange-400 text-center">
              Stacks: {Math.floor(state.bossHitsReceived / boss.mechanic.stackPerHits)}
            </p>
          )}
        </motion.div>
      )}

      {/* Particle effects */}
      <ParticleEffect particles={particles} />

      <GroundLayer stageColor={stage.color} />

      {/* Stage indicator mobile */}
      <div className="sm:hidden absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm border border-white/10">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
        <span className="font-pixel text-[7px]" style={{ color: stage.color }}>{stage.name}</span>
      </div>

      {/* Tap hint */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
        <span className="font-pixel text-[7px] text-muted-foreground/50 animate-pulse">TAP TO ATTACK</span>
      </div>
    </div>
  );
}