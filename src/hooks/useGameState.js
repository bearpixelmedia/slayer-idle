import { useState, useEffect, useCallback, useRef } from "react";
import {
  STAGES, UPGRADES, TAP_UPGRADES, IDLE_UPGRADES, ALL_UPGRADES,
  getUpgradeCost, getEnemyHP, getEnemyReward, getSoulsOnPrestige
} from "@/lib/gameData";

const SAVE_KEY = "idle_slayer_save";

function loadGame() {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return null;
}

function defaultState() {
  return {
    coins: 0,
    totalCoinsEarned: 0,
    souls: 0,
    stage: 0,
    highestStage: 0,
    killCount: 0,
    totalKills: 0,
    prestigeCount: 0,
    upgradeLevels: {},
    enemyHP: getEnemyHP(0, 0),
    enemyMaxHP: getEnemyHP(0, 0),
    currentEnemyName: STAGES[0].enemies[0],
    lastSave: Date.now(),
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
  };
}

export default function useGameState({ damageMultiplier = 1, offlineMultiplier = 1 } = {}) {
  const [state, setState] = useState(() => loadGame() || defaultState());
  const [floatingCoins, setFloatingCoins] = useState([]);
  const [particles, setParticles] = useState([]);
  const [enemyDying, setEnemyDying] = useState(false);
  const [slashEffects, setSlashEffects] = useState([]);
  const [abilities, setAbilities] = useState(defaultAbilities());
  const [offlineEarnings, setOfflineEarnings] = useState(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const abilitiesRef = useRef(abilities);
  abilitiesRef.current = abilities;

  // Save game periodically
  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ ...stateRef.current, lastSave: Date.now() }));
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
    return Math.floor(damage * soulBonus * damageMultiplier);
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
    return Math.floor(cps * soulBonus * damageMultiplier);
  }

  function spawnNewEnemy(s) {
    const stageData = STAGES[s.stage];
    const enemyName = stageData.enemies[Math.floor(Math.random() * stageData.enemies.length)];
    const hp = getEnemyHP(s.stage, s.killCount);
    return { ...s, enemyHP: hp, enemyMaxHP: hp, currentEnemyName: enemyName };
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

  const dealDamage = useCallback((damage, x, y) => {
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
      const newHP = prev.enemyHP - finalDamage;
      
      if (newHP <= 0) {
        const reward = getEnemyReward(prev.stage, prev.killCount);
        const soulBonus = 1 + (prev.souls * 0.05);
        const totalReward = Math.floor(reward * soulBonus);
        
        setFloatingCoins(fc => [...fc, { id: Date.now() + Math.random(), amount: totalReward, x, y }]);
        
        // Spawn coin particles
        const coinParticles = Array.from({ length: 6 }).map((_, i) => ({
          id: Date.now() + Math.random() + i,
          x,
          y,
          emoji: "✨",
          angle: (360 / 6) * i,
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
          coins: prev.coins + totalReward,
          totalCoinsEarned: prev.totalCoinsEarned + totalReward,
          killCount: newKillCount,
          totalKills: prev.totalKills + 1,
          stage: newStage,
          highestStage: Math.max(prev.highestStage || 0, newStage),
        };
        
        return spawnNewEnemy(newState);
      }
      
      return { ...prev, enemyHP: newHP };
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
      if (!abilitiesRef.current.autoClicker.active) return;
      const damage = getTapDamage(stateRef.current);
      dealDamage(damage, 65 + Math.random() * 20, 40 + Math.random() * 30);
    }, 500);
    return () => clearInterval(interval);
  }, [dealDamage]);

  // Clean up floating coins and particles
  useEffect(() => {
    const interval = setInterval(() => {
      setFloatingCoins(prev => prev.filter(c => Date.now() - c.id < 1000));
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

  const prestige = useCallback(() => {
    setState(prev => {
      const newSouls = getSoulsOnPrestige(prev.totalCoinsEarned);
      if (newSouls <= 0) return prev;
      
      const fresh = defaultState();
      return {
        ...fresh,
        souls: prev.souls + newSouls,
        totalKills: prev.totalKills,
        highestStage: prev.highestStage || 0,
        prestigeCount: (prev.prestigeCount || 0) + 1,
      };
    });
  }, []);

  const canPrestige = getSoulsOnPrestige(state.totalCoinsEarned) > 0;
  const soulsOnPrestige = getSoulsOnPrestige(state.totalCoinsEarned);

  return {
    state,
    floatingCoins,
    particles,
    enemyDying,
    slashEffects,
    offlineEarnings,
    setOfflineEarnings,
    handleTap,
    buyUpgrade,
    prestige,
    canPrestige,
    soulsOnPrestige,
    abilities,
    activateAbility,
    getTapDamage: () => getTapDamage(state),
    getIdleCPS: () => getIdleCPS(state),
    getUpgradeLevel,
  };
}