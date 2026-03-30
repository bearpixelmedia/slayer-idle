/**
 * Shared vertical arc for sun/moon: "horizon" is placed high on screen so bodies
 * stay in open sky above parallax mountain silhouettes (not tucked behind peaks).
 */
export const CELESTIAL_ZENITH_TOP_PCT = 2;
/** Lowest point of the arc (rise/set) — keep above mountain layers (~10–55% with art aligned bottom). */
export const CELESTIAL_SCREEN_HORIZON_TOP_PCT = 24;

export function arcTopFromProgress(p) {
  const u = Math.min(1, Math.max(0, p));
  const s = Math.sin(u * Math.PI);
  return CELESTIAL_ZENITH_TOP_PCT + (1 - s) * (CELESTIAL_SCREEN_HORIZON_TOP_PCT - CELESTIAL_ZENITH_TOP_PCT);
}

/** Clamp vertical % so the disc stays in the sky band and clear of foreground. */
export function clampCelestialTopPct(y) {
  return Math.min(36, Math.max(1, y));
}
