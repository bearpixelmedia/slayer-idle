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
      {/* Atmosphere haze - top to bottom gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/40" />
      
      {/* Distant fog layer */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/5 to-transparent" style={{ opacity: 0.4 }} />

      {/* Far distant mountains layer 1 - Very slow */}
      <div className="absolute top-12 left-0 right-0 h-1/3 animate-ground-scroll" style={{ animationDuration: "60s", opacity: 0.08 }}>
        <div className="flex whitespace-nowrap w-[200%] h-full items-end">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={`mountain-far-${i}`}
              className="flex-shrink-0"
              style={{
                width: "200px",
                height: `${180 + (i % 3) * 40}px`,
                background: `linear-gradient(180deg, rgba(20,10,0,0.15) 0%, rgba(10,5,0,0.35) 100%)`,
                clipPath: `polygon(${15 + (i % 4) * 5}% 0%, 0% 70%, ${20 + (i % 3) * 10}% 100%, ${80 + (i % 3) * 10}% 100%, 100% 70%, ${85 - (i % 4) * 5}% 0%)`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Far distant mountains layer 2 */}
      <div className="absolute top-20 left-0 right-0 h-1/3 animate-ground-scroll" style={{ animationDuration: "45s", opacity: 0.12 }}>
        <div className="flex whitespace-nowrap w-[200%] h-full items-end">
          {Array.from({ length: 25 }).map((_, i) => (
            <div
              key={`mountain-mid-far-${i}`}
              className="flex-shrink-0"
              style={{
                width: "140px",
                height: `${120 + (i % 4) * 60}px`,
                background: `linear-gradient(180deg, rgba(30,20,10,0.2) 0%, rgba(20,12,5,0.4) 100%)`,
                clipPath: `polygon(${20 + (i % 3) * 8}% 0%, 0% 65%, ${25 + (i % 4) * 12}% 100%, ${75 + (i % 4) * 12}% 100%, 100% 65%, ${80 - (i % 3) * 8}% 0%)`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Mid-distance mountains layer 3 */}
      <div className="absolute top-1/4 left-0 right-0 h-2/5 animate-ground-scroll" style={{ animationDuration: "30s", opacity: 0.18 }}>
        <div className="flex whitespace-nowrap w-[200%] h-full items-end">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={`peak-${i}`}
              className="flex-shrink-0"
              style={{
                width: "110px",
                height: `${100 + (i % 5) * 80}px`,
                background: `linear-gradient(180deg, rgba(40,30,20,0.25) 0%, rgba(25,18,10,0.45) 100%)`,
                clipPath: `polygon(${25 + (i % 4) * 10}% 0%, 0% 60%, ${30 + (i % 5) * 15}% 100%, ${70 + (i % 5) * 15}% 100%, 100% 60%, ${75 - (i % 4) * 10}% 0%)`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Hills with varied terrain */}
      <div className="absolute top-1/2 left-0 right-0 h-1/3 animate-ground-scroll" style={{ animationDuration: "18s", opacity: 0.28 }}>
        <div className="flex whitespace-nowrap w-[200%] h-full items-end">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={`hill-${i}`}
              className="flex-shrink-0"
              style={{
                width: "70px",
                height: `${50 + (i % 6) * 35}px`,
                background: `linear-gradient(180deg, rgba(50,40,25,0.35) 0%, rgba(35,28,18,0.55) 100%)`,
                borderRadius: "50% 50% 0 0 / 80% 80% 0 0",
              }}
            />
          ))}
        </div>
      </div>

      {/* Large rock formations */}
      <div className="absolute bottom-40 left-0 right-0 h-28 animate-ground-scroll" style={{ animationDuration: "12s", opacity: 0.35 }}>
        <div className="flex whitespace-nowrap w-[200%] h-full items-end">
          {Array.from({ length: 45 }).map((_, i) => (
            <div
              key={`rock-formation-${i}`}
              className="flex-shrink-0"
              style={{
                width: `${45 + (i % 5) * 15}px`,
                height: `${30 + (i % 7) * 25}px`,
                background: `linear-gradient(135deg, rgba(60,45,30,0.5) 0%, rgba(40,30,20,0.7) 100%)`,
                borderRadius: `${15 + (i % 3) * 10}%`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Smaller rocks and pebbles layer */}
      <div className="absolute bottom-32 left-0 right-0 h-16 animate-ground-scroll" style={{ animationDuration: "8s", opacity: 0.4 }}>
        <div className="flex whitespace-nowrap w-[200%] h-full items-center gap-1">
          {Array.from({ length: 60 }).map((_, i) => (
            <span key={`pebble-${i}`} className="inline-block text-muted-foreground/45 text-2xl">
              {["🪨", "🪨", "🪨", "🌿", "🍃"][i % 5]}
            </span>
          ))}
        </div>
      </div>

      {/* Ground vegetation layer */}
      <div className="absolute bottom-28 left-0 right-0 h-12 animate-ground-scroll" style={{ animationDuration: "6s", opacity: 0.3 }}>
        <div className="flex whitespace-nowrap w-[200%]">
          {Array.from({ length: 70 }).map((_, i) => (
            <span key={`plant-${i}`} className="inline-block mx-0.5 text-green-700/30 text-xl">
              {["🌿", "🍃", "🌱"][i % 3]}
            </span>
          ))}
        </div>
      </div>

      {/* Main terrain floor layer */}
      <div className="absolute bottom-20 left-0 right-0 h-24">
        {/* Upper earth gradient */}
        <div className="flex-1 bg-gradient-to-b from-amber-950/50 via-amber-950/60 to-amber-950/70 border-t-4 border-amber-800/50 animate-ground-scroll" style={{ animationDuration: "5s", height: "12px" }}>
          <div className="flex whitespace-nowrap w-[200%] h-full items-center">
            {Array.from({ length: 80 }).map((_, i) => (
              <span key={`earth-${i}`} className="inline-block mx-0.5 text-amber-900 text-sm font-bold">
                ▬
              </span>
            ))}
          </div>
        </div>

        {/* Main floor base */}
        <div className="flex-1 bg-gradient-to-b from-amber-950/60 to-amber-950/80" style={{ height: "8px" }} />

        {/* Floor detail texture */}
        <div className="flex-1 bg-gradient-to-b from-black/30 to-black/50 animate-ground-scroll" style={{ animationDuration: "4s", height: "6px" }}>
          <div className="flex whitespace-nowrap w-[200%] h-full items-center">
            {Array.from({ length: 100 }).map((_, i) => (
              <span key={`texture-${i}`} className="inline-block text-foreground/25 text-xs">
                ▪
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Foreground ground detail (fastest parallax) */}
      <div className="absolute bottom-20 left-0 right-0 h-8 animate-ground-scroll" style={{ animationDuration: "3s", opacity: 0.5 }}>
        <div className="flex whitespace-nowrap w-[200%] h-full items-center">
          {Array.from({ length: 120 }).map((_, i) => (
            <span key={`detail-${i}`} className="inline-block text-foreground/35 text-xs font-bold">
              {["▪", "·", "▪", "▫"][i % 4]}
            </span>
          ))}
        </div>
      </div>

      {/* Deep shadow/depth overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/70 to-transparent" />

      {/* Light source from top - cinematic lighting */}
      <div className="absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-b from-black/10 via-black/5 to-transparent pointer-events-none" />

      {/* Vignette edges for depth perception */}
      <div className="absolute inset-0 shadow-inner pointer-events-none" style={{ boxShadow: "inset 0 0 60px rgba(0,0,0,0.6)" }} />
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

      <GroundLayer stageColor={stage.color} />

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