import React, { useState } from "react";
import { formatNumber } from "@/lib/formatNumber";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function PrestigePanel({ canPrestige, soulsOnPrestige, slayerPointsOnPrestige, currentSouls, onPrestige }) {
  if (!canPrestige) return null;

  return (
    <div className="mx-4 mb-4">
      <div className="p-4 rounded-xl bg-gradient-to-r from-accent/20 to-purple-900/20 border border-accent/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-pixel text-[9px] text-accent mb-1">👻 PRESTIGE AVAILABLE</h3>
            <p className="text-xs text-muted-foreground">
              Reset progress and gain <span className="text-accent font-bold">+{formatNumber(soulsOnPrestige)} souls</span>
            </p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">
              Each soul gives +5% to all earnings permanently
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <motion.button
                className="px-4 py-2 rounded-lg bg-accent text-accent-foreground font-pixel text-[8px] hover:brightness-110"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                PRESTIGE
              </motion.button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-border">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-pixel text-sm text-accent">Confirm Prestige</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground space-y-3">
                  <div>
                    <p className="font-semibold text-foreground mb-2">You will gain:</p>
                    <div className="flex gap-4 text-sm">
                      <div>
                        <p className="text-accent font-bold">+{formatNumber(soulsOnPrestige)} 👻</p>
                        <p className="text-[10px]">Souls</p>
                      </div>
                      <div>
                        <p className="text-primary font-bold">+{formatNumber(slayerPointsOnPrestige)} 🌳</p>
                        <p className="text-[10px]">Slayer Points</p>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-border/30">
                    <p className="text-[10px] text-muted-foreground/80">
                      <span className="text-foreground font-semibold">Why prestige?</span> Unlock powerful skills, multiply your earnings by {((currentSouls + soulsOnPrestige) * 5)}%, and break through cost walls with fresh upgrades.
                    </p>
                  </div>
                  <div className="pt-2">
                    <p className="text-[10px]">
                      Currently: <span className="text-accent">{formatNumber(currentSouls)} souls</span> → After: <span className="text-accent">{formatNumber(currentSouls + soulsOnPrestige)} souls</span>
                    </p>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-secondary text-foreground">Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-accent text-accent-foreground" onClick={onPrestige}>
                  Prestige Now
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}