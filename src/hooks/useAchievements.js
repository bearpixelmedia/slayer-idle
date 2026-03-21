import { useState, useEffect, useRef } from "react";
import { ACHIEVEMENTS, computeAchievementMultipliers } from "@/lib/achievements";

const SAVE_KEY = "idle_slayer_achievements";

function loadUnlocked() {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export default function useAchievements(gameState) {
  const [unlockedIds, setUnlockedIds] = useState(() => loadUnlocked());
  const [newUnlock, setNewUnlock] = useState(null); // for toast notification
  const unlockedRef = useRef(unlockedIds);
  unlockedRef.current = unlockedIds;

  // Early return if gameState is invalid (cannot happen after hooks)
  if (!gameState || typeof gameState !== 'object') {
    return { unlockedIds, newUnlock: null, damageMultiplier: 1, offlineMultiplier: 1 };
  }

  // Build stats object from game state
  const stats = {
    totalCoinsEarned: typeof gameState.totalCoinsEarned === 'number' ? gameState.totalCoinsEarned : 0,
    totalKills: typeof gameState.totalKills === 'number' ? gameState.totalKills : 0,
    prestigeCount: typeof gameState.prestigeCount === 'number' ? gameState.prestigeCount : 0,
    highestStage: typeof gameState.highestStage === 'number' ? gameState.highestStage : 0,
  };

  useEffect(() => {
    const newlyUnlocked = (Array.isArray(ACHIEVEMENTS) ? ACHIEVEMENTS : []).filter(
      (a) => a?.id && typeof a?.condition === 'function' && !unlockedRef.current.includes(a.id) && a.condition(stats)
    );

    if (newlyUnlocked.length > 0) {
      const newIds = newlyUnlocked.map((a) => a.id);
      const updated = [...unlockedRef.current, ...newIds];
      setUnlockedIds(updated);
      unlockedRef.current = updated;
      localStorage.setItem(SAVE_KEY, JSON.stringify(updated));
      // Show the most recent unlock as a toast
      setNewUnlock(newlyUnlocked[newlyUnlocked.length - 1]);
      const timer = setTimeout(() => setNewUnlock(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [stats.totalCoinsEarned, stats.totalKills, stats.prestigeCount, stats.highestStage]);

  const multipliers = computeAchievementMultipliers(unlockedIds);

  return {
    unlockedIds,
    newUnlock,
    damageMultiplier: multipliers.damageMultiplier,
    offlineMultiplier: multipliers.offlineMultiplier,
  };
}