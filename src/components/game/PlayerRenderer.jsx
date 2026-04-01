import React from 'react';
import AnimatedSprite from '@/components/game/AnimatedSprite';

export default function PlayerRenderer({ animation = 'idle', className = '' }) {
  return (
    <div className={`overflow-visible flex items-end justify-center ${className}`}>
      <div style={{ transform: 'scale(2)', transformOrigin: 'bottom center' }} className="overflow-visible">
        <AnimatedSprite
          character="hero"
          animation={animation}
        />
      </div>
    </div>
  );
}