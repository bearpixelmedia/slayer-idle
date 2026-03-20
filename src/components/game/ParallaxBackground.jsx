import React from "react";

export default function ParallaxBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden w-full h-full">
      {/* Sky gradient - covers entire top half */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-sky-700 via-sky-500 to-sky-400" />

      {/* Stars/sky detail */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={`star-${i}`}
            className="absolute rounded-full bg-white"
            style={{
              width: `${1 + (i % 3)}px`,
              height: `${1 + (i % 3)}px`,
              top: `${(i * 7) % 40}%`,
              left: `${(i * 13 + 5) % 100}%`,
              opacity: 0.6 + (i % 3) * 0.15,
            }}
          />
        ))}
      </div>

      {/* Far distant mountains - slowest parallax */}
      <div className="absolute top-0 left-0 right-0 w-full h-1/3 animate-ground-scroll" style={{ animationDuration: "80s", opacity: 0.4 }}>
        <div className="flex whitespace-nowrap w-[200%] h-full items-end">
          {Array.from({ length: 20 }).map((_, i) => (
            <svg
              key={`dist-mountain-${i}`}
              viewBox="0 0 120 150"
              className="flex-shrink-0"
              style={{ width: "120px", height: "150px" }}
            >
              <polygon points="60,0 0,150 120,150" fill="rgba(100, 120, 140, 0.5)" />
              <polygon points="60,20 20,150 100,150" fill="rgba(80, 100, 120, 0.6)" />
            </svg>
          ))}
        </div>
      </div>

      {/* Mid-distance mountains - medium parallax */}
      <div className="absolute top-1/4 left-0 right-0 w-full h-1/2 animate-ground-scroll" style={{ animationDuration: "40s", opacity: 0.65 }}>
        <div className="flex whitespace-nowrap w-[200%] h-full items-end">
          {Array.from({ length: 25 }).map((_, i) => (
            <svg
              key={`mid-mountain-${i}`}
              viewBox="0 0 100 140"
              className="flex-shrink-0"
              style={{ width: "100px", height: "140px" }}
            >
              <polygon points="50,10 0,140 100,140" fill="rgba(60, 100, 50, 0.7)" />
              <polygon points="50,40 20,140 80,140" fill="rgba(40, 80, 30, 0.8)" />
            </svg>
          ))}
        </div>
      </div>

      {/* Foreground mountains - fast parallax */}
      <div className="absolute top-1/2 left-0 right-0 w-full h-1/2 animate-ground-scroll" style={{ animationDuration: "20s", opacity: 0.9 }}>
        <div className="flex whitespace-nowrap w-[200%] h-full items-end">
          {Array.from({ length: 30 }).map((_, i) => (
            <svg
              key={`fore-mountain-${i}`}
              viewBox="0 0 90 180"
              className="flex-shrink-0"
              style={{ width: "90px", height: "180px" }}
            >
              <polygon points="45,5 0,180 90,180" fill="rgba(34, 139, 34, 0.8)" />
              <polygon points="45,35 15,180 75,180" fill="rgba(25, 100, 25, 0.9)" />
            </svg>
          ))}
        </div>
      </div>

      {/* Foliage/trees - fastest parallax */}
      <div className="absolute bottom-8 left-0 right-0 w-full h-1/4 animate-ground-scroll" style={{ animationDuration: "12s", opacity: 1 }}>
        <div className="flex whitespace-nowrap w-[200%] h-full items-end gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <div
              key={`tree-${i}`}
              className="flex-shrink-0 flex flex-col items-center justify-end"
              style={{ width: "50px", height: "100%" }}
            >
              {/* Tree crown */}
              <svg viewBox="0 0 40 50" style={{ width: "40px", height: "50px" }} className="mb-1">
                <circle cx="20" cy="15" r="12" fill="rgba(20, 100, 20, 0.9)" />
                <circle cx="12" cy="20" r="10" fill="rgba(25, 120, 25, 0.85)" />
                <circle cx="28" cy="20" r="10" fill="rgba(25, 120, 25, 0.85)" />
                <circle cx="20" cy="30" r="8" fill="rgba(30, 130, 30, 0.8)" />
              </svg>
              {/* Tree trunk */}
              <div className="w-2 flex-1 bg-amber-900" />
            </div>
          ))}
        </div>
      </div>

      {/* Bushes and low foliage */}
      <div className="absolute bottom-0 left-0 right-0 w-full h-1/5 animate-ground-scroll" style={{ animationDuration: "8s", opacity: 1 }}>
        <div className="flex whitespace-nowrap w-[200%] h-full items-end gap-1">
          {Array.from({ length: 50 }).map((_, i) => (
            <svg
              key={`bush-${i}`}
              viewBox="0 0 30 30"
              className="flex-shrink-0"
              style={{ width: "30px", height: "100%" }}
            >
              <circle cx="15" cy="15" r="14" fill="rgba(34, 139, 34, 0.95)" />
              <circle cx="8" cy="12" r="10" fill="rgba(40, 150, 40, 0.9)" />
              <circle cx="22" cy="12" r="10" fill="rgba(40, 150, 40, 0.9)" />
            </svg>
          ))}
        </div>
      </div>

      {/* Ground layer - bottom */}
      <div className="absolute bottom-0 left-0 right-0 w-full h-20 bg-gradient-to-b from-green-900 via-green-950 to-yellow-900" />

      {/* Ground detail texture */}
      <div className="absolute bottom-0 left-0 right-0 w-full h-20 animate-ground-scroll" style={{ animationDuration: "6s" }}>
        <div className="flex whitespace-nowrap w-[200%] h-full">
          {Array.from({ length: 100 }).map((_, i) => (
            <div key={`grass-${i}`} className="flex-1 h-full border-l border-green-800/30" />
          ))}
        </div>
      </div>
    </div>
  );
}