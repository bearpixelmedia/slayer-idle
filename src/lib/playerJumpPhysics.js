/**
 * Shared jump integration for PlayerDisplay + world coin vertical placement.
 * Apex height uses the same fixed timestep as a typical 60fps frame so coins sit at the
 * peak reached when holding jump through the boost window (no early jump-cut).
 */

export const JUMP_V0 = -520;
export const JUMP_GRAVITY_UP = 3400;
export const JUMP_GRAVITY_FALL = 6800;
export const JUMP_HOLD_BOOST_MS = 105;
export const JUMP_HOLD_BOOST_ACCEL = 5200;
export const JUMP_CUT = 0.38;
export const JUMP_VY_MAX_UP = -640;
export const JUMP_VY_MAX_DOWN = 1050;

/**
 * @param {number} [dtSec=1/60] - integration step (60fps default matches common RAF cadence)
 * @returns {number} positive px: how far the jump motion translates the hero stack upward at apex
 */
export function computeJumpApexOffsetPx(dtSec = 1 / 60) {
  let py = 0;
  let vy = JUMP_V0;
  let t = 0;
  let minPy = 0;
  const holdEnd = JUMP_HOLD_BOOST_MS / 1000;
  const dt = Math.max(1e-6, dtSec);

  for (let guard = 0; guard < 20000; guard++) {
    const active = t < holdEnd && vy < 0;
    if (active) vy -= JUMP_HOLD_BOOST_ACCEL * dt;
    const g = vy > 0 ? JUMP_GRAVITY_FALL : JUMP_GRAVITY_UP;
    vy += g * dt;
    vy = Math.max(JUMP_VY_MAX_UP, Math.min(JUMP_VY_MAX_DOWN, vy));
    py += vy * dt;
    if (py < minPy) minPy = py;
    t += dt;
    if (py >= 0) break;
  }

  return -minPy;
}

/** Rounded up slightly so rect overlap still registers at apex on varied frame times. */
export const PLAYER_JUMP_APEX_OFFSET_PX = Math.ceil(computeJumpApexOffsetPx(1 / 60));
