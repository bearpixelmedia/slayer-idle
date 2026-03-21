import { useState, useEffect, useCallback, useRef } from "react";
import {
  ZONES, STAGES, UPGRADES, TAP_UPGRADES, IDLE_UPGRADES, ALL_UPGRADES, BOW_UPGRADES,
  getUpgradeCost, getEnemyHP, getEnemyReward, getEnemySouls, getSoulsOnPrestige, getSlayerPointsOnPrestige, getBowSoulMultiplier,
  getZoneStages, canUnlockZone, getPackSize
} from "@/lib/gameData";
import { SKILLS, getSkillMultipliers } from "@/lib/skillTree";
import { isBossEncounter, getBossForStage, getBossHP, getBossReward, BOSS_ENCOUNTER_INTERVAL, isBossShieldActive, getBossEnrageMultiplier } from "@/lib/bosses";
import { BUFF_TYPES, PROC_RATES, selectRandomBuff, shouldProcBuff, getBuffMultiplier, BUFF_RULES } from "@/lib/buffs";
import { VILLAGE_BUILDINGS, computeVillageMultipliers, getBuildingUpgradeCost, canAffordUpgrade } from "@/lib/village";

const SAVE_VERSION = 3;

const SAVE_KEY = "idle_slayer_save";

/**
 * getZoneStages(zoneId) returns global STAGES indices (numbers), not stage row objects.
 * Game state `stage` is also a global STAGES index — never index zoneStages[stage] as if stage were local.
 */
function getStageDataForZone(activeZoneId, globalStageIndex) {
  const indices = getZoneStages(activeZoneId);
  const g = indices.includes(globalStageIndex) ? globalStageIndex : indices[0];
  return STAGES[g] || STAGES[0];
}

function loadGame() {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      // Migrate old saves
      if (!data.saveVersion || data.saveVersion < SAVE_VERSION) {
        console.log("Migrating save from v" + (data.saveVersion || 1) + " to v" + SAVE_VERSION);
        return { ...data, saveVersion: SAVE_VERSION };
      }
      return data;
    }
  } catch (e) {
    console.error("Failed to load save:", e);
  }
  return null;
}

