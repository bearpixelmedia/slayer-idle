import React from "react";
import { ZONES, canUnlockZone } from "@/lib/gameData";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ChevronRight } from "lucide-react";

export default function ZoneSelector({
  activeZoneId,
  unlockedZoneIds,
  zoneProgress,
  slayerPoints,
  onSwitchZone,
  onUnlockZone,
}) {
  return (
    <div className="mx-4 my-4 rounded-xl border border-border/50 overflow-hidden bg-card/60">
      <div className="px-4 py-3 border-b border-border/30">
        <div className="flex items-center gap-2">
          <span className="text-lg">🗺️</span>
          <span className="font-pixel text-[9px] text-primary">ZONES</span>
          <span className="font-pixel text-[8px] text-muted-foreground ml-auto">
            {unlockedZoneIds.length} / {ZONES.length}
          </span>
        </div>
      </div>

      <div className="px-4 py-3 space-y-2">
        {ZONES.map((zone) => {
          const isUnlocked = (unlockedZoneIds || []).includes(zone.id);
          const isActive = activeZoneId === zone.id;
          const zp = zoneProgress?.[zone.id];
          const canUnlock = isUnlocked || canUnlockZone(zone.id, unlockedZoneIds || [], zoneProgress || {}, slayerPoints);
          const req = zone.unlockRequirement;

          return (
            <motion.button
              key={zone.id}
              onClick={() => isUnlocked ? onSwitchZone(zone.id) : onUnlockZone(zone.id)}
              className={`relative w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                isActive
                  ? "bg-primary/20 border-primary/50"
                  : isUnlocked
                    ? "bg-secondary/40 border-secondary/50 hover:border-secondary/70"
                    : canUnlock
                      ? "bg-amber-900/20 border-amber-600/40 hover:border-amber-600/60"
                      : "bg-muted/20 border-border/30 opacity-50 cursor-not-allowed"
              }`}
              whileTap={isUnlocked || canUnlock ? { scale: 0.97 } : {}}
              disabled={!isUnlocked && !canUnlock}
            >
              {/* Zone icon/indicator */}
              <div className="flex-shrink-0 text-xl">
                {!isUnlocked && !canUnlock && <Lock className="w-5 h-5 text-muted-foreground" />}
                {(isUnlocked || canUnlock) && isActive && <span>✨</span>}
                {(isUnlocked || canUnlock) && !isActive && <span>🌍</span>}
              </div>

              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-pixel text-[9px] text-foreground font-bold">{zone.name}</span>
                  {isActive && <span className="font-pixel text-[7px] text-primary">● ACTIVE</span>}
                </div>
                <p className="text-[8px] text-muted-foreground truncate">{zone.description}</p>
                <div className="flex items-center gap-3 mt-1 text-[7px] text-muted-foreground/70">
                  {isUnlocked && (
                    <>
                      <span>Stage: {zp.stage + 1}</span>
                      <span>|</span>
                      <span>Best: {zp.highestStage + 1}</span>
                    </>
                  )}
                  {!isUnlocked && canUnlock && req && (
                    <span className="text-amber-500">Cost: {req.spCost} SP</span>
                  )}
                </div>
              </div>

              {!isUnlocked && canUnlock && (
                <div className="flex-shrink-0">
                  <ChevronRight className="w-4 h-4 text-amber-500" />
                </div>
              )}
              {isUnlocked && (
                <div className="flex-shrink-0">
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}