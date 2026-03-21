import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { loadGameSettings } from "@/lib/gameSettings";
import SpriteTileRow from "./SpriteTileRow";

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
  const refs = useRef([]);
  const speeds = useRef([]);
  const rafId = useRef(null);
  const celestialRef = useRef(null);
  const celARef = useRef(null);
  const celBRef = useRef(null);
  const celBlendRef = useRef({
    stablePhase: getSkyTimePhaseIndexFromHour(getLocalFractionalHour()),
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

  useEffect(() => {
    reloadSprites();
    // Reload when localStorage changes (e.g. after saving in GameSettings)
    window.addEventListener("storage", reloadSprites);
    return () => window.removeEventListener("storage", reloadSprites);
  }, [reloadSprites]);

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

      const outer = celestialRef.current;
      const spanA = celARef.current;
      const spanB = celBRef.current;
      if (outer && spanA && spanB) {
        const tHour = getLocalFractionalHour();
        const phase = getSkyTimePhaseIndexFromHour(tHour);
        outer.style.left = `${getCelestialLeftPercent(smooth)}%`;

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

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "linear-gradient(to bottom, #0a1628 0%, #1e4080 40%, #2d6e3a 100%)", willChange: "transform" }}>
      {/* Sky */}
      <div style={{ position: "absolute", inset: 0, height: "75%", background: "linear-gradient(to bottom, #0a1628, #1e4080, #2d6e3a)", pointerEvents: "none" }} />

      {/* Time-of-day: two stacked glyphs crossfade in RAF (smoothstep ~520ms) */}
      <div
        ref={celestialRef}
        className="select-none pointer-events-none"
        style={{
          position: "absolute",
          top: "6%",
          left: `${getCelestialLeftPercent(
            typeof window !== "undefined" ? window.__gameDisplayWorldProgress : 0
          )}%`,
          right: "auto",
          transform: "translateX(-50%)",
          zIndex: 5,
          fontSize: "clamp(1.75rem, 6vw, 3.25rem)",
          lineHeight: 1,
          filter: "drop-shadow(0 0 12px rgba(255, 255, 230, 0.35))",
          fontFamily: '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif',
        }}
        aria-hidden
      >
        <div style={{ position: "relative", display: "inline-block", minWidth: "2.5rem", minHeight: "1.25em" }}>
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

      {/* Far mountains */}
      {layer(1, 0.06, 10, 30, 0.45,
        <SpriteTileRow spriteUrl={sprites.mountainFar} tileWidth={150} count={16} fallback={
          <div style={{ display: "flex", width: "200%", height: "100%", alignItems: "flex-end" }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <svg key={i} viewBox="0 0 150 200" style={{ flex: "0 0 150px", height: "100%" }}>
                <polygon points={`75,${15 + (i * 11) % 30} 0,200 150,200`} fill="rgba(30,65,110,0.5)" />
                <polygon points={`40,${35 + (i * 17) % 30} 0,200 80,200`} fill="rgba(20,55,100,0.4)" />
              </svg>
            ))}
          </div>
        } />
      )}

      {/* Mid mountains / hills */}
      {layer(2, 0.12, 20, 35, 0.65,
        <SpriteTileRow spriteUrl={sprites.mountainMid} tileWidth={150} count={20} fallback={
          <div style={{ display: "flex", width: "200%", height: "100%", alignItems: "flex-end" }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <svg key={i} viewBox="0 0 150 200" style={{ flex: "0 0 150px", height: "100%" }}>
                <polygon points={`75,${10 + (i * 13) % 28} 0,200 150,200`} fill="rgba(40,100,60,0.7)" />
                <polygon points={`40,${30 + (i * 19) % 35} 0,200 80,200`} fill="rgba(30,85,50,0.6)" />
              </svg>
            ))}
          </div>
        } />
      )}

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

      {/* Shrubs render in ParallaxShrubOverlay (above player/enemy) */}

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