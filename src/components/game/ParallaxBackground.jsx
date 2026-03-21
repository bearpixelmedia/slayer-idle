import React, { useEffect, useRef, memo } from "react";

// All layers defined as static data - no re-renders
const LAYERS = [
  { id: "stars",          speed: 0.01 },
  { id: "mountains-far", speed: 0.06 },
  { id: "mountains-mid", speed: 0.12 },
  { id: "trees-far",     speed: 0.25 },
  { id: "trees-mid",     speed: 0.45 },
  { id: "trees-front",   speed: 0.65 },
  { id: "shrubs",        speed: 0.85 },
  { id: "grass-mid",     speed: 0.91 },
  { id: "grass-fg",      speed: 0.98 },
];

// Stars - rendered once, static
const Stars = memo(() => (
  <div className="absolute inset-0 w-[200%]">
    {Array.from({ length: 30 }).map((_, i) => (
      <div
        key={i}
        className="absolute rounded-full bg-white"
        style={{
          width: `${1 + (i % 3)}px`,
          height: `${1 + (i % 3)}px`,
          top: `${5 + (i * 13) % 40}%`,
          left: `${(i * 6.7) % 100}%`,
          opacity: 0.2 + (i % 4) * 0.1,
        }}
      />
    ))}
  </div>
));

// Mountains - rendered once
const Mountains = memo(({ variant }) => {
  const count = variant === "far" ? 8 : 10;
  const color = variant === "far" ? "rgba(30, 65, 110, 0.5)" : "rgba(40, 100, 60, 0.7)";
  return (
    <div className="flex w-[200%] h-full items-end">
      {Array.from({ length: count }).map((_, i) => {
        const peak = 15 + (i * 11) % 30;
        return (
          <svg key={i} viewBox="0 0 150 200" style={{ flex: "0 0 150px", height: "100%" }}>
            <polygon points={`75,${peak} 0,200 150,200`} fill={color} />
            <polygon points={`40,${peak + 20} 0,200 80,200`} fill={color} opacity="0.7" />
          </svg>
        );
      })}
    </div>
  );
});

// Trees - rendered once
const Trees = memo(({ count, size, color }) => (
  <div className="flex w-[200%] h-full items-end">
    {Array.from({ length: count }).map((_, i) => (
      <svg key={i} viewBox="0 0 50 110" style={{ flex: `0 0 ${size}px`, height: "100%" }}>
        <circle cx="25" cy="20" r="12" fill={color} />
        <circle cx="15" cy="30" r="10" fill={color} />
        <circle cx="35" cy="30" r="10" fill={color} />
        <rect x="22" y="40" width="6" height="70" fill="rgba(90, 55, 25, 0.9)" />
      </svg>
    ))}
  </div>
));

// Shrubs - rendered once
const Shrubs = memo(() => (
  <div className="flex w-[200%] h-full items-end">
    {Array.from({ length: 40 }).map((_, i) => {
      const s = 20 + (i % 4) * 8;
      return (
        <div key={i} style={{ flex: `0 0 ${s}px`, height: `${s}px` }}>
          <svg viewBox="0 0 35 35" width="100%" height="100%">
            <circle cx="17" cy="17" r="14" fill="rgba(45, 160, 45, 0.95)" />
            <circle cx="10" cy="13" r="10" fill="rgba(55, 180, 55, 0.9)" />
            <circle cx="24" cy="13" r="10" fill="rgba(55, 180, 55, 0.9)" />
          </svg>
        </div>
      );
    })}
  </div>
));

// Grass strip - rendered once
const GrassStrip = memo(({ color1, color2, count }) => (
  <div className="flex w-[200%] h-full">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        style={{
          flex: 1,
          background: `linear-gradient(to bottom, ${color1}, ${color2})`,
          opacity: 0.85 + (i % 2) * 0.1,
        }}
      />
    ))}
  </div>
));

export default function ParallaxBackground() {
  const layerRefs = useRef({});
  const camXRef = useRef(0);
  const targetRef = useRef(0);
  const rafRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Advance target on interval
    intervalRef.current = setInterval(() => {
      targetRef.current = (targetRef.current + 2) % 10000;
    }, 60);

    // Animation loop - directly sets CSS transforms, no React state
    const tick = () => {
      const lerp = 0.12;
      camXRef.current += (targetRef.current - camXRef.current) * lerp;
      const camX = camXRef.current;

      // Directly update each layer's transform
      Object.entries(layerRefs.current).forEach(([speed, el]) => {
        if (el) {
          el.style.transform = `translate3d(${-camX * Number(speed)}px, 0, 0)`;
        }
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearInterval(intervalRef.current);
    };
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

  const setRef = (speed) => (el) => {
    layerRefs.current[speed] = el;
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-blue-950 via-blue-800 to-green-900">
      {/* Static sky */}
      <div className="absolute inset-0 w-full h-3/4 bg-gradient-to-b from-blue-950 via-blue-800 to-green-700 pointer-events-none" />

      {/* Stars - speed 0.01 */}
      <div ref={setRef(0.01)} style={layerStyle(0, 60, 0.5)}>
        <Stars />
      </div>

      {/* Far mountains - speed 0.06 */}
      <div ref={setRef(0.06)} style={layerStyle(10, 30, 0.45)}>
        <Mountains variant="far" />
      </div>

      {/* Mid mountains - speed 0.12 */}
      <div ref={setRef(0.12)} style={layerStyle(18, 35, 0.65)}>
        <Mountains variant="mid" />
      </div>

      {/* Far trees - speed 0.25 */}
      <div ref={setRef(0.25)} style={layerStyle(32, 30, 0.6)}>
        <Trees count={25} size={40} color="rgba(10, 65, 20, 0.88)" />
      </div>

      {/* Mid trees - speed 0.45 */}
      <div ref={setRef(0.45)} style={layerStyle(30, 38, 0.75)}>
        <Trees count={20} size={60} color="rgba(18, 85, 28, 0.92)" />
      </div>

      {/* Front trees - speed 0.65 */}
      <div ref={setRef(0.65)} style={layerStyle(27, 46, 0.88)}>
        <Trees count={18} size={75} color="rgba(25, 100, 35, 0.95)" />
      </div>

      {/* Shrubs - speed 0.85 */}
      <div ref={setRef(0.85)} style={layerStyle(62, 25, 0.88)}>
        <Shrubs />
      </div>

      {/* Mid grass - speed 0.91 */}
      <div ref={setRef(0.91)} style={layerStyle(76, 20, 0.9)}>
        <GrassStrip color1="rgba(40,100,40,0.9)" color2="rgba(20,60,20,1)" count={60} />
      </div>

      {/* Foreground grass - speed 0.98 */}
      <div ref={setRef(0.98)} style={layerStyle(85, 15, 0.95)}>
        <GrassStrip color1="rgba(50,120,50,0.95)" color2="rgba(30,70,30,1)" count={80} />
      </div>

      {/* Static ground */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-b from-green-700 via-green-900 to-yellow-900 pointer-events-none" />

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{
        boxShadow: "inset 0 0 150px rgba(0,0,0,0.5)"
      }} />
    </div>
  );
}