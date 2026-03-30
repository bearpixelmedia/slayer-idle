/**
 * combatHelpers.js
 *
 * Pure (stateless) helpers used by the combat engine and persistence layer.
 * No React imports — safe to import from anywhere.
 */

import {
  STAGES, getEnemyHP, getEnemyReward,
  getZoneStages,
} from "@/lib/gameData";
import { getBossForStage, getBossHP, isBossEncounter } from "@/lib/bosses";

// ─── Constants ───────────────────────────────────────────────────────────────

export const DEATH_ANIM_MS = 300;

// ─── Utility ─────────────────────────────────────────────────────────────────

export function newEnemyId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function coerceFiniteNumber(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function getStageDataForZone(activeZoneId, globalStageIndex) {
  const indices = getZoneStages(activeZoneId);
  const g = indices.includes(globalStageIndex) ? globalStageIndex : indices[0];
  return STAGES[g] || STAGES[0];
}

// ─── World coin helpers ───────────────────────────────────────────────────────

function airCoinHeightTier() {
  const r = Math.random();
  if (r < 0.5) return 0;
  if (r < 0.8) return 1;
  return 2;
}

export function spawnWorldCoins(s) {
  const wp = s.worldProgress ?? 0;
  const queue = s.nextCoinWorldPos ?? 14;
  if (wp < queue) return s;

  const baseReward = getEnemyReward(s.stage, s.killCount);
  const minBase = Math.max(wp + 8 + Math.random() * 10, queue);
  const newCoins = [];

  const pushCoin = (worldPos, heightTier, amount) => {
    newCoins.push({ id: newEnemyId(), worldPos, amount, heightTier });
  };

  const coinValue = () => Math.max(1, Math.floor(baseReward * 0.05 + Math.random() * 4));
  const TRIPLE_PATH_GAP = 2.4;
  const groupCount = 4 + Math.floor(Math.random() * 5);

  let pos = minBase;
  for (let g = 0; g < groupCount; g++) {
    const isTriple = Math.random() < 0.5;
    if (isTriple) {
      for (let t = 0; t < 3; t++) {
        pushCoin(pos + t * TRIPLE_PATH_GAP, airCoinHeightTier(), coinValue());
      }
      pos += TRIPLE_PATH_GAP * 3 + 3 + Math.random() * 4;
    } else {
      pushCoin(pos, airCoinHeightTier(), coinValue());
      pos += 5 + Math.random() * 6;
    }
  }

  const lastPos = newCoins[newCoins.length - 1].worldPos;
  const nextQueue = lastPos + 5 + Math.random() * 12;
  const nextCoinWorldPos = Math.max(nextQueue, wp + 1);

  return {
    ...s,
    worldCoins: [...(s.worldCoins || []), ...newCoins],
    nextCoinWorldPos,
  };
}

export function stripGroundWorldCoins(worldCoins) {
  if (!Array.isArray(worldCoins)) return [];
  return worldCoins.filter((c) => c && typeof c.worldPos === "number");
}

// ─── Enemy spawn ─────────────────────────────────────────────────────────────

export function spawnNewEnemy(s, opts = {}) {
  const boss = getBossForStage(s.stage) || null;
  const warningActive = s.bossWarning && Date.now() < s.bossWarning.warningEndTime;
  const warningForCurrentBoss = s.bossWarning && boss && s.bossWarning.bossId === boss?.id;
  const shouldEncounterBoss = Boolean(boss && isBossEncounter(s.killCount));

  if (shouldEncounterBoss && warningForCurrentBoss && !warningActive) {
    const hp = getBossHP(s.stage, s.killCount);
    const wp = s.worldProgress ?? 0;
    const queue = s.nextEnemyWorldPos ?? 0;
    const minBossApproachOnPath = 28 + Math.random() * 20;
    const bossWorldPos = Math.max(wp + minBossApproachOnPath, queue);
    return {
      ...s,
      enemyHP: hp,
      enemyMaxHP: hp,
      currentEnemyName: boss.name,
      isBossActive: true,
      bossHitsReceived: 0,
      bossFightStartTime: Date.now(),
      bossEnrageResetUsed: false,
      bossWarning: null,
      enemyCluster: [],
      currentClusterIndex: 0,
      nextEnemyWorldPos: bossWorldPos,
    };
  }

  const stageData = getStageDataForZone(s.activeZoneId, s.stage);
  const enemies = stageData.enemies;

  const clusterSize = 1 + Math.floor(Math.random() * 3);
  const enemyHP = getEnemyHP(s.stage, s.killCount);
  const wp = s.worldProgress ?? 0;
  const queue = s.nextEnemyWorldPos ?? 0;
  const anchor = opts.afterKillWorldPos;
  const forwardAfterKill =
    typeof anchor === "number" && Number.isFinite(anchor) ? anchor + (12 + Math.random() * 10) : null;

  const minApproachOnPath = 26 + Math.random() * 22;
  const base = Math.max(wp + minApproachOnPath, queue, forwardAfterKill ?? 0);
  const spacing = 5 + Math.random() * 3;

  const cluster = Array.from({ length: clusterSize }).map((_, i) => {
    const enemyName = enemies[Math.floor(Math.random() * enemies.length)];
    return {
      id: newEnemyId(),
      name: enemyName,
      hp: enemyHP,
      maxHp: enemyHP,
      worldPos: base + i * spacing,
    };
  });

  const activeEnemy = cluster[0];

  // Boss warning check
  if (boss && isBossEncounter(s.killCount) && !warningForCurrentBoss) {
    return {
      ...s,
      enemyHP: activeEnemy.hp,
      enemyMaxHP: activeEnemy.maxHp,
      currentEnemyName: activeEnemy.name,
      isBossActive: false,
      enemyCluster: cluster,
      currentClusterIndex: 0,
      bossWarning: { bossId: boss.id, warningEndTime: Date.now() + 3000 },
      nextEnemyWorldPos: cluster[cluster.length - 1].worldPos + (15 + Math.random() * 10),
    };
  }

  const lastWorldPos = cluster[cluster.length - 1].worldPos;
  const nextSpawnDistance = 15 + Math.random() * 10;

  return {
    ...s,
    enemyHP: activeEnemy.hp,
    enemyMaxHP: activeEnemy.maxHp,
    currentEnemyName: activeEnemy.name,
    isBossActive: false,
    enemyCluster: cluster,
    currentClusterIndex: 0,
    nextEnemyWorldPos: lastWorldPos + nextSpawnDistance,
  };
}

// ─── Cluster state helpers ────────────────────────────────────────────────────

export function sanitizeClusterIndex(s) {
  const list = s?.enemyCluster;
  if (!Array.isArray(list) || list.length === 0) return s;
  const ci = s.currentClusterIndex;
  if (typeof ci === "number" && ci >= 0 && ci < list.length) return s;
  return { ...s, currentClusterIndex: 0 };
}

export function resumeClusterAfterDeadEnemy(s) {
  const list = s.enemyCluster;
  if (!Array.isArray(list) || list.length === 0) return s;

  const ci = typeof s.currentClusterIndex === "number" ? s.currentClusterIndex : 0;
  const safeCi = Math.max(0, Math.min(ci, list.length - 1));
  const nextIndex = safeCi + 1;

  const trimmed = list.slice(nextIndex);
  const nextEnemy = trimmed[0];

  if (!nextEnemy) {
    const slainWorld = list[safeCi]?.worldPos;
    const afterKill =
      typeof slainWorld === "number" && Number.isFinite(slainWorld) ? slainWorld : undefined;
    return spawnNewEnemy({ ...s, enemyCluster: [] }, { afterKillWorldPos: afterKill });
  }

  return {
    ...s,
    enemyCluster: trimmed,
    currentClusterIndex: 0,
    enemyHP: nextEnemy.hp,
    enemyMaxHP: nextEnemy.maxHp,
    currentEnemyName: nextEnemy.name,
    playerHP: s.playerMaxHP,
  };
}

export function sanitizePathScalars(s) {
  const worldProgress = coerceFiniteNumber(s.worldProgress, 0);
  const nextEnemyWorldPos = coerceFiniteNumber(s.nextEnemyWorldPos, 20);
  const nextCoinWorldPos = coerceFiniteNumber(s.nextCoinWorldPos, 12);

  const enemyCluster = Array.isArray(s.enemyCluster) ? s.enemyCluster : [];
  const nextCluster = enemyCluster.map((e) => ({
    ...e,
    worldPos: coerceFiniteNumber(e.worldPos, worldProgress + 30),
  }));

  const changed =
    worldProgress !== s.worldProgress ||
    nextEnemyWorldPos !== s.nextEnemyWorldPos ||
    nextCoinWorldPos !== s.nextCoinWorldPos ||
    nextCluster.some((e, i) => e.worldPos !== enemyCluster[i]?.worldPos);

  return changed
    ? { ...s, worldProgress, nextEnemyWorldPos, nextCoinWorldPos, enemyCluster: nextCluster }
    : s;
}
