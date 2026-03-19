// src/hooks/useMinions.js
import { useState, useEffect, useCallback, useRef } from "react";
import { nanoid } from "nanoid";

import { MINION_TYPES, MISSION_DEFS, MINION_SYSTEM_CONFIG } from "@/lib/minions";
import {
  canUnlock,
  getUnlockedMinionTypes,
  getUnlockedMissionDefs,
  computeMissionOutcome,
  createMissionInstance,
  canStartMission,
  startMission,
  tickMissions,
  getClaimableMissions,
  claimMission,
  claimAllMissions,
  purchaseMinion,
  ensureStarterMinion,
  processOfflineProgress,
} from "@/lib/minionHelpers";

const SAVE_KEY = "idle_slayer_minions_save";

/**
 * @typedef {import("../lib/minionTypes").MinionsState} MinionsState
 * @typedef {import("../lib/minionTypes").OwnedMinion} OwnedMinion
 * @typedef {import("../lib/minionTypes").MissionInstance} MissionInstance
 */

const defaultMinionsState = () => ({
  ownedMinions: [],
  missions: [],
  lastProcessedAt: Date.now(),
});

function loadMinionsState() {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    return saved ? JSON.parse(saved) : defaultMinionsState();
  } catch (e) {
    console.error("Failed to load minion save:", e);
    return defaultMinionsState();
  }
}

export default function useMinions(gameState, setSouls) {
  const [minionsState, setMinionsState] = useState(loadMinionsState);
  const minionsStateRef = useRef(minionsState);
  minionsStateRef.current = minionsState;

  const progressContext = {
    unlockedZoneIds: gameState.unlockedZoneIds,
    highestStage: gameState.highestStage,
  };

  const economyContext = {
    souls: gameState.souls,
  };

  // Initial load and offline progress
  useEffect(() => {
    const now = Date.now();
    let nextState = minionsStateRef.current;

    nextState = ensureStarterMinion(nextState, MINION_TYPES, now, nanoid);

    if (MINION_SYSTEM_CONFIG.offlineProgressEnabled) {
      const { nextState: processedState, completedCount } = processOfflineProgress(nextState, now);
      nextState = processedState;
      if (completedCount > 0) {
        console.log(`Minions: Processed ${completedCount} missions offline.`);
      }
    }

    setMinionsState(nextState);
    localStorage.setItem(SAVE_KEY, JSON.stringify(nextState));
  }, []);

  // Periodic tick
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const { nextState } = tickMissions(minionsStateRef.current, now);
      setMinionsState(nextState);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Save to storage
  useEffect(() => {
    localStorage.setItem(SAVE_KEY, JSON.stringify(minionsState));
  }, [minionsState]);

  // Derived state
  const unlockedMinionTypes = getUnlockedMinionTypes(MINION_TYPES, progressContext);
  const unlockedMissionDefs = getUnlockedMissionDefs(MISSION_DEFS, progressContext);
  const claimableMissions = getClaimableMissions(minionsState);

  // Actions
  const sendMinionOnMission = useCallback((minion, missionDef) => {
    const minionType = MINION_TYPES.find((mt) => mt.id === minion.minionTypeId);
    if (!minionType) return false;

    const result = startMission({
      minionsState: minionsStateRef.current,
      minion,
      missionDef,
      minionTypeDef: minionType,
      nowMs: Date.now(),
      newMissionInstanceId: nanoid(),
    });

    if (result.ok) {
      setMinionsState(result.nextState);
      return true;
    }
    return false;
  }, []);

  const buyMinion = useCallback((minionTypeDef) => {
    const result = purchaseMinion({
      minionsState: minionsStateRef.current,
      minionTypeDef,
      progress: progressContext,
      economy: economyContext,
      nowMs: Date.now(),
      newMinionInstanceId: nanoid(),
    });

    if (result.ok) {
      setMinionsState(result.nextState);
      setSouls((prev) => prev - result.soulsSpent);
      return true;
    }
    return false;
  }, [gameState.souls, setSouls]);

  const claimMissionReward = useCallback((missionInstanceId) => {
    const result = claimMission({
      minionsState: minionsStateRef.current,
      missionInstanceId,
      nowMs: Date.now(),
    });

    if (result.ok) {
      setMinionsState(result.nextState);
      setSouls((prev) => prev + result.soulsAwarded);
      return true;
    }
    return false;
  }, [setSouls]);

  const claimAllMissionRewards = useCallback(() => {
    const result = claimAllMissions({
      minionsState: minionsStateRef.current,
      nowMs: Date.now(),
    });

    if (result.claimedCount > 0) {
      setMinionsState(result.nextState);
      setSouls((prev) => prev + result.soulsAwarded);
      return true;
    }
    return false;
  }, [setSouls]);

  return {
    minionsState,
    unlockedMinionTypes,
    unlockedMissionDefs,
    claimableMissions,
    sendMinionOnMission,
    buyMinion,
    claimMissionReward,
    claimAllMissionRewards,
  };
}