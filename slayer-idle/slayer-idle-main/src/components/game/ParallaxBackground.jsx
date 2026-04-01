import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { loadGameSettings, GAME_SETTINGS_UPDATED_EVENT } from "@/lib/gameSettings";
import { getObservedSkyEnvironment } from "@/lib/skyCelestial";
import { arcTopFromProgress, clampCelestialTopPct } from "@/lib/skyArc";
import SpriteTileRow from "./SpriteTileRow";
import { ParallaxMountainFarFallback, ParallaxMountainMidFallback } from "./ParallaxMountainSilhouettes";

/** Local clock: moon phases at night, crescent at twilight, sun in daytime. */
const SKY_TIME_EMOJIS = ["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘", "🌙", "☀️"];

/** Fractional hour in local time (0–24), sub-hour precision for smooth sky motion. */
function getLocalFractionalHour() {
  const d = new Date();
  return (
    (d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds() + d.getMilliseconds() / 1000) / 3600
  );
}

function getSkyTimePhaseIndexFromHour(t) {
  if (t >= 7 && t < 17) return 9; // ☀️ day

  if ((t >= 6 && t < 7) || (t >= 17 && t < 18)) return 8; // 🌙 dawn / dusk

  // Night (18:00–06:00): sweep wax/wane (0–7)
  const night = t >= 18 ? (t - 18) / 12 : (t + 6) / 12;
  return Math.min(7, Math.floor(night * 8));
}

/** Sky gradients aligned with celestial phase (sun = daytime sky, not dark night blue). */
const SKY_GRAD_NIGHT =
  "linear-gradient(to bottom, #060d1f 0%, #0d2252 30%, #1a3a6e 55%, #1e5c3a 80%, #163020 100%)";
const SKY_GRAD_DAY =
  "linear-gradient(to bottom, #4aa8e0 0%, #72c3f5 28%, #a8d8f0 55%, #c5e8c8 75%, #5cbd3a 100%)";
const SKY_GRAD_TWILIGHT =
  "linear-gradient(to bottom, #1a1040 0%, #6b2d6e 18%, #c45a28 36%, #e88838 48%, #7aac58 70%, #3a7828 100%)";

function getSkyGradientForHour(t) {
  if (t >= 7 && t < 17) return SKY_GRAD_DAY;
  if ((t >= 6 && t < 7) || (t >= 17 && t < 18)) return SKY_GRAD_TWILIGHT;
  return SKY_GRAD_NIGHT;
}

function inferSkyKindFromHour(t) {
  if (t >= 7 && t < 17) return "day";
  if ((t >= 6 && t < 7) || (t >= 17 && t < 18)) return "twilight";
  return "night";
}

/** Star layer opacity: hidden in daytime, full at night, muted at twilight. */
function getStarsLayerOpacityForHour(t) {
  if (t >= 7 && t < 17) return 0.04;
  if (t >= 6 && t < 7) return 0.15 + (t - 6) * 0.35;
  if (t >= 17 && t < 18) return 0.5 - (t - 17) * 0.35;
  return 0.5;
}

function getSkyGradientForSkyKind(kind) {
  if (kind === "day") return SKY_GRAD_DAY;
  if (kind === "twilight") return SKY_GRAD_TWILIGHT;
  return SKY_GRAD_NIGHT;
}

/** Sun / twilight / night glyph index when using observed sun altitude. */
function getSkyTimePhaseFromObserved(altDeg, tHour) {
  if (altDeg > 2) return 9;
  if (altDeg > -8) return 8;
  const night = tHour >= 18 ? (tHour - 18) / 12 : (tHour + 6) / 12;
  return Math.min(7, Math.floor(night * 8));
}

function skyCoordsFromSettings(s) {
  const la = Number(s?.sky_latitude);
  const lo = Number(s?.sky_longitude);
  if (Number.isFinite(la) && Number.isFinite(lo)) return { lat: la, lng: lo };
  return { lat: null, lng: null };
}

function getParallaxSkyBootstrap() {
  const tHour = getLocalFractionalHour();
  if (typeof window === "undefined") {
    return {
      skyInitial: getSkyGradientForHour(tHour),
      celestialTop0: getCelestialTopPercent(tHour, 0),
      celestialLeft0: getCelestialLeftPercent(0),
      initialPhase: getSkyTimePhaseIndexFromHour(tHour),
    };
  }
  const w = typeof window.__gameDisplayWorldProgress === "number" ? window.__gameDisplayWorldProgress : 0;
  const coords = skyCoordsFromSettings(loadGameSettings());
  if (coords.lat == null) {
    return {
      skyInitial: getSkyGradientForHour(tHour),
      celestialTop0: getCelestialTopPercent(tHour, w),
      celestialLeft0: getCelestialLeftPercent(w),
      initialPhase: getSkyTimePhaseIndexFromHour(tHour),
    };
  }
  const env = getObservedSkyEnvironment(coords.lat, coords.lng, new Date(), w);
  if (!env) {
    return {
      skyInitial: getSkyGradientForHour(tHour),
      celestialTop0: getCelestialTopPercent(tHour, w),
      celestialLeft0: getCelestialLeftPercent(w),
      initialPhase: getSkyTimePhaseIndexFromHour(tHour),
    };
  }
  return {
    skyInitial: getSkyGradientForSkyKind(env.skyKind),
    celestialTop0: env.topPercent,
    celestialLeft0: env.leftPercent,
    initialPhase: getSkyTimePhaseFromObserved(env.sunAltDegrees, tHour),
  };
}

