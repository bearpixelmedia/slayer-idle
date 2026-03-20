import React from "react";

export default function ParallaxBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden w-full h-full bg-gradient-to-b from-blue-900 via-blue-700 to-blue-500">
      {/* Layer 0: Sky gradient base */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-blue-900 via-blue-700 to-sky-400" />

      {/* Layer 1: Far distant stars (slowest) - depth 0.02 */}
      <div className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
        {Array.from({ length: 25 }).map((_, i) => (
          <div
            key={`star-far-${i}`}
            className="absolute rounded-full bg-white"
            style={{
              width: `${1 + (i % 2)}px`,
              height: `${1 + (i % 2)}px`,
              top: `${(i * 3) % 35}%`,
              left: `${(i * 7 + 5) % 100}%`,
              opacity: 0.4 + (i % 2) * 0.2,
              animation: `twinkle ${3 + (i % 2) * 2}s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Layer 2: Mid stars - depth 0.04 */}
      <div className="absolute inset-0 w-full h-full pointer-events-none opacity-60 animate-ground-scroll" style={{ animationDuration: "240s" }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={`star-mid-${i}`}
            className="absolute rounded-full bg-white"
            style={{
              width: `${1.5 + (i % 2) * 0.5}px`,
              height: `${1.5 + (i % 2) * 0.5}px`,
              top: `${25 + ((i * 5) % 40)}%`,
              left: `${(i * 9 + 15) % 100}%`,
              opacity: 0.6 + (i % 3) * 0.2,
              animation: `twinkle ${4 + (i % 3)}s ease-in-out ${i * 0.3}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Layer 3: Ultra-distant mountains - depth 0.06 */}
      <div className="absolute top-0 left-0 right-0 w-full h-1/3 animate-ground-scroll" style={{ animationDuration: "200s", opacity: 0.3 }}>
        <div className="flex whitespace-nowrap w-[200%] h-full items-end">
          {Array.from({ length: 20 }).map((_, i) => (
            <svg key={`ultra-dist-${i}`} viewBox="0 0 120 150" className="flex-shrink-0" style={{ width: "120px", height: "150px" }}>
              <polygon points="60,0 0,150 120,150" fill="rgba(50, 80, 120, 0.4)" />
              <polygon points="60,30 20,150 100,150" fill="rgba(40, 70, 110, 0.5)" />
            </svg>
          ))}
        </div>
      </div>

      {/* Layer 4: Far pine silhouettes - depth 0.12 */}
      <div className="absolute top-1/6 left-0 right-0 w-full h-1/3 animate-ground-scroll" style={{ animationDuration: "120s", opacity: 0.5 }}>
        <div className="flex whitespace-nowrap w-[200%] h-full items-end">
          {Array.from({ length: 25 }).map((_, i) => (
            <svg key={`pine-far-${i}`} viewBox="0 0 80 120" className="flex-shrink-0" style={{ width: "80px", height: "120px" }}>
              <polygon points="40,5 0,120 80,120" fill="rgba(20, 60, 40, 0.6)" />
            </svg>
          ))}
        </div>
      </div>

      {/* Layer 5: Mid-distance mountains with variation - depth 0.22 */}
      <div className="absolute top-1/4 left-0 right-0 w-full h-1/2 animate-ground-scroll" style={{ animationDuration: "60s", opacity: 0.75 }}>
        <div className="flex whitespace-nowrap w-[200%] h-full items-end">
          {Array.from({ length: 25 }).map((_, i) => (
            <svg key={`mountain-mid-${i}`} viewBox="0 0 100 140" className="flex-shrink-0" style={{ width: "100px", height: `${100 + (i % 3) * 40}px` }}>
              <polygon points="50,10 0,140 100,140" fill="rgba(35, 85, 50, 0.8)" />
              <polygon points="50,40 20,140 80,140" fill="rgba(25, 75, 40, 0.9)" />
            </svg>
          ))}
        </div>
      </div>

      {/* Layer 6: Atmospheric haze - depth 0.3 */}
      <div className="absolute inset-0 w-full h-full pointer-events-none" style={{
        background: "linear-gradient(180deg, transparent 0%, rgba(100, 150, 180, 0.15) 50%, rgba(80, 120, 150, 0.25) 100%)"
      }} />

      {/* Layer 7: Foreground mountains - depth 0.45 */}
      <div className="absolute top-1/2 left-0 right-0 w-full h-1/2 animate-ground-scroll" style={{ animationDuration: "30s", opacity: 0.95 }}>
        <div className="flex whitespace-nowrap w-[200%] h-full items-end">
          {Array.from({ length: 30 }).map((_, i) => (
            <svg key={`mountain-fore-${i}`} viewBox="0 0 90 180" className="flex-shrink-0" style={{ width: "90px", height: `${120 + (i % 4) * 60}px` }}>
              <polygon points="45,5 0,180 90,180" fill="rgba(34, 139, 34, 0.85)" />
              <polygon points="45,35 15,180 75,180" fill="rgba(22, 100, 22, 0.95)" />
            </svg>
          ))}
        </div>
      </div>

      {/* Layer 8: Trees mid-ground - depth 0.5 */}
      <div className="absolute bottom-1/5 left-0 right-0 w-full h-1/3 animate-ground-scroll" style={{ animationDuration: "25s", opacity: 1 }}>
        <div className="flex whitespace-nowrap w-[200%] h-full items-end gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={`tree-${i}`} className="flex-shrink-0 flex flex-col items-center justify-end" style={{ width: "50px", height: "100%" }}>
              <svg viewBox="0 0 40 50" style={{ width: "40px", height: "50px" }} className="mb-1">
                <circle cx="20" cy="15" r="12" fill="rgba(15, 90, 15, 0.95)" />
                <circle cx="12" cy="20" r="10" fill="rgba(20, 110, 20, 0.9)" />
                <circle cx="28" cy="20" r="10" fill="rgba(20, 110, 20, 0.9)" />
                <circle cx="20" cy="30" r="8" fill="rgba(25, 130, 25, 0.85)" />
              </svg>
              <div className="w-2 flex-1 bg-amber-900" />
            </div>
          ))}
        </div>
      </div>

      {/* Layer 9: Bushes foreground - depth 0.55 */}
      <div className="absolute bottom-0 left-0 right-0 w-full h-1/5 animate-ground-scroll" style={{ animationDuration: "20s", opacity: 1 }}>
        <div className="flex whitespace-nowrap w-[200%] h-full items-end gap-1">
          {Array.from({ length: 50 }).map((_, i) => (
            <svg key={`bush-${i}`} viewBox="0 0 30 30" className="flex-shrink-0" style={{ width: "30px", height: "100%" }}>
              <circle cx="15" cy="15" r="14" fill="rgba(34, 139, 34, 0.98)" />
              <circle cx="8" cy="12" r="10" fill="rgba(45, 160, 45, 0.95)" />
              <circle cx="22" cy="12" r="10" fill="rgba(45, 160, 45, 0.95)" />
            </svg>
          ))}
        </div>
      </div>

      {/* Layer 10: Ground base - depth static */}
      <div className="absolute bottom-0 left-0 right-0 w-full h-20 bg-gradient-to-b from-green-900 via-green-950 to-yellow-900" />

      {/* Layer 11: Ground texture detail - depth 0.6 */}
      <div className="absolute bottom-0 left-0 right-0 w-full h-20 animate-ground-scroll" style={{ animationDuration: "15s" }}>
        <div className="flex whitespace-nowrap w-[200%] h-full">
          {Array.from({ length: 100 }).map((_, i) => (
            <div key={`grass-${i}`} className="flex-1 h-full border-l border-green-800/30" />
          ))}
        </div>
      </div>

      {/* Layer 12: Edge vignette for depth - depth static */}
      <div className="absolute inset-0 pointer-events-none w-full h-full" style={{
        boxShadow: "inset 0 0 100px rgba(0,0,0,0.4), inset 0 0 150px rgba(0,0,0,0.2)"
      }} />

      {/* Layer 13: Final atmospheric overlay - depth static */}
      <div className="absolute inset-0 pointer-events-none w-full h-full" style={{
        background: "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.1) 100%)"
      }} />

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        
        .absolute {
          will-change: transform;
        }
        
        .animate-ground-scroll {
          will-change: transform;
        }
      `}</style>
    </div>
  );
}