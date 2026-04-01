/**
 * useCombatEngine.js — orchestrator
 *
 * Composes useDealDamage + useGameLoop into the same return shape
 * as before. No consumer changes needed.
 */

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
import useDealDamage from "./useDealDamage";
import useGameLoop from "./useGameLoop";

export default function useCombatEngine({
  stateRef,
  setState,
  skillMults,
  villageMultipliers,
  abilitiesRef,
  activeBuffsRef,
  heroAbilitiesRef,
  isShieldWallActive,
  currentWeaponRef,
  tryProcBuff,
  getTapDamageRef,
  getIdleCPSRef,
}) {
  // ── Visual state + dealDamage + tickWorldCoinCollection ──────────────────
  const {
    floatingCoins,  setFloatingCoins,
    floatingSouls,  setFloatingSouls,
    floatingDamage, setFloatingDamage,
    particles,      setParticles,
    enemyDying,     setEnemyDying,
    slashEffects,   setSlashEffects,
    enemyHit,
    playerHit,
    attackTick,     setAttackTick,
    dealDamage,
    tickWorldCoinCollection,
  } = useDealDamage({
    stateRef,
    setState,
    skillMults,
    villageMultipliers,
    abilitiesRef,
    activeBuffsRef,
    currentWeaponRef,
    tryProcBuff,
    isShieldWallActive,
  });

  // ── Main game loop (world tick, auto-attack, idle DPS, cleanup) ──────────
  useGameLoop({
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
  });

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
