import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatNumber } from "@/lib/formatNumber";
import { X } from "lucide-react";

export default function OfflineEarningsModal({ earnings, onClose }) {
  if (!earnings) return null;

  const { coins, souls, seconds } = earnings;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative bg-card border-2 border-primary rounded-xl p-6 max-w-sm mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>

          <h2 className="font-pixel text-sm text-primary mb-4 text-center">
            ⏰ WELCOME BACK
          </h2>

          <div className="space-y-3 mb-6">
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground mb-1">YOU WERE GONE</p>
              <p className="font-pixel text-xs text-foreground">
                {hours > 0 && `${hours}h `}
                {minutes}m
              </p>
            </div>

            <div className="h-px bg-border/30" />

            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 p-3 rounded-lg bg-primary/10 border border-primary/30 text-center">
                <p className="text-[9px] text-muted-foreground mb-1">IDLE COINS</p>
                <p className="font-pixel text-sm text-primary">+{formatNumber(coins)}</p>
              </div>

              {souls > 0 && (
                <div className="flex-1 p-3 rounded-lg bg-accent/10 border border-accent/30 text-center">
                  <p className="text-[9px] text-muted-foreground mb-1">SOULS</p>
                  <p className="font-pixel text-sm text-accent">+{formatNumber(souls)}</p>
                </div>
              )}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="w-full py-2 rounded-lg bg-primary text-primary-foreground font-pixel text-[9px] hover:brightness-110"
          >
            AWESOME!
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}