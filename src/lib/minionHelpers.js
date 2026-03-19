// src/lib/minionHelpers.js
/**
 * @typedef {import("./minionTypes").UnlockCondition} UnlockCondition
 * @typedef {import("./minionTypes").MinionTypeDef} MinionTypeDef
 * @typedef {import("./minionTypes").MissionDef} MissionDef
 * @typedef {import("./minionTypes").OwnedMinion} OwnedMinion
 * @typedef {import("./minionTypes").MissionInstance} MissionInstance
 * @typedef {import("./minionTypes").MinionsState} MinionsState
 */
/**
 * Minimal player progress needed for unlock checks.
 * @typedef {Object} MinionProgressContext
 * @property {string[]} unlockedZoneIds
 * @property {number} highestStage
 */
/**
 * Economy context used when spending/awarding souls.
 * @typedef {Object} MinionEconomyContext
 * @property {number} souls
 */

/**
 * Evaluate unlock condition recursively.
 * @param {UnlockCondition} condition
 * @param {MinionProgressContext} ctx
 * @returns {boolean}
 */
export function canUnlock(condition, ctx) {
  if (!condition || !ctx) return false;

  switch (condition.type) {
    case "default":
      return true;
    case "zone_unlocked":
      return ctx.unlockedZoneIds.includes(condition.zoneId);
    case "highest_stage_at_least":
      return ctx.highestStage >= condition.value;
    case "all":
      return condition.conditions.every((subCondition) =>
        canUnlock(subCondition, ctx)
      );
    default:
      return false;
  }
}

/**
 * Returns minion defs currently unlockable/visible to player.
 * @param {MinionTypeDef[]} minionDefs
 * @param {MinionProgressContext} ctx
 * @returns {MinionTypeDef[]}
 */
export function getUnlockedMinionTypes(minionDefs, ctx) {
  return minionDefs.filter((minion) => canUnlock(minion.unlock, ctx));
}

/**
 * Returns mission defs currently unlockable/visible to player.
 * @param {MissionDef[]} missionDefs
 * @param {MinionProgressContext} ctx
 * @returns {MissionDef[]}
 */
export function getUnlockedMissionDefs(missionDefs, ctx) {
  return missionDefs.filter((mission) => canUnlock(mission.unlock, ctx));
}

/**
 * Computes final mission runtime/reward for a minion + mission pair.
 * @param {MissionDef} missionDef
 * @param {MinionTypeDef} minionType
 * @returns {{ durationSec: number, expectedSoulReward: number }}
 */
export function computeMissionOutcome(missionDef, minionType) {
  const durationSec = Math.round(missionDef.baseDurationSec / minionType.baseSpeed);
  const expectedSoulReward = Math.floor(
    missionDef.baseSoulReward * minionType.carryingCapacity * missionDef.rewardMultiplier
  );
  return { durationSec, expectedSoulReward };
}

/**
 * Creates a mission instance object in "active" state.
 * @param {Object} params
 * @param {string} params.instanceId
 * @param {MissionDef} params.missionDef
 * @param {OwnedMinion} params.minion
 * @param {number} params.nowMs
 * @param {number} params.durationSec
 * @param {number} params.expectedSoulReward
 * @returns {MissionInstance}
 */
export function createMissionInstance(params) {
  const { instanceId, missionDef, minion, nowMs, durationSec, expectedSoulReward } = params;
  return {
    instanceId,
    missionDefId: missionDef.id,
    minionInstanceId: minion.instanceId,
    startedAt: nowMs,
    endsAt: nowMs + durationSec * 1000,
    durationSec,
    expectedSoulReward,
    status: "active",
    completedAt: null,
    claimedAt: null,
  };
}

/**
 * Can this minion start a mission now?
 * @param {OwnedMinion} minion
 * @returns {boolean}
 */
export function canStartMission(minion) {
  return minion.status === "idle";
}

