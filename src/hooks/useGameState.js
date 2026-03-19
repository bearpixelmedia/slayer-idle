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
    killCount: 0,
    totalKills: 0,
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
};

function defaultAbilities() {
  return {
    magnet: { active: false, durationRemaining: 0, cooldownRemaining: 0 },
    doubleDamage: { active: false, durationRemaining: 0, cooldownRemaining: 0 },
  };
}

export default function useGameState() {
  const [state, setState] = useState(() => loadGame() || defaultState());
  const [floatingCoins, setFloatingCoins] = useState([]);
  const [enemyDying, setEnemyDying] = useState(false);
  const [slashEffects, setSlashEffects] = useState([]);
  const [abilities, setAbilities] = useState(defaultAbilities());
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
        const offlineEarnings = Math.floor(idleCPS * offlineSeconds * 0.5);
        if (offlineEarnings > 0) {
          setState(prev => ({
            ...prev,
            coins: prev.coins + offlineEarnings,
            totalCoinsEarned: prev.totalCoinsEarned + offlineEarnings,
          }));
        }
      }
    }
  }, []);

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
    return Math.floor(damage * soulBonus);
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
    return Math.floor(cps * soulBonus);
  }

  function spawnNewEnemy(s) {
    const stageData = STAGES[s.stage];
    const enemyName = stageData.enemies[Math.floor(Math.random() * stageData.enemies.length)];
    const hp = getEnemyHP(s.stage, s.killCount);
    return { ...s, enemyHP: hp, enemyMaxHP: hp, currentEnemyName: enemyName };
  }

  const dealDamage = useCallback((damage, x, y) => {
    setState(prev => {
      const newHP = prev.enemyHP - damage;
      
      if (newHP <= 0) {
        const reward = getEnemyReward(prev.stage, prev.killCount);
        const soulBonus = 1 + (prev.souls * 0.05);
        const totalReward = Math.floor(reward * soulBonus);
        
        setFloatingCoins(fc => [...fc, { id: Date.now() + Math.random(), amount: totalReward, x, y }]);
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
        };
        
        return spawnNewEnemy(newState);
      }
      
      return { ...prev, enemyHP: newHP };
    });
  }, []);

  const handleTap = useCallback((x, y) => {
    const damage = getTapDamage(stateRef.current);
    
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

  // Clean up floating coins
  useEffect(() => {
    const interval = setInterval(() => {
      setFloatingCoins(prev => prev.filter(c => Date.now() - c.id < 1000));
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
      };
    });
  }, []);

  const canPrestige = getSoulsOnPrestige(state.totalCoinsEarned) > 0;
  const soulsOnPrestige = getSoulsOnPrestige(state.totalCoinsEarned);

  return {
    state,
    floatingCoins,
    enemyDying,
    slashEffects,
    handleTap,
    buyUpgrade,
    prestige,
    canPrestige,
    soulsOnPrestige,
    getTapDamage: () => getTapDamage(state),
    getIdleCPS: () => getIdleCPS(state),
    getUpgradeLevel,
  };
}