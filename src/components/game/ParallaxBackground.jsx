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

  return (
    <div className="absolute inset-0 overflow-hidden w-full h-full bg-gradient-to-b from-blue-950 via-blue-800 to-sky-500">
      {/* Layer 0: Sky - static anchor (speed 0) */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-blue-950 via-blue-800 to-sky-500 pointer-events-none" />

      {/* Layer 1: Far stars - speed 0.01 */}
      <div 
        className="absolute inset-0 w-full h-full pointer-events-none opacity-50"
        style={{ transform: "translate3d(calc(var(--camX) * 0.01), 0, 0)" }}
      >
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
      </div>

      {/* Layer 2: Clouds - speed 0.03 */}
      <div 
        className="absolute top-0 left-0 right-0 h-1/4 pointer-events-none opacity-35"
        style={{ transform: "translate3d(calc(var(--camX) * 0.03), 0, 0)" }}
      >
        <div className="flex whitespace-nowrap w-[200%] h-full items-center">
          {Array.from({ length: 12 }).map((_, i) => (
            <svg key={`cloud-${i}`} viewBox="0 0 100 50" className="flex-shrink-0" style={{ width: "150px", height: "75px" }}>
              <ellipse cx="50" cy="25" rx="40" ry="22" fill="rgba(255, 255, 255, 0.25)" />
              <ellipse cx="25" cy="32" rx="28" ry="18" fill="rgba(255, 255, 255, 0.18)" />
              <ellipse cx="75" cy="32" rx="32" ry="18" fill="rgba(255, 255, 255, 0.18)" />
            </svg>
          ))}
        </div>
      </div>

      {/* Layer 3: Far mountains - speed 0.08 */}
      <div 
        className="absolute top-0 left-0 right-0 h-1/3 pointer-events-none opacity-45"
        style={{ transform: "translate3d(calc(var(--camX) * 0.08), 0, 0)" }}
      >
        <div className="flex whitespace-nowrap w-[200%] h-full items-end">
          {Array.from({ length: 16 }).map((_, i) => (
            <svg key={`mtn-far-${i}`} viewBox="0 0 150 220" className="flex-shrink-0" style={{ width: "150px", height: "100%" }}>
              <polygon points="75,15 0,220 150,220" fill="rgba(42, 82, 135, 0.55)" />
              <polygon points="75,60 20,220 130,220" fill="rgba(32, 72, 125, 0.65)" />
            </svg>
          ))}
        </div>
      </div>

      {/* Layer 4: Mid mountains - speed 0.18 */}
      <div 
        className="absolute top-1/4 left-0 right-0 h-2/5 pointer-events-none"
        style={{ 
          transform: "translate3d(calc(var(--camX) * 0.18), 0, 0)",
          opacity: 0.75
        }}
      >
        <div className="flex whitespace-nowrap w-[200%] h-full items-end">
          {Array.from({ length: 18 }).map((_, i) => {
            const heightVariation = 60 + (i * 17) % 80;
            return (
              <svg key={`mtn-mid-${i}`} viewBox="0 0 130 200" className="flex-shrink-0" style={{ width: "130px", height: `${heightVariation}px` }}>
                <polygon points="65,20 0,200 130,200" fill={`rgba(${30 + i * 2}, ${95 + i * 2}, ${55 + i * 3}, 0.8)`} />
                <polygon points="65,55 25,200 105,200" fill={`rgba(${20 + i * 2}, ${75 + i * 2}, ${40 + i * 3}, 0.9)`} />
              </svg>
            );
          })}
        </div>
      </div>

      {/* Layer 6: Fog/Haze transition - speed 0.42 (static depth perception) */}
      <div 
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          background: "linear-gradient(180deg, transparent 0%, rgba(120, 160, 200, 0.08) 35%, rgba(100, 140, 180, 0.15) 65%, rgba(80, 120, 160, 0.25) 100%)"
        }}
      />

      {/* Layer 5/6/7: Unified treeline (all speeds/sizes matched) - speed 0.50 */}
      <div 
        className="absolute left-0 right-0 pointer-events-none"
        style={{ 
          transform: "translate3d(calc(var(--camX) * 0.50), 0, 0)",
          top: "20%",
          height: "55%"
        }}
      >
        <div className="flex whitespace-nowrap w-[200%] h-full items-end gap-1">
          {Array.from({ length: 50 }).map((_, i) => {
            const baseScale = 0.75;
            const offset = (i * 7) % 3;
            return (
              <svg 
                key={`tree-unified-${i}`}
                viewBox="0 0 50 110"
                className="flex-shrink-0"
                style={{ width: `${50 * baseScale}px`, height: "100%", opacity: 0.75 + (i % 3) * 0.1 }}
              >
                {/* Canopy - consistent size */}
                <circle cx="25" cy="20" r="14" fill={`rgba(${18 + offset * 5}, ${100 + offset * 10}, ${28 + offset * 5}, 0.96)`} />
                <circle cx="15" cy="30" r="11" fill={`rgba(${26 + offset * 5}, ${120 + offset * 10}, ${35 + offset * 5}, 0.93)`} />
                <circle cx="35" cy="30" r="11" fill={`rgba(${26 + offset * 5}, ${120 + offset * 10}, ${35 + offset * 5}, 0.93)`} />
                <circle cx="25" cy="42" r="10" fill={`rgba(${35 + offset * 5}, ${140 + offset * 10}, ${45 + offset * 5}, 0.88)`} />
                {/* Trunk connects directly */}
                <rect x="22" y="50" width="6" height="60" fill="rgb(139, 101, 58)" />
              </svg>
            );
          })}
        </div>
      </div>

      {/* Layer 8: Shrubs/bushes - speed 0.85 */}
      <div 
        className="absolute bottom-1/5 left-0 right-0 h-1/4 pointer-events-none"
        style={{ 
          transform: "translate3d(calc(var(--camX) * 0.85), 0, 0)"
        }}
      >
        <div className="flex whitespace-nowrap w-[200%] h-full items-end gap-0.5">
          {Array.from({ length: 60 }).map((_, i) => {
            const scale = 0.8 + (i % 3) * 0.15;
            return (
              <svg key={`shrub-${i}`} viewBox="0 0 35 35" className="flex-shrink-0" style={{ width: `${35 * scale}px`, height: "100%", opacity: 0.85 + (i % 3) * 0.1 }}>
                <circle cx="17" cy="17" r={`${15 * scale}`} fill="rgba(38, 155, 38, 0.96)" />
                <circle cx={`${10 * scale}`} cy={`${14 * scale}`} r={`${11 * scale}`} fill="rgba(48, 175, 48, 0.93)" />
                <circle cx={`${24 * scale}`} cy={`${14 * scale}`} r={`${11 * scale}`} fill="rgba(48, 175, 48, 0.93)" />
              </svg>
            );
          })}
        </div>
      </div>

      {/* Layer 9: Close foreground grass - speed 1.0 (fastest) */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-1/5 pointer-events-none"
        style={{ 
          transform: "translate3d(calc(var(--camX) * 1.0), 0, 0)"
        }}
      >
        <div className="flex whitespace-nowrap w-[200%] h-full items-end">
          {Array.from({ length: 140 }).map((_, i) => (
            <div 
              key={`grass-${i}`} 
              className="flex-1 h-full bg-gradient-to-b from-green-900 via-green-950 to-yellow-900 border-l border-green-800/60"
              style={{ opacity: 0.85 + (i % 2) * 0.15 }}
            />
          ))}
        </div>
      </div>

      {/* Layer 10: Ground base - static */}
      <div className="absolute bottom-0 left-0 right-0 w-full h-20 bg-gradient-to-b from-green-950 via-green-975 to-yellow-950 pointer-events-none" />

      {/* Layer 11: Vignette - static */}
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