/**
 * Start mission operation (pure state transform).
 * @param {Object} params
 * @param {MinionsState} params.minionsState
 * @param {OwnedMinion} params.minion
 * @param {MissionDef} params.missionDef
 * @param {MinionTypeDef} params.minionTypeDef
 * @param {number} params.nowMs
 * @param {string} params.newMissionInstanceId
 * @returns {{ ok: true, nextState: MinionsState, mission: MissionInstance } | { ok: false, reason: string }}
 */
export function startMission(params) {
  const { minionsState, minion, missionDef, minionTypeDef, nowMs, newMissionInstanceId } = params;

  if (!minion || minion.status !== "idle") {
    return { ok: false, reason: "MINION_BUSY" };
  }
  if (!minionTypeDef || minionTypeDef.id !== minion.minionTypeId) {
    return { ok: false, reason: "INVALID_MINION" };
  }
  if (!missionDef) {
    return { ok: false, reason: "INVALID_MISSION" };
  }

  const { durationSec, expectedSoulReward } = computeMissionOutcome(missionDef, minionTypeDef);
  const newMissionInstance = createMissionInstance({
    instanceId: newMissionInstanceId,
    missionDef,
    minion,
    nowMs,
    durationSec,
    expectedSoulReward,
  });

  const nextOwnedMinions = minionsState.ownedMinions.map((m) =>
    m.instanceId === minion.instanceId
      ? { ...m, status: "on_mission", activeMissionInstanceId: newMissionInstance.instanceId }
      : m
  );
  const nextMissions = [...minionsState.missions, newMissionInstance];

  return {
    ok: true,
    nextState: { ...minionsState, ownedMinions: nextOwnedMinions, missions: nextMissions },
    mission: newMissionInstance,
  };
}

/**
 * Marks missions whose end time has passed as completed.
 * @param {MinionsState} minionsState
 * @param {number} nowMs
 * @returns {{ nextState: MinionsState, completedCount: number }}
 */
export function tickMissions(minionsState, nowMs) {
  let completedCount = 0;
  const nextMissions = minionsState.missions.map((m) => {
    if (m.status === "active" && nowMs >= m.endsAt) {
      completedCount++;
      return { ...m, status: "completed", completedAt: nowMs };
    }
    return m;
  });

  const nextOwnedMinions = minionsState.ownedMinions.map((minion) => {
    const activeMission = nextMissions.find(m => m.instanceId === minion.activeMissionInstanceId);
    if (activeMission && activeMission.status === "completed") {
      return { ...minion, status: "idle", activeMissionInstanceId: null };
    }
    return minion;
  });

  return { nextState: { ...minionsState, missions: nextMissions, ownedMinions: nextOwnedMinions }, completedCount };
}

/**
 * Returns completed missions that are not yet claimed.
 * @param {MinionsState} minionsState
 * @returns {MissionInstance[]}
 */
export function getClaimableMissions(minionsState) {
  return minionsState.missions.filter((m) => m.status === "completed");
}

/**
 * Claim one completed mission and award souls.
 * @param {Object} params
 * @param {MinionsState} params.minionsState
 * @param {string} params.missionInstanceId
 * @param {number} params.nowMs
 * @returns {{ ok: true, nextState: MinionsState, soulsAwarded: number } | { ok: false, reason: string }}
 */
export function claimMission(params) {
  const { minionsState, missionInstanceId, nowMs } = params;
  let soulsAwarded = 0;
  let missionFound = false;
  let errorReason = null;

  const nextMissions = minionsState.missions.map((m) => {
    if (m.instanceId === missionInstanceId) {
      missionFound = true;
      if (m.status === "claimed") {
        errorReason = "MISSION_ALREADY_CLAIMED";
        return m;
      }
      if (m.status === "active") {
        errorReason = "MISSION_NOT_COMPLETED";
        return m;
      }
      soulsAwarded = m.expectedSoulReward;
      return { ...m, status: "claimed", claimedAt: nowMs };
    }
    return m;
  });

  if (!missionFound) {
    return { ok: false, reason: "MISSION_NOT_FOUND" };
  }
  if (errorReason) {
    return { ok: false, reason: errorReason };
  }

  return {
    ok: true,
    nextState: { ...minionsState, missions: nextMissions },
    soulsAwarded,
  };
}

