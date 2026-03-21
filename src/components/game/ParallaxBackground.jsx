import React, { useEffect, useRef, useState } from "react";
import { loadGameSettings } from "@/lib/gameSettings";
import SpriteTileRow from "./SpriteTileRow";

const PARALLAX_LAYERS = [
  { id: 0, speed: 0.05, top: 0, height: 60, opacity: 0.3 },
  { id: 1, speed: 0.10, top: 5, height: 30, opacity: 0.35 },
  { id: 2, speed: 0.15, top: 15, height: 35, opacity: 0.5 },
  { id: 3, speed: 0.22, top: 25, height: 26, opacity: 0.4 },
  { id: 4, speed: 0.32, top: 30, height: 30, opacity: 0.55 },
  { id: 5, speed: 0.42, top: 35, height: 34, opacity: 0.7 },
  { id: 6, speed: 0.52, top: 38, height: 38, opacity: 0.8 },
  { id: 7, speed: 0.62, top: 40, height: 43, opacity: 0.85 },
  { id: 8, speed: 0.72, top: 42, height: 48, opacity: 0.92 },
  { id: 9, speed: 0.82, top: 60, height: 22, opacity: 0.88 },
  { id: 10, speed: 0.92, top: 63, height: 24, opacity: 0.95 },
];

