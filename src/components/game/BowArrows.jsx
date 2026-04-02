import React, { useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

/**
 * Bow shots: bright streak from player toward enemy.
 * Coordinates: x = % from left, y = % from bottom (same as GameCanvas / combatHitboxes).
 */
function BowArrows({ shots }) {
  const wrapRef = useRef(null);
  const [size, setSize] = useState({ w: 1, h: 1 });

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      setSize({ w: Math.max(1, r.width), h: Math.max(1, r.height) });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="pointer-events-none absolute inset-0 overflow-visible">
      {shots.map((s) => {
        const dx = ((s.x1 - s.x0) / 100) * size.w;
        const dy = -((s.y1 - s.y0) / 100) * size.h;
        const len = Math.max(4, Math.hypot(dx, dy));
        const angleDeg = Math.atan2(dy, dx) * (180 / Math.PI);

        return (
          <motion.div
            key={s.id}
            className="absolute rounded-full bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-100"
            style={{
              left: `${s.x0}%`,
              bottom: `${s.y0}%`,
              width: len,
              height: 7,
              transformOrigin: "0 50%",
              boxShadow: "0 0 14px #facc15, 0 0 4px #fff, inset 0 0 2px rgba(255,255,255,0.9)",
              border: "1px solid rgba(254,243,199,0.95)",
            }}
            initial={{ rotate: angleDeg, scaleX: 0.04 }}
            animate={{ rotate: angleDeg, scaleX: 1 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          />
        );
      })}
    </div>
  );
}

export default React.memo(BowArrows);
