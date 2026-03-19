import { useState, useEffect, useCallback, useRef } from "react";
import {
  STAGES, UPGRADES, TAP_UPGRADES, IDLE_UPGRADES, ALL_UPGRADES, BOW_UPGRADES,
  getUpgradeCost, getEnemyHP, getEnemyReward, getEnemySouls, getSoulsOnPrestige, getSlayerPointsOnPrestige, getBowSoulMultiplier
} from "@/lib/gameData";
import { SKILLS, getSkillMultipliers } from "@/lib/skillTree";
import { isBossEncounter, getBossForStage, getBossHP, getBossReward } from "@/lib/bosses";

const SAVE_VERSION = 2;

const SAVE_KEY = "idle_slayer_save";

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
  const [floatingCoins, setFloatingCoins] = useState([]);
  const [floatingSouls, setFloatingSouls] = useState([]);
  const [floatingDamage, setFloatingDamage] = useState([]);
  const [particles, setParticles] = useState([]);
  const [enemyDying, setEnemyDying] = useState(false);
  const [slashEffects, setSlashEffects] = useState([]);
  const [abilities, setAbilities] = useState(defaultAbilities());
  const [offlineEarnings, setOfflineEarnings] = useState(null);
  const [enemyHit, setEnemyHit] = useState(false);
  const [currentWeapon, setCurrentWeapon] = useState(weaponMode);
  const stateRef = useRef(state);
  stateRef.current = state;
  const abilitiesRef = useRef(abilities);
  abilitiesRef.current = abilities;

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

  function getTapDamage(s = state) {
    let damage = 1;
    UPGRADES.forEach(u => {
      const level = s.upgradeLevels[u.id] || 0;
      if (level > 0 && TAP_UPGRADES.includes(u.id)) {
        damage += u.basePower * level;
      }
      if (level > 0 && ALL_UPGRADES.includes(u.id)) {
        damage += u.basePower * level * 0.3;
      }
    });
    const soulBonus = 1 + (s.souls * 0.05);
    const skillMults = getSkillMultipliers(s.unlockedSkills);
    return Math.floor(damage * soulBonus * damageMultiplier * skillMults.damageMultiplier);
  }

  function getIdleCPS(s = state) {
    let cps = 0;
    UPGRADES.forEach(u => {
      const level = s.upgradeLevels[u.id] || 0;
      if (level > 0 && IDLE_UPGRADES.includes(u.id)) {
        cps += u.basePower * level;
      }
      if (level > 0 && ALL_UPGRADES.includes(u.id)) {
        cps += u.basePower * level * 0.5;
      }
    });
    const soulBonus = 1 + (s.souls * 0.05);
    const skillMults = getSkillMultipliers(s.unlockedSkills);
    return Math.floor(cps * soulBonus * damageMultiplier * skillMults.idleMultiplier);
  }

  function applyRewardMultipliers(coins, souls, s = state) {
    const skillMults = getSkillMultipliers(s.unlockedSkills);
    const coinAfterMultiplier = Math.floor(coins * skillMults.coinDropMultiplier);
    const soulsAfterMultiplier = Math.floor(souls * skillMults.soulMultiplier);
    return { coins: coinAfterMultiplier, souls: soulsAfterMultiplier };
  }

  function spawnNewEnemy(s) {
    // Check if next enemy should be a boss
    if (isBossEncounter(s.killCount + 1)) {
      const boss = getBossForStage(s.stage);
      if (boss) {
        const hp = getBossHP(s.stage, s.killCount);
        return { ...s, enemyHP: hp, enemyMaxHP: hp, currentEnemyName: boss.name, isBossActive: true };
      }
    }

    const stageData = STAGES[s.stage];
    const enemyName = stageData.enemies[Math.floor(Math.random() * stageData.enemies.length)];
    const hp = getEnemyHP(s.stage, s.killCount);
    return { ...s, enemyHP: hp, enemyMaxHP: hp, currentEnemyName: enemyName, isBossActive: false };
  }

  // Ability tick — runs every second
  useEffect(() => {
    const interval = setInterval(() => {
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
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Magnet ability: award bonus coins every second while active
  useEffect(() => {
    const interval = setInterval(() => {
      if (!abilitiesRef.current.magnet.active) return;
      const cps = getIdleCPS(stateRef.current);
      const bonus = Math.max(10, cps * 3);
      setState(prev => ({
        ...prev,
        coins: prev.coins + bonus,
        totalCoinsEarned: prev.totalCoinsEarned + bonus,
      }));
      setFloatingCoins(fc => [...fc, { id: Date.now() + Math.random(), amount: bonus, x: 30 + Math.random() * 40, y: 30 + Math.random() * 30 }]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const activateAbility = useCallback((id) => {
    setAbilities(prev => {
      const a = prev[id];
      if (a.active || a.cooldownRemaining > 0) return prev;
      return {
        ...prev,
        [id]: { active: true, durationRemaining: ABILITY_CONFIGS[id].duration, cooldownRemaining: 0 },
      };
    });
  }, []);

  const playSound = useCallback((type) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    
    if (type === "hit") {
      oscillator.frequency.value = 400;
      gain.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } else if (type === "critical") {
      oscillator.frequency.value = 600;
      gain.gain.setValueAtTime(0.2, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    }
  }, []);

  const dealDamage = useCallback((damage, x, y) => {
    setEnemyHit(true);
    setTimeout(() => setEnemyHit(false), 150);
    
    const multiplier = abilitiesRef.current.doubleDamage.active ? 2 : 1;
    const finalDamage = damage * multiplier;
    const isCritical = multiplier > 1;
    
    playSound(isCritical ? "critical" : "hit");

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
      // Enemy damage to player
      const playerDamage = prev.isBossActive ? 3 : 1;
      const newPlayerHP = prev.playerHP - playerDamage;
      
      if (newPlayerHP <= 0) {
        return { ...prev, playerHP: 0, isDead: true };
      }

      const newHP = prev.enemyHP - finalDamage;
      
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
          const baseSouls = getEnemySouls(prev.stage, prev.killCount);
          const stageBias = STAGES[prev.stage]?.soulBias || 1;
          const soulBonus = 1 + (prev.souls * 0.05);
          soulReward = baseSouls * stageBias;
          
          const reward = getEnemyReward(prev.stage, prev.killCount);
          coinReward = Math.floor(reward * soulBonus);
        }
        
        // Apply skill tree multipliers to rewards
        const { coins: finalCoins, souls: finalSouls } = applyRewardMultipliers(coinReward, soulReward, prev);
        
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
        
        if (newKillCount > 0 && newKillCount % 25 === 0 && prev.stage < STAGES.length - 1) {
          newStage = prev.stage + 1;
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
          playerHP: prev.playerMaxHP,
        };
        
        return spawnNewEnemy(newState);
      }
      
      return { ...prev, enemyHP: newHP, playerHP: newPlayerHP };
    });
  }, []);

  const handleTap = useCallback((x, y) => {
    const damage = getTapDamage(stateRef.current);
    // Note: double damage multiplier is applied inside dealDamage via abilitiesRef
    
    setSlashEffects(prev => [...prev, { id: Date.now() + Math.random(), x, y }]);
    setTimeout(() => {
      setSlashEffects(prev => prev.slice(1));
    }, 300);
    
    dealDamage(damage, x, y);
  }, [dealDamage]);

  // Idle damage tick
  useEffect(() => {
    const interval = setInterval(() => {
      const cps = getIdleCPS(stateRef.current);
      if (cps > 0) {
        dealDamage(Math.max(1, Math.floor(cps / 2)), 50 + Math.random() * 20, 50 + Math.random() * 20);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [dealDamage]);

  // Auto-clicker ability: deal tap damage every 0.5 seconds while active
  useEffect(() => {
    const interval = setInterval(() => {
      if (!abilitiesRef.current?.autoClicker?.active) return;
      const damage = getTapDamage(stateRef.current);
      dealDamage(damage, 65 + Math.random() * 20, 40 + Math.random() * 30);
    }, 500);
    return () => clearInterval(interval);
  }, [dealDamage]);

  // Clean up floating coins, souls, damage numbers, and particles
  useEffect(() => {
    const interval = setInterval(() => {
      setFloatingCoins(prev => prev.filter(c => Date.now() - c.id < 1000));
      setFloatingSouls(prev => prev.filter(s => Date.now() - s.id < 1000));
      setFloatingDamage(prev => prev.filter(d => Date.now() - d.id < 800));
      setParticles(prev => prev.filter(p => Date.now() - p.id < 1000));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const buyUpgrade = useCallback((upgradeId) => {
    setState(prev => {
      const upgrade = UPGRADES.find(u => u.id === upgradeId);
      const level = prev.upgradeLevels[upgradeId] || 0;
      const cost = getUpgradeCost(upgrade, level);
      
      if (prev.coins < cost) return prev;
      
      return {
        ...prev,
        coins: prev.coins - cost,
        upgradeLevels: { ...prev.upgradeLevels, [upgradeId]: level + 1 },
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
        saveVersion: SAVE_VERSION,
      };
    });
  }, []);

  const baseSoulsOnPrestige = getSoulsOnPrestige(state.totalCoinsEarned);
  const prestigeSoulMult = getSkillMultipliers(state.unlockedSkills).soulMultiplier;
  const soulsOnPrestige =
    baseSoulsOnPrestige > 0
      ? Math.max(1, Math.floor(baseSoulsOnPrestige * prestigeSoulMult))
      : 0;
  const canPrestige = baseSoulsOnPrestige > 0;
  const slayerPointsOnPrestige = getSlayerPointsOnPrestige(state.souls + soulsOnPrestige);

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
    getTapDamage: () => getTapDamage(state),
    getIdleCPS: () => getIdleCPS(state),
    getUpgradeLevel,
    enemyHit,
  };
}