function defaultState() {
  return {
    coins: 0,
    totalCoinsEarned: 0,
    souls: 0,
    slayerPoints: 0,
    unlockedSkills: [],
    activeZoneId: "realm_of_light",
    unlockedZoneIds: ["realm_of_light"],
    zoneProgress: {
      "realm_of_light": { stage: 0, highestStage: 0, killCount: 0 },
      "whispering_woods": { stage: 0, highestStage: 0, killCount: 0 },
      "shadowfell_citadel": { stage: 0, highestStage: 0, killCount: 0 },
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
    // Boss warning and mechanic state (transient)
    bossWarning: null, // { bossId, warningEndTime }
    bossHitsReceived: 0, // Track hits for enrage mechanic
    bossFightStartTime: null, // Track elapsed time for shield window mechanic
    bossEnrageResetUsed: false, // Ensure enrage reset threshold triggers once per fight
    villageBuildings: {},
    // Enemy cluster state
    enemyCluster: [], // Array of enemy objects in current cluster
    currentClusterIndex: 0, // Which enemy in cluster is active
  };
}

const ABILITY_CONFIGS = {
  magnet: { duration: 10, cooldown: 45 },
  doubleDamage: { duration: 8, cooldown: 60 },
  autoClicker: { duration: 10, cooldown: 75 },
};

function defaultAbilities() {
  return {
    magnet: { active: false, durationRemaining: 0, cooldownRemaining: 0 },
    doubleDamage: { active: false, durationRemaining: 0, cooldownRemaining: 0 },
    autoClicker: { active: false, durationRemaining: 0, cooldownRemaining: 0 },
  };
}

export default function useGameState({ damageMultiplier = 1, offlineMultiplier = 1, weaponMode = "sword" } = {}) {
  const [state, setState] = useState(() => loadGame() || defaultState());

  // Export setState for external hook usage
  if (typeof window !== "undefined") {
    window.__setGameState = setState;
  }
  const [floatingCoins, setFloatingCoins] = useState([]);
  const [floatingSouls, setFloatingSouls] = useState([]);
  const [floatingDamage, setFloatingDamage] = useState([]);
  const [particles, setParticles] = useState([]);
  const [enemyDying, setEnemyDying] = useState(false);
  const [slashEffects, setSlashEffects] = useState([]);
  const [abilities, setAbilities] = useState(defaultAbilities());
  const [offlineEarnings, setOfflineEarnings] = useState(null);
  const [enemyHit, setEnemyHit] = useState(false);
  const [playerHit, setPlayerHit] = useState(false);
  const [currentWeapon, setCurrentWeapon] = useState(weaponMode);
  const currentWeaponRef = useRef(weaponMode);
  useEffect(() => {
    currentWeaponRef.current = currentWeapon;
  }, [currentWeapon]);
  const [autoWalking, setAutoWalking] = useState(true);
  const autoWalkingRef = useRef(true);
  const [activeBuffs, setActiveBuffs] = useState([]);
  const stateRef = useRef(state);
  stateRef.current = state;
  const abilitiesRef = useRef(abilities);
  abilitiesRef.current = abilities;
  const activeBuffsRef = useRef(activeBuffs);
  activeBuffsRef.current = activeBuffs;
  const lastBuffProcRef = useRef(Date.now());
  const lastTapTimeRef = useRef(Date.now());

  // Save game periodically
  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ ...stateRef.current, lastSave: Date.now(), saveVersion: SAVE_VERSION }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Calculate offline earnings on load
  useEffect(() => {
    const saved = loadGame();
    if (saved && saved.lastSave) {
      const offlineSeconds = Math.min((Date.now() - saved.lastSave) / 1000, 3600 * 8);
      if (offlineSeconds > 10) {
        const idleCPS = getIdleCPS(saved);
        const offlineCoins = Math.floor(idleCPS * offlineSeconds * 0.5 * offlineMultiplier);
        
        // Calculate souls earned (if prestige is available)
        const totalCoinsAfterOffline = saved.totalCoinsEarned + offlineCoins;
        const soulsEarned = Math.max(0, Math.floor(Math.sqrt(totalCoinsAfterOffline / 1000)) - saved.souls);
        
        if (offlineCoins > 0) {
          setState(prev => ({
            ...prev,
            coins: prev.coins + offlineCoins,
            totalCoinsEarned: prev.totalCoinsEarned + offlineCoins,
          }));
          
          setOfflineEarnings({
            coins: offlineCoins,
            souls: soulsEarned,
            seconds: offlineSeconds,
          });
        }
      }
    }
  }, [offlineMultiplier]);

  function getUpgradeLevel(id) {
    return state.upgradeLevels[id] || 0;
  }

  // Memoize getTapDamage calculation
  const getTapDamage = useCallback((s = state, weapon = currentWeapon, buffs = activeBuffs) => {
    if (!s || typeof s !== 'object') return 1;
    let damage = 1;
    const upgradeLevels = s.upgradeLevels || {};
    Array.isArray(UPGRADES) && UPGRADES.forEach(u => {
      if (!u?.id) return;
      const level = upgradeLevels[u.id] || 0;
      if (level > 0 && TAP_UPGRADES.includes(u.id)) {
        damage += (u.basePower || 0) * level;
      }
      if (level > 0 && ALL_UPGRADES.includes(u.id)) {
        damage += (u.basePower || 0) * level * 0.3;
      }
    });
    const souls = typeof s.souls === 'number' ? s.souls : 0;
    const soulBonus = 1 + (souls * 0.05);
    const skillMults = getSkillMultipliers(Array.isArray(s.unlockedSkills) ? s.unlockedSkills : []) || { damageMultiplier: 1 };
    const villageMultipliers = computeVillageMultipliers(s.villageBuildings || {}) || { tapDamageMultiplier: 1 };
    const buffMult = getBuffMultiplier(Array.isArray(buffs) ? buffs : [], "tapDamageMultiplier");
    return Math.floor(damage * soulBonus * damageMultiplier * (skillMults?.damageMultiplier || 1) * (villageMultipliers?.tapDamageMultiplier || 1) * buffMult);
  }, [damageMultiplier, state, currentWeapon, activeBuffs]);

  // Memoize getIdleCPS calculation
  const getIdleCPS = useCallback((s = state) => {
    if (!s || typeof s !== 'object') return 0;
    let cps = 0;
    const upgradeLevels = s.upgradeLevels || {};
    Array.isArray(UPGRADES) && UPGRADES.forEach(u => {
      if (!u?.id) return;
      const level = upgradeLevels[u.id] || 0;
      if (level > 0 && IDLE_UPGRADES.includes(u.id)) {
        cps += (u.basePower || 0) * level;
      }
      if (level > 0 && ALL_UPGRADES.includes(u.id)) {
        cps += (u.basePower || 0) * level * 0.5;
      }
    });
    const souls = typeof s.souls === 'number' ? s.souls : 0;
    const soulBonus = 1 + (souls * 0.05);
    const skillMults = getSkillMultipliers(Array.isArray(s.unlockedSkills) ? s.unlockedSkills : []) || { idleMultiplier: 1 };
    const villageMultipliers = computeVillageMultipliers(s.villageBuildings || {}) || { coinMultiplier: 1 };
    return Math.floor(cps * soulBonus * damageMultiplier * (skillMults?.idleMultiplier || 1) * (villageMultipliers?.coinMultiplier || 1));
  }, [damageMultiplier, state]);

  function applyRewardMultipliers(coins, souls, s = state, buffs = activeBuffs) {
    if (!s || typeof s !== 'object') return { coins: 0, souls: 0 };
    const skillMults = getSkillMultipliers(Array.isArray(s.unlockedSkills) ? s.unlockedSkills : []) || { coinDropMultiplier: 1, soulMultiplier: 1 };
    const villageMultipliers = computeVillageMultipliers(s.villageBuildings || {}) || { coinMultiplier: 1, soulMultiplier: 1 };
    const buffCoinMult = getBuffMultiplier(Array.isArray(buffs) ? buffs : [], "coinMultiplier");
    const buffSoulMult = getBuffMultiplier(Array.isArray(buffs) ? buffs : [], "soulMultiplier");
    const coinAfterMultiplier = Math.floor(coins * (skillMults?.coinDropMultiplier || 1) * (villageMultipliers?.coinMultiplier || 1) * buffCoinMult);
    const soulsAfterMultiplier = Math.floor(souls * (skillMults?.soulMultiplier || 1) * (villageMultipliers?.soulMultiplier || 1) * buffSoulMult);
    return { coins: coinAfterMultiplier, souls: soulsAfterMultiplier };
  }

  // Buff proc helper
  const tryProcBuff = useCallback((source, s = state) => {
    const now = Date.now();
    const timeSinceLastProc = now - lastBuffProcRef.current;
    
    if (timeSinceLastProc < BUFF_RULES.globalCooldown * 1000) {
      return;
    }

    let procRate = 0;
    if (source === "tap") procRate = PROC_RATES.tap;
    else if (source === "kill") procRate = PROC_RATES.kill;
    else if (source === "idle") procRate = PROC_RATES.idle;

    if (!shouldProcBuff(procRate)) return;

    const buff = selectRandomBuff();
    const existingBuff = activeBuffsRef.current.find(b => b.id === buff.id);

    if (existingBuff) {
      // Extend duration (capped at +50%)
      const extension = Math.min(buff.duration * BUFF_RULES.maxDurationExtension, buff.duration * 0.5);
      existingBuff.endTime = Math.min(existingBuff.endTime + extension * 1000, now + buff.duration * 1000 * 1.5);
    } else {
      // Only add if under max concurrent
      if (activeBuffsRef.current.length < BUFF_RULES.maxConcurrent) {
        setActiveBuffs(prev => [...prev, {
          id: buff.id,
          name: buff.name,
          icon: buff.icon,
          effects: buff.effects,
          duration: buff.duration,
          startTime: now,
          endTime: now + buff.duration * 1000,
        }]);
      }
    }

    lastBuffProcRef.current = now;
  }, []);

  function spawnNewEnemy(s) {
    const boss = getBossForStage(s.stage) || null;
    const warningActive = s.bossWarning && Date.now() < s.bossWarning.warningEndTime;
    const warningForCurrentBoss = s.bossWarning && boss && s.bossWarning.bossId === boss?.id;
    const shouldEncounterBoss = Boolean(boss && isBossEncounter(s.killCount));

    // Boss encounter has a gated warning phase first, then boss spawn.
    if (shouldEncounterBoss && warningForCurrentBoss && !warningActive) {
        const hp = getBossHP(s.stage, s.killCount);
        return {
          ...s,
          enemyHP: hp,
          enemyMaxHP: hp,
          currentEnemyName: boss.name,
          isBossActive: true,
          bossHitsReceived: 0,
          bossFightStartTime: Date.now(),
          bossEnrageResetUsed: false,
          bossWarning: null, // Clear warning once boss spawns
          enemyCluster: [],
          currentClusterIndex: 0,
        };
    }

    const stageData = getStageDataForZone(s.activeZoneId, s.stage);
    const packSizeLevel = s.upgradeLevels?.pack_size || 0;
    const packSize = getPackSize(packSizeLevel);
    
    // Generate cluster of 1 or packSize enemies
    const useCluster = Math.random() < 0.7; // 70% chance for cluster
    const clusterSize = useCluster ? packSize : 1;
    const cluster = Array.from({ length: clusterSize }).map(() => {
      const enemyName = stageData.enemies[Math.floor(Math.random() * stageData.enemies.length)];
      return {
        name: enemyName,
        hp: getEnemyHP(s.stage, s.killCount),
        maxHp: getEnemyHP(s.stage, s.killCount),
      };
    });

    // Set first enemy as active
    const activeEnemy = cluster[0];

    let nextBossWarning = s.bossWarning || null;
    if (shouldEncounterBoss && boss && !warningForCurrentBoss) {
      nextBossWarning = {
        bossId: boss.id,
        warningEndTime: Date.now() + 4000, // 4 second warning gate
      };
    }
    
    return {
      ...s,
      enemyHP: activeEnemy.hp,
      enemyMaxHP: activeEnemy.maxHp,
      currentEnemyName: activeEnemy.name,
      isBossActive: false,
      bossHitsReceived: 0,
      bossFightStartTime: null,
      bossEnrageResetUsed: false,
      bossWarning: nextBossWarning,
      enemyCluster: cluster,
      currentClusterIndex: 0,
    };
  }

  // Consolidated tick loop - abilities, buffs, and idle proc
  useEffect(() => {
    let tickCounter = 0;
    const interval = setInterval(() => {
      tickCounter++;
      
      // Ability tick every 1 second
      if (tickCounter % 10 === 0) {
        setAbilities(prev => {
          const next = { ...prev };
          let changed = false;
          Object.keys(next).forEach(id => {
            const a = { ...next[id] };
            if (a.active && a.durationRemaining > 0) {
              a.durationRemaining = Math.max(0, a.durationRemaining - 1);
              if (a.durationRemaining === 0) {
                a.active = false;
                a.cooldownRemaining = ABILITY_CONFIGS[id].cooldown;
              }
              changed = true;
            } else if (!a.active && a.cooldownRemaining > 0) {
              a.cooldownRemaining = Math.max(0, a.cooldownRemaining - 1);
              changed = true;
            }
            next[id] = a;
          });
          return changed ? next : prev;
        });
      }
      
      // Buff cleanup every 100ms
      if (tickCounter % 1 === 0) {
        const now = Date.now();
        setActiveBuffs(prev => prev.filter(buff => buff.endTime > now));
      }
      
      // Buff proc on idle tick every 1 second
      if (tickCounter % 10 === 0) {
        tryProcBuff("idle", stateRef.current);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [tryProcBuff]);

  // If a warning is active and expires, spawn the pending boss immediately.
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        if (!prev.bossWarning) return prev;
        if (Date.now() < prev.bossWarning.warningEndTime) return prev;
        return spawnNewEnemy(prev);
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Magnet ability: award bonus coins every second while active
  useEffect(() => {
    let magnetCounter = 0;
    const interval = setInterval(() => {
      magnetCounter++;
      if (!abilitiesRef.current.magnet.active) return;
      if (magnetCounter % 10 !== 0) return; // Only trigger every 1 second
      
      const cps = getIdleCPS(stateRef.current);
      const bonus = Math.max(10, cps * 3);
      setState(prev => ({
        ...prev,
        coins: prev.coins + bonus,
        totalCoinsEarned: prev.totalCoinsEarned + bonus,
      }));
      setFloatingCoins(fc => [...fc, { id: Date.now() + Math.random(), amount: bonus, x: 30 + Math.random() * 40, y: 30 + Math.random() * 30 }]);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const activateAbility = useCallback((id) => {
    setAbilities(prev => {
      const a = prev[id];
      if (!a || a.active || a.cooldownRemaining > 0) return prev;
      if (!ABILITY_CONFIGS[id]) return prev;
      return {
        ...prev,
        [id]: { active: true, durationRemaining: ABILITY_CONFIGS[id].duration, cooldownRemaining: 0 },
      };
    });
  }, []);

  // Removed - now uses soundManager for audio playback

  const dealDamage = useCallback((damage, x, y) => {
    setEnemyHit(true);
    setTimeout(() => setEnemyHit(false), 150);
    
    const multiplier = abilitiesRef.current.doubleDamage.active ? 2 : 1;
    const finalDamage = damage * multiplier;
    const isCritical = multiplier > 1;

    // Spawn particles for critical hits
    if (isCritical) {
      const particleCount = 8;
      const newParticles = Array.from({ length: particleCount }).map((_, i) => ({
        id: Date.now() + Math.random() + i,
        x,
        y,
        emoji: "⚡",
        angle: (360 / particleCount) * i,
        distance: 60 + Math.random() * 30,
        duration: 0.6,
      }));
      setParticles(prev => [...prev, ...newParticles]);
    }

    setState(prev => {
      if (prev.bossWarning && Date.now() < prev.bossWarning.warningEndTime) {
        return prev;
      }

      // Apply boss mechanics during combat
       let adjustedDamage = finalDamage;
       let newBossHits = prev.bossHitsReceived;
       let bossEnrageResetUsed = prev.bossEnrageResetUsed;

       if (prev.isBossActive) {
         const boss = getBossForStage(prev.stage) || null;

         // Check shield window (mechanic: shield_window)
         if (boss && boss.mechanic?.type === "shield_window") {
          const elapsedMs = Date.now() - (prev.bossFightStartTime || Date.now());
          if (isBossShieldActive(elapsedMs, boss)) {
            adjustedDamage = Math.ceil(finalDamage * (1 - boss.mechanic.damageReduction));
          }
        }
        
        // Track hits for enrage stacks
        newBossHits = prev.bossHitsReceived + 1;
        
        // Check enrage (mechanic: enrage)
        if (boss && boss.mechanic.type === "enrage") {
          const enrageMultiplier = getBossEnrageMultiplier(newBossHits, boss);
          // Boss damage is applied to player later
        }
        
        // Check thorns (mechanic: thorns) - reflects damage to player
        if (boss && boss.mechanic.type === "thorns") {
          // Thorns damage will be applied to player HP
        }
      }

      // Enemy damage to player
      let playerDamage = prev.isBossActive ? 3 : 1;

      if (prev.isBossActive) {
        const boss = getBossForStage(prev.stage) || null;

        // Apply enrage multiplier to incoming damage
        if (boss && boss.mechanic?.type === "enrage") {
          const enrageMultiplier = getBossEnrageMultiplier(newBossHits, boss);
          playerDamage = Math.ceil(playerDamage * enrageMultiplier);
        }
        
        // Apply thorns reflection
        if (boss && boss.mechanic?.type === "thorns") {
          const thornsDamage = Math.ceil(finalDamage * boss.mechanic.reflectPct);
          playerDamage += thornsDamage;
        }
      }
      
      const newPlayerHP = prev.playerHP - playerDamage;

      if (playerDamage > 0) {
        setPlayerHit(true);
        setTimeout(() => setPlayerHit(false), 150);
      }

      if (newPlayerHP <= 0) {
        return { ...prev, playerHP: 0, isDead: true };
      }

      const newHP = prev.enemyHP - adjustedDamage;

      if (prev.isBossActive) {
        const boss = getBossForStage(prev.stage) || null;
        if (
          boss &&
          boss.mechanic?.type === "enrage" &&
          !bossEnrageResetUsed &&
          typeof boss.mechanic?.resetThreshold === "number" &&
          newHP > 0 &&
          newHP <= prev.enemyMaxHP * boss.mechanic.resetThreshold
        ) {
          newBossHits = 0;
          bossEnrageResetUsed = true;
        }
      }
      
      if (newHP <= 0) {
        let coinReward = 0;
        let soulReward = 0;

        // Boss encounter
        if (prev.isBossActive) {
          const bossRewards = getBossReward(prev.stage);
          const soulBonus = 1 + (prev.souls * 0.05);
          coinReward = Math.floor(bossRewards.coins * soulBonus);
          soulReward = bossRewards.souls;
        } else {
          // Normal enemy - base soul drops with zone bias
          const baseSouls = getEnemySouls(prev.stage);
          const stageMeta = getStageDataForZone(prev.activeZoneId, prev.stage);
          const stageBias = stageMeta?.soulBias || 1;
          const soulBonus = 1 + (prev.souls * 0.05);
          const bowLevel = prev.upgradeLevels?.bow || 0;
          const bowBonus =
            currentWeaponRef.current === "bow" ? getBowSoulMultiplier(bowLevel) : 1;
          soulReward = baseSouls * stageBias * bowBonus;
          
          const reward = getEnemyReward(prev.stage, prev.killCount);
          coinReward = Math.floor(reward * soulBonus);
        }
        
        // Apply skill tree multipliers to rewards
        const { coins: finalCoins, souls: finalSouls } = applyRewardMultipliers(coinReward, soulReward, prev, activeBuffsRef.current);
        
        // Buff proc on kill
        tryProcBuff("kill", prev);
        
        setFloatingCoins(fc => [...fc, { id: Date.now() + Math.random(), amount: finalCoins, x, y }]);
        setFloatingDamage(fd => [...fd, { id: Date.now() + Math.random(), amount: finalDamage, x, y, isCritical }]);
        
        // Show soul drops separately
        if (finalSouls > 0) {
          setFloatingSouls(fs => [...fs, { id: Date.now() + Math.random() * 0.1, amount: finalSouls, x: x + 15, y }]);
        }
        
        // Spawn extra particles for boss kills
        const particleCount = prev.isBossActive ? 12 : 6;
        const coinParticles = Array.from({ length: particleCount }).map((_, i) => ({
          id: Date.now() + Math.random() + i,
          x,
          y,
          emoji: prev.isBossActive ? "⭐" : "✨",
          angle: (360 / particleCount) * i,
          distance: 50 + Math.random() * 30,
          duration: 0.8,
        }));
        setParticles(prev => [...prev, ...coinParticles]);

        setEnemyDying(true);
        setTimeout(() => setEnemyDying(false), 300);
        
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
          highestStage: Math.max(zoneProgress[prev.activeZoneId].highestStage, newStage),
          killCount: newKillCount,
        };
        
        // If boss was defeated and it has enrage mechanic, reset HP at 50% check
         let bossHitsToTrack = newBossHits;
         if (prev.isBossActive) {
           const boss = getBossForStage(prev.stage) || null;
           if (boss && boss.mechanic?.type === "enrage") {
             // Reset enrage stacks for next boss fight
             bossHitsToTrack = 0;
           }
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
        
        return spawnNewEnemy(newState);
      }
      
      return {
        ...prev,
        enemyHP: newHP,
        playerHP: newPlayerHP,
        bossHitsReceived: newBossHits,
        bossEnrageResetUsed,
      };
    });
  }, []);

  const handleTap = useCallback((x, y) => {
    lastTapTimeRef.current = Date.now();
    tryProcBuff("tap", stateRef.current);
    
    const damage = getTapDamage(stateRef.current, currentWeaponRef.current, activeBuffsRef.current);
    // Note: double damage multiplier is applied inside dealDamage via abilitiesRef
    
    setSlashEffects(prev => [...prev, { id: Date.now() + Math.random(), x, y }]);
    setTimeout(() => {
      setSlashEffects(prev => prev.slice(1));
    }, 300);
    
    dealDamage(damage, x, y);
  }, [dealDamage, tryProcBuff]);

  // Consolidated attack loop - idle, auto-clicker, auto-walk
  useEffect(() => {
    let tickCounter = 0;
    const interval = setInterval(() => {
      tickCounter++;
      
      // Idle damage every 10 ticks (1000ms)
      if (tickCounter % 10 === 0) {
        const cps = getIdleCPS(stateRef.current);
        if (cps > 0) {
          dealDamage(Math.max(1, Math.floor(cps / 2)), 50 + Math.random() * 20, 50 + Math.random() * 20);
        }
      }
      
      // Auto-clicker every 5 ticks (500ms)
      if (tickCounter % 5 === 0 && abilitiesRef.current?.autoClicker?.active) {
        const damage = getTapDamage(stateRef.current, currentWeaponRef.current, activeBuffsRef.current);
        dealDamage(damage, 65 + Math.random() * 20, 40 + Math.random() * 30);
      }
      
      // Auto-walk every 6 ticks (600ms)
      if (tickCounter % 6 === 0 && autoWalkingRef.current && !stateRef.current.isDead) {
        const damage = getTapDamage(stateRef.current, currentWeaponRef.current, activeBuffsRef.current);
        dealDamage(damage, 65 + Math.random() * 10, 50 + Math.random() * 10);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [dealDamage]);

  // Clean up floating coins, souls, damage numbers, and particles (batch cleanup)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setFloatingCoins(prev => prev.filter(c => now - c.id < 1000));
      setFloatingSouls(prev => prev.filter(s => now - s.id < 1000));
      setFloatingDamage(prev => prev.filter(d => now - d.id < 800));
      setParticles(prev => prev.filter(p => now - p.id < 1000));
      setSlashEffects(prev => prev.slice(Math.max(0, prev.length - 1)));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const buyUpgrade = useCallback((upgradeId, count = 1) => {
    setState(prev => {
      const upgrade = UPGRADES.find(u => u.id === upgradeId);
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

  const upgradeBuilding = useCallback((buildingId) => {
    setState(prev => {
      const building = VILLAGE_BUILDINGS.find(b => b.id === buildingId);
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

  const unlockSkill = useCallback((skillId) => {
    setState(prev => {
      if (prev.unlockedSkills.includes(skillId)) return prev;
      
      const skill = SKILLS.find(s => s.id === skillId);
      if (!skill) return prev;
      
      // Check prerequisites and SP availability
      const hasPrereqs = skill.requires.every(req => prev.unlockedSkills.includes(req));
      if (!hasPrereqs || prev.slayerPoints < skill.cost) return prev;
      
      // Atomic: deduct SP and add skill
      return {
        ...prev,
        unlockedSkills: [...prev.unlockedSkills, skillId],
        slayerPoints: prev.slayerPoints - skill.cost,
      };
    });
  }, []);

  const revive = useCallback(() => {
    setState(prev => {
      const reviveCost = 10;
      if (prev.souls < reviveCost) return prev;
      return {
        ...prev,
        souls: prev.souls - reviveCost,
        playerHP: prev.playerMaxHP,
        isDead: false,
      };
    });
  }, []);

  const prestige = useCallback(() => {
    setState(prev => {
      const baseSoulsFromRun = getSoulsOnPrestige(prev.totalCoinsEarned);
      if (baseSoulsFromRun <= 0) return prev;

      const soulMult = getSkillMultipliers(prev.unlockedSkills).soulMultiplier;
      const newSouls = Math.max(1, Math.floor(baseSoulsFromRun * soulMult));

      const newSlayerPoints = getSlayerPointsOnPrestige(prev.souls + newSouls);
      const fresh = defaultState();
      return {
        ...fresh,
        souls: prev.souls + newSouls,
        slayerPoints: prev.slayerPoints + newSlayerPoints,
        unlockedSkills: prev.unlockedSkills, // PERSIST skill unlocks
        totalKills: prev.totalKills,
        highestStage: prev.highestStage || 0,
        prestigeCount: (prev.prestigeCount || 0) + 1,
        villageBuildings: prev.villageBuildings || {},
        saveVersion: SAVE_VERSION,
      };
    });
  }, []);

  const baseSoulsOnPrestige = getSoulsOnPrestige(state.totalCoinsEarned);
  const prestigeSoulMult = (getSkillMultipliers(state.unlockedSkills) || { soulMultiplier: 1 }).soulMultiplier;
  const soulsOnPrestige =
    baseSoulsOnPrestige > 0
      ? Math.max(1, Math.floor(baseSoulsOnPrestige * prestigeSoulMult))
      : 0;
  const canPrestige = baseSoulsOnPrestige > 0;
  const slayerPointsOnPrestige = getSlayerPointsOnPrestige(state.souls + soulsOnPrestige);

  const switchZone = useCallback((zoneId) => {
    setState(prev => {
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
      };
      return spawnNewEnemy(switched);
    });
  }, []);

  const unlockZone = useCallback((zoneId) => {
    setState(prev => {
      if (!canUnlockZone(zoneId, prev.unlockedZoneIds, prev.zoneProgress, prev.slayerPoints)) return prev;
      
      const zone = ZONES.find(z => z.id === zoneId);
      if (!zone?.unlockRequirement) return prev;

      return {
        ...prev,
        unlockedZoneIds: [...prev.unlockedZoneIds, zoneId],
        slayerPoints: prev.slayerPoints - zone.unlockRequirement.spCost,
      };
    });
  }, []);

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
    getTapDamage: () => getTapDamage(),
    getIdleCPS: () => getIdleCPS(),
    getUpgradeLevel,
    enemyHit,
    currentWeapon,
    setCurrentWeapon,
    switchZone,
    unlockZone,
    activeBuffs,
    upgradeBuilding,
    autoWalking,
    setAutoWalking,
    playerHit,
  };
}