import React, { useEffect, useRef, useState } from "react";
import { loadGameSettings } from "@/lib/gameSettings";
import SpriteTileRow from "./SpriteTileRow";

/**
 * Same parallax scroll as ParallaxBackground layers 9–10, but rendered above
 * player/enemy so shrubs read as foreground along the road.
 */
function ParallaxShrubOverlay() {
  const backRef = useRef(null);
  const frontRef = useRef(null);
  const rafId = useRef(null);
  const [sprites, setSprites] = useState({ shrubBack: null, shrubFront: null });

  const reloadSprites = React.useCallback(() => {
    const s = loadGameSettings();
    setSprites({
      shrubBack: s.parallax_shrub_back || null,
      shrubFront: s.parallax_shrub_front || null,
    });
  }, []);

  useEffect(() => {
    reloadSprites();
    window.addEventListener("storage", reloadSprites);
    return () => window.removeEventListener("storage", reloadSprites);
  }, [reloadSprites]);

  useEffect(() => {
    const loopWidth = 3000;
    const smoothRef = { current: null };
    const tick = () => {
      const target = window.__gameRunProgress?.current ?? 0;
      if (smoothRef.current === null) smoothRef.current = target;
      const prev = smoothRef.current;
      let smooth = prev + (target - prev) * 0.28;
      if (Math.abs(target - smooth) < 0.0005) smooth = target;
      smoothRef.current = smooth;

      const cx = smooth * 40;
      const wrappedCx = ((cx % loopWidth) + loopWidth) % loopWidth;

      const backSpeed = 0.84;
      const frontSpeed = 0.88;
      if (backRef.current) {
        backRef.current.style.transform = `translate3d(${-wrappedCx * backSpeed}px,0,0)`;
      }
      if (frontRef.current) {
        frontRef.current.style.transform = `translate3d(${-wrappedCx * frontSpeed}px,0,0)`;
      }
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId.current);
  }, []);

  const layerStyle = (top, height, opacity) => ({
    position: "absolute",
    left: 0,
    right: 0,
    top: `${top}%`,
    height: `${height}%`,
    opacity,
    pointerEvents: "none",
    willChange: "transform",
  });

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none z-[29]"
      aria-hidden
    >
      {/* Shrubs - back layer */}
      <div ref={backRef} style={layerStyle(72, 15, 0.82)}>
        {sprites.shrubBack ? (
          <SpriteTileRow spriteUrl={sprites.shrubBack} tileWidth={40} count={120} />
        ) : (
          <div style={{ display: "flex", width: "200%", height: "100%", alignItems: "flex-end", gap: "2px" }}>
            {Array.from({ length: 120 }).map((_, i) => {
              const type = i % 4;
              const s = 18 + (i % 5) * 7;
              const g1 = `rgba(${35 + (i % 3) * 8},${140 + (i % 4) * 10},${35 + (i % 3) * 5},0.9)`;
              const g2 = `rgba(${50 + (i % 3) * 8},${165 + (i % 4) * 8},${45 + (i % 3) * 5},0.85)`;
              const g3 = `rgba(${25 + (i % 3) * 8},${115 + (i % 4) * 10},${25 + (i % 3) * 5},0.88)`;
              if (type === 0)
                return (
                  <svg key={i} viewBox="0 0 40 40" style={{ flex: `0 0 ${s}px`, height: `${s}px`, opacity: 0.8 + (i % 3) * 0.07 }}>
                    <ellipse cx="20" cy="22" rx="18" ry="14" fill={g3} />
                    <circle cx="20" cy="16" r="13" fill={g1} />
                    <circle cx="10" cy="20" r="9" fill={g2} />
                    <circle cx="30" cy="20" r="9" fill={g2} />
                    <circle cx="20" cy="12" r="7" fill={g2} />
                  </svg>
                );
              if (type === 1)
                return (
                  <svg key={i} viewBox="0 0 30 50" style={{ flex: `0 0 ${s * 0.7}px`, height: `${s * 1.3}px`, opacity: 0.78 + (i % 3) * 0.07 }}>
                    <rect x="13" y="20" width="4" height="30" fill="rgba(60,35,15,0.8)" />
                    <ellipse cx="15" cy="18" rx="10" ry="14" fill={g1} />
                    <ellipse cx="7" cy="26" rx="7" ry="10" fill={g2} transform="rotate(-20,7,26)" />
                    <ellipse cx="23" cy="26" rx="7" ry="10" fill={g2} transform="rotate(20,23,26)" />
                  </svg>
                );
              if (type === 2)
                return (
                  <svg key={i} viewBox="0 0 55 30" style={{ flex: `0 0 ${s * 1.4}px`, height: `${s * 0.75}px`, opacity: 0.82 + (i % 3) * 0.07 }}>
                    <ellipse cx="27" cy="20" rx="25" ry="12" fill={g3} />
                    <circle cx="14" cy="16" r="10" fill={g1} />
                    <circle cx="27" cy="13" r="11" fill={g2} />
                    <circle cx="40" cy="16" r="10" fill={g1} />
                    <circle cx="7" cy="20" r="7" fill={g2} />
                    <circle cx="48" cy="20" r="7" fill={g2} />
                  </svg>
                );
              return (
                <svg key={i} viewBox="0 0 45 35" style={{ flex: `0 0 ${s * 1.1}px`, height: `${s}px`, opacity: 0.8 + (i % 3) * 0.08 }}>
                  <circle cx="10" cy="25" r="9" fill={g3} />
                  <circle cx="22" cy="18" r="12" fill={g1} />
                  <circle cx="35" cy="23" r="10" fill={g2} />
                  <circle cx="22" cy="14" r="8" fill={g2} />
                </svg>
              );
            })}
          </div>
        )}
      </div>

      {/* Shrubs - front layer */}
      <div ref={frontRef} style={layerStyle(75, 16, 0.9)}>
        {sprites.shrubFront ? (
          <SpriteTileRow spriteUrl={sprites.shrubFront} tileWidth={50} count={160} />
        ) : (
          <div style={{ display: "flex", width: "200%", height: "100%", alignItems: "flex-end", gap: "1px" }}>
            {Array.from({ length: 160 }).map((_, i) => {
              const type = i % 5;
              const s = 22 + (i % 4) * 9;
              const g1 = `rgba(${40 + (i % 4) * 7},${150 + (i % 5) * 9},${38 + (i % 4) * 5},0.95)`;
              const g2 = `rgba(${58 + (i % 4) * 7},${175 + (i % 5) * 7},${52 + (i % 4) * 5},0.92)`;
              const g3 = `rgba(${28 + (i % 4) * 7},${120 + (i % 5) * 9},${26 + (i % 4) * 5},0.9)`;
              if (type === 0)
                return (
                  <svg key={i} viewBox="0 0 40 40" style={{ flex: `0 0 ${s}px`, height: `${s}px`, opacity: 0.88 + (i % 3) * 0.08 }}>
                    <ellipse cx="20" cy="24" rx="18" ry="13" fill={g3} />
                    <circle cx="20" cy="15" r="14" fill={g1} />
                    <circle cx="9" cy="21" r="10" fill={g2} />
                    <circle cx="31" cy="21" r="10" fill={g2} />
                    <circle cx="20" cy="10" r="8" fill={g2} />
                  </svg>
                );
              if (type === 1)
                return (
                  <svg key={i} viewBox="0 0 30 50" style={{ flex: `0 0 ${s * 0.7}px`, height: `${s * 1.3}px`, opacity: 0.85 + (i % 3) * 0.08 }}>
                    <rect x="13" y="22" width="4" height="28" fill="rgba(70,40,18,0.85)" />
                    <ellipse cx="15" cy="19" rx="11" ry="15" fill={g1} />
                    <ellipse cx="6" cy="28" rx="8" ry="11" fill={g2} transform="rotate(-20,6,28)" />
                    <ellipse cx="24" cy="28" rx="8" ry="11" fill={g2} transform="rotate(20,24,28)" />
                    <circle cx="15" cy="10" r="6" fill={g2} />
                  </svg>
                );
              if (type === 2)
                return (
                  <svg key={i} viewBox="0 0 60 32" style={{ flex: `0 0 ${s * 1.5}px`, height: `${s * 0.8}px`, opacity: 0.87 + (i % 3) * 0.07 }}>
                    <ellipse cx="30" cy="22" rx="28" ry="12" fill={g3} />
                    <circle cx="15" cy="17" r="11" fill={g1} />
                    <circle cx="30" cy="13" r="13" fill={g2} />
                    <circle cx="45" cy="17" r="11" fill={g1} />
                    <circle cx="6" cy="22" r="8" fill={g2} />
                    <circle cx="54" cy="22" r="8" fill={g2} />
                  </svg>
                );
              if (type === 3)
                return (
                  <svg key={i} viewBox="0 0 45 40" style={{ flex: `0 0 ${s * 1.1}px`, height: `${s}px`, opacity: 0.86 + (i % 3) * 0.08 }}>
                    <circle cx="10" cy="28" r="10" fill={g3} />
                    <circle cx="23" cy="19" r="14" fill={g1} />
                    <circle cx="37" cy="26" r="11" fill={g2} />
                    <circle cx="23" cy="13" r="9" fill={g2} />
                    <circle cx="15" cy="23" r="7" fill={g2} />
                  </svg>
                );
              return (
                <svg key={i} viewBox="0 0 38 38" style={{ flex: `0 0 ${s * 0.9}px`, height: `${s * 0.9}px`, opacity: 0.85 + (i % 3) * 0.08 }}>
                  <circle cx="19" cy="22" r="14" fill={g1} />
                  <circle cx="10" cy="16" r="9" fill={g2} />
                  <circle cx="28" cy="16" r="9" fill={g2} />
                  <circle cx="19" cy="10" r="8" fill={g2} />
                  <circle cx="10" cy="14" r="3" fill="rgba(255,180,80,0.8)" />
                  <circle cx="28" cy="14" r="3" fill="rgba(255,120,120,0.8)" />
                  <circle cx="19" cy="8" r="3" fill="rgba(200,100,255,0.8)" />
                </svg>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default React.memo(ParallaxShrubOverlay);
