/**
 * @typedef {"default" | "zone_unlocked" | "highest_stage_at_least" | "all"} UnlockConditionType
 */
/**
 * Unlock rule for minions/missions.
 * Supports nested "all" conditions.
 *
 * @typedef {Object} UnlockCondition
 * @property {UnlockConditionType} type
 * @property {string} [zoneId] - Required when type === "zone_unlocked"
 * @property {number} [value] - Required when type === "highest_stage_at_least"
 * @property {UnlockCondition[]} [conditions] - Required when type === "all"
 */
/**
 * A minion definition from MINION_TYPES.
 *
 * @typedef {Object} MinionTypeDef
 * @property {string} id
 * @property {string} name
 * @property {string} icon
 * @property {string} description
 * @property {number} baseSpeed - >1 faster, <1 slower
 * @property {number} carryingCapacity - reward multiplier
 * @property {UnlockCondition} unlock
 * @property {number} purchaseCostSouls
 */
/**
 * A mission definition from MISSION_DEFS.
 *
 * @typedef {Object} MissionDef
 * @property {string} id
 * @property {string} name
 * @property {string} icon
 * @property {string} description
 * @property {"short" | "medium" | "long"} family
 * @property {number} baseDurationSec
 * @property {number} baseSoulReward
 * @property {number} rewardMultiplier
 * @property {UnlockCondition} unlock
 * @property {string[]} [tags]
 */
/**
 * Player-owned minion state.
 *
 * @typedef {Object} OwnedMinion
 * @property {string} instanceId - Unique runtime/save id (e.g. nanoid)
 * @property {string} minionTypeId - Links to MINION_TYPES.id
 * @property {number} level - Keep at 1 for v1, future-proof for upgrades
 * @property {"idle" | "on_mission"} status
 * @property {string | null} activeMissionInstanceId - Mission currently assigned
 * @property {number} acquiredAt - Unix ms timestamp
 */
/**
 * Runtime mission record (active or completed-unclaimed).
 *
 * @typedef {Object} MissionInstance
 * @property {string} instanceId - Unique id for this run
 * @property {string} missionDefId - Links to MISSION_DEFS.id
 * @property {string} minionInstanceId - Links to OwnedMinion.instanceId
 * @property {number} startedAt - Unix ms
 * @property {number} endsAt - Unix ms
 * @property {number} durationSec - Final computed duration for this run
 * @property {number} expectedSoulReward - Final computed reward for this run
 * @property {"active" | "completed" | "claimed"} status
 * @property {number | null} completedAt - Unix ms when mission finished
 * @property {number | null} claimedAt - Unix ms when reward was claimed
 */
/**
 * Aggregate minion system state persisted in save.
 *
 * @typedef {Object} MinionsState
 * @property {OwnedMinion[]} ownedMinions
 * @property {MissionInstance[]} missions
 * @property {number} lastProcessedAt - Unix ms, used for offline catch-up
 */