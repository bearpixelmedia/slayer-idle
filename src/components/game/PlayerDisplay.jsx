import React from "react";
import { motion } from "framer-motion";
import PlayerRenderer from "./PlayerRenderer";

function PlayerDisplay({ playerHP, playerMaxHP, enemyHit, playerHit, weaponMode, gameSettings }) {
  return (
    <div 
      className="absolute bottom-56 left-[20%] flex flex-col items-center gap-2 z-20"
    >
      <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden border border-border/50">
        <motion.div
          className="h-full bg-green-500"
          animate={{ width: `${(playerHP / playerMaxHP) * 100}%` }}
          transition={{ duration: 0.15 }}
        />
      </div>
      <motion.div 
        className="animate-run-cycle drop-shadow-lg"
        animate={{ 
          scale: enemyHit ? 1.15 : 1, 
          filter: playerHit ? "brightness(2)" : "brightness(1)", 
          y: enemyHit ? -80 : 0,
          rotateZ: enemyHit ? 360 : 0
        }}
        transition={{ duration: 0.4 }}
      >
        <PlayerRenderer
          spriteUrl={weaponMode === "bow" ? gameSettings.player_bow : gameSettings.player_sword}
          fallbackEmoji={weaponMode === "bow" ? "🏹" : "⚔️"}
          className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16"
        />
      </motion.div>
      <div className="absolute -bottom-6 w-20 h-1 bg-black/30 rounded-full blur-sm" />
    </div>
  );
}

export default React.memo(PlayerDisplay);