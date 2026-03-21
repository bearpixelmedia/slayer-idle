import React, { useEffect, useRef } from "react";

export default function ParallaxBackground() {
  const refs = useRef([]);
  const speeds = useRef([]);
  const camX = useRef(0);
  const target = useRef(0);
  const rafId = useRef(null);
  const intId = useRef(null);

  useEffect(() => {
    intId.current = setInterval(() => {
      target.current = (target.current + 2) % 10000;
    }, 60);

    const tick = () => {
      camX.current += (target.current - camX.current) * 0.12;
      const cx = camX.current;
      for (let i = 0; i < refs.current.length; i++) {
        const el = refs.current[i];
        if (el) el.style.transform = `translate3d(${-cx * speeds.current[i]}px,0,0)`;
      }
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId.current);
      clearInterval(intId.current);
    };
  }, []);

  const layer = (idx, speed, top, height, opacity, children) => {
    speeds.current[idx] = speed;
    return (
      <div
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
      )}

      {/* Far mountains */}
      {layer(1, 0.06, 10, 30, 0.45,
        <div style={{ display: "flex", width: "200%", height: "100%", alignItems: "flex-end" }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <svg key={i} viewBox="0 0 150 200" style={{ flex: "0 0 150px", height: "100%" }}>
              <polygon points={`75,${15 + (i * 11) % 30} 0,200 150,200`} fill="rgba(30,65,110,0.5)" />
              <polygon points={`40,${35 + (i * 17) % 30} 0,200 80,200`} fill="rgba(20,55,100,0.4)" />
            </svg>
          ))}
        </div>
      )}

      {/* Mid mountains / hills */}
      {layer(2, 0.12, 20, 35, 0.65,
        <div style={{ display: "flex", width: "200%", height: "100%", alignItems: "flex-end" }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <svg key={i} viewBox="0 0 150 200" style={{ flex: "0 0 150px", height: "100%" }}>
              <polygon points={`75,${10 + (i * 13) % 28} 0,200 150,200`} fill="rgba(40,100,60,0.7)" />
              <polygon points={`40,${30 + (i * 19) % 35} 0,200 80,200`} fill="rgba(30,85,50,0.6)" />
            </svg>
          ))}
        </div>
      )}

      {/* Far trees */}
      {layer(3, 0.25, 33, 30, 0.6,
        <div style={{ display: "flex", width: "200%", height: "100%", alignItems: "flex-end" }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <svg key={i} viewBox="0 0 50 110" style={{ flex: "0 0 40px", height: "100%" }}>
              <circle cx="25" cy="20" r="12" fill="rgba(10,65,20,0.88)" />
              <circle cx="15" cy="30" r="10" fill="rgba(15,75,25,0.85)" />
              <circle cx="35" cy="30" r="10" fill="rgba(15,75,25,0.85)" />
              <rect x="22" y="40" width="6" height="70" fill="rgba(80,50,20,0.9)" />
            </svg>
          ))}
        </div>
      )}

      {/* Mid trees */}
      {layer(4, 0.45, 30, 40, 0.78,
        <div style={{ display: "flex", width: "200%", height: "100%", alignItems: "flex-end" }}>
          {Array.from({ length: 18 }).map((_, i) => (
            <svg key={i} viewBox="0 0 50 110" style={{ flex: "0 0 60px", height: "100%" }}>
              <circle cx="25" cy="18" r="14" fill="rgba(18,85,28,0.92)" />
              <circle cx="14" cy="30" r="12" fill="rgba(25,100,35,0.9)" />
              <circle cx="36" cy="30" r="12" fill="rgba(25,100,35,0.9)" />
              <rect x="22" y="42" width="6" height="68" fill="rgba(90,55,25,0.95)" />
            </svg>
          ))}
        </div>
      )}

      {/* Front trees */}
      {layer(5, 0.65, 27, 48, 0.9,
        <div style={{ display: "flex", width: "200%", height: "100%", alignItems: "flex-end" }}>
          {Array.from({ length: 16 }).map((_, i) => (
            <svg key={i} viewBox="0 0 50 110" style={{ flex: "0 0 75px", height: "100%" }}>
              <circle cx="25" cy="15" r="16" fill="rgba(25,100,35,0.95)" />
              <circle cx="12" cy="28" r="14" fill="rgba(30,115,40,0.93)" />
              <circle cx="38" cy="28" r="14" fill="rgba(30,115,40,0.93)" />
              <circle cx="25" cy="42" r="12" fill="rgba(35,130,45,0.91)" />
              <rect x="22" y="52" width="6" height="58" fill="rgba(110,65,30,0.98)" />
            </svg>
          ))}
        </div>
      )}

      {/* Shrubs */}
      {layer(6, 0.85, 63, 25, 0.88,
        <div style={{ display: "flex", width: "200%", height: "100%", alignItems: "flex-end" }}>
          {Array.from({ length: 35 }).map((_, i) => {
            const s = 20 + (i % 4) * 8;
            return (
              <svg key={i} viewBox="0 0 35 35" style={{ flex: `0 0 ${s}px`, height: `${s}px` }}>
                <circle cx="17" cy="17" r="14" fill="rgba(45,160,45,0.95)" />
                <circle cx="10" cy="13" r="10" fill="rgba(55,180,55,0.9)" />
                <circle cx="24" cy="13" r="10" fill="rgba(55,180,55,0.9)" />
              </svg>
            );
          })}
        </div>
      )}

      {/* Mid grass */}
      {layer(7, 0.91, 77, 20, 0.9,
        <div style={{ display: "flex", width: "200%", height: "100%", background: "linear-gradient(to bottom, rgba(40,100,40,0.9), rgba(20,60,20,1))" }} />
      )}

      {/* Foreground grass */}
      {layer(8, 0.98, 85, 15, 0.96,
        <div style={{ display: "flex", width: "200%", height: "100%", background: "linear-gradient(to bottom, rgba(55,130,55,0.95), rgba(30,70,30,1))" }} />
      )}

      {/* Static ground */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "80px", background: "linear-gradient(to bottom, #2d6e1a, #1a3d0a)", pointerEvents: "none" }} />

      {/* Vignette */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", boxShadow: "inset 0 0 120px rgba(0,0,0,0.55)" }} />
    </div>
  );
}