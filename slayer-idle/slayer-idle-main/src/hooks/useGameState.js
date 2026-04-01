/**
 * useGameState.js — orchestrator
 *
 * Composes sub-hooks and exposes the full game API to consumers.
 *
 * Sub-hooks:
 *   combatHelpers.js        — pure state helpers (spawnNewEnemy, etc.)
 *   useGamePersistence.js   — save/load, defaultState, offline earnings
 *   useBuffsAndAbilities.js — buffs, built-in abilities, hero abilities
 *   useCombatEngine.js      — main loop, dealDamage, world coins
 *
 * Hero system additions:
 *   - heroPassives  (derived from recruited heroes + their levels)
 *   - getTapDamage  now factors in rogue passive tapDamageBoost
 *   - getIdleCPS    now factors in hero DPS + upgrades
 *   - recruitHero   spend coins to recruit a hero (level 0 → 1)
 *   - levelHero     spend coins to level a recruited hero
 *   - hero active abilities wired through useBuffsAndAbilities
 */

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  ZONES, UPGRADES,
  getUpgradeCost, getSoulsOnPrestige, getSlayerPointsOnPrestige, getBowSoulMultiplier,
  getZoneStages, canUnlockZone,
  computeTapDamage, computeIdleCPS,
} from "@/lib/gameData";
import {
  HEROES, HERO_BY_ID, MAX_HEROES,
  getHeroLevelCost, computeHeroPassives, computeHeroDPS,
} from "@/lib/heroes";
import { SKILLS, getSkillMultipliers } from "@/lib/skillTree";
import { VILLAGE_BUILDINGS, computeVillageMultipliers, getBuildingUpgradeCost, canAffordUpgrade } from "@/lib/village";
import { getBuffMultiplier } from "@/lib/buffs";

import {
  loadGame, saveGame, defaultState, defaultAbilities, computeOfflineEarnings,
  computePrestigePreview, SAVE_VERSION,
} from "./useGamePersistence";
import {
  spawnNewEnemy, sanitizePathScalars, coerceFiniteNumber,
} from "./combatHelpers";
import useBuffsAndAbilities from "./useBuffsAndAbilities";
import useCombatEngine from "./useCombatEngine";

