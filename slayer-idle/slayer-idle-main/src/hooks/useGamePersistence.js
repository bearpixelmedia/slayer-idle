/**
 * useGamePersistence.js
 *
 * Save/load, defaultState, offline earnings.
 * Pure functions — no React hooks inside this module (except the one exported hook).
 */

import { useEffect } from "react";
import {
  STAGES, getEnemyHP, getSoulsOnPrestige, getSlayerPointsOnPrestige,
} from "@/lib/gameData";
import { getSkillMultipliers } from "@/lib/skillTree";
import { spawnNewEnemy, sanitizePathScalars, sanitizeClusterIndex, resumeClusterAfterDeadEnemy, stripGroundWorldCoins, coerceFiniteNumber } from "./combatHelpers";

export const SAVE_VERSION = 4;
export const SAVE_KEY = "idle_slayer_save";

export const ABILITY_CONFIGS = {
  magnet:       { duration: 10, cooldown: 45 },
  doubleDamage: { duration: 8,  cooldown: 60 },
  autoClicker:  { duration: 10, cooldown: 75 },
};

export function defaultAbilities() {
  return {
    magnet:       { active: false, durationRemaining: 0, cooldownRemaining: 0 },
    doubleDamage: { active: false, durationRemaining: 0, cooldownRemaining: 0 },
    autoClicker:  { active: false, durationRemaining: 0, cooldownRemaining: 0 },
  };
}

export function defaultState() {
  return {
    coins: 0,
    totalCoinsEarned: 0,
    souls: 0,
    slayerPoints: 0,
    unlockedSkills: [],
    activeZoneId: "realm_of_light",
    unlockedZoneIds: ["realm_of_light"],
    zoneProgress: {
      "realm_of_light":      { stage: 0, highestStage: 0, killCount: 0 },
      "whispering_woods":    { stage: 0, highestStage: 0, killCount: 0 },
      "shadowfell_citadel":  { stage: 0, highestStage: 0, killCount: 0 },
    },
    stage: 0,
    highestStage: 0,
    killCount: 0,
    totalKills: 0,
    prestigeCount: 0,
    upgradeLevels: {},
    enemyHP: getEnemyHP(0, 0),
    enemyMaxHP: getEnemyHP(0, 0),
    currentEnemyName: STAGES[0].enemies[0],
    isBossActive: false,
    playerHP: 100,
    playerMaxHP: 100,
    isDead: false,
    lastSave: Date.now(),
    saveVersion: SAVE_VERSION,
    bossWarning: null,
    bossHitsReceived: 0,
    bossFightStartTime: null,
    bossEnrageResetUsed: false,
    villageBuildings: {},
    enemyCluster: [],
    currentClusterIndex: 0,
    worldProgress: 0,
    nextEnemyWorldPos: 20,
    worldCoins: [],
    nextCoinWorldPos: 12,
  };
}

export function loadGame() {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      let merged = { ...data, worldCoins: stripGroundWorldCoins(data.worldCoins) };
      merged = sanitizePathScalars(merged);
      merged = sanitizeClusterIndex(merged);
      merged = resumeClusterAfterDeadEnemy(merged);
      if (merged.isBossActive && merged.enemyHP <= 0) {
        merged = spawnNewEnemy({ ...merged, isBossActive: false, enemyHP: 0, enemyCluster: [] });
      }
      if (!data.saveVersion || data.saveVersion < SAVE_VERSION) {
        console.log("Migrating save from v" + (data.saveVersion || 1) + " to v" + SAVE_VERSION);
        return { ...merged, saveVersion: SAVE_VERSION };
      }
      return merged;
    }
  } catch (e) {
    console.error("Failed to load save:", e);
  }
  return null;
}

export function saveGame(state) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ ...state, lastSave: Date.now() }));
  } catch (e) {
    console.error("Failed to save:", e);
  }
}

/**
 * Compute offline earnings for a loaded save.
 * Returns { offlineCoins, soulsEarned } or null if nothing to apply.
 */
export function computeOfflineEarnings(savedState, getIdleCPS, offlineMultiplier = 1) {
  if (!savedState?.lastSave) return null;
  const offlineSeconds = Math.min((Date.now() - savedState.lastSave) / 1000, 3600 * 8);
  if (offlineSeconds < 10) return null;

  const idleCPS = getIdleCPS(savedState);
  const offlineCoins = Math.floor(idleCPS * offlineSeconds * 0.5 * offlineMultiplier);
  const totalCoinsAfterOffline = savedState.totalCoinsEarned + offlineCoins;
  const soulsEarned = Math.max(
    0,
    Math.floor(Math.sqrt(totalCoinsAfterOffline / 1000)) - Math.floor(Math.sqrt(savedState.totalCoinsEarned / 1000))
  );

  if (offlineCoins <= 0 && soulsEarned <= 0) return null;
  return { offlineCoins, soulsEarned, offlineSeconds };
}

/**
 * Periodic save hook — call inside useGameState.
 */
export function usePeriodicSave(state) {
  useEffect(() => {
    const interval = setInterval(() => saveGame(state), 30_000);
    return () => clearInterval(interval);
  }, [state]);
}

/**
 * Prestige computation helpers (pure, no hooks).
 */
export function computePrestigePreview(state) {
  const baseSouls = getSoulsOnPrestige(state.totalCoinsEarned);
  const mult = (getSkillMultipliers(state.unlockedSkills) || { soulMultiplier: 1 }).soulMultiplier;
  const soulsOnPrestige = baseSouls > 0 ? Math.max(1, Math.floor(baseSouls * mult)) : 0;
  const canPrestige = baseSouls > 0;
  const slayerPointsOnPrestige = getSlayerPointsOnPrestige(state.souls + soulsOnPrestige);
  return { soulsOnPrestige, canPrestige, slayerPointsOnPrestige };
}
