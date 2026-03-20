import { useState, useEffect, useRef, useCallback } from "react";
import { QUESTS, getQuestById } from "@/lib/quests";

const SAVE_KEY = "idle_slayer_quests";

function loadQuestProgress() {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function initializeQuestProgress() {
  const progress = {};
  (Array.isArray(QUESTS) ? QUESTS : []).forEach((q) => {
    if (q?.id) {
      progress[q.id] = { questId: q.id, progress: 0, completed: false, claimed: false };
    }
  });
  return progress;
}

export default function useQuests(gameState, unlockedZoneIds = []) {
  const [questProgress, setQuestProgress] = useState(() => {
    const saved = loadQuestProgress();
    const initialized = initializeQuestProgress();
    return { ...initialized, ...saved };
  });

  const questProgressRef = useRef(questProgress);
  questProgressRef.current = questProgress;

  const saveProgress = useCallback((newProgress) => {
    localStorage.setItem(SAVE_KEY, JSON.stringify(newProgress));
  }, []);

  // Update quest progress based on game state
  useEffect(() => {
    if (!gameState || typeof gameState !== 'object') return;
    setQuestProgress((prev) => {
      let updated = { ...prev };
      let changed = false;

      (Array.isArray(QUESTS) ? QUESTS : []).forEach((quest) => {
        if (!quest?.id || !quest?.type || !quest?.target) return;
        const qp = updated[quest.id];
        if (!qp || qp.completed || qp.claimed) return;

        let newProgress = qp.progress;

        // kill_enemy: killed specific enemy type in specific zone
        if (quest.type === "kill_enemy") {
          const zoneData = gameState.zoneProgress?.[quest.zoneId];
          const killCount = typeof zoneData?.killCount === 'number' ? zoneData.killCount : 0;
          newProgress = Math.min(killCount, quest.target);
        }

        // kill_zone: killed enemies in specific zone (for current run)
        if (quest.type === "kill_zone") {
          const zoneData = gameState.zoneProgress?.[quest.zoneId];
          const killCount = typeof zoneData?.killCount === 'number' ? zoneData.killCount : 0;
          newProgress = Math.min(killCount, quest.target);
        }

        // kill_any: killed any enemies (global)
        if (quest.type === "kill_any") {
          const totalKills = typeof gameState.totalKills === 'number' ? gameState.totalKills : 0;
          newProgress = Math.min(totalKills, quest.target);
        }

        // kill_boss_zone: killed boss in specific zone
        if (quest.type === "kill_boss_zone") {
          const zoneData = gameState.zoneProgress?.[quest.zoneId];
          const bossKilled = (typeof zoneData?.highestStage === 'number' && zoneData.highestStage > 0) ? 1 : 0;
          newProgress = Math.min(bossKilled, quest.target);
        }

        // reach_stage: reached specific stage globally or in zone
        if (quest.type === "reach_stage") {
          const targetStage = typeof quest.target === 'number' ? quest.target : 0;
          const stageReached = quest.zoneId
            ? (typeof gameState.zoneProgress?.[quest.zoneId]?.highestStage === 'number' && gameState.zoneProgress[quest.zoneId].highestStage >= targetStage)
            : (typeof gameState.highestStage === 'number' && gameState.highestStage >= targetStage);
          newProgress = stageReached ? quest.target : qp.progress;
        }

        // zone_souls: total souls earned lifetime
        if (quest.type === "zone_souls") {
          const souls = typeof gameState.souls === 'number' ? gameState.souls : 0;
          const coinsEarned = typeof gameState.totalCoinsEarned === 'number' ? gameState.totalCoinsEarned : 0;
          const totalSoulsEarned = souls + Math.floor(Math.sqrt(coinsEarned) / 10);
          newProgress = Math.min(totalSoulsEarned, quest.target);
        }

        // prestige: prestige count milestone
        if (quest.type === "prestige") {
          const prestigeCount = typeof gameState.prestigeCount === 'number' ? gameState.prestigeCount : 0;
          newProgress = Math.min(prestigeCount, quest.target);
        }

        // spend_sp: slayer points spent — track via skill unlocks as proxy
        if (quest.type === "spend_sp") {
          const spUnlocked = Array.isArray(gameState.unlockedSkills) ? gameState.unlockedSkills.length : 0;
          newProgress = Math.min(spUnlocked, quest.target);
        }

        // unlock_zone: zone unlocked
        if (quest.type === "unlock_zone") {
          const isUnlocked = (Array.isArray(unlockedZoneIds) ? unlockedZoneIds : []).includes(quest.zoneId) ? 1 : 0;
          newProgress = Math.min(isUnlocked, quest.target);
        }

        // earn_coins: earned coins (global)
        if (quest.type === "earn_coins") {
          const totalCoinsEarned = typeof gameState.totalCoinsEarned === 'number' ? gameState.totalCoinsEarned : 0;
          newProgress = Math.min(totalCoinsEarned, quest.target);
        }

        // Check completion
        const isCompleted = newProgress >= quest.target;

        if (newProgress !== qp.progress || (isCompleted && !qp.completed)) {
          updated[quest.id] = {
            questId: quest.id,
            progress: newProgress,
            completed: isCompleted,
            claimed: qp.claimed,
          };
          changed = true;
        }
      });

      if (changed) {
        saveProgress(updated);
      }
      return changed ? updated : prev;
    });
  }, [
    gameState.totalKills,
    gameState.totalCoinsEarned,
    gameState.highestStage,
    gameState.prestigeCount,
    gameState.unlockedSkills,
    gameState.zoneProgress,
    gameState.souls,
    unlockedZoneIds,
    saveProgress,
  ]);

  const claimReward = useCallback(
    (questId) => {
      const qp = questProgressRef.current[questId];
      if (!qp || !qp.completed || qp.claimed) return null;

      const quest = getQuestById(questId);
      if (!quest) return null;

      setQuestProgress((prev) => ({
        ...prev,
        [questId]: { ...prev[questId], claimed: true },
      }));

      saveProgress({
        ...questProgressRef.current,
        [questId]: { ...qp, claimed: true },
      });

      return quest.reward;
    },
    [saveProgress]
  );

  const resetQuestForRepeat = useCallback((questId) => {
    setQuestProgress((prev) => ({
      ...prev,
      [questId]: { questId, progress: 0, completed: false, claimed: false },
    }));

    saveProgress({
      ...questProgressRef.current,
      [questId]: { questId, progress: 0, completed: false, claimed: false },
    });
  }, [saveProgress]);

  return {
    questProgress,
    claimReward,
    resetQuestForRepeat,
  };
}