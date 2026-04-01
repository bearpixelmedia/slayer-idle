/**
 * useDealDamage.js
 *
 * Encapsulates:
 *   - All visual effect state (floatingCoins, floatingSouls, floatingDamage,
 *     particles, slashEffects, enemyHit, playerHit, enemyDying, attackTick)
 *   - applyRewardMultipliers — shared by dealDamage and tickWorldCoinCollection
 *   - dealDamage — resolves hit/kill/reward, updates game state
 *   - tickWorldCoinCollection — collision-based world coin pickup
 *
 * Returns everything useCombatEngine used to own directly.
 */

import { useState, useRef, useCallback } from "react";
import {
  getEnemySouls, getZoneStages,
} from "@/lib/gameData";
import {
  getBossForStage, getBossReward, getBossEnrageMultiplier, isBossShieldActive,
} from "@/lib/bosses";
import { getBowSoulMultiplier } from "@/lib/gameData";
import { getBuffMultiplier } from "@/lib/buffs";
import {
  DEATH_ANIM_MS,
  spawnNewEnemy,
  spawnWorldCoins,
  resumeClusterAfterDeadEnemy,
  getStageDataForZone,
} from "./combatHelpers";
import { getEnemyReward } from "@/lib/gameData";

export default function useDealDamage({
  stateRef,
  setState,
  skillMults,
  villageMultipliers,
  abilitiesRef,
  activeBuffsRef,
  currentWeaponRef,
  tryProcBuff,
  isShieldWallActive,
}) {
  // ─── Visual effect state ──────────────────────────────────────────────────
  const [floatingCoins,  setFloatingCoins]  = useState([]);
  const [floatingSouls,  setFloatingSouls]  = useState([]);
  const [floatingDamage, setFloatingDamage] = useState([]);
  const [particles,      setParticles]      = useState([]);
  const [enemyDying,     setEnemyDying]     = useState(false);
  const [slashEffects,   setSlashEffects]   = useState([]);
  const [enemyHit,       setEnemyHit]       = useState(false);
  const [playerHit,      setPlayerHit]      = useState(false);
  const [attackTick,     setAttackTick]     = useState(0);

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

    // Guard: enemy already at 0 HP
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

      // Player takes damage
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

      // Knight hero Shield Wall — blocks all incoming damage
      if (typeof isShieldWallActive === "function" && isShieldWallActive()) {
        playerDamage = 0;
      }

      if (playerDamage > 0) {
        setPlayerHit(true);
        setTimeout(() => setPlayerHit(false), 150);
      }

      const newPlayerHP = prev.playerHP - playerDamage;
      if (newPlayerHP <= 0) return { ...prev, playerHP: 0, isDead: true };

      const newHP = prev.enemyHP - adjustedDamage;

      // Enrage reset threshold
      if (prev.isBossActive && !bossEnrageResetUsed && newHP > 0) {
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

      // Enemy survives
      return {
        ...prev,
        enemyHP: newHP,
        playerHP: newPlayerHP,
        bossHitsReceived: newBossHits,
        bossEnrageResetUsed,
      };
    });
  }, [stateRef, setState, abilitiesRef, activeBuffsRef, currentWeaponRef, applyRewardMultipliers, tryProcBuff]);

  return {
    // Visual state
    floatingCoins,  setFloatingCoins,
    floatingSouls,  setFloatingSouls,
    floatingDamage, setFloatingDamage,
    particles,      setParticles,
    enemyDying,     setEnemyDying,
    slashEffects,   setSlashEffects,
    enemyHit,
    playerHit,
    attackTick,     setAttackTick,
    // Actions
    dealDamage,
    tickWorldCoinCollection,
    applyRewardMultipliers,
  };
}
