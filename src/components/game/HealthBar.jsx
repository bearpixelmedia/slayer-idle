import React from "react";
import { motion } from "framer-motion";

function HealthBar({ current, max, isBoss }) {
  const pct = Math.max(0, (current / max) * 100);
  return (
    <div className={`${isBoss ? "w-32 sm:w-48" : "w-20 sm:w-32"} h-2.5 bg-muted rounded-full overflow-hidden border border-border/50`}>
      <motion.div
        className="h-full rounded-full"
        style={{
          background: pct > 50 ? "linear-gradient(90deg, #22c55e, #4ade80)" :
                     pct > 25 ? "linear-gradient(90deg, #eab308, #facc15)" :
                     "linear-gradient(90deg, #dc2626, #ef4444)"
        }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.15 }}
      />
    </div>
  );
}

export default React.memo(HealthBar);