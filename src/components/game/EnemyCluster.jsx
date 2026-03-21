import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatNumber } from "@/lib/formatNumber";
import EnemyRenderer from "./EnemyRenderer";

function HealthBar({ current, max, isBoss }) {
  const pct = Math.max(0, (current / max) * 100);
  return (
    <div className={`${isBoss ? "w-32 sm:w-48" : "w-20 sm:w-32"} h-2.5 bg-muted rounded-full overflow-hidden border border-border/50`}>
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

function EnemyCluster({ cluster, currentIndex, isBossActive, enemyHP, enemyMaxHP, currentEnemyName, enemyHit, enemyDying, boss, shieldActive }) {
  return (
    <>
      {cluster && cluster.map((enemy, idx) => (
        <div 
          key={idx}
          className="absolute flex flex-col items-center gap-2 z-20"
          style={{
            left: "80%",
            bottom: `calc(14rem + ${idx * 4}rem)`,
            opacity: idx === currentIndex ? 1 : 0.5,
          }}
        >
          {idx === currentIndex && (
            <div className="text-center mb-1">
              {isBossActive && (
                <p className="font-pixel text-[8px] text-red-400 mb-1 animate-pulse">⚔️ BOSS ENCOUNTER ⚔️</p>
              )}
              <p className="font-pixel text-[7px] sm:text-[8px] text-foreground/80 mb-1">{currentEnemyName}</p>
              <HealthBar current={enemyHP} max={enemyMaxHP} isBoss={isBossActive} />
              <p className="font-pixel text-[6px] text-muted-foreground mt-0.5">
                {formatNumber(enemyHP)} / {formatNumber(enemyMaxHP)}
              </p>
            </div>
          )}
          <div className="relative">
            <EnemyRenderer
              enemyName={enemy.name}
              enemyHit={enemyHit && idx === currentIndex}
              enemyDying={enemyDying && idx === currentIndex}
              isBoss={isBossActive}
            />
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-24 h-2 bg-black/25 rounded-full blur-md" />
          </div>
        </div>
      ))}
    </>
  );
}

export default React.memo(EnemyCluster);