/** 0–1 through local calendar day (midnight → midnight), for sun/moon arc across the sky. */
function getLocalDayFraction() {
  const d = new Date();
  return (
    (d.getHours() * 3600000 + d.getMinutes() * 60000 + d.getSeconds() * 1000 + d.getMilliseconds()) /
    86400000
  );
}

/** Horizontal anchor % (left) for the celestial emoji: drifts with real time + slight run-linked offset. */
function getCelestialLeftPercent(smoothWorldProgress) {
  const frac = getLocalDayFraction();
  const base = 6 + frac * 88;
  const w = typeof smoothWorldProgress === "number" && Number.isFinite(smoothWorldProgress) ? smoothWorldProgress : 0;
  // Smooth drift with run — avoid (w * k) % 1 which snapped the moon/sun in a tight loop every ~0.9 path units
  const runWiggle = Math.sin(w * 0.09) * 3.2;
  return ((base + runWiggle) % 100 + 100) % 100;
}

function solarArcTopPercent(t) {
  const p = Math.min(1, Math.max(0, (t - 6) / 12));
  return arcTopFromProgress(p);
}

/** Hours since 18:00 going through midnight to 06:00 → 0..12 for one night arc. */
function lunarArcTopPercent(t) {
  const fromDusk = t >= 18 ? t - 18 : t + 6;
  const p = Math.min(1, Math.max(0, fromDusk / 12));
  return arcTopFromProgress(p);
}

/**
 * Vertical position from local time only (phase-independent) so rise/set arcs stay smooth while
 * glyphs crossfade; twilight ramps day vs night altitude over 6–7 and 17–18.
 */
function getCelestialTopPercent(tHour, smoothWorldProgress) {
  const ySun = solarArcTopPercent(tHour);
  const yMoon = lunarArcTopPercent(tHour);
  let dayWeight;
  if (tHour < 6) dayWeight = 0;
  else if (tHour < 7) dayWeight = tHour - 6;
  else if (tHour < 17) dayWeight = 1;
  else if (tHour < 18) dayWeight = 1 - (tHour - 17);
  else dayWeight = 0;
  let y = ySun * dayWeight + yMoon * (1 - dayWeight);
  const w = typeof smoothWorldProgress === "number" && Number.isFinite(smoothWorldProgress) ? smoothWorldProgress : 0;
  y += Math.sin(w * 0.07) * 0.4;
  return clampCelestialTopPct(y);
}

const SKY_BAND_HEIGHT_PCT = 75;

/** Blend mode: screen + blue sky ⇒ cyan fringe; sun uses normal compositing with warm-only stops. */
function celestialLightMixBlendModeForPhase(phase) {
  if (phase === 9) return "normal";
  if (phase === 8) return "soft-light";
  return "screen";
}

/** Transparent core so the emoji stays visible when this layer is painted on top (corona in front). */
function celestialLightRadialGradient(phase) {
  if (phase === 9) {
    return "radial-gradient(circle, transparent 0%, transparent 5%, rgba(255,248,220,0.88) 12%, rgba(255,220,130,0.5) 26%, rgba(255,175,70,0.28) 42%, rgba(255,155,55,0.08) 58%, transparent 72%)";
  }
  if (phase === 8) {
    return "radial-gradient(circle, transparent 0%, transparent 5%, rgba(255,245,225,0.58) 13%, rgba(200,215,255,0.36) 30%, rgba(130,150,210,0.12) 50%, transparent 70%)";
  }
  return "radial-gradient(circle, transparent 0%, transparent 6%, rgba(232,238,255,0.72) 14%, rgba(185,200,238,0.34) 32%, rgba(110,130,190,0.12) 48%, transparent 64%)";
}

function celestialLightDiameterForPhase(phase) {
  if (phase === 9) return "min(125vw, 880px)";
  if (phase === 8) return "min(102vw, 680px)";
  return "min(88vw, 540px)";
}

function celestialLightOpacityForPhase(phase, skyKind) {
  if (phase === 9) return skyKind === "day" ? 0.62 : 0.48;
  if (phase === 8) return 0.52;
  return skyKind === "night" ? 0.44 : 0.28;
}

