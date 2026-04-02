import { useState, useEffect, useRef, useCallback } from "react";
import { UPGRADES, getUpgradeCost } from "@/lib/gameData";

const SAVE_KEY = "idle_slayer_save";

const DEFAULT_STATE = {
  coins: 0,
  souls: 0,
  slayerPoints: 0,
  stage: 1,
  killCount: 0,
  enemyHP: 100,
  enemyMaxHP: 100,
  upgradeLevels: {},
  prestigeCount: 0,
  isDead: false,
  unlockedZoneIds: ["zone_1"],
  activeZoneId: "zone_1",
  buildings: {},
  heroes: {},
  skills: {},
};

function loadState() {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) return { ...DEFAULT_STATE, ...JSON.parse(saved) };
  } catch {}
  return { ...DEFAULT_STATE };
}

function saveState(state) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {}
}

export default function useGameState(initMultipliers = {}) {
  const [state, setState] = useState(() => loadState());
  const [floatingCoins, setFloatingCoins] = useState([]);
  const [floatingSouls, setFloatingSouls] = useState([]);
  const [floatingDamage, setFloatingDamage] = useState([]);
  const [particles, setParticles] = useState([]);
  const [enemyDying, setEnemyDying] = useState(false);
  const [slashEffects, setSlashEffects] = useState([]);
  const [offlineEarnings, setOfflineEarnings] = useState(null);
  const [currentWeapon, setCurrentWeapon] = useState("sword");
  const [activeBuffs, setActiveBuffs] = useState([]);
  const [abilities, setAbilities] = useState([]);
  const [heroAbilities, setHeroAbilities] = useState([]);
  const [heroPassives, setHeroPassives] = useState([]);
  const [heroDPS, setHeroDPS] = useState(0);
  const attackTickRef = useRef(0);
  const enemyHitRef = useRef(0);
  const playerHitRef = useRef(0);

  const damageMultiplier = initMultipliers?.damageMultiplier ?? 1;

  useEffect(() => {
    const id = setInterval(() => {
      setState(prev => {
        const cps = getIdleCPSFromState(prev, damageMultiplier);
        if (cps <= 0) return prev;
        const next = { ...prev, coins: prev.coins + cps / 10 };
        saveState(next);
        return next;
      });
    }, 100);
    return () => clearInterval(id);
  }, [damageMultiplier]);

  function getIdleCPSFromState(s, mult = 1) {
    let cps = 0;
    UPGRADES.forEach(u => {
      const level = s.upgradeLevels?.[u.id] || 0;
      if (level > 0 && u.cps) cps += u.cps * level * mult;
    });
    return cps;
  }

  const getTapDamage = useCallback(() => {
    return Math.max(1, 1 * damageMultiplier);
  }, [damageMultiplier]);

  const getIdleCPS = useCallback(() => {
    return getIdleCPSFromState(state, damageMultiplier);
  }, [state, damageMultiplier]);

  const handleTap = useCallback((x, y) => {
    const dmg = getTapDamage();
    setState(prev => {
      const newHP = Math.max(0, prev.enemyHP - dmg);
      const died = newHP <= 0;
      const reward = died ? Math.ceil(prev.stage * 1.5) : 0;
      const next = {
        ...prev,
        enemyHP: died ? prev.enemyMaxHP : newHP,
        coins: prev.coins + reward,
        killCount: died ? prev.killCount + 1 : prev.killCount,
        stage: died ? prev.stage + 1 : prev.stage,
      };
      saveState(next);
      return next;
    });
    if (x !== undefined) {
      const id = Date.now();
      setFloatingDamage(p => [...p, { id, x, y, value: dmg }]);
      setTimeout(() => setFloatingDamage(p => p.filter(f => f.id !== id)), 800);
    }
  }, [getTapDamage]);

  const buyUpgrade = useCallback((upgradeId, quantity = 1) => {
    setState(prev => {
      const upgrade = UPGRADES.find(u => u.id === upgradeId);
      if (!upgrade) return prev;
      const currentLevel = prev.upgradeLevels?.[upgradeId] || 0;
      const cost = getUpgradeCost(upgrade, currentLevel);
      if (prev.coins < cost) return prev;
      const next = {
        ...prev,
        coins: prev.coins - cost,
        upgradeLevels: { ...prev.upgradeLevels, [upgradeId]: currentLevel + 1 },
      };
      saveState(next);
      return next;
    });
  }, []);

  const prestige = useCallback(() => {
    setState(prev => {
      const next = {
        ...DEFAULT_STATE,
        prestigeCount: (prev.prestigeCount || 0) + 1,
        souls: (prev.souls || 0) + soulsOnPrestige,
        unlockedZoneIds: ["zone_1"],
        activeZoneId: "zone_1",
      };
      saveState(next);
      return next;
    });
  }, []);

  const revive = useCallback(() => {
    setState(prev => {
      const next = { ...prev, isDead: false, souls: Math.max(0, (prev.souls || 0) - 10) };
      saveState(next);
      return next;
    });
  }, []);

  const canPrestige = state.stage >= 20;
  const soulsOnPrestige = Math.floor((state.stage || 1) / 10);
  const slayerPointsOnPrestige = 1;

  const unlockSkill = useCallback((skillId) => {
    setState(prev => {
      const next = { ...prev, skills: { ...prev.skills, [skillId]: true } };
      saveState(next);
      return next;
    });
  }, []);

  const activateAbility = useCallback((abilityId) => {}, []);

  const switchZone = useCallback((zoneId) => {
    setState(prev => {
      const next = { ...prev, activeZoneId: zoneId };
      saveState(next);
      return next;
    });
  }, []);

  const unlockZone = useCallback((zoneId) => {
    setState(prev => {
      const next = { ...prev, unlockedZoneIds: [...(prev.unlockedZoneIds || []), zoneId] };
      saveState(next);
      return next;
    });
  }, []);

  const upgradeBuilding = useCallback((buildingId) => {
    setState(prev => {
      const level = (prev.buildings?.[buildingId] || 0) + 1;
      const next = { ...prev, buildings: { ...prev.buildings, [buildingId]: level } };
      saveState(next);
      return next;
    });
  }, []);

  const recruitHero = useCallback((heroId) => {
    setState(prev => {
      const next = { ...prev, heroes: { ...prev.heroes, [heroId]: { level: 1 } } };
      saveState(next);
      return next;
    });
  }, []);

  const levelHero = useCallback((heroId) => {
    setState(prev => {
      const hero = prev.heroes?.[heroId] || { level: 0 };
      const next = { ...prev, heroes: { ...prev.heroes, [heroId]: { ...hero, level: hero.level + 1 } } };
      saveState(next);
      return next;
    });
  }, []);

  const activateHeroAbility = useCallback((abilityId) => {}, []);

  const attackTick = attackTickRef.current;
  const enemyHit = enemyHitRef.current;
  const playerHit = playerHitRef.current;
  const tickWorldCoinCollection = useCallback(() => {}, []);

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
    getTapDamage,
    getIdleCPS,
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
    heroAbilities,
    heroPassives,
    heroDPS,
    recruitHero,
    levelHero,
    activateHeroAbility,
  };
}