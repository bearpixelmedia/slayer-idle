import React, { useRef, useCallback, useEffect, useMemo } from "react";
import { STAGES, ENEMY_EMOJIS } from "@/lib/gameData";
import { motion, AnimatePresence } from "framer-motion";
import { getBossForStage, isBossShieldActive } from "@/lib/bosses";
import ParticleEffect from "./ParticleEffect";
import ParallaxBackground from "./ParallaxBackground";
import { loadGameSettings } from "@/lib/gameSettings";
import EnemyCluster from "./EnemyCluster";
import PlayerDisplay from "./PlayerDisplay";
import FloatingElements from "./FloatingElements";
import BossUI from "./BossUI";

function GameCanvasComponent({
  state,
  enemyDying,
  floatingCoins,
  floatingSouls,
  floatingDamage,
  slashEffects,
  particles,
  onTap,
  enemyHit,
  playerHit,
  weaponMode,
  playerWorldPos,
}) {
  const canvasRef = useRef(null);
  const gameSettings = React.useMemo(() => loadGameSettings(), []);
  const stage = STAGES[state?.stage] || STAGES[0];
  const boss = state?.isBossActive ? getBossForStage(state?.stage) : null;
  const showBossWarning = state?.bossWarning && Date.now() < state.bossWarning.warningEndTime;
  const shieldActive =
    state?.isBossActive &&
    boss?.mechanic?.type === "shield_window" &&
    state?.bossFightStartTime
      ? isBossShieldActive(Date.now() - state.bossFightStartTime, boss)
      : false;
  
  // Player run speed - constant forward motion, pauses when in combat
  const runProgress = useRef(0);
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (!state.isDead) {
        const playerProgress = runProgress.current;
        const enemyWorldPos = state.enemyCluster?.[state.currentClusterIndex]?.worldPos || state.nextEnemyWorldPos;
        const inCombat = playerProgress >= enemyWorldPos - 5;
        
        // Only advance if not in combat with enemy
        if (!inCombat) {
          runProgress.current += 0.095;
        }
      }
    }, 50);
    return () => clearInterval(interval);
  }, [state.isDead, state.enemyCluster, state.currentClusterIndex, state.nextEnemyWorldPos]);
  
  // Expose runProgress to window for ParallaxBackground to access
  React.useEffect(() => {
    window.__gameRunProgress = runProgress;
  }, []);

  const handleClick = React.useCallback((e) => {
    if (!state || state.isDead) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Only allow tap if enemy is close (within 40% horizontal distance)
    const enemyX = 85; // Enemy position (right side)
    const playerX = 20; // Player position (left side)
    const distance = Math.abs(enemyX - playerX);
    const closestDistance = distance * 0.4; // Can attack if within 40% of distance
    
    if (Math.abs(x - enemyX) > closestDistance) return; // Enemy too far
    
    onTap(x, y);
  }, [state, onTap]);

  // Spacebar attack/jump input
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space" && !state.isDead) {
        e.preventDefault();
        onTap(50, 50);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state.isDead, onTap]);

  return (
    <div
      ref={canvasRef}
      className={`relative w-full flex-1 bg-gradient-to-b ${stage.bgGradient} cursor-pointer select-none overflow-hidden`}
      onClick={handleClick}
    >
      <ParallaxBackground />
      <PlayerDisplay 
        playerHP={state.playerHP}
        playerMaxHP={state.playerMaxHP}
        enemyHit={enemyHit}
        playerHit={playerHit}
        weaponMode={weaponMode}
        gameSettings={gameSettings}
      />
      <EnemyCluster
        cluster={state.enemyCluster}
        currentIndex={state.currentClusterIndex}
        isBossActive={state.isBossActive}
        enemyHP={state.enemyHP}
        enemyMaxHP={state.enemyMaxHP}
        currentEnemyName={state.currentEnemyName}
        enemyHit={enemyHit}
        enemyDying={enemyDying}
        boss={boss}
        shieldActive={shieldActive}
        playerWorldPos={playerWorldPos}
      />
      <FloatingElements
        floatingCoins={floatingCoins}
        floatingSouls={floatingSouls}
        floatingDamage={floatingDamage}
        slashEffects={slashEffects}
      />
      <BossUI
        showBossWarning={showBossWarning}
        isBossActive={state?.isBossActive}
        boss={boss}
        shieldActive={shieldActive}
        bossHitsReceived={state?.bossHitsReceived}
        bossMechanic={boss?.mechanic}
      />

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

export default React.memo(GameCanvasComponent);