function ParallaxBackgroundComponent() {
  const refs = useRef([]);
  const speeds = useRef([]);
  const rafId = useRef(null);
  const [sprites, setSprites] = useState({});

  const reloadSprites = () => {
    const s = loadGameSettings();
    setSprites({
      treeVeryFar: s.parallax_tree_very_far || null,
      treeFar: s.parallax_tree_far || null,
      treeMidBack: s.parallax_tree_mid_back || null,
      treeMid: s.parallax_tree_mid || null,
      treeMidFront: s.parallax_tree_mid_front || null,
      treeFront: s.parallax_tree_front || null,
      shrubBack: s.parallax_shrub_back || null,
      shrubFront: s.parallax_shrub_front || null,
      mountainFar: s.parallax_mountain_far || null,
      mountainMid: s.parallax_mountain_mid || null,
      ground: s.parallax_ground || null,
      sky: s.parallax_sky || null,
      clouds: s.parallax_clouds || null,
      stars: s.parallax_stars || null,
    });
  };

  useEffect(() => {
    reloadSprites();
    // Reload when localStorage changes (e.g. after saving in GameSettings)
    window.addEventListener("storage", reloadSprites);
    return () => window.removeEventListener("storage", reloadSprites);
  }, []);

  useEffect(() => {
    const tick = () => {
      // Use player's run progress for world scroll
      const playerProgress = window.__gameRunProgress?.current || 0;
      const cx = playerProgress * 40; // Convert progress units to pixels
      for (let i = 0; i < refs.current.length; i++) {
        const el = refs.current[i];
        if (el) {
          // Loop the transform using modulo to create infinite scroll
          const loopWidth = 3000; // Wrap every 3000px
          const wrappedCx = (cx % loopWidth + loopWidth) % loopWidth;
          el.style.transform = `translate3d(${-wrappedCx * speeds.current[i]}px,0,0)`;
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
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "linear-gradient(to bottom, #0a1628, #1e3a5f, #1a4a2e)" }}>
      {/* Sky */}
      <div style={{ position: "absolute", inset: 0, height: "75%", background: "linear-gradient(to bottom, #0a1628, #1e4080, #2d6e3a)", pointerEvents: "none" }} />

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

      {/* Shrubs - back layer */}
      {layer(9, 0.84, 62, 22, 0.82,
        sprites.shrubBack ? <SpriteTileRow spriteUrl={sprites.shrubBack} tileWidth={40} count={120} /> :
        <div style={{ display: "flex", width: "200%", height: "100%", alignItems: "flex-end", gap: "2px" }}>
          {Array.from({ length: 120 }).map((_, i) => {
            const type = i % 4;
            const s = 18 + (i % 5) * 7;
            const g1 = `rgba(${35 + (i%3)*8},${140 + (i%4)*10},${35 + (i%3)*5},0.9)`;
            const g2 = `rgba(${50 + (i%3)*8},${165 + (i%4)*8},${45 + (i%3)*5},0.85)`;
            const g3 = `rgba(${25 + (i%3)*8},${115 + (i%4)*10},${25 + (i%3)*5},0.88)`;
            if (type === 0) return ( // Round bush
              <svg key={i} viewBox="0 0 40 40" style={{ flex: `0 0 ${s}px`, height: `${s}px`, opacity: 0.8 + (i%3)*0.07 }}>
                <ellipse cx="20" cy="22" rx="18" ry="14" fill={g3} />
                <circle cx="20" cy="16" r="13" fill={g1} />
                <circle cx="10" cy="20" r="9" fill={g2} />
                <circle cx="30" cy="20" r="9" fill={g2} />
                <circle cx="20" cy="12" r="7" fill={g2} />
              </svg>
            );
            if (type === 1) return ( // Tall fern-like
              <svg key={i} viewBox="0 0 30 50" style={{ flex: `0 0 ${s * 0.7}px`, height: `${s * 1.3}px`, opacity: 0.78 + (i%3)*0.07 }}>
                <rect x="13" y="20" width="4" height="30" fill="rgba(60,35,15,0.8)" />
                <ellipse cx="15" cy="18" rx="10" ry="14" fill={g1} />
                <ellipse cx="7" cy="26" rx="7" ry="10" fill={g2} transform="rotate(-20,7,26)" />
                <ellipse cx="23" cy="26" rx="7" ry="10" fill={g2} transform="rotate(20,23,26)" />
              </svg>
            );
            if (type === 2) return ( // Wide low shrub
              <svg key={i} viewBox="0 0 55 30" style={{ flex: `0 0 ${s * 1.4}px`, height: `${s * 0.75}px`, opacity: 0.82 + (i%3)*0.07 }}>
                <ellipse cx="27" cy="20" rx="25" ry="12" fill={g3} />
                <circle cx="14" cy="16" r="10" fill={g1} />
                <circle cx="27" cy="13" r="11" fill={g2} />
                <circle cx="40" cy="16" r="10" fill={g1} />
                <circle cx="7" cy="20" r="7" fill={g2} />
                <circle cx="48" cy="20" r="7" fill={g2} />
              </svg>
            );
            return ( // Cluster of small bushes
              <svg key={i} viewBox="0 0 45 35" style={{ flex: `0 0 ${s * 1.1}px`, height: `${s}px`, opacity: 0.8 + (i%3)*0.08 }}>
                <circle cx="10" cy="25" r="9" fill={g3} />
                <circle cx="22" cy="18" r="12" fill={g1} />
                <circle cx="35" cy="23" r="10" fill={g2} />
                <circle cx="22" cy="14" r="8" fill={g2} />
              </svg>
            );
          })}
        </div>
      )}

      {/* Shrubs - front layer */}
      {layer(10, 0.88, 65, 24, 0.9,
        sprites.shrubFront ? <SpriteTileRow spriteUrl={sprites.shrubFront} tileWidth={50} count={160} /> :
        <div style={{ display: "flex", width: "200%", height: "100%", alignItems: "flex-end", gap: "1px" }}>
          {Array.from({ length: 160 }).map((_, i) => {
            const type = i % 5;
            const s = 22 + (i % 4) * 9;
            const g1 = `rgba(${40 + (i%4)*7},${150 + (i%5)*9},${38 + (i%4)*5},0.95)`;
            const g2 = `rgba(${58 + (i%4)*7},${175 + (i%5)*7},${52 + (i%4)*5},0.92)`;
            const g3 = `rgba(${28 + (i%4)*7},${120 + (i%5)*9},${26 + (i%4)*5},0.9)`;
            if (type === 0) return (
              <svg key={i} viewBox="0 0 40 40" style={{ flex: `0 0 ${s}px`, height: `${s}px`, opacity: 0.88 + (i%3)*0.08 }}>
                <ellipse cx="20" cy="24" rx="18" ry="13" fill={g3} />
                <circle cx="20" cy="15" r="14" fill={g1} />
                <circle cx="9" cy="21" r="10" fill={g2} />
                <circle cx="31" cy="21" r="10" fill={g2} />
                <circle cx="20" cy="10" r="8" fill={g2} />
              </svg>
            );
            if (type === 1) return (
              <svg key={i} viewBox="0 0 30 50" style={{ flex: `0 0 ${s * 0.7}px`, height: `${s * 1.3}px`, opacity: 0.85 + (i%3)*0.08 }}>
                <rect x="13" y="22" width="4" height="28" fill="rgba(70,40,18,0.85)" />
                <ellipse cx="15" cy="19" rx="11" ry="15" fill={g1} />
                <ellipse cx="6" cy="28" rx="8" ry="11" fill={g2} transform="rotate(-20,6,28)" />
                <ellipse cx="24" cy="28" rx="8" ry="11" fill={g2} transform="rotate(20,24,28)" />
                <circle cx="15" cy="10" r="6" fill={g2} />
              </svg>
            );
            if (type === 2) return (
              <svg key={i} viewBox="0 0 60 32" style={{ flex: `0 0 ${s * 1.5}px`, height: `${s * 0.8}px`, opacity: 0.87 + (i%3)*0.07 }}>
                <ellipse cx="30" cy="22" rx="28" ry="12" fill={g3} />
                <circle cx="15" cy="17" r="11" fill={g1} />
                <circle cx="30" cy="13" r="13" fill={g2} />
                <circle cx="45" cy="17" r="11" fill={g1} />
                <circle cx="6" cy="22" r="8" fill={g2} />
                <circle cx="54" cy="22" r="8" fill={g2} />
              </svg>
            );
            if (type === 3) return (
              <svg key={i} viewBox="0 0 45 40" style={{ flex: `0 0 ${s * 1.1}px`, height: `${s}px`, opacity: 0.86 + (i%3)*0.08 }}>
                <circle cx="10" cy="28" r="10" fill={g3} />
                <circle cx="23" cy="19" r="14" fill={g1} />
                <circle cx="37" cy="26" r="11" fill={g2} />
                <circle cx="23" cy="13" r="9" fill={g2} />
                <circle cx="15" cy="23" r="7" fill={g2} />
              </svg>
            );
            return ( // Flower bush
              <svg key={i} viewBox="0 0 38 38" style={{ flex: `0 0 ${s * 0.9}px`, height: `${s * 0.9}px`, opacity: 0.85 + (i%3)*0.08 }}>
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

export default React.memo(ParallaxBackgroundComponent);