function skyWashRadialAt(phase, skyKind, leftPct, topPctViewport) {
  const gy = Math.min(100, Math.max(0, (topPctViewport / SKY_BAND_HEIGHT_PCT) * 100));
  if (phase === 9) {
    const core = skyKind === "day" ? "rgba(255,246,210,0.42)" : "rgba(255,225,170,0.32)";
    return {
      background: `radial-gradient(ellipse 70% 55% at ${leftPct}% ${gy}%, ${core} 0%, rgba(255,205,130,0.16) 40%, rgba(255,190,110,0) 72%)`,
      opacity: skyKind === "day" ? 0.42 : 0.34,
    };
  }
  if (phase === 8) {
    return {
      background: `radial-gradient(ellipse 65% 50% at ${leftPct}% ${gy}%, rgba(255,235,210,0.28) 0%, rgba(160,185,230,0.2) 42%, transparent 70%)`,
      opacity: 0.42,
    };
  }
  return {
    background: `radial-gradient(ellipse 55% 48% at ${leftPct}% ${gy}%, rgba(210,220,255,0.32) 0%, rgba(90,110,170,0.12) 45%, transparent 68%)`,
    opacity: skyKind === "night" ? 0.22 : 0.14,
  };
}

const CELESTIAL_CROSSFADE_MS = 520;