export default function useGameState({
  damageMultiplier = 1,
  offlineMultiplier = 1,
  weaponMode = "sword",
} = {}) {
  // ─── Core state ───────────────────────────────────────────────────────────
  const [state, setState] = useState(() => loadGame() || defaultState());
  const [offlineEarnings, setOfflineEarnings] = useState(null);
  const [currentWeapon, setCurrentWeapon] = useState(weaponMode);

  const stateRef = useRef(state);
  const currentWeaponRef = useRef(weaponMode);

  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => { currentWeaponRef.current = currentWeapon; }, [currentWeapon]);

  // ─── Periodic save ────────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => saveGame(stateRef.current), 30_000);
    return () => clearInterval(interval);
  }, []);

  // ─── Derived multipliers ──────────────────────────────────────────────────
  const skillMults = useMemo(
    () => getSkillMultipliers(state.unlockedSkills || []),
    [state.unlockedSkills]
  );
  const villageMultipliers = useMemo(
    () => computeVillageMultipliers(state.villageBuildings || {}),
    [state.villageBuildings]
  );

  // ─── Hero passives (derived from recruited heroes + levels) ──────────────
  // heroPassives: { damageReduction, tapDamageBoost, soulGainBoost }
  const heroPassives = useMemo(
    () => computeHeroPassives(state.heroes || {}),
    [state.heroes]
  );

  // Total idle DPS contributed by all heroes
  const heroDPS = useMemo(
    () => computeHeroDPS(state.heroes || {}),
    [state.heroes]
  );

  // ─── Damage / DPS calculations ────────────────────────────────────────────
  const getTapDamage = useCallback(
    (s = stateRef.current, weapon = currentWeaponRef.current, buffs = []) => {
      const base = computeTapDamage(s, weapon, buffs, skillMults, villageMultipliers, damageMultiplier);
      // Apply rogue passive tapDamageBoost
      const boost = heroPassives.tapDamageBoost || 0;
      return base * (1 + boost);
    },
    [skillMults, villageMultipliers, damageMultiplier, heroPassives]
  );

  const getIdleCPS = useCallback(
    (s = stateRef.current) => {
      const upgradeCPS = computeIdleCPS(s, skillMults, villageMultipliers);
      // Hero DPS is independent of upgrade idle DPS
      return upgradeCPS + heroDPS;
    },
    [skillMults, villageMultipliers, heroDPS]
  );

  const getTapDamageRef = useRef(getTapDamage);
  const getIdleCPSRef   = useRef(getIdleCPS);
  useEffect(() => { getTapDamageRef.current = getTapDamage; }, [getTapDamage]);
  useEffect(() => { getIdleCPSRef.current   = getIdleCPS;   }, [getIdleCPS]);

  // ─── Buffs & abilities (built-in + hero) ─────────────────────────────────
  const handleArcaneBombRef = useRef(null);

  const {
    abilities,      abilitiesRef,
    heroAbilities,  heroAbilitiesRef,
    activeBuffs,    activeBuffsRef,
    activateAbility,
    activateHeroAbility,
    consumeBackstabHit,
    isShieldWallActive,
    tryProcBuff,
  } = useBuffsAndAbilities(stateRef, { onArcaneBomb: (...args) => handleArcaneBombRef.current?.(...args) });

  // ─── Combat engine ────────────────────────────────────────────────────────
  const {
    floatingCoins, floatingSouls, floatingDamage, particles,
    enemyDying, slashEffects, setSlashEffects,
    enemyHit, playerHit, attackTick, setAttackTick,
    dealDamage, tickWorldCoinCollection,
  } = useCombatEngine({
    stateRef, setState,
    skillMults, villageMultipliers,
    abilitiesRef, activeBuffsRef,
    heroAbilitiesRef,
    isShieldWallActive,
    currentWeaponRef, tryProcBuff,
    getTapDamageRef, getIdleCPSRef,
  });

  // ─── Arcane Bomb handler (needs dealDamage from combat engine) ─────────────
  const handleArcaneBomb = useCallback(() => {
    const s = stateRef.current;
    if (!s || s.isDead || s.enemyHP <= 0) return;
    const tapDmg = getTapDamageRef.current(s, currentWeaponRef.current, activeBuffsRef.current);
    const bombDamage = tapDmg * (HERO_BY_ID.wizard?.ability?.multiplier ?? 20);
    dealDamage(bombDamage, 50 + Math.random() * 20, 40 + Math.random() * 20);
  }, [dealDamage, activeBuffsRef]);

  useEffect(() => { handleArcaneBombRef.current = handleArcaneBomb; }, [handleArcaneBomb]);

  // ─── Offline earnings (one-shot on mount) ────────────────────────────────
  useEffect(() => {
    const saved = loadGame();
    if (!saved) return;
    const result = computeOfflineEarnings(saved, getIdleCPS, offlineMultiplier);
    if (!result) return;
    const { offlineCoins, soulsEarned, seconds } = result;
    setState((prev) => ({
      ...prev,
      coins: prev.coins + offlineCoins,
      totalCoinsEarned: prev.totalCoinsEarned + offlineCoins,
      souls: prev.souls + soulsEarned,
    }));
    setOfflineEarnings({ coins: offlineCoins, souls: soulsEarned, seconds });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Tap handler ─────────────────────────────────────────────────────────
  const lastTapTimeRef = useRef(Date.now());

  const handleTap = useCallback(
    (x, y, opts = {}) => {
      const bowFlightMs =
        typeof opts.bowFlightMs === "number" && opts.bowFlightMs > 0 ? opts.bowFlightMs : 0;
      lastTapTimeRef.current = Date.now();
      tryProcBuff("tap", stateRef.current);
      setAttackTick((n) => n + 1);

      // Check backstab before computing damage (it boosts the multiplier)
      const backstabActive = heroAbilitiesRef.current?.backstab?.active;
      let tapDamage = getTapDamageRef.current(
        stateRef.current, currentWeaponRef.current, activeBuffsRef.current
      );
      if (backstabActive) {
        tapDamage *= HERO_BY_ID.rogue?.ability?.multiplier ?? 5;
        consumeBackstabHit();
      }

      const applyHit = () => {
        if (!bowFlightMs) {
          setSlashEffects((prev) => [...prev, { id: Date.now() + Math.random(), x, y }]);
          setTimeout(() => setSlashEffects((prev) => prev.slice(1)), 300);
        }
        dealDamage(tapDamage, x, y);
      };

      if (bowFlightMs) setTimeout(applyHit, bowFlightMs);
      else applyHit();
    },
    [dealDamage, tryProcBuff, setAttackTick, setSlashEffects, activeBuffsRef, heroAbilitiesRef, consumeBackstabHit]
  );

  // ─── Upgrade actions ──────────────────────────────────────────────────────
  function getUpgradeLevel(id) {
    return state.upgradeLevels?.[id] || 0;
  }

  const buyUpgrade = useCallback((upgradeId, count = 1) => {
    setState((prev) => {
      const upgrade = UPGRADES.find((u) => u.id === upgradeId);
      if (!upgrade) return prev;
      let level = prev.upgradeLevels[upgradeId] || 0;
      let totalCost = 0;
      let boughtCount = 0;
      for (let i = 0; i < count; i++) {
        const cost = getUpgradeCost(upgrade, level);
        if (prev.coins - totalCost < cost) break;
        totalCost += cost;
        level++;
        boughtCount++;
      }
      if (boughtCount === 0) return prev;
      return {
        ...prev,
        coins: prev.coins - totalCost,
        upgradeLevels: { ...prev.upgradeLevels, [upgradeId]: level },
      };
    });
  }, []);

  // ─── Hero actions ─────────────────────────────────────────────────────────

  /** Recruit a hero for the first time (sets level to 1). */
  const recruitHero = useCallback((heroId) => {
    setState((prev) => {
      const hero = HERO_BY_ID[heroId];
      if (!hero) return prev;
      const alreadyRecruited = (prev.heroes?.[heroId] || 0) >= 1;
      if (alreadyRecruited) return prev;
      const recruitedCount = Object.values(prev.heroes || {}).filter((l) => l >= 1).length;
      if (recruitedCount >= MAX_HEROES) return prev;
      if (prev.coins < hero.unlockCost) return prev;
      return {
        ...prev,
        coins: prev.coins - hero.unlockCost,
        heroes: { ...prev.heroes, [heroId]: 1 },
      };
    });
  }, []);

  /** Level up a recruited hero. */
  const levelHero = useCallback((heroId) => {
    setState((prev) => {
      const hero = HERO_BY_ID[heroId];
      if (!hero) return prev;
      const currentLevel = prev.heroes?.[heroId] || 0;
      if (currentLevel < 1) return prev; // must be recruited first
      const cost = getHeroLevelCost(heroId, currentLevel);
      if (prev.coins < cost) return prev;
      return {
        ...prev,
        coins: prev.coins - cost,
        heroes: { ...prev.heroes, [heroId]: currentLevel + 1 },
      };
    });
  }, []);

  /** Dismiss a hero from the active team. */
  const dismissHero = useCallback((heroId) => {
    setState((prev) => {
      if (!prev.heroes?.[heroId]) return prev;
      const updated = { ...prev.heroes };
      delete updated[heroId];
      return { ...prev, heroes: updated };
    });
  }, []);

  // ─── Village actions ──────────────────────────────────────────────────────
  const upgradeBuilding = useCallback((buildingId) => {
    setState((prev) => {
      const building = VILLAGE_BUILDINGS.find((b) => b.id === buildingId);
      if (!building) return prev;
      const currentLevel = prev.villageBuildings[buildingId] || 0;
      const cost = getBuildingUpgradeCost(building, currentLevel);
      if (!cost || !canAffordUpgrade(cost, prev)) return prev;
      return {
        ...prev,
        coins: prev.coins - cost.coins,
        souls: prev.souls - cost.souls,
        villageBuildings: { ...prev.villageBuildings, [buildingId]: currentLevel + 1 },
      };
    });
  }, []);

  // ─── Skill tree ───────────────────────────────────────────────────────────
  const unlockSkill = useCallback((skillId) => {
    setState((prev) => {
      if (prev.unlockedSkills.includes(skillId)) return prev;
      const skill = SKILLS.find((s) => s.id === skillId);
      if (!skill) return prev;
      const hasPrereqs = skill.requires.every((req) => prev.unlockedSkills.includes(req));
      if (!hasPrereqs || prev.slayerPoints < skill.cost) return prev;
      return {
        ...prev,
        unlockedSkills: [...prev.unlockedSkills, skillId],
        slayerPoints: prev.slayerPoints - skill.cost,
      };
    });
  }, []);

  // ─── Revive / prestige / zone ─────────────────────────────────────────────
  const revive = useCallback(() => {
    setState((prev) => {
      if (prev.souls < 10) return prev;
      return { ...prev, souls: prev.souls - 10, playerHP: prev.playerMaxHP, isDead: false };
    });
  }, []);

  const prestige = useCallback((opts = {}) => {
    const fromDeath = opts.fromDeath === true;
    setState((prev) => {
      const baseSoulsFromRun = getSoulsOnPrestige(prev.totalCoinsEarned);
      const effectiveBaseSouls = baseSoulsFromRun > 0 ? baseSoulsFromRun : fromDeath ? 1 : 0;
      if (effectiveBaseSouls <= 0) return prev;

      const soulMult = getSkillMultipliers(prev.unlockedSkills).soulMultiplier;
      // Apply wizard soulGainBoost passive if wizard is recruited
      const wizardBoost = computeHeroPassives(prev.heroes || {}).soulGainBoost || 0;
      const newSouls = Math.max(1, Math.floor(effectiveBaseSouls * soulMult * (1 + wizardBoost)));
      const newSlayerPoints = getSlayerPointsOnPrestige(prev.souls + newSouls);
      const fresh = defaultState();
      const wp = coerceFiniteNumber(prev.worldProgress, 0);

      const merged = {
        ...fresh,
        worldProgress: wp,
        nextCoinWorldPos: wp + 12,
        souls: prev.souls + newSouls,
        slayerPoints: prev.slayerPoints + newSlayerPoints,
        unlockedSkills: prev.unlockedSkills,
        // Heroes persist through prestige — levels kept
        heroes: prev.heroes || {},
        totalKills: prev.totalKills,
        highestStage: prev.highestStage || 0,
        prestigeCount: (prev.prestigeCount || 0) + 1,
        villageBuildings: prev.villageBuildings || {},
        saveVersion: SAVE_VERSION,
      };
      return sanitizePathScalars(spawnNewEnemy(merged));
    });
  }, []);

  const switchZone = useCallback((zoneId) => {
    setState((prev) => {
      if (!prev.unlockedZoneIds.includes(zoneId)) return prev;
      const zp = prev.zoneProgress[zoneId];
      if (!zp) return prev;
      const switched = {
        ...prev,
        activeZoneId: zoneId,
        stage: zp.stage,
        killCount: zp.killCount,
        highestStage: zp.highestStage,
        isBossActive: false,
        bossWarning: null,
        bossHitsReceived: 0,
        bossFightStartTime: null,
        bossEnrageResetUsed: false,
        worldCoins: [],
        nextCoinWorldPos: (prev.worldProgress ?? 0) + 12,
      };
      return spawnNewEnemy(switched);
    });
  }, []);

  const unlockZone = useCallback((zoneId) => {
    setState((prev) => {
      if (!canUnlockZone(zoneId, prev.unlockedZoneIds, prev.zoneProgress, prev.slayerPoints)) return prev;
      const zone = ZONES.find((z) => z.id === zoneId);
      if (!zone?.unlockRequirement) return prev;
      return {
        ...prev,
        unlockedZoneIds: [...prev.unlockedZoneIds, zoneId],
        slayerPoints: prev.slayerPoints - zone.unlockRequirement.spCost,
      };
    });
  }, []);

  // ─── Prestige preview ─────────────────────────────────────────────────────
  const { soulsOnPrestige, canPrestige, slayerPointsOnPrestige } =
    computePrestigePreview(state);

  // ─── Return shape ─────────────────────────────────────────────────────────
  return {
    state,
    floatingCoins,
    floatingSouls,
    floatingDamage,
    particles,
    enemyDying,
    slashEffects,
    offlineEarnings,
    setOfflineEarnings,
    handleTap,
    buyUpgrade,
    prestige,
    revive,
    canPrestige,
    soulsOnPrestige,
    slayerPointsOnPrestige,
    unlockSkill,
    abilities,
    activateAbility,
    // Hero system
    heroAbilities,
    heroPassives,
    heroDPS,
    recruitHero,
    levelHero,
    dismissHero,
    activateHeroAbility,
    isShieldWallActive,
    getTapDamage: () => getTapDamageRef.current(stateRef.current),
    getIdleCPS:   () => getIdleCPSRef.current(stateRef.current),
    getUpgradeLevel,
    enemyHit,
    currentWeapon,
    setCurrentWeapon,
    switchZone,
    unlockZone,
    activeBuffs,
    upgradeBuilding,
    playerHit,
    attackTick,
    tickWorldCoinCollection,
  };
}
