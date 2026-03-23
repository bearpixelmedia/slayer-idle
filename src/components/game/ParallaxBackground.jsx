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
  "linear-gradient(to bottom, #0a1628 0%, #1e4080 40%, #2d6e3a 100%)";
const SKY_GRAD_DAY =
  "linear-gradient(to bottom, #7ec4ea 0%, #9bd6f2 35%, #c8e8f0 65%, #5cb870 100%)";
const SKY_GRAD_TWILIGHT =
  "linear-gradient(to bottom, #1e3a5c 0%, #4a7eb8 38%, #6aab78 100%)";

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

const PARALLAX_LAYERS = [
  { id: 0, speed: 0.01, top: 0, height: 60, opacity: 0.3 },
  { id: 1, speed: 0.04, top: 5, height: 30, opacity: 0.35 },
  { id: 2, speed: 0.08, top: 15, height: 35, opacity: 0.5 },
  { id: 3, speed: 0.12, top: 25, height: 26, opacity: 0.4 },
  { id: 4, speed: 0.18, top: 30, height: 30, opacity: 0.55 },
  { id: 5, speed: 0.28, top: 35, height: 34, opacity: 0.7 },
  { id: 6, speed: 0.40, top: 38, height: 38, opacity: 0.8 },
  { id: 7, speed: 0.55, top: 40, height: 43, opacity: 0.85 },
  { id: 8, speed: 0.72, top: 42, height: 48, opacity: 0.92 },
  { id: 9, speed: 0.88, top: 60, height: 22, opacity: 0.88 },
  { id: 10, speed: 1.05, top: 63, height: 24, opacity: 0.95 },
];

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
      treeVeryFar: s.parallax_tree_very_far || null,
      treeFar: s.parallax_tree_far || null,
      treeMidBack: s.parallax_tree_mid_back || null,
      treeMid: s.parallax_tree_mid || null,
      treeMidFront: s.parallax_tree_mid_front || null,
      treeFront: s.parallax_tree_front || null,
      mountainFar: s.parallax_mountain_far || null,
      mountainMid: s.parallax_mountain_mid || null,
      ground: s.parallax_ground || null,
      sky: s.parallax_sky || null,
      clouds: s.parallax_clouds || null,
      stars: s.parallax_stars || null,
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

      {/* Stars */}
      {layer(0, 0.01, 0, 60, 0.5,
        sprites.stars ? (
          <SpriteTileRow spriteUrl={sprites.stars} tileWidth={200} count={20} />
        ) : (
          <div style={{ position: "relative", width: "200%", height: "100%" }}>
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} style={{
                position: "absolute",
                width: `${1 + i % 3}px`, height: `${1 + i % 3}px`,
                borderRadius: "50%", background: "white",
                top: `${5 + (i * 13) % 40}%`, left: `${(i * 6.7) % 100}%`,
                opacity: 0.2 + (i % 4) * 0.1,
              }} />
            ))}
          </div>
        )
      )}

      {/* Far mountains — slow scroll vs mid (~5×) so depth reads like real parallax */}
      {layer(1, 0.03, 10, 30, 0.45,
        <SpriteTileRow spriteUrl={sprites.mountainFar} tileWidth={150} count={16} fallback={<ParallaxMountainFarFallback />} />
      )}

      {/* Mid mountains / hills — faster; jagged silhouette differs from far massifs */}
      {layer(2, 0.15, 20, 35, 0.65,
        <SpriteTileRow spriteUrl={sprites.mountainMid} tileWidth={150} count={20} fallback={<ParallaxMountainMidFallback />} />
      )}

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

      {/* Very far trees */}
      {layer(3, 0.22, 35, 26, 0.5,
        <SpriteTileRow spriteUrl={sprites.treeVeryFar} tileWidth={35} count={100} fallback={
          <div style={{ display: "flex", width: "200%", height: "100%", alignItems: "flex-end" }}>
            {Array.from({ length: 50 }).map((_, i) => (
              <svg key={i} viewBox="0 0 50 110" style={{ flex: "0 0 35px", height: "100%" }}>
                <circle cx="25" cy="20" r="8" fill="rgba(8,60,15,0.85)" />
                <circle cx="18" cy="28" r="6" fill="rgba(10,70,18,0.8)" />
                <circle cx="32" cy="28" r="6" fill="rgba(10,70,18,0.8)" />
                <rect x="23" y="36" width="4" height="74" fill="rgba(60,35,15,0.8)" />
              </svg>
            ))}
          </div>
        } />
      )}

      {/* Far trees */}
      {layer(4, 0.28, 33, 30, 0.65,
        <SpriteTileRow spriteUrl={sprites.treeFar} tileWidth={42} count={90} fallback={
          <div style={{ display: "flex", width: "200%", height: "100%", alignItems: "flex-end" }}>
            {Array.from({ length: 45 }).map((_, i) => (
              <svg key={i} viewBox="0 0 50 110" style={{ flex: "0 0 42px", height: "100%" }}>
                <circle cx="25" cy="18" r="10" fill="rgba(12,65,20,0.88)" />
                <circle cx="16" cy="28" r="8" fill="rgba(15,75,25,0.85)" />
                <circle cx="34" cy="28" r="8" fill="rgba(15,75,25,0.85)" />
                <circle cx="25" cy="38" r="7" fill="rgba(18,80,28,0.9)" />
                <rect x="22" y="44" width="5" height="66" fill="rgba(70,40,18,0.85)" />
              </svg>
            ))}
          </div>
        } />
      )}

      {/* Mid-back trees */}
      {layer(5, 0.43, 34, 34, 0.8,
        <SpriteTileRow spriteUrl={sprites.treeMidBack} tileWidth={58} count={76} fallback={
          <div style={{ display: "flex", width: "200%", height: "100%", alignItems: "flex-end" }}>
            {Array.from({ length: 38 }).map((_, i) => (
              <svg key={i} viewBox="0 0 50 110" style={{ flex: "0 0 58px", height: "100%" }}>
                <circle cx="25" cy="18" r="12" fill="rgba(15,80,25,0.92)" />
                <circle cx="15" cy="30" r="10" fill="rgba(22,100,32,0.9)" />
                <circle cx="35" cy="30" r="10" fill="rgba(22,100,32,0.9)" />
                <circle cx="25" cy="42" r="9" fill="rgba(28,120,40,0.88)" />
                <rect x="22" y="50" width="6" height="60" fill="rgba(90,55,25,0.96)" />
              </svg>
            ))}
          </div>
        } />
      )}

      {/* Mid trees */}
      {layer(6, 0.50, 31, 38, 0.85,
        <SpriteTileRow spriteUrl={sprites.treeMid} tileWidth={65} count={70} fallback={
          <div style={{ display: "flex", width: "200%", height: "100%", alignItems: "flex-end" }}>
            {Array.from({ length: 35 }).map((_, i) => (
              <svg key={i} viewBox="0 0 50 110" style={{ flex: "0 0 65px", height: "100%" }}>
                <circle cx="25" cy="16" r="14" fill="rgba(18,90,28,0.93)" />
                <circle cx="14" cy="30" r="12" fill="rgba(25,110,35,0.91)" />
                <circle cx="36" cy="30" r="12" fill="rgba(25,110,35,0.91)" />
                <circle cx="25" cy="44" r="10" fill="rgba(32,130,42,0.89)" />
                <rect x="22" y="52" width="6" height="58" fill="rgba(100,60,28,0.97)" />
              </svg>
            ))}
          </div>
        } />
      )}

      {/* Mid-front trees */}
      {layer(7, 0.57, 29, 43, 0.88,
        <SpriteTileRow spriteUrl={sprites.treeMidFront} tileWidth={70} count={64} fallback={
          <div style={{ display: "flex", width: "200%", height: "100%", alignItems: "flex-end" }}>
            {Array.from({ length: 32 }).map((_, i) => (
              <svg key={i} viewBox="0 0 50 110" style={{ flex: "0 0 70px", height: "100%" }}>
                <circle cx="25" cy="15" r="15" fill="rgba(20,95,30,0.94)" />
                <circle cx="13" cy="29" r="13" fill="rgba(28,115,37,0.92)" />
                <circle cx="37" cy="29" r="13" fill="rgba(28,115,37,0.92)" />
                <circle cx="25" cy="44" r="11" fill="rgba(35,135,44,0.9)" />
                <rect x="22" y="53" width="6" height="57" fill="rgba(110,65,30,0.98)" />
              </svg>
            ))}
          </div>
        } />
      )}

      {/* Front trees */}
      {layer(8, 0.65, 27, 48, 0.9,
        <SpriteTileRow spriteUrl={sprites.treeFront} tileWidth={75} count={90} fallback={
          <div style={{ display: "flex", width: "200%", height: "100%", alignItems: "flex-end" }}>
            {Array.from({ length: 45 }).map((_, i) => (
              <svg key={i} viewBox="0 0 50 110" style={{ flex: "0 0 75px", height: "100%" }}>
                <circle cx="25" cy="14" r="16" fill="rgba(22,100,32,0.95)" />
                <circle cx="12" cy="28" r="14" fill="rgba(30,120,39,0.93)" />
                <circle cx="38" cy="28" r="14" fill="rgba(30,120,39,0.93)" />
                <circle cx="25" cy="44" r="12" fill="rgba(38,140,47,0.91)" />
                <rect x="22" y="54" width="6" height="56" fill="rgba(120,70,32,1)" />
              </svg>
            ))}
          </div>
        } />
      )}

      {/* Shrubs: ParallaxShrubOverlay (below combat z-index, frames bottom of path) */}

      {/* Static ground */}
      {sprites.ground ? (
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "18%", pointerEvents: "none", display: "flex", alignItems: "flex-end" }}>
          <SpriteTileRow spriteUrl={sprites.ground} tileWidth={200} count={12} />
        </div>
      ) : (
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "18%", background: "linear-gradient(to bottom, #1e5c14, #0f2e08)", pointerEvents: "none" }} />
      )}

      {/* Vignette */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", boxShadow: "inset 0 0 120px rgba(0,0,0,0.55)" }} />
    </div>
  );
}

export default React.memo(ParallaxBackground);