function smoothstep01(t) {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

// 5 parallax layers (indices 0–6, indices 1–2 are mountains, 3–6 are trees+ground)

function ParallaxBackground() {
  const skyBoot = useMemo(() => getParallaxSkyBootstrap(), []);
  const skyCoordsRef = useRef(
    typeof window !== "undefined" ? skyCoordsFromSettings(loadGameSettings()) : { lat: null, lng: null }
  );
  const refs = useRef([]);
  const speeds = useRef([]);
  const rafId = useRef(null);
  const celestialRef = useRef(null);
  const celestialLightRef = useRef(null);
  const skyWashRef = useRef(null);
  const celARef = useRef(null);
  const celBRef = useRef(null);
  const skyRootRef = useRef(null);
  const skyBandRef = useRef(null);
  const celBlendRef = useRef({
    stablePhase: skyBoot.initialPhase,
    blending: false,
    fromPhase: 0,
    toPhase: 0,
    blendStart: 0,
  });
  const [sprites, setSprites] = useState({});
  const spritesRef = useRef({});
  const layerMapRef = useRef(new Map());

  const reloadSprites = React.useCallback(() => {
    const s = loadGameSettings();
    const newSprites = {
      // Layer 1: sky
      stars: s.parallax_stars || null,
      // Layer 2: far mountains
      mountainFar: s.parallax_mountain_far || null,
      mountainMid: s.parallax_mountain_mid || null,
      // Layer 3: far trees — default to PC tree_b (far, smaller)
      treeVeryFar: s.parallax_tree_very_far || "/sprites/environment/props/tree_b.png",
      // Layer 4: mid trees — default to PC tree_a (main canopy)
      treeMid: s.parallax_tree_mid || "/sprites/environment/props/tree_a.png",
      // Layer 5: near trees / shrubs — default to PC vegetation
      treeFront: s.parallax_tree_front || "/sprites/environment/props/tree_c.png",
      // Layer 6: ground
      ground: s.parallax_ground || null,
    };
    spritesRef.current = newSprites;
    setSprites(newSprites);
  }, []);

  const reloadSkyCoords = React.useCallback(() => {
    skyCoordsRef.current = skyCoordsFromSettings(loadGameSettings());
  }, []);

  useEffect(() => {
    reloadSprites();
    reloadSkyCoords();
    const onStorage = (e) => {
      if (e.key === "game_settings_config" || e.key === null) {
        reloadSprites();
        reloadSkyCoords();
      }
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(GAME_SETTINGS_UPDATED_EVENT, reloadSprites);
    window.addEventListener(GAME_SETTINGS_UPDATED_EVENT, reloadSkyCoords);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(GAME_SETTINGS_UPDATED_EVENT, reloadSprites);
      window.removeEventListener(GAME_SETTINGS_UPDATED_EVENT, reloadSkyCoords);
    };
  }, [reloadSprites, reloadSkyCoords]);

  useLayoutEffect(() => {
    const a = celARef.current;
    const p = celBlendRef.current.stablePhase;
    if (a && !a.textContent) a.textContent = SKY_TIME_EMOJIS[p];
  }, []);

  useEffect(() => {
    const loopWidth = 3000;
    // Game state updates worldProgress ~10/s; RAF runs ~60/s — interpolate so scroll isn't stepped/choppy.
    const smoothRef = { current: null };
    const tick = () => {
      const target = window.__gameRunProgress?.current ?? 0;
      if (smoothRef.current === null) smoothRef.current = target;
      const prev = smoothRef.current;
      let smooth = prev + (target - prev) * 0.28;
      // Snap when very close to avoid endless micro-drift
      if (Math.abs(target - smooth) < 0.0005) smooth = target;
      smoothRef.current = smooth;
      // Same value as parallax scroll — EnemyCluster / bow aim read this so sprites aren’t stepped while layers glide at 60fps.
      if (typeof window !== "undefined") window.__gameDisplayWorldProgress = smooth;

      const coordsNow = skyCoordsRef.current;
      const observedEnv =
        coordsNow.lat != null && coordsNow.lng != null
          ? getObservedSkyEnvironment(coordsNow.lat, coordsNow.lng, new Date(), smooth)
          : null;

      const tHour = getLocalFractionalHour();
      const skyKind = observedEnv?.skyKind ?? inferSkyKindFromHour(tHour);
      const phase = observedEnv
        ? getSkyTimePhaseFromObserved(observedEnv.sunAltDegrees, tHour)
        : getSkyTimePhaseIndexFromHour(tHour);

      let celLeft;
      let celTop;
      if (observedEnv) {
        celLeft = observedEnv.leftPercent;
        celTop = observedEnv.topPercent;
      } else {
        celLeft = getCelestialLeftPercent(smooth);
        celTop = getCelestialTopPercent(tHour, smooth);
      }

      const outer = celestialRef.current;
      const lightEl = celestialLightRef.current;
      const washEl = skyWashRef.current;
      if (outer) {
        outer.style.left = `${celLeft}%`;
        outer.style.top = `${celTop}%`;
      }
      if (lightEl) {
        const d = celestialLightDiameterForPhase(phase);
        lightEl.style.width = d;
        lightEl.style.height = d;
        lightEl.style.background = celestialLightRadialGradient(phase);
        lightEl.style.opacity = String(celestialLightOpacityForPhase(phase, skyKind));
        lightEl.style.mixBlendMode = celestialLightMixBlendModeForPhase(phase);
      }
      if (washEl) {
        const w = skyWashRadialAt(phase, skyKind, celLeft, celTop);
        washEl.style.background = w.background;
        washEl.style.opacity = String(w.opacity);
      }

      const spanA = celARef.current;
      const spanB = celBRef.current;
      if (outer && spanA && spanB) {
        const cs = celBlendRef.current;
        const now = performance.now();
        const em = (i) => SKY_TIME_EMOJIS[i];

        if (!cs.blending) {
          if (phase !== cs.stablePhase) {
            cs.blending = true;
            cs.fromPhase = cs.stablePhase;
            cs.toPhase = phase;
            cs.blendStart = now;
            spanA.textContent = em(cs.fromPhase);
            spanB.textContent = em(cs.toPhase);
            spanA.style.opacity = "1";
            spanB.style.opacity = "0";
          } else {
            if (spanA.textContent !== em(phase)) spanA.textContent = em(phase);
            spanA.style.opacity = "1";
            spanB.textContent = "";
            spanB.style.opacity = "0";
          }
        } else {
          if (phase !== cs.toPhase) {
            cs.fromPhase = cs.toPhase;
            cs.toPhase = phase;
            cs.blendStart = now;
            spanA.textContent = em(cs.fromPhase);
            spanB.textContent = em(cs.toPhase);
            spanA.style.opacity = "1";
            spanB.style.opacity = "0";
          }
          const u = Math.min(1, (now - cs.blendStart) / CELESTIAL_CROSSFADE_MS);
          const e = smoothstep01(u);
          spanA.style.opacity = String(1 - e);
          spanB.style.opacity = String(e);
          if (u >= 1) {
            cs.stablePhase = cs.toPhase;
            cs.blending = false;
            spanA.textContent = em(cs.stablePhase);
            spanA.style.opacity = "1";
            spanB.textContent = "";
            spanB.style.opacity = "0";
          }
        }
      }

      const cx = smooth * 40;
      const wrappedCx = ((cx % loopWidth) + loopWidth) % loopWidth;

      for (let i = 0; i < refs.current.length; i++) {
        const el = refs.current[i];
        if (el && layerMapRef.current.has(i)) {
          const speed = layerMapRef.current.get(i);
          const offset = -wrappedCx * speed;
          el.style.transform = `translate3d(${offset}px,0,0)`;
        }
      }

      const skyGrad = observedEnv ? getSkyGradientForSkyKind(observedEnv.skyKind) : getSkyGradientForHour(tHour);
      const starsOpacity = observedEnv ? observedEnv.starsOpacity : getStarsLayerOpacityForHour(tHour);
      const rootEl = skyRootRef.current;
      const bandEl = skyBandRef.current;
      if (rootEl) rootEl.style.background = skyGrad;
      if (bandEl) bandEl.style.background = skyGrad;
      const starsEl = refs.current[0];
      if (starsEl && layerMapRef.current.has(0)) {
        starsEl.style.opacity = String(starsOpacity);
      }

      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  const layer = (idx, speed, top, height, opacity, children) => {
    speeds.current[idx] = speed;
    layerMapRef.current.set(idx, speed);
    return (
      <div
        key={`layer-${idx}`}
        ref={el => { refs.current[idx] = el; }}
        style={{ position: "absolute", left: 0, right: 0, top: `${top}%`, height: `${height}%`, opacity, pointerEvents: "none", willChange: "transform" }}
      >
        {children}
      </div>
    );
  };

  const skyInitial = skyBoot.skyInitial;
  const celestialTop0 = skyBoot.celestialTop0;

  return (
    <div
      ref={skyRootRef}
      style={{ position: "absolute", inset: 0, overflow: "hidden", background: skyInitial, willChange: "transform" }}
    >
      {/* Sky */}
      <div
        ref={skyBandRef}
        style={{ position: "absolute", inset: 0, height: `${SKY_BAND_HEIGHT_PCT}%`, background: skyInitial, pointerEvents: "none" }}
      >
        <div
          ref={skyWashRef}
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            mixBlendMode: "soft-light",
            opacity: 0,
            willChange: "opacity, background",
          }}
          aria-hidden
        />
      </div>

      {/* LAYER 1 — Stars / sky drift */}
      {layer(0, 0.01, 0, 65, 0.5,
        sprites.stars ? (
          <SpriteTileRow spriteUrl={sprites.stars} tileWidth={200} count={20} />
        ) : (
          <div style={{ position: "relative", width: "200%", height: "100%" }}>
            {/* Stars */}
            {Array.from({ length: 48 }).map((_, i) => (
              <div key={`star-${i}`} style={{
                position: "absolute",
                width: `${1 + i % 3}px`, height: `${1 + i % 3}px`,
                borderRadius: "50%", background: "white",
                top: `${3 + (i * 11) % 45}%`, left: `${(i * 4.17) % 100}%`,
                opacity: 0.15 + (i % 5) * 0.08,
              }} />
            ))}
            {/* Clouds — puff shapes drifting in the upper sky */}
            {Array.from({ length: 8 }).map((_, i) => {
              const cx = (i * 12.5) % 100;
              const cy = 15 + (i * 7) % 30;
              const w = 80 + (i * 23) % 100;
              return (
                <svg key={`cloud-${i}`} style={{ position: "absolute", left: `${cx}%`, top: `${cy}%`, opacity: 0.12 + (i % 3) * 0.06, width: w, height: w * 0.4 }} viewBox="0 0 120 50">
                  <ellipse cx="60" cy="34" rx="55" ry="16" fill="white" />
                  <ellipse cx="40" cy="26" rx="28" ry="20" fill="white" />
                  <ellipse cx="75" cy="22" rx="24" ry="18" fill="white" />
                  <ellipse cx="55" cy="18" rx="20" ry="16" fill="white" />
                </svg>
              );
            })}
          </div>
        )
      )}

      {/* LAYER 2 — Mountains (far + mid stacked in same scrolling div) */}
      {layer(1, 0.03, 8, 45, 0.5,
        sprites.mountainFar ? (
          <SpriteTileRow spriteUrl={sprites.mountainFar} tileWidth={200} count={16} />
        ) : (
          <div style={{ position: "relative", width: "200%", height: "100%" }}>
            {/* Far mountain range — smooth distant silhouette */}
            <svg style={{ position: "absolute", bottom: "45%", left: 0, width: "100%", height: "60%" }} viewBox="0 0 2000 200" preserveAspectRatio="none">
              <polygon points="0,200 0,130 60,90 130,110 200,60 280,85 360,40 440,70 520,30 600,55 680,20 760,50 840,15 920,45 1000,10 1080,40 1160,20 1240,50 1320,30 1400,60 1480,35 1560,65 1640,45 1720,80 1800,55 1880,75 1940,95 2000,120 2000,200" fill="rgba(40,55,80,0.55)" />
            </svg>
            {/* Mid hill range — slightly in front, more green tones */}
            <svg style={{ position: "absolute", bottom: "20%", left: 0, width: "100%", height: "55%" }} viewBox="0 0 2000 200" preserveAspectRatio="none">
              <polygon points="0,200 0,160 80,120 160,140 240,100 340,115 420,80 500,95 580,65 680,85 760,55 860,75 940,45 1040,68 1120,38 1220,60 1300,35 1400,55 1480,40 1580,62 1660,48 1760,70 1840,90 1920,110 2000,140 2000,200" fill="rgba(25,65,35,0.65)" />
            </svg>
            {/* Near hill base */}
            <svg style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "35%" }} viewBox="0 0 2000 100" preserveAspectRatio="none">
              <polygon points="0,100 0,60 100,45 200,55 320,30 440,48 560,25 680,40 800,20 920,38 1040,18 1160,35 1280,15 1400,32 1520,12 1640,30 1760,48 1880,35 2000,50 2000,100" fill="rgba(18,55,25,0.75)" />
            </svg>
          </div>
        )
      )}

      {/* Atmospheric haze / horizon fog — sits just above the treeline */}
      <div
        style={{
          position: "absolute",
          left: 0, right: 0,
          top: "52%",
          height: "14%",
          pointerEvents: "none",
          zIndex: 18,
          background: "linear-gradient(to bottom, transparent 0%, rgba(180,210,240,0.18) 40%, rgba(200,230,210,0.28) 70%, transparent 100%)",
          mixBlendMode: "screen",
        }}
        aria-hidden
      />

      {/* Sun / moon: drawn above mountain silhouettes; radial glow + sky wash updated in RAF */}
      <div
        ref={celestialRef}
        className="select-none pointer-events-none"
        style={{
          position: "absolute",
          top: `${celestialTop0}%`,
          left: `${skyBoot.celestialLeft0}%`,
          right: "auto",
          transform: "translateX(-50%)",
          zIndex: 22,
          fontSize: "clamp(1.75rem, 6vw, 3.25rem)",
          lineHeight: 1,
          fontFamily: '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif',
          willChange: "left, top",
        }}
        aria-hidden
      >
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "inline-block",
            minWidth: "2.5rem",
            minHeight: "1.25em",
            filter: "drop-shadow(0 0 10px rgba(255, 255, 255, 0.35))",
          }}
        >
          <span
            ref={celARef}
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              whiteSpace: "nowrap",
              opacity: 1,
            }}
          />
          <span
            ref={celBRef}
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              whiteSpace: "nowrap",
              opacity: 0,
            }}
          />
        </div>
        <div
          ref={celestialLightRef}
          style={{
            position: "absolute",
            left: "50%",
            top: "clamp(0.75rem, 3.2vw, 1.2rem)",
            transform: "translate(-50%, -50%)",
            zIndex: 2,
            pointerEvents: "none",
            borderRadius: "50%",
            filter: "blur(5px)",
            mixBlendMode: "normal",
            width: "min(125vw, 880px)",
            height: "min(125vw, 880px)",
            opacity: 0.7,
            willChange: "opacity, width, height, background",
          }}
          aria-hidden
        />
      </div>

      {/* LAYER 3 — Far background trees */}
      {layer(3, 0.08, 45, 40, 0.6,
        sprites.treeVeryFar ? (
          <SpriteTileRow spriteUrl={sprites.treeVeryFar} tileWidth={42} count={90} />
        ) : (
          <div style={{ display: "flex", width: "200%", height: "100%", alignItems: "flex-end", gap: "3px" }}>
            {Array.from({ length: 72 }).map((_, i) => {
              const h = 55 + (i * 17) % 45;
              const w = 26 + (i * 7) % 20;
              const kind = i % 5; // 0-2 = pine, 3-4 = distant round tree
              const dark = `rgba(${8 + (i%3)*4},${48 + (i%4)*7},${14 + (i%3)*4},0.65)`;
              const mid  = `rgba(${12+(i%3)*5},${60+(i%4)*8},${18+(i%3)*5},0.60)`;
              const light= `rgba(${16+(i%3)*5},${72+(i%4)*7},${22+(i%3)*4},0.55)`;
              const trunkCol = "rgba(30,16,6,0.6)";
              if (kind <= 2) return (
                // Pine — 3-tier
                <svg key={i} viewBox="0 0 50 110" style={{ flex: `0 0 ${w}px`, height: `${h}%` }}>
                  <polygon points="25,2 36,34 14,34" fill={dark} />
                  <polygon points="25,18 38,52 12,52" fill={mid} />
                  <polygon points="25,36 40,72 10,72" fill={light} />
                  <rect x="22" y="72" width="6" height="38" fill={trunkCol} />
                </svg>
              );
              if (kind === 3) return (
                // Distant round deciduous
                <svg key={i} viewBox="0 0 50 100" style={{ flex: `0 0 ${w * 1.2}px`, height: `${h * 0.75}%` }}>
                  <rect x="22" y="62" width="5" height="38" fill={trunkCol} />
                  <circle cx="25" cy="48" r="18" fill={dark} />
                  <circle cx="16" cy="40" r="13" fill={mid} />
                  <circle cx="34" cy="40" r="13" fill={mid} />
                  <circle cx="25" cy="28" r="12" fill={light} />
                </svg>
              );
              // Tall thin spire
              return (
                <svg key={i} viewBox="0 0 30 120" style={{ flex: `0 0 ${w * 0.65}px`, height: `${h}%` }}>
                  <rect x="13" y="90" width="4" height="30" fill={trunkCol} />
                  <polygon points="15,2 22,30 8,30" fill={dark} />
                  <polygon points="15,18 23,48 7,48" fill={mid} />
                  <polygon points="15,36 24,68 6,68" fill={light} />
                  <polygon points="15,56 25,90 5,90" fill={dark} />
                </svg>
              );
            })}
          </div>
        )
      )}

      {/* LAYER 4 — Mid trees (main tree band) */}
      {layer(4, 0.35, 40, 45, 0.9,
        sprites.treeMid ? (
          <SpriteTileRow spriteUrl={sprites.treeMid} tileWidth={65} count={60} />
        ) : (
          <div style={{ display: "flex", width: "200%", height: "100%", alignItems: "flex-end", gap: "1px" }}>
            {Array.from({ length: 50 }).map((_, i) => {
              const kind = i % 3;
              const w = 52 + (i * 11) % 28;
              const h = 70 + (i * 13) % 30;
              const g1 = `rgba(${18+(i%4)*5},${85+(i%5)*10},${26+(i%4)*4},0.94)`;
              const g2 = `rgba(${28+(i%4)*5},${110+(i%5)*8},${36+(i%4)*4},0.91)`;
              const g3 = `rgba(${14+(i%4)*4},${68+(i%5)*9},${20+(i%4)*3},0.88)`;
              const trunk = `rgba(${80+(i%3)*12},${48+(i%4)*8},${20+(i%3)*6},1)`;
              if (kind === 0) return (
                // Round canopy deciduous
                <svg key={i} viewBox="0 0 60 120" style={{ flex: `0 0 ${w}px`, height: `${h}%` }}>
                  <rect x="27" y="72" width="6" height="48" fill={trunk} />
                  <circle cx="30" cy="55" r="22" fill={g3} />
                  <circle cx="18" cy="45" r="17" fill={g1} />
                  <circle cx="42" cy="45" r="17" fill={g1} />
                  <circle cx="30" cy="32" r="16" fill={g2} />
                  <circle cx="20" cy="38" r="10" fill={g2} />
                  <circle cx="40" cy="38" r="10" fill={g2} />
                </svg>
              );
              if (kind === 1) return (
                // Tall pine
                <svg key={i} viewBox="0 0 50 120" style={{ flex: `0 0 ${w * 0.75}px`, height: `${h}%` }}>
                  <rect x="22" y="80" width="6" height="40" fill={trunk} />
                  <polygon points="25,4 38,40 12,40" fill={g1} />
                  <polygon points="25,22 40,58 10,58" fill={g2} />
                  <polygon points="25,42 42,80 8,80" fill={g3} />
                </svg>
              );
              // Bushy oak
              return (
                <svg key={i} viewBox="0 0 70 120" style={{ flex: `0 0 ${w * 1.1}px`, height: `${h}%` }}>
                  <rect x="32" y="70" width="7" height="50" fill={trunk} />
                  <ellipse cx="35" cy="52" rx="28" ry="24" fill={g3} />
                  <circle cx="20" cy="42" r="18" fill={g1} />
                  <circle cx="50" cy="42" r="18" fill={g1} />
                  <circle cx="35" cy="28" r="18" fill={g2} />
                  <circle cx="25" cy="36" r="12" fill={g2} />
                  <circle cx="45" cy="36" r="12" fill={g2} />
                </svg>
              );
            })}
          </div>
        )
      )}

      {/* LAYER 5 — Near trees + shrubs framing the path */}
      {layer(5, 0.65, 52, 44, 1.0,
        sprites.treeFront ? (
          <SpriteTileRow spriteUrl={sprites.treeFront} tileWidth={75} count={60} />
        ) : (
          <div style={{ display: "flex", width: "200%", height: "100%", alignItems: "flex-end", gap: "0px" }}>
            {Array.from({ length: 44 }).map((_, i) => {
              const kind = i % 4;
              const w = 60 + (i * 13) % 35;
              const g1 = `rgba(${22+(i%4)*6},${100+(i%5)*10},${30+(i%4)*5},0.97)`;
              const g2 = `rgba(${32+(i%4)*6},${125+(i%5)*8},${42+(i%4)*5},0.94)`;
              const g3 = `rgba(${16+(i%4)*5},${80+(i%5)*9},${22+(i%4)*4},0.92)`;
              const trunk = `rgba(${90+(i%3)*14},${52+(i%4)*9},${18+(i%3)*7},1)`;
              if (kind === 0) return (
                // Large round front tree
                <svg key={i} viewBox="0 0 70 130" style={{ flex: `0 0 ${w}px`, height: "100%" }}>
                  <rect x="31" y="75" width="8" height="55" fill={trunk} />
                  <circle cx="35" cy="58" rx="27" r="27" fill={g3} />
                  <circle cx="20" cy="46" r="22" fill={g1} />
                  <circle cx="50" cy="46" r="22" fill={g1} />
                  <circle cx="35" cy="30" r="20" fill={g2} />
                  <circle cx="22" cy="40" r="14" fill={g2} />
                  <circle cx="48" cy="40" r="14" fill={g2} />
                </svg>
              );
              if (kind === 1) return (
                // Shrub cluster
                <svg key={i} viewBox="0 0 80 60" style={{ flex: `0 0 ${w * 1.1}px`, height: "45%" }}>
                  <ellipse cx="40" cy="42" rx="36" ry="18" fill={g3} />
                  <circle cx="20" cy="32" r="16" fill={g1} />
                  <circle cx="40" cy="26" r="18" fill={g2} />
                  <circle cx="60" cy="32" r="16" fill={g1} />
                  <circle cx="12" cy="38" r="11" fill={g2} />
                  <circle cx="68" cy="38" r="11" fill={g2} />
                  {/* Little flowers */}
                  <circle cx="22" cy="28" r="3" fill="rgba(255,200,80,0.9)" />
                  <circle cx="55" cy="24" r="3" fill="rgba(255,120,120,0.9)" />
                  <circle cx="40" cy="18" r="3" fill="rgba(200,120,255,0.85)" />
                </svg>
              );
              if (kind === 2) return (
                // Tall pine
                <svg key={i} viewBox="0 0 55 130" style={{ flex: `0 0 ${w * 0.8}px`, height: "100%" }}>
                  <rect x="24" y="88" width="7" height="42" fill={trunk} />
                  <polygon points="27,5 42,44 12,44" fill={g1} />
                  <polygon points="27,26 44,66 10,66" fill={g2} />
                  <polygon points="27,48 46,88 8,88" fill={g3} />
                </svg>
              );
              // Wide oak + grass tuft
              return (
                <svg key={i} viewBox="0 0 90 130" style={{ flex: `0 0 ${w * 1.2}px`, height: "100%" }}>
                  <rect x="41" y="72" width="8" height="58" fill={trunk} />
                  <ellipse cx="45" cy="55" rx="36" ry="28" fill={g3} />
                  <circle cx="26" cy="43" r="24" fill={g1} />
                  <circle cx="64" cy="43" r="24" fill={g1} />
                  <circle cx="45" cy="26" r="22" fill={g2} />
                  {/* Grass tufts at base */}
                  <ellipse cx="20" cy="125" rx="14" ry="6" fill={g2} />
                  <ellipse cx="70" cy="125" rx="14" ry="6" fill={g1} />
                </svg>
              );
            })}
          </div>
        )
      )}

      {/* LAYER 6 — Ground strip: players, enemies, shrubs, coins, powerups live here */}
      {layer(6, 0.95, 79, 21, 1.0,
        sprites.ground ? (
          <SpriteTileRow spriteUrl={sprites.ground} tileWidth={200} count={20} />
        ) : (
          <svg style={{ width: "200%", height: "100%", display: "block" }} viewBox="0 0 2000 120" preserveAspectRatio="none">
            <defs>
              <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5ecf30" />
                <stop offset="12%" stopColor="#44b820" />
                <stop offset="38%" stopColor="#2d8810" />
                <stop offset="100%" stopColor="#0d2808" />
              </linearGradient>
              <linearGradient id="pathGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c8a050" />
                <stop offset="100%" stopColor="#8a6030" />
              </linearGradient>
            </defs>
            {/* Base fill */}
            <rect x="0" y="0" width="2000" height="120" fill="url(#groundGrad)" />
            {/* Bright grass highlight at the very top edge */}
            <rect x="0" y="0" width="2000" height="5" fill="rgba(120,220,60,0.35)" />
            {/* Dirt path */}
            <rect x="0" y="0" width="2000" height="16" fill="url(#pathGrad)" opacity="0.55" />
            {/* Path edge shadow */}
            <rect x="0" y="15" width="2000" height="3" fill="rgba(0,0,0,0.2)" />
            {/* Grass tufts */}
            {Array.from({ length: 48 }).map((_, i) => (
              <g key={i} transform={`translate(${i * 43 + (i%5)*7}, 0)`}>
                <ellipse cx="4" cy="14" rx="9" ry="6" fill={`rgba(${62+(i%4)*8},${178+(i%5)*9},${40+(i%4)*6},0.92)`} />
                <ellipse cx="20" cy="12" rx="7" ry="5" fill={`rgba(${50+(i%4)*7},${155+(i%5)*9},${30+(i%4)*5},0.88)`} />
                <ellipse cx="12" cy="9" rx="5" ry="4" fill={`rgba(${78+(i%4)*6},${195+(i%5)*6},${50+(i%4)*4},0.78)`} />
              </g>
            ))}
            {/* Scattered rocks */}
            {Array.from({ length: 22 }).map((_, i) => (
              <g key={`rock-${i}`} transform={`translate(${60 + i * 88 + (i%5)*14}, ${8 + (i%3)*5})`}>
                <ellipse cx="0" cy="0" rx={5+(i%3)*2} ry={3+(i%2)*2} fill={`rgba(${105+(i%4)*18},${95+(i%3)*14},${78+(i%4)*12},0.75)`} />
                <ellipse cx="0" cy="-1" rx={3+(i%3)*1} ry={1+(i%2)*1} fill={`rgba(${150+(i%4)*15},${140+(i%3)*12},${120+(i%4)*10},0.4)`} />
              </g>
            ))}
            {/* Small wildflowers scattered in the grass */}
            {Array.from({ length: 16 }).map((_, i) => (
              <circle key={`flower-${i}`} cx={35 + i * 125 + (i%4)*18} cy={22 + (i%3)*12} r="3"
                fill={["rgba(255,220,60,0.9)","rgba(255,100,140,0.85)","rgba(180,120,255,0.8)","rgba(255,180,50,0.9)"][i%4]} />
            ))}
          </svg>
        )
      )}

      {/* Vignette — elliptical so it's softer at top/bottom, darker at sides */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 110% 100% at 50% 50%, transparent 40%, rgba(0,0,0,0.22) 70%, rgba(0,0,0,0.58) 100%)",
      }} />
      {/* Top atmospheric darkening */}
      <div style={{
        position: "absolute", left: 0, right: 0, top: 0, height: "18%", pointerEvents: "none",
        background: "linear-gradient(to bottom, rgba(0,0,0,0.28) 0%, transparent 100%)",
      }} />
    </div>
  );
}

export default React.memo(ParallaxBackground);