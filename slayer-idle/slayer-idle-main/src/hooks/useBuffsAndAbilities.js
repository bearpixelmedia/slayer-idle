/**
 * useBuffsAndAbilities.js
 *
 * Manages active buffs and ability cooldowns/durations.
 * Exports a hook that owns its own state slices and returns
 * everything the orchestrator needs.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { BUFF_RULES, selectRandomBuff, shouldProcBuff, getBuffMultiplier } from "@/lib/buffs";
import { ABILITY_CONFIGS, defaultAbilities } from "./useGamePersistence";

export default function useBuffsAndAbilities(stateRef) {
  const [abilities, setAbilities] = useState(defaultAbilities);
  const [activeBuffs, setActiveBuffs] = useState([]);

  const abilitiesRef = useRef(abilities);
  const activeBuffsRef = useRef(activeBuffs);
  const lastBuffProcRef = useRef(Date.now());

  // Keep refs in sync
  useEffect(() => { abilitiesRef.current = abilities; }, [abilities]);
  useEffect(() => { activeBuffsRef.current = activeBuffs; }, [activeBuffs]);

  // ─── Buff proc ────────────────────────────────────────────────────────────
  const tryProcBuff = useCallback((source, s) => {
    const now = Date.now();
    const timeSinceLastProc = now - lastBuffProcRef.current;
    if (!shouldProcBuff(source, timeSinceLastProc)) return;

    lastBuffProcRef.current = now;
    const buff = selectRandomBuff();
    const existingBuff = activeBuffsRef.current.find((b) => b.id === buff.id);

    setActiveBuffs((prev) => {
      if (existingBuff) {
        const extension = Math.min(
          buff.duration * BUFF_RULES.maxDurationExtension,
          buff.duration
        );
        return prev.map((b) =>
          b.id === buff.id ? { ...b, endTime: b.endTime + extension * 1000 } : b
        );
      }
      if (prev.length >= BUFF_RULES.maxConcurrent) return prev;
      return [
        ...prev,
        { ...buff, endTime: now + buff.duration * 1000, startTime: now },
      ];
    });
  }, []);

  // ─── Ability activation ───────────────────────────────────────────────────
  const activateAbility = useCallback((id) => {
    setAbilities((prev) => {
      const a = prev[id];
      if (!a || a.active || a.cooldownRemaining > 0) return prev;
      if (!ABILITY_CONFIGS[id]) return prev;
      return {
        ...prev,
        [id]: {
          active: true,
          durationRemaining: ABILITY_CONFIGS[id].duration,
          cooldownRemaining: 0,
        },
      };
    });
  }, []);

  // ─── Tick: ability countdown + buff cleanup ───────────────────────────────
  useEffect(() => {
    let tickCounter = 0;
    const interval = setInterval(() => {
      tickCounter++;

      // Ability countdown every 1s (10 × 100ms)
      if (tickCounter % 10 === 0) {
        setAbilities((prev) => {
          let changed = false;
          const updates = {};
          Object.keys(prev).forEach((id) => {
            const a = prev[id];
            if (a.active && a.durationRemaining > 0) {
              const remaining = a.durationRemaining - 1;
              updates[id] = {
                ...a,
                durationRemaining: Math.max(0, remaining),
                active: remaining > 0,
                cooldownRemaining: remaining <= 0 ? ABILITY_CONFIGS[id].cooldown : 0,
              };
              changed = true;
            } else if (!a.active && a.cooldownRemaining > 0) {
              updates[id] = { ...a, cooldownRemaining: Math.max(0, a.cooldownRemaining - 1) };
              changed = true;
            } else {
              updates[id] = a;
            }
          });
          return changed ? updates : prev;
        });

        // Idle buff proc every 1s
        tryProcBuff("idle", stateRef.current);
      }

      // Buff expiry every tick
      const now = Date.now();
      setActiveBuffs((prev) => prev.filter((b) => b.endTime > now));
    }, 100);

    return () => clearInterval(interval);
  }, [tryProcBuff, stateRef]);

  return {
    abilities,
    abilitiesRef,
    activeBuffs,
    activeBuffsRef,
    activateAbility,
    tryProcBuff,
    getBuffMultiplier: (key) =>
      getBuffMultiplier(Array.isArray(activeBuffsRef.current) ? activeBuffsRef.current : [], key),
  };
}
