import React, { useState, useEffect } from "react";

export default function ParallaxBackground() {
  const [camX, setCamX] = useState(0);
  const [targetCamX, setTargetCamX] = useState(0);

  // Smooth camera movement tied to game progression
  useEffect(() => {
    let animFrame;
    const tick = () => {
      setCamX((prev) => prev + (targetCamX - prev) * 0.12);
      animFrame = requestAnimationFrame(tick);
    };
    animFrame = requestAnimationFrame(tick);

    // Simulate progression by incrementing target
    const interval = setInterval(() => {
      setTargetCamX((prev) => (prev + 2) % 10000);
    }, 60);

    return () => {
      cancelAnimationFrame(animFrame);
      clearInterval(interval);
    };
  }, [targetCamX]);

  // Apply CSS variable to root for all layers
  useEffect(() => {
    document.documentElement.style.setProperty("--camX", `${-camX}px`);
  }, [camX]);

  const createLayer = (id, speed, topPercent, heightPercent, opacity, content) => (
    <div
      key={id}
      className="absolute left-0 right-0 pointer-events-none"
      style={{
        transform: `translate3d(calc(var(--camX) * ${speed}), 0, 0)`,
        top: `${topPercent}%`,
        height: `${heightPercent}%`,
        opacity: opacity,
      }}
    >
      {content}
    </div>
  );

  return (
    <div className="absolute inset-0 overflow-hidden w-full h-full bg-gradient-to-b from-blue-950 via-blue-800 to-sky-500">
      {/* Layer 0: Sky - static anchor (speed 0) */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-blue-950 via-blue-800 to-sky-500 pointer-events-none" />

      {/* Layer 1: Far stars - speed 0.01 */}
      {createLayer("stars", 0.01, 0, 100, 0.5, (
        <div className="flex whitespace-nowrap w-[200%] h-full">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={`star-${i}`}
              className="absolute rounded-full bg-white"
              style={{
                width: `${1 + (i % 3)}px`,
                height: `${1 + (i % 3)}px`,
                top: `${8 + ((i * 11) % 35)}%`,
                left: `${(i * 4.5) % 100}%`,
                opacity: 0.25 + (i % 5) * 0.12,
                animation: `twinkle ${5 + (i % 4)}s ease-in-out ${i * 0.15}s infinite`,
              }}
            />
          ))}
        </div>
      ))}

      {/* Layer 2: Distant clouds - speed 0.02 */}
      {createLayer("clouds-distant", 0.02, 5, 15, 0.2, (
        <div className="flex whitespace-nowrap w-[200%] h-full items-center">
          {Array.from({ length: 8 }).map((_, i) => (
            <svg key={`cloud-dist-${i}`} viewBox="0 0 100 50" className="flex-shrink-0" style={{ width: "120px", height: "60px" }}>
              <ellipse cx="50" cy="25" rx="30" ry="16" fill="rgba(200, 220, 240, 0.15)" />
            </svg>
          ))}
        </div>
      ))}

      {/* Layer 3: Very far mountains - speed 0.04 */}
      {createLayer("mountains-very-far", 0.04, 8, 25, 0.3, (
        <div className="flex whitespace-nowrap w-[200%] h-full items-end">
          {Array.from({ length: 12 }).map((_, i) => (
            <svg key={`mtn-vfar-${i}`} viewBox="0 0 150 200" className="flex-shrink-0" style={{ width: "150px", height: "100%" }}>
              <polygon points="75,15 0,200 150,200" fill="rgba(25, 55, 95, 0.4)" />
            </svg>
          ))}
        </div>
      ))}

      {/* Layer 4: Far mountains - speed 0.08 */}
      {createLayer("mountains-far", 0.08, 12, 30, 0.45, (
        <div className="flex whitespace-nowrap w-[200%] h-full items-end">
          {Array.from({ length: 14 }).map((_, i) => (
            <svg key={`mtn-far-${i}`} viewBox="0 0 150 220" className="flex-shrink-0" style={{ width: "150px", height: "100%" }}>
              <polygon points="75,15 0,220 150,220" fill="rgba(42, 82, 135, 0.55)" />
              <polygon points="75,60 20,220 130,220" fill="rgba(32, 72, 125, 0.65)" />
            </svg>
          ))}
        </div>
      ))}

      {/* Layer 5: Mid mountains - speed 0.12 */}
      {createLayer("mountains-mid", 0.12, 18, 35, 0.6, (
        <div className="flex whitespace-nowrap w-[200%] h-full items-end">
          {Array.from({ length: 16 }).map((_, i) => (
            <svg key={`mtn-mid-${i}`} viewBox="0 0 130 200" className="flex-shrink-0" style={{ width: "130px", height: "100%" }}>
              <polygon points="65,20 0,200 130,200" fill={`rgba(${45 + i}, ${110 + i}, ${70 + i}, 0.7)`} />
              <polygon points="65,55 25,200 105,200" fill={`rgba(${35 + i}, ${90 + i}, ${55 + i}, 0.8)`} />
            </svg>
          ))}
        </div>
      ))}

      {/* Layer 6: Mist/clouds - speed 0.18 */}
      {createLayer("mist-far", 0.18, 25, 40, 0.15, (
        <div className="absolute inset-0 w-full h-full" style={{
          background: "linear-gradient(180deg, transparent 0%, rgba(120, 160, 200, 0.08) 50%, transparent 100%)"
        }} />
      ))}

      {/* Layer 7: Very distant trees - speed 0.22 */}
      {createLayer("trees-very-far", 0.22, 32, 28, 0.5, (
        <div className="flex whitespace-nowrap w-[200%] h-full items-end gap-0.5">
          {Array.from({ length: 50 }).map((_, i) => (
            <svg key={`tree-vfar-${i}`} viewBox="0 0 50 110" className="flex-shrink-0" style={{ width: "35px", height: "100%", opacity: 0.6 }}>
              <circle cx="25" cy="20" r="7" fill="rgba(8, 60, 15, 0.85)" />
              <circle cx="18" cy="28" r="5" fill="rgba(10, 70, 18, 0.8)" />
              <circle cx="32" cy="28" r="5" fill="rgba(10, 70, 18, 0.8)" />
              <rect x="23" y="38" width="4" height="72" fill="rgba(60, 35, 15, 0.8)" />
            </svg>
          ))}
        </div>
      ))}

      {/* Layer 8: Distant trees - speed 0.28 */}
      {createLayer("trees-distant", 0.28, 35, 28, 0.65, (
        <div className="flex whitespace-nowrap w-[200%] h-full items-end gap-0.5">
          {Array.from({ length: 45 }).map((_, i) => (
            <svg key={`tree-dist-${i}`} viewBox="0 0 50 110" className="flex-shrink-0" style={{ width: "42px", height: "100%", opacity: 0.7 }}>
              <circle cx="25" cy="18" r="9" fill="rgba(12, 65, 20, 0.88)" />
              <circle cx="16" cy="28" r="7" fill="rgba(15, 75, 25, 0.85)" />
              <circle cx="34" cy="28" r="7" fill="rgba(15, 75, 25, 0.85)" />
              <circle cx="25" cy="38" r="6" fill="rgba(18, 80, 28, 0.9)" />
              <rect x="22" y="43" width="5" height="67" fill="rgba(70, 40, 18, 0.85)" />
            </svg>
          ))}
        </div>
      ))}

      {/* Layer 9: Back treeline small - speed 0.35 */}
      {createLayer("trees-back", 0.35, 38, 28, 0.75, (
        <div className="flex whitespace-nowrap w-[200%] h-full items-end gap-0.5">
          {Array.from({ length: 40 }).map((_, i) => {
            const offset = (i * 7) % 3;
            return (
              <svg key={`tree-back-${i}`} viewBox="0 0 50 110" className="flex-shrink-0" style={{ width: "50px", height: "100%", opacity: 0.75 + (i % 3) * 0.08 }}>
                <circle cx="25" cy="20" r="10" fill={`rgba(${12 + offset * 5}, ${70 + offset * 10}, ${20 + offset * 5}, 0.9)`} />
                <circle cx="16" cy="28" r="8" fill={`rgba(${18 + offset * 5}, ${85 + offset * 10}, ${25 + offset * 5}, 0.88)`} />
                <circle cx="34" cy="28" r="8" fill={`rgba(${18 + offset * 5}, ${85 + offset * 10}, ${25 + offset * 5}, 0.88)`} />
                <circle cx="25" cy="38" r="7" fill={`rgba(${20 + offset * 5}, ${90 + offset * 10}, ${28 + offset * 5}, 0.92)`} />
                <rect x="22" y="45" width="6" height="65" fill="rgba(80, 50, 20, 0.95)" />
              </svg>
            );
          })}
        </div>
      ))}

      {/* Layer 10: Mid-back trees - speed 0.43 */}
      {createLayer("trees-mid-back", 0.43, 36, 32, 0.8, (
        <div className="flex whitespace-nowrap w-[200%] h-full items-end gap-0.8">
          {Array.from({ length: 38 }).map((_, i) => {
            const offset = (i * 9) % 3;
            return (
              <svg key={`tree-mb-${i}`} viewBox="0 0 50 110" className="flex-shrink-0" style={{ width: "58px", height: "100%", opacity: 0.8 + (i % 2) * 0.08 }}>
                <circle cx="25" cy="18" r="12" fill={`rgba(${15 + offset * 5}, ${80 + offset * 10}, ${25 + offset * 5}, 0.92)`} />
                <circle cx="15" cy="30" r="10" fill={`rgba(${22 + offset * 5}, ${100 + offset * 10}, ${32 + offset * 5}, 0.9)`} />
                <circle cx="35" cy="30" r="10" fill={`rgba(${22 + offset * 5}, ${100 + offset * 10}, ${32 + offset * 5}, 0.9)`} />
                <circle cx="25" cy="42" r="9" fill={`rgba(${28 + offset * 5}, ${120 + offset * 10}, ${40 + offset * 5}, 0.88)`} />
                <rect x="22" y="50" width="6" height="60" fill="rgba(90, 55, 25, 0.96)" />
              </svg>
            );
          })}
        </div>
      ))}

      {/* Layer 11: Mid trees - speed 0.50 */}
      {createLayer("trees-mid", 0.50, 33, 37, 0.85, (
        <div className="flex whitespace-nowrap w-[200%] h-full items-end gap-1">
          {Array.from({ length: 35 }).map((_, i) => {
            const offset = (i * 11) % 3;
            return (
              <svg key={`tree-mid-${i}`} viewBox="0 0 50 110" className="flex-shrink-0" style={{ width: "65px", height: "100%", opacity: 0.82 + (i % 2) * 0.08 }}>
                <circle cx="25" cy="16" r="14" fill={`rgba(${18 + offset * 5}, ${90 + offset * 10}, ${28 + offset * 5}, 0.93)`} />
                <circle cx="14" cy="30" r="12" fill={`rgba(${25 + offset * 5}, ${110 + offset * 10}, ${35 + offset * 5}, 0.91)`} />
                <circle cx="36" cy="30" r="12" fill={`rgba(${25 + offset * 5}, ${110 + offset * 10}, ${35 + offset * 5}, 0.91)`} />
                <circle cx="25" cy="44" r="10" fill={`rgba(${32 + offset * 5}, ${130 + offset * 10}, ${42 + offset * 5}, 0.89)`} />
                <rect x="22" y="52" width="6" height="58" fill="rgba(100, 60, 28, 0.97)" />
              </svg>
            );
          })}
        </div>
      ))}

      {/* Layer 12: Mid-front trees - speed 0.57 */}
      {createLayer("trees-mid-front", 0.57, 31, 42, 0.88, (
        <div className="flex whitespace-nowrap w-[200%] h-full items-end gap-1.5">
          {Array.from({ length: 32 }).map((_, i) => {
            const offset = (i * 13) % 3;
            return (
              <svg key={`tree-mf-${i}`} viewBox="0 0 50 110" className="flex-shrink-0" style={{ width: "70px", height: "100%", opacity: 0.83 + (i % 3) * 0.07 }}>
                <circle cx="25" cy="15" r="15" fill={`rgba(${20 + offset * 5}, ${95 + offset * 10}, ${30 + offset * 5}, 0.94)`} />
                <circle cx="13" cy="29" r="13" fill={`rgba(${28 + offset * 5}, ${115 + offset * 10}, ${37 + offset * 5}, 0.92)`} />
                <circle cx="37" cy="29" r="13" fill={`rgba(${28 + offset * 5}, ${115 + offset * 10}, ${37 + offset * 5}, 0.92)`} />
                <circle cx="25" cy="44" r="11" fill={`rgba(${35 + offset * 5}, ${135 + offset * 10}, ${44 + offset * 5}, 0.9)`} />
                <rect x="22" y="53" width="6" height="57" fill="rgba(110, 65, 30, 0.98)" />
              </svg>
            );
          })}
        </div>
      ))}

      {/* Layer 13: Front treeline large - speed 0.65 */}
      {createLayer("trees-front", 0.65, 28, 48, 0.90, (
        <div className="flex whitespace-nowrap w-[200%] h-full items-end gap-1.5">
          {Array.from({ length: 30 }).map((_, i) => {
            const offset = (i * 15) % 3;
            return (
              <svg key={`tree-front-${i}`} viewBox="0 0 50 110" className="flex-shrink-0" style={{ width: "75px", height: "100%", opacity: 0.85 + (i % 3) * 0.07 }}>
                <circle cx="25" cy="14" r="16" fill={`rgba(${22 + offset * 5}, ${100 + offset * 10}, ${32 + offset * 5}, 0.95)`} />
                <circle cx="12" cy="28" r="14" fill={`rgba(${30 + offset * 5}, ${120 + offset * 10}, ${39 + offset * 5}, 0.93)`} />
                <circle cx="38" cy="28" r="14" fill={`rgba(${30 + offset * 5}, ${120 + offset * 10}, ${39 + offset * 5}, 0.93)`} />
                <circle cx="25" cy="44" r="12" fill={`rgba(${38 + offset * 5}, ${140 + offset * 10}, ${47 + offset * 5}, 0.91)`} />
                <rect x="22" y="54" width="6" height="56" fill="rgb(120, 70, 32)" />
              </svg>
            );
          })}
        </div>
      ))}

      {/* Layer 14: Very large foreground trees - speed 0.72 */}
      {createLayer("trees-very-front", 0.72, 25, 52, 0.92, (
        <div className="flex whitespace-nowrap w-[200%] h-full items-end gap-2">
          {Array.from({ length: 25 }).map((_, i) => {
            const offset = (i * 17) % 3;
            return (
              <svg key={`tree-vf-${i}`} viewBox="0 0 50 110" className="flex-shrink-0" style={{ width: "82px", height: "100%", opacity: 0.87 + (i % 2) * 0.06 }}>
                <circle cx="25" cy="12" r="18" fill={`rgba(${25 + offset * 5}, ${105 + offset * 10}, ${35 + offset * 5}, 0.96)`} />
                <circle cx="11" cy="27" r="15" fill={`rgba(${33 + offset * 5}, ${125 + offset * 10}, ${42 + offset * 5}, 0.94)`} />
                <circle cx="39" cy="27" r="15" fill={`rgba(${33 + offset * 5}, ${125 + offset * 10}, ${42 + offset * 5}, 0.94)`} />
                <circle cx="25" cy="43" r="13" fill={`rgba(${41 + offset * 5}, ${145 + offset * 10}, ${50 + offset * 5}, 0.92)`} />
                <rect x="22" y="54" width="6" height="56" fill="rgb(130, 75, 35)" />
              </svg>
            );
          })}
        </div>
      ))}

      {/* Layer 15: Shrubs/vegetation - speed 0.80 */}
      {createLayer("shrubs", 0.80, 60, 25, 0.88, (
        <div className="flex whitespace-nowrap w-[200%] h-full items-end gap-0.3">
          {Array.from({ length: 120 }).map((_, i) => {
            const scale = 0.7 + (i % 5) * 0.1;
            return (
              <svg key={`shrub-${i}`} viewBox="0 0 35 35" className="flex-shrink-0" style={{ width: `${35 * scale}px`, height: "100%", opacity: 0.85 + (i % 3) * 0.1 }}>
                <circle cx="17" cy="17" r={`${14 * scale}`} fill="rgba(45, 165, 45, 0.95)" />
                <circle cx={`${10 * scale}`} cy={`${13 * scale}`} r={`${10 * scale}`} fill="rgba(55, 185, 55, 0.92)" />
                <circle cx={`${24 * scale}`} cy={`${13 * scale}`} r={`${10 * scale}`} fill="rgba(55, 185, 55, 0.92)" />
              </svg>
            );
          })}
        </div>
      ))}

      {/* Layer 16: Flowers/small plants - speed 0.84 */}
      {createLayer("flowers", 0.84, 68, 18, 0.82, (
        <div className="flex whitespace-nowrap w-[200%] h-full items-end gap-0.8">
          {Array.from({ length: 90 }).map((_, i) => {
            const flowerType = i % 3;
            const scale = 0.5 + (i % 4) * 0.08;
            const colors = [
              "rgba(255, 100, 100, 0.9)",
              "rgba(255, 255, 100, 0.9)",
              "rgba(150, 100, 255, 0.9)"
            ];
            return (
              <svg key={`flower-${i}`} viewBox="0 0 20 30" className="flex-shrink-0" style={{ width: `${20 * scale}px`, height: "100%", opacity: 0.75 + (i % 2) * 0.15 }}>
                <circle cx="10" cy="8" r={`${3 * scale}`} fill={colors[flowerType]} />
                <circle cx={`${7 * scale}`} cy={`${5 * scale}`} r={`${2.5 * scale}`} fill={colors[flowerType]} />
                <circle cx={`${13 * scale}`} cy={`${5 * scale}`} r={`${2.5 * scale}`} fill={colors[flowerType]} />
                <rect x={`${9 * scale}`} y={`${8 * scale}`} width={`${2 * scale}`} height={`${22 * scale}`} fill="rgba(50, 120, 50, 0.8)" />
              </svg>
            );
          })}
        </div>
      ))}

      {/* Layer 17: Large bushes/ferns - speed 0.87 */}
      {createLayer("ferns", 0.87, 64, 28, 0.85, (
        <div className="flex whitespace-nowrap w-[200%] h-full items-end gap-0.5">
          {Array.from({ length: 85 }).map((_, i) => {
            const scale = 0.75 + (i % 3) * 0.15;
            return (
              <svg key={`fern-${i}`} viewBox="0 0 40 50" className="flex-shrink-0" style={{ width: `${40 * scale}px`, height: "100%", opacity: 0.8 + (i % 2) * 0.1 }}>
                <circle cx="20" cy="12" r={`${8 * scale}`} fill="rgba(60, 140, 60, 0.92)" />
                <circle cx="10" cy="22" r={`${7 * scale}`} fill="rgba(70, 150, 70, 0.9)" />
                <circle cx="30" cy="22" r={`${7 * scale}`} fill="rgba(70, 150, 70, 0.9)" />
                <circle cx="20" cy="35" r={`${9 * scale}`} fill="rgba(50, 130, 50, 0.93)" />
              </svg>
            );
          })}
        </div>
      ))}

      {/* Layer 18: Tall grass clusters - speed 0.90 */}
      {createLayer("tall-grass", 0.90, 70, 22, 0.88, (
        <div className="flex whitespace-nowrap w-[200%] h-full items-end gap-0.3">
          {Array.from({ length: 140 }).map((_, i) => {
            const height = 30 + (i % 4) * 15;
            return (
              <div key={`tall-grass-${i}`} style={{ width: "6px", height: `${height}%`, background: `linear-gradient(to top, rgba(40, 100, 40, 0.9), rgba(60, 130, 60, 0.8))`, opacity: 0.75 + (i % 3) * 0.15 }} />
            );
          })}
        </div>
      ))}

      {/* Layer 19: Stone/rocks - speed 0.93 */}
      {createLayer("rocks", 0.93, 72, 20, 0.87, (
        <div className="flex whitespace-nowrap w-[200%] h-full items-end gap-0.8">
          {Array.from({ length: 70 }).map((_, i) => {
            const size = 8 + (i % 3) * 6;
            return (
              <svg key={`rock-${i}`} viewBox="0 0 30 30" className="flex-shrink-0" style={{ width: `${size}px`, height: `${size}px`, opacity: 0.8 + (i % 2) * 0.15 }}>
                <circle cx="15" cy="15" r="14" fill={`rgba(${100 + (i % 3) * 10}, ${100 + (i % 3) * 10}, ${95 + (i % 3) * 10}, 0.85)`} />
                <circle cx="8" cy="10" r="5" fill={`rgba(${120 + (i % 3) * 10}, ${120 + (i % 3) * 10}, ${115 + (i % 3) * 10}, 0.7)`} />
              </svg>
            );
          })}
        </div>
      ))}

      {/* Layer 20: Close grass detail - speed 0.91 */}
      {createLayer("grass-near", 0.91, 76, 20, 0.9, (
        <div className="flex whitespace-nowrap w-[200%] h-full items-end gap-0.4">
          {Array.from({ length: 130 }).map((_, i) => (
            <div key={`grass-n-${i}`} className="flex-1 h-full bg-gradient-to-b from-green-800 via-green-900 to-green-950 border-l border-green-700/40" style={{ opacity: 0.88 + (i % 2) * 0.12 }} />
          ))}
        </div>
      ))}

      {/* Layer 21: Very close grass - speed 0.95 */}
      {createLayer("grass-very-close", 0.95, 82, 18, 0.92, (
        <div className="flex whitespace-nowrap w-[200%] h-full items-end gap-0">
          {Array.from({ length: 160 }).map((_, i) => (
            <div key={`grass-vc-${i}`} className="flex-1 h-full bg-gradient-to-b from-green-700 via-green-850 to-yellow-850 border-l border-green-700/60" style={{ opacity: 0.9 + (i % 2) * 0.1 }} />
          ))}
        </div>
      ))}

      {/* Layer 22: Foreground grass - speed 0.98 */}
      {createLayer("grass-foreground", 0.98, 85, 15, 0.95, (
        <div className="flex whitespace-nowrap w-[200%] h-full items-end">
          {Array.from({ length: 200 }).map((_, i) => (
            <div key={`grass-fg-${i}`} className="flex-1 h-full bg-gradient-to-b from-green-600 via-green-700 to-yellow-700 border-l border-green-600/70" style={{ opacity: 0.92 + (i % 2) * 0.08 }} />
          ))}
        </div>
      ))}

      {/* Layer 23: Ultra close foreground - speed 1.0 (fastest) */}
      {createLayer("ultra-foreground", 1.0, 88, 12, 0.97, (
        <div className="flex whitespace-nowrap w-[200%] h-full items-end">
          {Array.from({ length: 220 }).map((_, i) => (
            <div key={`ultra-fg-${i}`} className="flex-1 h-full bg-gradient-to-b from-green-500 via-green-600 to-yellow-600 border-l border-green-500/80" style={{ opacity: 0.94 + (i % 2) * 0.06 }} />
          ))}
        </div>
      ))}

      {/* Layer 24: Ground base - static */}
      <div className="absolute bottom-0 left-0 right-0 w-full h-20 bg-gradient-to-b from-green-700 via-green-900 to-yellow-900 pointer-events-none" />

      {/* Layer 25: Vignette overlay - static */}
      <div className="absolute inset-0 pointer-events-none w-full h-full" style={{
        boxShadow: "inset 0 0 150px rgba(0,0,0,0.6), inset 0 0 200px rgba(0,0,0,0.3)"
      }} />

      <style>{`
        :root {
          --camX: 0px;
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.85; }
        }
        
        .absolute {
          will-change: transform;
        }
      `}</style>
    </div>
  );
}