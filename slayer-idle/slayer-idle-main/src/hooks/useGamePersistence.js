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

export const SAVE_VERSION = 5;
export const SAVE_KEY = "idle_slayer_save";

// ─── Built-in ability configs (magnet, doubleDamage, autoClicker) ────────────
export const ABILITY_CONFIGS = {
  magnet:       { duration: 10, cooldown: 45 },
  doubleDamage: { duration: 8,  cooldown: 60 },
  autoClicker:  { duration: 10, cooldown: 75 },
};

// ─── Hero ability configs ─────────────────────────────────────────────────────
// Mirrors hero ability definitions in heroes.js — kept here so persistence
// and useBuffsAndAbilities can reference cooldowns without importing heroes.js.
export const HERO_ABILITY_CONFIGS = {
  shield_wall:  { duration: 3,  cooldown: 30 },
  backstab:     { duration: 0,  cooldown: 25, hits: 5 },   // duration=0 → uses hit counter
  arcane_bomb:  { duration: 0,  cooldown: 35 },             // instant burst
};

export function defaultAbilities() {
  return {
    magnet:       { active: false, durationRemaining: 0, cooldownRemaining: 0 },
    doubleDamage: { active: false, durationRemaining: 0, cooldownRemaining: 0 },
    autoClicker:  { active: false, durationRemaining: 0, cooldownRemaining: 0 },
  };
}

export function defaultHeroAbilities() {
  return {
    shield_wall:  { active: false, durationRemaining: 0, cooldownRemaining: 0 },
    backstab:     { active: false, hitsRemaining: 0,     cooldownRemaining: 0 },
    arcane_bomb:  { active: false, durationRemaining: 0, cooldownRemaining: 0 },
  };
}

// ─── Default game state ───────────────────────────────────────────────────────

export function defaultState() {
  return {
    // Economy
    coins: 0,
    totalCoinsEarned: 0,
    souls: 0,
    slayerPoints: 0,

    // Skills / upgrades
    unlockedSkills: [],
    upgradeLevels: {},

    // Heroes: { heroId: level } — 0 or absent means not recruited
    heroes: {},

    // Zone / stage
    activeZoneId: "whispering_forest",
    unlockedZoneIds: ["whispering_forest"],
    zoneProgress: {
      whispering_forest: { stage: 0, highestStage: 0, killCount: 0 },
      bone_dungeon:      { stage: 0, highestStage: 0, killCount: 0 },
      orcish_caverns:    { stage: 0, highestStage: 0, killCount: 0 },
      deep_mines:        { stage: 0, highestStage: 0, killCount: 0 },
    },
    stage: 0,
    highestStage: 0,
    killCount: 0,
    totalKills: 0,
    prestigeCount: 0,

    // Combat
    enemyHP: getEnemyHP(0, 0),
    enemyMaxHP: getEnemyHP(0, 0),
    currentEnemyName: STAGES[0].enemies[0],
    isBossActive: false,
    playerHP: 100,
    playerMaxHP: 100,
    isDead: false,
    bossWarning: null,
    bossHitsReceived: 0,
    bossFightStartTime: null,
    bossEnrageResetUsed: false,

    // World runner
    enemyCluster: [],
    currentClusterIndex: 0,
    worldProgress: 0,
    nextEnemyWorldPos: 20,
    worldCoins: [],
    nextCoinWorldPos: 12,

    // Village
    villageBuildings: {},

    // Meta
    lastSave: Date.now(),
    saveVersion: SAVE_VERSION,
  };
}

// ─── Save / load ──────────────────────────────────────────────────────────────

export function loadGame() {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      let merged = { ...defaultState(), ...data, worldCoins: stripGroundWorldCoins(data.worldCoins) };
      merged = sanitizePathScalars(merged);
      merged = sanitizeClusterIndex(merged);
      merged = resumeClusterAfterDeadEnemy(merged);
      if (merged.isBossActive && merged.enemyHP <= 0) {
        merged = spawnNewEnemy({ ...merged, isBossActive: false, enemyHP: 0, enemyCluster: [] });
      }

      // Migrate old zone IDs to new ones
      if (!merged.zoneProgress?.whispering_forest) {
        merged.zoneProgress = {
          whispering_forest: merged.zoneProgress?.realm_of_light      || { stage: 0, highestStage: 0, killCount: 0 },
          bone_dungeon:      merged.zoneProgress?.whispering_woods     || { stage: 0, highestStage: 0, killCount: 0 },
          orcish_caverns:    merged.zoneProgress?.shadowfell_citadel   || { stage: 0, highestStage: 0, killCount: 0 },
          deep_mines:        { stage: 0, highestStage: 0, killCount: 0 },
        };
      }
      // Migrate old active zone IDs
      const zoneIdMap = {
        realm_of_light:     "whispering_forest",
        whispering_woods:   "bone_dungeon",
        shadowfell_citadel: "orcish_caverns",
      };
      if (zoneIdMap[merged.activeZoneId]) {
        merged.activeZoneId = zoneIdMap[merged.activeZoneId];
      }
      if (!merged.unlockedZoneIds?.includes("whispering_forest")) {
        merged.unlockedZoneIds = ["whispering_forest"];
      } else {
        merged.unlockedZoneIds = merged.unlockedZoneIds.map((id) => zoneIdMap[id] || id);
      }

      // Ensure heroes key exists
      if (!merged.heroes) merged.heroes = {};

      if (!data.saveVersion || data.saveVersion < SAVE_VERSION) {
        console.log(`Migrating save v${data.saveVersion ?? 1} → v${SAVE_VERSION}`);
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

// ─── Offline earnings ─────────────────────────────────────────────────────────

export function computeOfflineEarnings(savedState, getIdleCPS, offlineMultiplier = 1) {
  if (!savedState?.lastSave) return null;
  const seconds = Math.min((Date.now() - savedState.lastSave) / 1000, 3600 * 8);
  if (seconds < 10) return null;

  const idleCPS = getIdleCPS(savedState);
  const offlineCoins = Math.floor(idleCPS * seconds * 0.5 * offlineMultiplier);

  const soulsFromCoins = (coins) => {
    if (coins < 100) return 0;
    return Math.floor(Math.pow(Math.log10(coins + 1), 2.8));
  };
  const totalCoinsAfter = savedState.totalCoinsEarned + offlineCoins;
  const rawSoulDelta = Math.max(0, soulsFromCoins(totalCoinsAfter) - soulsFromCoins(savedState.totalCoinsEarned));
  const soulsEarned = Math.floor(rawSoulDelta * offlineMultiplier);

  if (offlineCoins <= 0 && soulsEarned <= 0) return null;
  return { offlineCoins, soulsEarned, seconds };
}

export function usePeriodicSave(state) {
  useEffect(() => {
    const interval = setInterval(() => saveGame(state), 30_000);
    return () => clearInterval(interval);
  }, [state]);
}

export function computePrestigePreview(state) {
  const baseSouls = getSoulsOnPrestige(state.totalCoinsEarned);
  const mult = (getSkillMultipliers(state.unlockedSkills) || { soulMultiplier: 1 }).soulMultiplier;
  const soulsOnPrestige = baseSouls > 0 ? Math.max(1, Math.floor(baseSouls * mult)) : 0;
  const canPrestige = baseSouls > 0;
  const slayerPointsOnPrestige = getSlayerPointsOnPrestige(state.souls + soulsOnPrestige);
  return { soulsOnPrestige, canPrestige, slayerPointsOnPrestige };
}
