/**
 * Location-based sun/moon placement using SunCalc (no network).
 * Falls back when coordinates are unset or times are invalid (e.g. some polar edge cases).
 */
import SunCalc from "suncalc";
import { arcTopFromProgress, clampCelestialTopPct } from "@/lib/skyArc";

function clampLng(n) {
  return Math.min(180, Math.max(-180, n));
}

function clampLat(n) {
  return Math.min(90, Math.max(-90, n));
}

/**
 * @returns {null | { leftPercent: number, topPercent: number, sunAltDegrees: number, skyKind: 'day'|'twilight'|'night', starsOpacity: number }}
 */
export function getObservedSkyEnvironment(latitude, longitude, now = new Date(), smoothWorldProgress = 0) {
  if (typeof latitude !== "number" || typeof longitude !== "number" || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  const lat = clampLat(latitude);
  const lng = clampLng(longitude);

  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const times = SunCalc.getTimes(dayStart, lat, lng);
  const sunRise = times.sunrise.getTime();
  const sunSet = times.sunset.getTime();

  if (!Number.isFinite(sunRise) || !Number.isFinite(sunSet) || sunSet <= sunRise + 30_000) {
    return null;
  }

  const tomorrow = new Date(dayStart);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextSunrise = SunCalc.getTimes(tomorrow, lat, lng).sunrise.getTime();

  const yesterday = new Date(dayStart);
  yesterday.setDate(yesterday.getDate() - 1);
  const prevSunset = SunCalc.getTimes(yesterday, lat, lng).sunset.getTime();

  const nowMs = now.getTime();

  let sunArcP = 0.5;
  if (nowMs >= sunRise && nowMs <= sunSet) {
    sunArcP = (nowMs - sunRise) / (sunSet - sunRise);
  } else if (nowMs < sunRise) {
    sunArcP = 0;
  } else {
    sunArcP = 1;
  }

  const ySun = arcTopFromProgress(sunArcP);
  const leftSun = 6 + sunArcP * 88;

  let nightP = 0.5;
  if (nowMs >= sunSet && nowMs < nextSunrise && nextSunrise > sunSet + 30_000) {
    nightP = (nowMs - sunSet) / (nextSunrise - sunSet);
  } else if (nowMs < sunRise && sunRise > prevSunset + 30_000) {
    nightP = (nowMs - prevSunset) / (sunRise - prevSunset);
  }

  const yMoon = arcTopFromProgress(nightP);
  const leftMoon = 6 + nightP * 88;

  const sunPos = SunCalc.getPosition(now, lat, lng);
  const altDeg = (sunPos.altitude * 180) / Math.PI;

  let dayWeight;
  if (altDeg <= -10) dayWeight = 0;
  else if (altDeg >= 8) dayWeight = 1;
  else dayWeight = (altDeg + 10) / 18;

  let top = ySun * dayWeight + yMoon * (1 - dayWeight);
  let left = leftSun * dayWeight + leftMoon * (1 - dayWeight);

  const w = typeof smoothWorldProgress === "number" && Number.isFinite(smoothWorldProgress) ? smoothWorldProgress : 0;
  left += Math.sin(w * 0.09) * 3.2;
  top += Math.sin(w * 0.07) * 0.4;

  let skyKind = "night";
  if (altDeg > 2) skyKind = "day";
  else if (altDeg > -8) skyKind = "twilight";

  let starsOpacity = 0.5;
  if (altDeg > 4) starsOpacity = 0.04;
  else if (altDeg < -8) starsOpacity = 0.5;
  else starsOpacity = 0.15 + ((altDeg + 8) / 12) * 0.35;

  return {
    leftPercent: ((left % 100) + 100) % 100,
    topPercent: clampCelestialTopPct(top),
    sunAltDegrees: altDeg,
    skyKind,
    starsOpacity: Math.min(0.55, Math.max(0.03, starsOpacity)),
  };
}
