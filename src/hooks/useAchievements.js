import { useState, useEffect } from "react";

const SAVE_KEY = "idle_slayer_achievements";

export default function useAchievements(state) {
  const [unlockedIds, setUnlockedIds] = useState(() => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [newUnlock, setNewUnlock] = useState(null);

  return {
    unlockedIds,
    newUnlock,
    damageMultiplier: 1,
    offlineMultiplier: 1,
  };
}