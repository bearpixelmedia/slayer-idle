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
    <div className="absolute inset-0 overflow-hidden">
      {/* High-altitude atmosphere with gradual color shift */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/30 via-slate-900/20 to-black/50" />
      
      {/* Upper sky layer with subtle clouds effect */}
      <div className="absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-b from-slate-800/40 via-slate-900/30 to-transparent" />

      {/* Atmospheric dust/fog particle effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-white/1 to-transparent" />

      {/* Ultra-distant mountains - extreme parallax */}
      <div className="absolute top-0 left-0 right-0 h-1/4 animate-ground-scroll" style={{ animationDuration: "90s", opacity: 0.06 }}>
        <div className="flex whitespace-nowrap w-[200%] h-full items-end">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={`ultra-dist-${i}`}
              className="flex-shrink-0"
              style={{
                width: "250px",
                height: `${220 + (i % 3) * 60}px`,
                background: `linear-gradient(180deg, 
                  rgba(15,8,0,0.08) 0%,
                  rgba(20,12,5,0.15) 30%,
                  rgba(10,6,2,0.25) 100%)`,
                clipPath: `polygon(${10 + (i % 5) * 4}% 0%, 0% 75%, ${15 + (i % 4) * 8}% 100%, ${85 + (i % 4) * 8}% 100%, 100% 75%, ${90 - (i % 5) * 4}% 0%)`,
                filter: "blur(0.5px)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Far mountains with atmospheric perspective */}
      <div className="absolute top-16 left-0 right-0 h-1/3 animate-ground-scroll" style={{ animationDuration: "60s", opacity: 0.12 }}>
        <div className="flex whitespace-nowrap w-[200%] h-full items-end">
          {Array.from({ length: 25 }).map((_, i) => (
            <div
              key={`far-mount-${i}`}
              className="flex-shrink-0"
              style={{
                width: "180px",
                height: `${160 + (i % 4) * 50}px`,
                background: `linear-gradient(180deg, 
                  rgba(25,15,8,0.15) 0%,
                  rgba(35,22,12,0.25) 40%,
                  rgba(20,12,6,0.45) 100%)`,
                clipPath: `polygon(${12 + (i % 5) * 6}% 0%, 0% 68%, ${18 + (i % 4) * 10}% 100%, ${82 + (i % 4) * 10}% 100%, 100% 68%, ${88 - (i % 5) * 6}% 0%)`,
                filter: "blur(1px)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Mid-distance mountain peaks */}
      <div className="absolute top-1/4 left-0 right-0 h-2/5 animate-ground-scroll" style={{ animationDuration: "35s", opacity: 0.22 }}>
        <div className="flex whitespace-nowrap w-[200%] h-full items-end">
          {Array.from({ length: 35 }).map((_, i) => (
            <div
              key={`mid-peak-${i}`}
              className="flex-shrink-0"
              style={{
                width: "130px",
                height: `${120 + (i % 5) * 90}px`,
                background: `linear-gradient(180deg,
                  rgba(45,35,22,0.28) 0%,
                  rgba(55,42,28,0.38) 35%,
                  rgba(35,25,15,0.55) 100%)`,
                clipPath: `polygon(${22 + (i % 4) * 8}% 0%, 0% 55%, ${28 + (i % 5) * 12}% 100%, ${72 + (i % 5) * 12}% 100%, 100% 55%, ${78 - (i % 4) * 8}% 0%)`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Closer hills with vegetation hints */}
      <div className="absolute top-2/5 left-0 right-0 h-1/3 animate-ground-scroll" style={{ animationDuration: "20s", opacity: 0.35 }}>
        <div className="flex whitespace-nowrap w-[200%] h-full items-end">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={`hill-close-${i}`}
              className="flex-shrink-0"
              style={{
                width: "80px",
                height: `${55 + (i % 6) * 40}px`,
                background: `linear-gradient(180deg,
                  rgba(60,48,32,0.42) 0%,
                  rgba(48,38,26,0.52) 50%,
                  rgba(35,28,18,0.65) 100%)`,
                borderRadius: "45% 55% 50% 50% / 75% 75% 25% 25%",
                boxShadow: "inset -2px -2px 4px rgba(0,0,0,0.3)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Rocky outcrops and stone formations */}
      <div className="absolute bottom-44 left-0 right-0 h-32 animate-ground-scroll" style={{ animationDuration: "14s", opacity: 0.42 }}>
        <div className="flex whitespace-nowrap w-[200%] h-full items-end">
          {Array.from({ length: 55 }).map((_, i) => (
            <div
              key={`rock-big-${i}`}
              className="flex-shrink-0"
              style={{
                width: `${55 + (i % 6) * 20}px`,
                height: `${35 + (i % 8) * 30}px`,
                background: `linear-gradient(135deg,
                  rgba(75,60,42,0.6) 0%,
                  rgba(55,42,30,0.8) 100%)`,
                borderRadius: `${20 + (i % 4) * 12}% ${22 - (i % 3) * 8}% ${18 + (i % 4) * 10}% ${24 - (i % 3) * 6}% / ${25 + (i % 4) * 8}% ${28 - (i % 3) * 10}% ${22 + (i % 4) * 6}% ${26 - (i % 3) * 4}%`,
                boxShadow: `inset -3px -3px 6px rgba(0,0,0,0.4), inset 1px 1px 3px rgba(255,255,255,0.1)`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Vegetation and grass patches */}
      <div className="absolute bottom-36 left-0 right-0 h-20 animate-ground-scroll" style={{ animationDuration: "10s", opacity: 0.45 }}>
        <div className="flex whitespace-nowrap w-[200%] h-full items-end gap-0.5">
          {Array.from({ length: 80 }).map((_, i) => (
            <div
              key={`grass-${i}`}
              className="flex-shrink-0"
              style={{
                width: "6px",
                height: `${8 + (i % 4) * 6}px`,
                background: `linear-gradient(180deg, rgba(60,80,30,0.4) 0%, rgba(35,48,18,0.6) 100%)`,
                borderRadius: "50% 50% 0 0",
              }}
            />
          ))}
        </div>
      </div>

      {/* Scattered pebbles and small rocks */}
      <div className="absolute bottom-28 left-0 right-0 h-14 animate-ground-scroll" style={{ animationDuration: "8s", opacity: 0.5 }}>
        <div className="flex whitespace-nowrap w-[200%] h-full items-center justify-around">
          {Array.from({ length: 70 }).map((_, i) => (
            <div
              key={`pebble-${i}`}
              className="flex-shrink-0"
              style={{
                width: `${4 + (i % 3) * 3}px`,
                height: `${3 + (i % 3) * 2}px`,
                borderRadius: "50%",
                background: `radial-gradient(circle at 30% 30%, rgba(150,140,125,0.6), rgba(90,80,65,0.8))`,
                boxShadow: "0 1px 2px rgba(0,0,0,0.4)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Soil/earth layers with realistic texture */}
      <div className="absolute bottom-20 left-0 right-0 h-20">
        {/* Surface layer */}
        <div className="h-3 bg-gradient-to-b from-amber-800/60 via-amber-900/70 to-amber-950/80 border-t-2 border-amber-700/50 animate-ground-scroll" style={{ animationDuration: "5s" }}>
          <div className="flex whitespace-nowrap w-[200%] h-full items-center opacity-70">
            {Array.from({ length: 100 }).map((_, i) => (
              <span key={`soil-${i}`} className="inline-block mx-px text-amber-900/50 text-xs">
                {["▬", "─", "▬"][i % 3]}
              </span>
            ))}
          </div>
        </div>

        {/* Compacted earth */}
        <div className="flex-1 bg-gradient-to-b from-amber-950/65 via-amber-950/75 to-stone-950/85" />

        {/* Stone layer with detail */}
        <div className="h-2 bg-gradient-to-b from-stone-800/60 to-stone-900/80 animate-ground-scroll" style={{ animationDuration: "4s" }}>
          <div className="flex whitespace-nowrap w-[200%] h-full items-center">
            {Array.from({ length: 120 }).map((_, i) => (
              <span key={`stone-${i}`} className="inline-block text-stone-700/40 text-xs">
                ▪
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Ultra-fine foreground detail (fastest parallax) */}
      <div className="absolute bottom-20 left-0 right-0 h-6 animate-ground-scroll" style={{ animationDuration: "2.5s", opacity: 0.6 }}>
        <div className="flex whitespace-nowrap w-[200%] h-full items-center">
          {Array.from({ length: 150 }).map((_, i) => (
            <span key={`micro-${i}`} className="inline-block text-foreground/30 text-[10px]">
              {["·", "¨", "·", "˙"][i % 4]}
            </span>
          ))}
        </div>
      </div>

      {/* Multiple depth shadows for cinematic effect */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/85 via-black/50 to-transparent" />
      <div className="absolute bottom-12 left-0 right-0 h-8 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />

      {/* Atmospheric lighting - top light */}
      <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/8 via-white/2 to-transparent pointer-events-none" />

      {/* Edge vignette for depth and framing */}
      <div className="absolute inset-0 pointer-events-none" style={{
        boxShadow: "inset 0 0 80px rgba(0,0,0,0.5), inset 0 0 120px rgba(0,0,0,0.3)",
      }} />

      {/* Subtle chromatic aberration effect */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.15) 100%)",
      }} />
    </div>
  );
}

import ParticleEffect from "./ParticleEffect";
import ParallaxBackground from "./ParallaxBackground";

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
      {/* Parallax background with sky, mountains, and foliage */}
      <ParallaxBackground />

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