import React from "react";
import { motion, AnimatePresence } from "framer-motion";

function BossUI({ showBossWarning, isBossActive, boss, shieldActive, bossHitsReceived, bossMechanic }) {
  return (
    <>
      {/* Boss warning banner */}
      <AnimatePresence>
        {showBossWarning && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-40 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="text-center px-4 max-w-xs"
              initial={{ scale: 0.5, y: -30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: -30 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <p className="font-pixel text-xl sm:text-2xl text-red-500 font-bold mb-2 drop-shadow-lg [text-shadow:0_0_10px_#ef4444]">
                ⚠️ BOSS APPROACHING ⚠️
              </p>
              <p className="font-pixel text-xs sm:text-sm text-yellow-400 drop-shadow-lg">
                Prepare for battle!
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Boss mechanic indicator */}
      {isBossActive && bossMechanic && (
        <motion.div
          className="absolute top-24 left-1/2 -translate-x-1/2 px-3 py-2 rounded-lg bg-red-900/60 border border-red-500/40 backdrop-blur-sm z-30 pointer-events-none sm:top-28"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="font-pixel text-[8px] sm:text-[9px] text-red-300 text-center">
            <span className="text-yellow-400">{bossMechanic.name}</span>
            <br />
            {bossMechanic.description}
          </p>

          {/* Shield window indicator */}
          {bossMechanic.type === "shield_window" && (
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
                    duration: bossMechanic.interval + bossMechanic.duration,
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
          {bossMechanic.type === "enrage" && (
            <p className="mt-1 font-pixel text-[7px] text-orange-400 text-center">
              Stacks: {Math.floor(bossHitsReceived / bossMechanic.stackPerHits)}
            </p>
          )}
        </motion.div>
      )}
    </>
  );
}

export default React.memo(BossUI);