// Buff definitions and mechanics
export const BUFF_TYPES = {
  coin_surge: {
    id: "coin_surge",
    name: "Coin Surge",
    icon: "💰",
    duration: 8,
    effects: { coinMultiplier: 2.0 },
  },
  soul_echo: {
    id: "soul_echo",
    name: "Soul Echo",
    icon: "👻",
    duration: 10,
    effects: { soulMultiplier: 1.75 },
  },
  frenzy: {
    id: "frenzy",
    name: "Frenzy",
    icon: "⚡",
    duration: 6,
    effects: { tapDamageMultiplier: 2.5, attackSpeedMultiplier: 1.2 },
  },
};

// Proc rates (as decimals)
export const PROC_RATES = {
  tap: 0.025,        // 2.5% per tap
  kill: 0.06,        // 6% per kill
  idle: 0.0015,      // 0.15% per second
};

// Weighted buff selection (should sum to 1.0)
export const BUFF_WEIGHTS = {
  coin_surge: 0.45,
  soul_echo: 0.25,
  frenzy: 0.30,
};

// Rules
export const BUFF_RULES = {
  maxConcurrent: 2,
  globalCooldown: 2,          // seconds
  maxDurationExtension: 0.5,  // 50% of base duration
  pityMinSeconds: 45,
  pityMaxSeconds: 60,
};

// Helper: select a random buff type based on weights
export function selectRandomBuff() {
  const rand = Math.random();
  let cumulative = 0;

  for (const [buffId, weight] of Object.entries(BUFF_WEIGHTS)) {
    cumulative += weight;
    if (rand < cumulative) {
      return BUFF_TYPES[buffId];
    }
  }

  // Fallback (shouldn't reach)
  return BUFF_TYPES.coin_surge;
}

// Helper: determine if a buff proc should occur
export function shouldProcBuff(procRate) {
  return Math.random() < procRate;
}

// Helper: calculate active buff multiplier for a given effect key
export function getBuffMultiplier(activeBuffs, effectKey) {
  if (!activeBuffs?.length) return 1.0;
  let multiplier = 1.0;
  activeBuffs.forEach(buff => {
    if (buff?.effects?.[effectKey]) {
      multiplier *= buff.effects[effectKey];
    }
  });
  return multiplier;
}