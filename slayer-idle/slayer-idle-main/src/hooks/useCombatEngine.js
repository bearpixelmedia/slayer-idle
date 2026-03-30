/**
 * useCombatEngine.js
 *
 * The main game loop: world progress, auto-attack, idle DPS,
 * dealDamage (with boss mechanics), and world coin collection.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import {
  getEnemyReward, getEnemySouls, getZoneStages,
} from "@/lib/gameData";
import {
  getBossForStage, getBossReward, getBossEnrageMultiplier, isBossShieldActive,
} from "@/lib/bosses";
import { getSkillMultipliers } from "@/lib/skillTree";
import { computeVillageMultipliers } from "@/lib/village";
import { getBowSoulMultiplier } from "@/lib/gameData";
import { getBuffMultiplier } from "@/lib/buffs";
import {
  isInCombatAlongPath,
  resolveCombatEnemyWorldPos,
  getEnemyScreenAnchorPercent,
} from "@/lib/combatHitboxes";
import {
  DEATH_ANIM_MS,
  spawnNewEnemy,
  spawnWorldCoins,
  sanitizePathScalars,
  resumeClusterAfterDeadEnemy,
  coerceFiniteNumber,
  getStageDataForZone,
  newEnemyId,
} from "./combatHelpers";

export default function useCombatEngine({
  stateRef,
  setState,
  skillMults,
  villageMultipliers,
  abilitiesRef,
  activeBuffsRef,
  currentWeaponRef,
  tryProcBuff,
  getTapDamageRef,
  getIdleCPSRef,
}) {
  const [floatingCoins, setFloatingCoins]   = useState([]);
  const [floatingSouls, setFloatingSouls]   = useState([]);
  const [floatingDamage, setFloatingDamage] = useState([]);
  const [particles, setParticles]           = useState([]);
  const [enemyDying, setEnemyDying]         = useState(false);
  const [slashEffects, setSlashEffects]     = useState([]);
  const [enemyHit, setEnemyHit]             = useState(false);
  const [playerHit, setPlayerHit]           = useState(false);
  const [attackTick, setAttackTick]         = useState(0);

  const enemyKillPendingRef = useRef(false);

  // ─── Reward multipliers ───────────────────────────────────────────────────
  const applyRewardMultipliers = useCallback((coins, souls, s, buffs) => {
    const sm = skillMults || {};
    const vm = villageMultipliers || {};
    const bm = Array.isArray(buffs) ? buffs : [];
    const buffCoinMult = getBuffMultiplier(bm, "coinMultiplier");
    const buffSoulMult = getBuffMultiplier(bm, "soulMultiplier");
    return {
      coins: Math.floor(coins * (sm.coinDropMultiplier || 1) * (vm.coinMultiplier || 1) * buffCoinMult),
      souls: Math.floor(souls * (sm.soulMultiplier || 1) * (vm.soulMultiplier || 1) * buffSoulMult),
    };
  }, [skillMults, villageMultipliers]);

  // ─── World coin collection ────────────────────────────────────────────────
  const tickWorldCoinCollection = useCallback((worldProgress, touchingCoinIds, onPickup) => {
    if (!Array.isArray(touchingCoinIds) || touchingCoinIds.length === 0) return;

    setState((prev) => {
      const touching = new Set(touchingCoinIds);
      const list = prev.worldCoins || [];
      const remaining = [];
      let collectedRaw = 0;

      for (const coin of list) {
        if (touching.has(coin.id)) {
          collectedRaw += coin.amount ?? 1;
        } else {
          remaining.push(coin);
        }
      }

      if (collectedRaw === 0) return prev;

      const { coins: finalCoins } = applyRewardMultipliers(
        collectedRaw, 0, prev, activeBuffsRef.current
      );

      const t = Date.now();
      const x = 20 + Math.random() * 30;
      const y = 32 + Math.random() * 12;

      setFloatingCoins((fc) => [...fc, { id: t + Math.random(), amount: finalCoins, x, y }]);
      onPickup?.();

      return {
        ...prev,
        coins: prev.coins + finalCoins,
        totalCoinsEarned: prev.totalCoinsEarned + finalCoins,
        worldCoins: remaining,
      };
    });
  }, [setState, applyRewardMultipliers, activeBuffsRef]);

  // ─── Deal damage ─────────────────────────────────────────────────────────
  const dealDamage = useCallback((damage, x, y) => {
    const snap = stateRef.current;

    // Guard: enemy already at 0 HP — handle cluster/boss advance without re-applying damage
    if (snap.enemyHP <= 0) {
      if (snap.isBossActive) {
        if (enemyKillPendingRef.current) return;
        setEnemyDying(false);
        enemyKillPendingRef.current = false;
        setState((p) => spawnNewEnemy({ ...p, isBossActive: false, enemyHP: 0, enemyCluster: [] }));
        return;
      }
      if (Array.isArray(snap.enemyCluster) && snap.enemyCluster.length > 0) {
        if (enemyKillPendingRef.current) return;
        setEnemyDying(false);
        enemyKillPendingRef.current = false;
        setState((prev) => resumeClusterAfterDeadEnemy(prev));
        return;
      }
    }

    const now = Date.now();
    setEnemyHit(true);
    setTimeout(() => setEnemyHit(false), 150);

    const multiplier = abilitiesRef.current.doubleDamage.active ? 2 : 1;
    const finalDamage = damage * multiplier;
    const isCritical = multiplier > 1;

    if (isCritical) {
      const count = 8;
      setParticles((prev) => [
        ...prev,
        ...Array.from({ length: count }).map((_, i) => ({
          id: now + Math.random() + i,
          x, y,
          emoji: "⚡",
          angle: (360 / count) * i,
          distance: 60 + Math.random() * 30,
          duration: 0.6,
        })),
      ]);
    }

    setState((prev) => {
      if (prev.bossWarning && Date.now() < prev.bossWarning.warningEndTime) return prev;
      if (
        prev.enemyHP <= 0 &&
        (prev.isBossActive || (Array.isArray(prev.enemyCluster) && prev.enemyCluster.length > 0))
      ) return prev;

      // Boss mechanics
      let adjustedDamage = finalDamage;
      let newBossHits = prev.bossHitsReceived;
      let bossEnrageResetUsed = prev.bossEnrageResetUsed;

      if (prev.isBossActive) {
        const boss = getBossForStage(prev.stage) || null;

        if (boss?.mechanic?.type === "shield_window") {
          const elapsedMs = Date.now() - (prev.bossFightStartTime || Date.now());
          if (isBossShieldActive(elapsedMs, boss)) {
            adjustedDamage = Math.ceil(finalDamage * (1 - boss.mechanic.damageReduction));
          }
        }

        newBossHits = prev.bossHitsReceived + 1;
      }

      // Player takes damage from enemy
      let playerDamage = prev.isBossActive ? 3 : 1;

      if (prev.isBossActive) {
        const boss = getBossForStage(prev.stage) || null;

        if (boss?.mechanic?.type === "enrage") {
          playerDamage = Math.ceil(playerDamage * getBossEnrageMultiplier(newBossHits, boss));
        }
        if (boss?.mechanic?.type === "thorns") {
          playerDamage += Math.ceil(finalDamage * boss.mechanic.reflectPct);
        }
      }

      if (playerDamage > 0) {
        setPlayerHit(true);
        setTimeout(() => setPlayerHit(false), 150);
      }

      const newPlayerHP = prev.playerHP - playerDamage;
      if (newPlayerHP <= 0) return { ...prev, playerHP: 0, isDead: true };

      const newHP = prev.enemyHP - adjustedDamage;

      // Enrage reset threshold
      if (
        prev.isBossActive &&
        !bossEnrageResetUsed &&
        newHP > 0
      ) {
        const boss = getBossForStage(prev.stage) || null;
        if (
          boss?.mechanic?.type === "enrage" &&
          typeof boss.mechanic?.resetThreshold === "number" &&
          newHP <= prev.enemyMaxHP * boss.mechanic.resetThreshold
        ) {
          newBossHits = 0;
          bossEnrageResetUsed = true;
        }
      }

      // Enemy dies
      if (newHP <= 0) {
        let coinReward = 0;
        let soulReward = 0;

        if (prev.isBossActive) {
          const bossRewards = getBossReward(prev.stage);
          const soulBonus = 1 + prev.souls * 0.05;
          coinReward = Math.floor(bossRewards.coins * soulBonus);
          soulReward = bossRewards.souls;
        } else {
          const baseSouls = getEnemySouls(prev.stage);
          const stageMeta = getStageDataForZone(prev.activeZoneId, prev.stage);
          const stageBias = stageMeta?.soulBias || 1;
          const soulBonus = 1 + prev.souls * 0.05;
          const bowLevel = prev.upgradeLevels?.bow || 0;
          const bowBonus =
            currentWeaponRef.current === "bow" ? getBowSoulMultiplier(bowLevel) : 1;
          soulReward = baseSouls * stageBias * bowBonus;

          const reward = getEnemyReward(prev.stage, prev.killCount);
          coinReward = Math.floor(reward * soulBonus);
        }

        const { coins: finalCoins, souls: finalSouls } = applyRewardMultipliers(
          coinReward, soulReward, prev, activeBuffsRef.current
        );

        tryProcBuff("kill", prev);

        const particleCount = prev.isBossActive ? 12 : 6;
        setParticles((p) => [
          ...p,
          ...Array.from({ length: particleCount }).map((_, i) => ({
            id: now + Math.random() + i,
            x, y,
            emoji: prev.isBossActive ? "⭐" : "✨",
            angle: (360 / particleCount) * i,
            distance: 50 + Math.random() * 30,
            duration: 0.8,
          })),
        ]);

        setFloatingCoins((fc) => [...fc, { id: now + Math.random(), amount: finalCoins, x, y }]);
        setFloatingDamage((fd) => [...fd, { id: now + Math.random(), amount: finalDamage, x, y, isCritical }]);
        if (finalSouls > 0) {
          setFloatingSouls((fs) => [...fs, { id: now + Math.random() * 0.1, amount: finalSouls, x: x + 15, y }]);
        }

        enemyKillPendingRef.current = true;
        setEnemyDying(true);

        // More enemies in cluster?
        const nextIndex = prev.currentClusterIndex + 1;
        if (!prev.isBossActive && nextIndex < prev.enemyCluster.length) {
          const nextEnemy = prev.enemyCluster[nextIndex];
          const trimmed = prev.enemyCluster.slice(nextIndex);
          setTimeout(() => {
            setState((p) => ({
              ...p,
              enemyCluster: trimmed,
              currentClusterIndex: 0,
              enemyHP: nextEnemy.hp,
              enemyMaxHP: nextEnemy.maxHp,
              currentEnemyName: nextEnemy.name,
              playerHP: p.playerMaxHP,
              bossHitsReceived: newBossHits,
              bossEnrageResetUsed,
            }));
            setEnemyDying(false);
            enemyKillPendingRef.current = false;
          }, DEATH_ANIM_MS);

          return {
            ...prev,
            enemyHP: 0,
            playerHP: prev.playerMaxHP,
            bossHitsReceived: newBossHits,
            bossEnrageResetUsed,
          };
        }

        // Cluster clear or boss dead — advance stage, spawn next
        const newKillCount = prev.killCount + 1;
        let newStage = prev.stage;
        const zoneStages = getZoneStages(prev.activeZoneId);
        const maxStageInZone = zoneStages[zoneStages.length - 1];
        if (newKillCount > 0 && newKillCount % 25 === 0 && prev.stage < maxStageInZone) {
          newStage = prev.stage + 1;
        }

        const zoneProgress = { ...prev.zoneProgress };
        zoneProgress[prev.activeZoneId] = {
          stage: newStage,
          highestStage: Math.max(zoneProgress[prev.activeZoneId]?.highestStage ?? 0, newStage),
          killCount: newKillCount,
        };

        let bossHitsToTrack = newBossHits;
        if (prev.isBossActive) {
          const boss = getBossForStage(prev.stage) || null;
          if (boss?.mechanic?.type === "enrage") bossHitsToTrack = 0;
        }

        const newState = {
          ...prev,
          coins: prev.coins + finalCoins,
          totalCoinsEarned: prev.totalCoinsEarned + finalCoins,
          souls: prev.souls + finalSouls,
          killCount: newKillCount,
          totalKills: prev.totalKills + 1,
          stage: newStage,
          highestStage: Math.max(prev.highestStage || 0, newStage),
          zoneProgress,
          playerHP: prev.playerMaxHP,
          bossHitsReceived: bossHitsToTrack,
          bossFightStartTime: null,
          bossEnrageResetUsed: false,
        };

        const slainWorld = prev.isBossActive
          ? (prev.nextEnemyWorldPos ?? prev.worldProgress)
          : prev.enemyCluster?.[prev.currentClusterIndex]?.worldPos;
        const afterKill =
          typeof slainWorld === "number" && Number.isFinite(slainWorld) ? slainWorld : undefined;

        setTimeout(() => {
          setState((p) => spawnNewEnemy(p, { afterKillWorldPos: afterKill }));
          setEnemyDying(false);
          enemyKillPendingRef.current = false;
        }, DEATH_ANIM_MS);

        return { ...newState, enemyHP: 0 };
      }

      return {
        ...prev,
        enemyHP: newHP,
        playerHP: newPlayerHP,
        bossHitsReceived: newBossHits,
        bossEnrageResetUsed,
      };
    });
  }, [stateRef, setState, abilitiesRef, activeBuffsRef, currentWeaponRef, applyRewardMultipliers, tryProcBuff]);

  // ─── Main game loop ───────────────────────────────────────────────────────
  useEffect(() => {
    let tickCounter = 0;
    const interval = setInterval(() => {
      tickCounter++;

      // World progress + enemy spawn check
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

      // Idle DPS every 10 ticks (1s)
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
  }, [dealDamage, stateRef, setState, abilitiesRef, activeBuffsRef, currentWeaponRef, getTapDamageRef, getIdleCPSRef]);

  // Boss warning expiry → spawn boss
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

  // Magnet ability: bonus coins each second it's active
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
  }, [abilitiesRef, getIdleCPSRef, stateRef, setState]);

  // Floating element cleanup
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setFloatingCoins((p) => p.filter((c) => now - c.id < 1000));
      setFloatingSouls((p) => p.filter((s) => now - s.id < 1000));
      setFloatingDamage((p) => p.filter((d) => now - d.id < 800));
      setParticles((p) => p.filter((x) => now - x.id < 1000));
      setSlashEffects((p) => p.slice(Math.max(0, p.length - 1)));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return {
    floatingCoins,
    floatingSouls,
    floatingDamage,
    particles,
    enemyDying,
    slashEffects,
    setSlashEffects,
    enemyHit,
    playerHit,
    attackTick,
    setAttackTick,
    dealDamage,
    tickWorldCoinCollection,
  };
}
