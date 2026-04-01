import React from "react";
import { motion, AnimatePresence } from "framer-motion";

function Particle({ id, x, y, emoji, angle, distance, duration }) {
  const radiansAngle = (angle * Math.PI) / 180;
  const endX = x + Math.cos(radiansAngle) * distance;
  const endY = y + Math.sin(radiansAngle) * distance;

  return (
    <motion.div
      key={id}
      className="absolute pointer-events-none text-2xl"
      style={{ left: `${x}%`, top: `${y}%` }}
      initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      animate={{ 
        opacity: 0, 
        x: endX - x, 
        y: endY - y, 
        scale: 0.3,
        rotate: angle
      }}
      exit={{ opacity: 0 }}
      transition={{ duration, ease: "easeOut" }}
    >
      {emoji}
    </motion.div>
  );
}

export default function ParticleEffect({ particles }) {
  return (
    <AnimatePresence>
      {particles.map((p) => (
        <Particle
          key={p.id}
          id={p.id}
          x={p.x}
          y={p.y}
          emoji={p.emoji}
          angle={p.angle}
          distance={p.distance}
          duration={p.duration}
        />
      ))}
    </AnimatePresence>
  );
}