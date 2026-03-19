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
  const [unlockedIds, setUnlockedIds] = useState(loadUnlocked);
  const [newUnlock, setNewUnlock] = useState(null); // for toast notification
  const unlockedRef = useRef(unlockedIds);
  unlockedRef.current = unlockedIds;

  // Build stats object from game state
  const stats = {
    totalCoinsEarned: gameState.totalCoinsEarned || 0,
    totalKills: gameState.totalKills || 0,
    prestigeCount: gameState.prestigeCount || 0,
    highestStage: gameState.highestStage || 0,
  };

  useEffect(() => {
    const newlyUnlocked = ACHIEVEMENTS.filter(
      (a) => !unlockedRef.current.includes(a.id) && a.condition(stats)
    );

    if (newlyUnlocked.length > 0) {
      const newIds = newlyUnlocked.map((a) => a.id);
      const updated = [...unlockedRef.current, ...newIds];
      setUnlockedIds(updated);
      localStorage.setItem(SAVE_KEY, JSON.stringify(updated));
      // Show the most recent unlock as a toast
      setNewUnlock(newlyUnlocked[newlyUnlocked.length - 1]);
      setTimeout(() => setNewUnlock(null), 4000);
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