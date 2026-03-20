import React, { useState, useEffect } from "react";

export default function ParallaxBackground() {
  const [cameraX, setCameraX] = useState(0);

  // Simulate camera movement tied to game progression
  useEffect(() => {
    const interval = setInterval(() => {
      setCameraX((prev) => (prev + 0.3) % 10000);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const getLayerOffset = (ratio) => cameraX * ratio;

  return (
    <div className="absolute inset-0 overflow-hidden w-full h-full">
      {/* Layer 0: Sky gradient base - static depth anchor */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-blue-950 via-blue-800 to-sky-500 pointer-events-none" />

      {/* Layer 1: Far stars/clouds - depth 0.02 (slowest) */}
      <div 
        className="absolute inset-0 w-full h-full pointer-events-none opacity-50"
        style={{ transform: `translateX(${-getLayerOffset(0.02)}px)` }}
      >
        <div className="flex whitespace-nowrap w-[200%] h-full">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={`star-${i}`}
              className="absolute rounded-full bg-white"
              style={{
                width: `${1 + (i % 3)}px`,
                height: `${1 + (i % 3)}px`,
                top: `${10 + ((i * 7) % 30)}%`,
                left: `${(i * 5) % 100}%`,
                opacity: 0.3 + (i % 4) * 0.15,
                animation: `twinkle ${4 + (i % 3)}s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Layer 2: Mid-clouds - depth 0.03 */}
      <div 
        className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
        style={{ transform: `translateX(${-getLayerOffset(0.03)}px)` }}
      >
        <div className="flex whitespace-nowrap w-[200%] h-1/4">
          {Array.from({ length: 15 }).map((_, i) => (
            <svg key={`cloud-${i}`} viewBox="0 0 100 50" className="flex-shrink-0" style={{ width: "120px", height: "60px" }}>
              <ellipse cx="50" cy="25" rx="40" ry="20" fill="rgba(255, 255, 255, 0.2)" />
              <ellipse cx="30" cy="30" rx="25" ry="15" fill="rgba(255, 255, 255, 0.15)" />
              <ellipse cx="70" cy="30" rx="30" ry="15" fill="rgba(255, 255, 255, 0.15)" />
            </svg>
          ))}
        </div>
      </div>

      {/* Layer 3: Far mountains - depth 0.08 */}
      <div 
        className="absolute top-0 left-0 right-0 w-full pointer-events-none opacity-40"
        style={{ 
          transform: `translateX(${-getLayerOffset(0.08)}px)`,
          height: "35%"
        }}
      >
        <div className="flex whitespace-nowrap w-[200%] h-full items-end">
          {Array.from({ length: 18 }).map((_, i) => (
            <svg key={`mtn-far-${i}`} viewBox="0 0 140 200" className="flex-shrink-0" style={{ width: "140px", height: "100%" }}>
              <polygon points="70,10 0,200 140,200" fill="rgba(45, 85, 140, 0.5)" />
              <polygon points="70,50 20,200 120,200" fill="rgba(35, 75, 130, 0.6)" />
            </svg>
          ))}
        </div>
      </div>

      {/* Layer 4: Near mountains - depth 0.18 */}
      <div 
        className="absolute top-1/4 left-0 right-0 w-full pointer-events-none"
        style={{ 
          transform: `translateX(${-getLayerOffset(0.18)}px)`,
          height: "40%",
          opacity: 0.7
        }}
      >
        <div className="flex whitespace-nowrap w-[200%] h-full items-end">
          {Array.from({ length: 20 }).map((_, i) => (
            <svg key={`mtn-near-${i}`} viewBox="0 0 120 180" className="flex-shrink-0" style={{ width: "120px", height: `${80 + (i % 4) * 35}px` }}>
              <polygon points="60,15 0,180 120,180" fill="rgba(32, 100, 60, 0.8)" />
              <polygon points="60,50 25,180 95,180" fill="rgba(22, 80, 50, 0.9)" />
            </svg>
          ))}
        </div>
      </div>

      {/* Layer 5: Far pine trees - depth 0.35 */}
      <div 
        className="absolute left-0 right-0 w-full pointer-events-none"
        style={{ 
          transform: `translateX(${-getLayerOffset(0.35)}px)`,
          top: "30%",
          height: "30%",
          opacity: 0.75
        }}
      >
        <div className="flex whitespace-nowrap w-[200%] h-full items-end gap-1">
          {Array.from({ length: 30 }).map((_, i) => (
            <svg key={`tree-far-${i}`} viewBox="0 0 50 100" className="flex-shrink-0" style={{ width: "50px", height: `${60 + (i % 3) * 20}px` }}>
              <polygon points="25,5 5,100 45,100" fill="rgba(15, 80, 25, 0.85)" />
              <polygon points="25,35 15,100 35,100" fill="rgba(10, 60, 15, 0.95)" />
            </svg>
          ))}
        </div>
      </div>

      {/* Layer 6: Mid trees - depth 0.55 */}
      <div 
        className="absolute bottom-1/4 left-0 right-0 w-full pointer-events-none"
        style={{ 
          transform: `translateX(${-getLayerOffset(0.55)}px)`,
          height: "35%"
        }}
      >
        <div className="flex whitespace-nowrap w-[200%] h-full items-end gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={`tree-mid-${i}`} className="flex-shrink-0 flex flex-col items-center justify-end h-full" style={{ width: "55px" }}>
              <svg viewBox="0 0 45 90" style={{ width: "45px", height: "90px" }} className="mb-1">
                <circle cx="22" cy="20" r="14" fill="rgba(20, 100, 25, 0.95)" />
                <circle cx="12" cy="28" r="11" fill="rgba(28, 120, 35, 0.9)" />
                <circle cx="32" cy="28" r="11" fill="rgba(28, 120, 35, 0.9)" />
                <circle cx="22" cy="42" r="10" fill="rgba(35, 140, 45, 0.85)" />
              </svg>
              <div className="w-2 bg-amber-900" style={{ height: "35px" }} />
            </div>
          ))}
        </div>
      </div>

      {/* Layer 7: Atmospheric haze - depth static but layered for depth perception */}
      <div className="absolute inset-0 pointer-events-none w-full h-full" style={{
        background: "linear-gradient(180deg, transparent 0%, rgba(100, 150, 180, 0.12) 40%, rgba(80, 120, 160, 0.2) 100%)"
      }} />

      {/* Layer 8: Near bushes/shrubs - depth 0.75 */}
      <div 
        className="absolute bottom-1/5 left-0 right-0 w-full pointer-events-none"
        style={{ 
          transform: `translateX(${-getLayerOffset(0.75)}px)`,
          height: "25%"
        }}
      >
        <div className="flex whitespace-nowrap w-[200%] h-full items-end gap-1">
          {Array.from({ length: 50 }).map((_, i) => (
            <svg key={`shrub-${i}`} viewBox="0 0 35 35" className="flex-shrink-0" style={{ width: "35px", height: "100%" }}>
              <circle cx="17" cy="17" r="15" fill="rgba(40, 160, 40, 0.96)" />
              <circle cx="10" cy="14" r="11" fill="rgba(50, 180, 50, 0.93)" />
              <circle cx="24" cy="14" r="11" fill="rgba(50, 180, 50, 0.93)" />
            </svg>
          ))}
        </div>
      </div>

      {/* Layer 9: Very near grass/foreground silhouette - depth 0.95 (fastest) */}
      <div 
        className="absolute bottom-0 left-0 right-0 w-full pointer-events-none"
        style={{ 
          transform: `translateX(${-getLayerOffset(0.95)}px)`,
          height: "22%"
        }}
      >
        <div className="flex whitespace-nowrap w-[200%] h-full items-end">
          {Array.from({ length: 100 }).map((_, i) => (
            <div key={`grass-${i}`} className="flex-1 h-full bg-gradient-to-b from-green-900 via-green-950 to-yellow-900 border-l border-green-800/50" />
          ))}
        </div>
      </div>

      {/* Layer 10: Ground base - depth static anchor */}
      <div className="absolute bottom-0 left-0 right-0 w-full h-20 bg-gradient-to-b from-green-950 via-green-975 to-yellow-950" />

      {/* Layer 11: Edge vignette - depth static */}
      <div className="absolute inset-0 pointer-events-none w-full h-full" style={{
        boxShadow: "inset 0 0 120px rgba(0,0,0,0.5), inset 0 0 180px rgba(0,0,0,0.25)"
      }} />

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.8; }
        }
        
        .absolute {
          will-change: transform;
        }
      `}</style>
    </div>
  );
}