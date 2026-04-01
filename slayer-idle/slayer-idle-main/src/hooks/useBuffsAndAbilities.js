/**
 * useBuffsAndAbilities.js
 *
 * Manages active buffs, built-in ability cooldowns, and hero active abilities.
 *
 * Hero abilities:
 *   shield_wall  — Knight: blocks all damage for N seconds (invincibility)
 *   backstab     — Rogue:  next N taps deal 5× damage (hit counter)
 *   arcane_bomb  — Wizard: instant AOE burst against current enemy cluster
 *
 * Hero abilities are only available if the hero is recruited (heroes[id] >= 1).
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { BUFF_RULES, selectRandomBuff, shouldProcBuff, getBuffMultiplier } from "@/lib/buffs";
import { HERO_BY_ID } from "@/lib/heroes";
import { ABILITY_CONFIGS, HERO_ABILITY_CONFIGS, defaultAbilities, defaultHeroAbilities } from "./useGamePersistence";

export default function useBuffsAndAbilities(stateRef, { onArcaneBomb } = {}) {
  const [abilities,      setAbilities]      = useState(defaultAbilities);
  const [heroAbilities,  setHeroAbilities]  = useState(defaultHeroAbilities);
  const [activeBuffs,    setActiveBuffs]    = useState([]);

  const abilitiesRef      = useRef(abilities);
  const heroAbilitiesRef  = useRef(heroAbilities);
  const activeBuffsRef    = useRef(activeBuffs);
  const lastBuffProcRef   = useRef(Date.now());

  useEffect(() => { abilitiesRef.current     = abilities;     }, [abilities]);
  useEffect(() => { heroAbilitiesRef.current  = heroAbilities; }, [heroAbilities]);
  useEffect(() => { activeBuffsRef.current    = activeBuffs;   }, [activeBuffs]);

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
        const extension = Math.min(buff.duration * BUFF_RULES.maxDurationExtension, buff.duration);
        return prev.map((b) =>
          b.id === buff.id ? { ...b, endTime: b.endTime + extension * 1000 } : b
        );
      }
      if (prev.length >= BUFF_RULES.maxConcurrent) return prev;
      return [...prev, { ...buff, endTime: now + buff.duration * 1000, startTime: now }];
    });
  }, []);

  // ─── Built-in ability activation ─────────────────────────────────────────
  const activateAbility = useCallback((id) => {
    setAbilities((prev) => {
      const a = prev[id];
      if (!a || a.active || a.cooldownRemaining > 0) return prev;
      if (!ABILITY_CONFIGS[id]) return prev;
      return {
        ...prev,
        [id]: { active: true, durationRemaining: ABILITY_CONFIGS[id].duration, cooldownRemaining: 0 },
      };
    });
  }, []);

  // ─── Hero ability activation ──────────────────────────────────────────────
  const activateHeroAbility = useCallback((abilityId) => {
    const s = stateRef.current;
    const cfg = HERO_ABILITY_CONFIGS[abilityId];
    if (!cfg) return;

    // Check the hero that owns this ability is actually recruited
    const ownerHero = Object.values(HERO_BY_ID).find((h) => h.ability.id === abilityId);
    if (!ownerHero) return;
    const heroLevel = s.heroes?.[ownerHero.id] || 0;
    if (heroLevel < 1) return;

    setHeroAbilities((prev) => {
      const a = prev[abilityId];
      if (!a || a.active || (a.cooldownRemaining > 0)) return prev;

      if (abilityId === "backstab") {
        return { ...prev, backstab: { active: true, hitsRemaining: cfg.hits, cooldownRemaining: 0 } };
      }
      if (abilityId === "arcane_bomb") {
        // Instant — fire immediately, then go to cooldown
        if (typeof onArcaneBomb === "function") onArcaneBomb();
        return { ...prev, arcane_bomb: { active: false, durationRemaining: 0, cooldownRemaining: cfg.cooldown } };
      }
      // shield_wall and any duration-based ability
      return { ...prev, [abilityId]: { active: true, durationRemaining: cfg.duration, cooldownRemaining: 0 } };
    });
  }, [stateRef]);

  /**
   * Called by dealDamage after a tap connects while backstab is active.
   * Returns whether backstab consumed a hit (so caller can apply 5× multiplier).
   */
  const consumeBackstabHit = useCallback(() => {
    let didConsume = false;
    setHeroAbilities((prev) => {
      const a = prev.backstab;
      if (!a || !a.active || a.hitsRemaining <= 0) return prev;
      didConsume = true;
      const remaining = a.hitsRemaining - 1;
      if (remaining <= 0) {
        return { ...prev, backstab: { active: false, hitsRemaining: 0, cooldownRemaining: HERO_ABILITY_CONFIGS.backstab.cooldown } };
      }
      return { ...prev, backstab: { ...a, hitsRemaining: remaining } };
    });
    return didConsume;
  }, []);

  /**
   * Returns true while shield_wall is active (used by damage-receive logic).
   */
  const isShieldWallActive = useCallback(() => {
    return heroAbilitiesRef.current?.shield_wall?.active === true;
  }, []);

  /**
   * Returns true if arcane_bomb just fired this frame (consumed by combat engine).
   * The arcane_bomb state is set to cooldown immediately on activation, so the
   * combat engine detects the fire by watching for a freshly set cooldown.
   */
  const wasArcaneBombFired = useCallback(() => {
    // Exposed via ref so combat engine can check without re-render
    return heroAbilitiesRef.current?.arcane_bomb?._justFired === true;
  }, []);

  // ─── Tick: countdown all timers + buff cleanup ─────────────────────────────
  useEffect(() => {
    let tickCounter = 0;
    const interval = setInterval(() => {
      tickCounter++;

      // Every second (10 × 100ms ticks)
      if (tickCounter % 10 === 0) {
        // Built-in abilities countdown
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

        // Hero abilities countdown
        setHeroAbilities((prev) => {
          let changed = false;
          const updates = { ...prev };

          // shield_wall — duration countdown
          const sw = prev.shield_wall;
          if (sw.active && sw.durationRemaining > 0) {
            const remaining = sw.durationRemaining - 1;
            updates.shield_wall = {
              active: remaining > 0,
              durationRemaining: Math.max(0, remaining),
              cooldownRemaining: remaining <= 0 ? HERO_ABILITY_CONFIGS.shield_wall.cooldown : 0,
            };
            changed = true;
          } else if (!sw.active && sw.cooldownRemaining > 0) {
            updates.shield_wall = { ...sw, cooldownRemaining: Math.max(0, sw.cooldownRemaining - 1) };
            changed = true;
          }

          // arcane_bomb — cooldown only
          const ab = prev.arcane_bomb;
          if (!ab.active && ab.cooldownRemaining > 0) {
            updates.arcane_bomb = { ...ab, cooldownRemaining: Math.max(0, ab.cooldownRemaining - 1) };
            changed = true;
          }

          // backstab — cooldown only (hit counter decremented elsewhere)
          const bs = prev.backstab;
          if (!bs.active && bs.cooldownRemaining > 0) {
            updates.backstab = { ...bs, cooldownRemaining: Math.max(0, bs.cooldownRemaining - 1) };
            changed = true;
          }

          return changed ? updates : prev;
        });

        // Idle buff proc
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
    heroAbilities,
    heroAbilitiesRef,
    activeBuffs,
    activeBuffsRef,
    activateAbility,
    activateHeroAbility,
    consumeBackstabHit,
    isShieldWallActive,
    tryProcBuff,
    getBuffMultiplier: (key) =>
      getBuffMultiplier(Array.isArray(activeBuffsRef.current) ? activeBuffsRef.current : [], key),
  };
}
