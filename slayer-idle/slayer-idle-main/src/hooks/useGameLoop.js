/**
 * useGameLoop.js
 *
 * The main 100ms setInterval loop:
 *   - World progress (player walks forward)
 *   - Enemy spawn checks
 *   - Auto-attack (sword/bow/ethereal)
 *   - Idle DPS tick (every 10 ticks = 1s)
 *   - Boss warning expiry → boss spawn
 *   - Magnet ability bonus coins
 *   - Floating element cleanup
 */

import { useEffect } from "react";
import {
  resolveCombatEnemyWorldPos,
  isInCombatAlongPath,
  getEnemyScreenAnchorPercent,
} from "@/lib/combatHitboxes";
import {
  sanitizePathScalars,
  spawnNewEnemy,
  spawnWorldCoins,
  coerceFiniteNumber,
} from "./combatHelpers";

export default function useGameLoop({
  stateRef,
  setState,
  abilitiesRef,
  activeBuffsRef,
  currentWeaponRef,
  getTapDamageRef,
  getIdleCPSRef,
  dealDamage,
  setAttackTick,
  setFloatingCoins,
  setFloatingSouls,
  setFloatingDamage,
  setParticles,
  setSlashEffects,
}) {
  // ─── Main game loop ───────────────────────────────────────────────────────
  useEffect(() => {
    let tickCounter = 0;

    const interval = setInterval(() => {
      tickCounter++;

      // ── World progress + enemy spawn ──
      setState((prev) => {
        if (prev.isDead) return prev;

        let pathState = sanitizePathScalars(prev);

        const list = pathState.enemyCluster;
        if (Array.isArray(list) && list.length > 0) {
          const ci = pathState.currentClusterIndex;
          if (typeof ci !== "number" || ci < 0 || ci >= list.length) {
            pathState = { ...pathState, currentClusterIndex: 0 };
          }
        }

        const enemyWorldPos = resolveCombatEnemyWorldPos({
          isBossActive: pathState.isBossActive,
          enemyCluster: pathState.enemyCluster,
          currentClusterIndex: pathState.currentClusterIndex,
          nextEnemyWorldPos: pathState.nextEnemyWorldPos,
        });

        const hasEncounter =
          Boolean(pathState.isBossActive) ||
          (Array.isArray(pathState.enemyCluster) && pathState.enemyCluster.length > 0);
        const pathResolved = enemyWorldPos != null && Number.isFinite(enemyWorldPos);
        const wp = coerceFiniteNumber(pathState.worldProgress, 0);
        const inMelee =
          hasEncounter &&
          pathResolved &&
          isInCombatAlongPath(wp, enemyWorldPos, Boolean(pathState.isBossActive));

        const shouldWalk = !inMelee;
        const newProgress = shouldWalk ? wp + 0.095 : wp;

        const clusterClear =
          !pathState.enemyCluster || pathState.enemyCluster.length === 0;
        if (clusterClear && newProgress >= pathState.nextEnemyWorldPos && !pathState.isBossActive) {
          return spawnWorldCoins(spawnNewEnemy({ ...pathState, worldProgress: newProgress }));
        }

        return spawnWorldCoins({ ...pathState, worldProgress: newProgress });
      });

      const state = stateRef.current;
      const bossWarningActive =
        state.bossWarning && Date.now() < state.bossWarning.warningEndTime;
      if (state.isDead || bossWarningActive) return;

      // ── Idle DPS (every 1s = 10 ticks) ──
      if (tickCounter % 10 === 0) {
        const cps = getIdleCPSRef.current(state);
        if (cps > 0) {
          dealDamage(
            Math.max(1, Math.floor(cps / 2)),
            50 + Math.random() * 20,
            50 + Math.random() * 20
          );
        }
      }

      // ── Auto-attack ──
      const enemyWorldPos = resolveCombatEnemyWorldPos({
        isBossActive: state.isBossActive,
        enemyCluster: state.enemyCluster,
        currentClusterIndex: state.currentClusterIndex,
        nextEnemyWorldPos: state.nextEnemyWorldPos,
      });
      const hasEncounter =
        Boolean(state.isBossActive) ||
        (Array.isArray(state.enemyCluster) && state.enemyCluster.length > 0);
      const pathResolved = enemyWorldPos != null && Number.isFinite(enemyWorldPos);
      const inCombatRange =
        hasEncounter &&
        pathResolved &&
        isInCombatAlongPath(state.worldProgress, enemyWorldPos, Boolean(state.isBossActive));

      const ethereal = abilitiesRef.current?.autoClicker?.active;
      const swingEveryTicks = ethereal ? 1 : 2;
      if (tickCounter % swingEveryTicks === 0 && inCombatRange) {
        const dmg = getTapDamageRef.current(state, currentWeaponRef.current, activeBuffsRef.current);
        setAttackTick((n) => n + 1);
        const anchor = getEnemyScreenAnchorPercent(state);
        const x = anchor ? anchor.leftPct + (Math.random() * 8 - 4) : 65 + Math.random() * 10;
        const y = anchor ? anchor.bottomPct + (Math.random() * 6 - 3) : 50 + Math.random() * 10;
        dealDamage(dmg, x, y);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [dealDamage, stateRef, setState, abilitiesRef, activeBuffsRef, currentWeaponRef, getTapDamageRef, getIdleCPSRef, setAttackTick]);

  // ─── Boss warning expiry → spawn boss ────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setState((prev) => {
        if (!prev.bossWarning) return prev;
        if (Date.now() < prev.bossWarning.warningEndTime) return prev;
        return spawnNewEnemy(prev);
      });
    }, 500);
    return () => clearInterval(interval);
  }, [setState]);

  // ─── Magnet ability: bonus coins while active ─────────────────────────────
  useEffect(() => {
    let counter = 0;
    const interval = setInterval(() => {
      counter++;
      if (!abilitiesRef.current.magnet.active) return;
      if (counter % 10 !== 0) return;
      const cps = getIdleCPSRef.current(stateRef.current);
      const bonus = Math.max(10, cps * 3);
      setState((prev) => ({
        ...prev,
        coins: prev.coins + bonus,
        totalCoinsEarned: prev.totalCoinsEarned + bonus,
      }));
      setFloatingCoins((fc) => [
        ...fc,
        { id: Date.now() + Math.random(), amount: bonus, x: 30 + Math.random() * 40, y: 30 + Math.random() * 30 },
      ]);
    }, 100);
    return () => clearInterval(interval);
  }, [abilitiesRef, getIdleCPSRef, stateRef, setState, setFloatingCoins]);

  // ─── Floating element cleanup ─────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setFloatingCoins((p)  => p.filter((c) => now - c.id < 1000));
      setFloatingSouls((p)  => p.filter((s) => now - s.id < 1000));
      setFloatingDamage((p) => p.filter((d) => now - d.id < 800));
      setParticles((p)      => p.filter((x) => now - x.id < 1000));
      setSlashEffects((p)   => p.slice(Math.max(0, p.length - 1)));
    }, 500);
    return () => clearInterval(interval);
  }, [setFloatingCoins, setFloatingSouls, setFloatingDamage, setParticles, setSlashEffects]);
}