/**
 * Claim all currently completed missions.
 * @param {Object} params
 * @param {MinionsState} params.minionsState
 * @param {number} params.nowMs
 * @returns {{ nextState: MinionsState, soulsAwarded: number, claimedCount: number }}
 */
export function claimAllMissions(params) {
  const { minionsState, nowMs } = params;
  let totalSoulsAwarded = 0;
  let claimedCount = 0;

  const nextMissions = minionsState.missions.map((m) => {
    if (m.status === "completed") {
      totalSoulsAwarded += m.expectedSoulReward;
      claimedCount++;
      return { ...m, status: "claimed", claimedAt: nowMs };
    }
    return m;
  });

  return {
    nextState: { ...minionsState, missions: nextMissions },
    soulsAwarded: totalSoulsAwarded,
    claimedCount,
  };
}

/**
 * Attempts to purchase a new minion (souls-only in v1).
 * @param {Object} params
 * @param {MinionsState} params.minionsState
 * @param {MinionTypeDef} params.minionTypeDef
 * @param {MinionProgressContext} params.progress
 * @param {MinionEconomyContext} params.economy
 * @param {number} params.nowMs
 * @param {string} params.newMinionInstanceId
 * @returns {{ ok: true, nextState: MinionsState, soulsSpent: number, ownedMinion: OwnedMinion } | { ok: false, reason: string }}
 */
export function purchaseMinion(params) {
  const { minionsState, minionTypeDef, progress, economy, nowMs, newMinionInstanceId } = params;

  if (!canUnlock(minionTypeDef.unlock, progress)) {
    return { ok: false, reason: "NOT_UNLOCKED" };
  }
  if (economy.souls < minionTypeDef.purchaseCostSouls) {
    return { ok: false, reason: "INSUFFICIENT_SOULS" };
  }

  const newMinion = {
    instanceId: newMinionInstanceId,
    minionTypeId: minionTypeDef.id,
    level: 1,
    status: "idle",
    activeMissionInstanceId: null,
    acquiredAt: nowMs,
  };

  return {
    ok: true,
    nextState: { ...minionsState, ownedMinions: [...minionsState.ownedMinions, newMinion] },
    soulsSpent: minionTypeDef.purchaseCostSouls,
    ownedMinion: newMinion,
  };
}

/**
 * Ensures default starter minion exists (for migration/new saves).
 * @param {MinionsState} minionsState
 * @param {MinionTypeDef[]} minionDefs
 * @param {number} nowMs
 * @param {() => string} makeId
 * @returns {MinionsState}
 */
export function ensureStarterMinion(minionsState, minionDefs, nowMs, makeId) {
  const starterMinionDef = minionDefs.find((m) => m.unlock.type === "default");
  if (!starterMinionDef) return minionsState;

  const hasStarterMinion = minionsState.ownedMinions.some(
    (m) => m.minionTypeId === starterMinionDef.id
  );

  if (!hasStarterMinion) {
    const newMinion = {
      instanceId: makeId(),
      minionTypeId: starterMinionDef.id,
      level: 1,
      status: "idle",
      activeMissionInstanceId: null,
      acquiredAt: nowMs,
    };
    return { ...minionsState, ownedMinions: [...minionsState.ownedMinions, newMinion] };
  }
  return minionsState;
}

/**
 * Offline catch-up helper
 * @param {MinionsState} minionsState
 * @param {number} nowMs
 * @returns {{ nextState: MinionsState, completedCount: number, processedAt: number }}
 */
export function processOfflineProgress(minionsState, nowMs) {
  if (!minionsState.lastProcessedAt) {
    return { nextState: { ...minionsState, lastProcessedAt: nowMs }, completedCount: 0, processedAt: nowMs };
  }

  const { nextState, completedCount } = tickMissions(minionsState, nowMs);

  return { nextState: { ...nextState, lastProcessedAt: nowMs }, completedCount, processedAt: nowMs };
}