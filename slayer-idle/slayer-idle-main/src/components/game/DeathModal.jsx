import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatNumber } from "@/lib/formatNumber";

export default function DeathModal({ isDead, souls, onRevive, onPrestige, canRevive }) {
  const reviveCost = 10;

  return (
    <AnimatePresence>
      {isDead && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative bg-card border-2 border-destructive rounded-xl p-8 max-w-sm mx-4 text-center"
          >
            <h2 className="font-pixel text-xl text-destructive mb-4 animate-pulse">💀 YOU DIED</h2>

            <p className="text-sm text-muted-foreground mb-6">
              You were defeated in battle. Choose wisely.
            </p>

            <div className="space-y-3">
              {/* Revive option */}
              <motion.button
                whileHover={canRevive ? { scale: 1.05 } : {}}
                whileTap={canRevive ? { scale: 0.95 } : {}}
                onClick={onRevive}
                disabled={!canRevive}
                className={`w-full py-3 rounded-lg font-pixel text-sm transition-all ${
                  canRevive
                    ? "bg-primary text-primary-foreground hover:brightness-110 cursor-pointer"
                    : "bg-muted/30 text-muted-foreground cursor-not-allowed opacity-50"
                }`}
              >
                ⚕️ REVIVE ({reviveCost} souls)
              </motion.button>

              {/* Prestige option */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onPrestige}
                className="w-full py-3 rounded-lg bg-accent text-accent-foreground font-pixel text-sm hover:brightness-110 transition-all"
              >
                ✨ PRESTIGE & RESET
              </motion.button>
            </div>

            <div className="mt-6 pt-4 border-t border-border/30 text-left space-y-2 text-[10px] text-muted-foreground">
              <p>Current Souls: <span className="text-accent font-bold">{formatNumber(typeof souls === "number" ? souls : 0)}</span></p>
              <p className="text-[9px]">Revive drains souls but keeps your run. Prestige resets but earns souls permanently.</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}