/**
 * Per-character weapon layout + gait tuning so emoji (or sprite) rigs read attached
 * and stay in phase with the shared run hop.
 */
const DEFAULT_RIG = {
  runDuration: 0.4,
  swayDelayL: 0.12,
  swayDelayR: 0.22,
  /** Degrees per px/s of vertical velocity — jump drag / follow-through */
  jumpVyToDeg: 0.024,
  /** Extra multiplier on jump tilt for the left-hand weapon */
  jumpTiltL: 1,
  jumpTiltR: -0.92,
  swordEmojiRotateDeg: 120,
  /** Scaled via weaponTriColumnLayout shield pull → translateX(out − pull); higher = more left on screen */
  shieldTranslateRem: 0.3,
  shieldTranslateRemSm: 0.34,
  shieldTranslateRemMd: 0.4,
};

const RIG_BY_KEY = {
  // King / melee fallback — heavier shield, slightly wider stagger
  "🤴": {
    swayDelayL: 0.1,
    swayDelayR: 0.24,
    jumpVyToDeg: 0.021,
    jumpTiltL: 0.95,
    jumpTiltR: -0.88,
    swordEmojiRotateDeg: 118,
    shieldTranslateRem: 0.32,
    shieldTranslateRemSm: 0.36,
    shieldTranslateRemMd: 0.42,
  },
  // Elf / bow fallback — lighter, more symmetric arms for archer read
  "🧝": {
    runDuration: 0.38,
    swayDelayL: 0.14,
    swayDelayR: 0.2,
    jumpVyToDeg: 0.028,
    jumpTiltL: 1.05,
    jumpTiltR: -1,
    swordEmojiRotateDeg: 122,
    shieldTranslateRem: 0.44,
    shieldTranslateRemSm: 0.54,
    shieldTranslateRemMd: 0.64,
  },
  // Custom spritesheet / static image — neutral rig; hop is shared with body
  __sprite__: {
    swayDelayL: 0.11,
    swayDelayR: 0.21,
    jumpVyToDeg: 0.023,
    jumpTiltL: 1,
    jumpTiltR: -0.9,
    swordEmojiRotateDeg: 120,
    shieldTranslateRem: 0.3,
    shieldTranslateRemSm: 0.34,
    shieldTranslateRemMd: 0.4,
  },
};

export function resolvePlayerCharacterKey(weaponMode, gameSettings) {
  const isBow = weaponMode === "bow";
  const sprite = isBow ? gameSettings?.player_bow : gameSettings?.player_sword;
  if (sprite && String(sprite).trim()) return "__sprite__";
  return isBow ? "🧝" : "🤴";
}

export function getPlayerWeaponRig(weaponMode, gameSettings) {
  const key = resolvePlayerCharacterKey(weaponMode, gameSettings);
  return { ...DEFAULT_RIG, ...(RIG_BY_KEY[key] || {}) };
}
