import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const GROUND_Y = 70;

// Pixel-art player: uses player/run.png (6 frames, 16×16 each → 96×16 sheet)
// We'll just show a static frame (frame 0) scaled up — no animation needed for minigame
function PixelRunner({ isGameOver }) {
  return (
    <div
      style={{
        width: 32,
        height: 32,
        backgroundImage: "url(/sprites/player/run.png)",
        backgroundRepeat: "no-repeat",
        backgroundSize: "192px 32px",   // 6 frames × 32px
        backgroundPosition: isGameOver ? "-160px 0px" : "0px 0px",
        imageRendering: "pixelated",
        transform: isGameOver ? "rotate(90deg)" : "none",
        transition: "transform 0.3s",
      }}
    />
  );
}

// Pixel-art rock: use a small brown square styled as a pixel obstacle
function PixelRock() {
  return (
    <div
      style={{
        width: 16,
        height: 16,
        backgroundImage: "url(/sprites/environment/props/rocks.png)",
        backgroundRepeat: "no-repeat",
        backgroundSize: "64px 64px",
        backgroundPosition: "0px 0px",
        imageRendering: "pixelated",
      }}
    />
  );
}

export default function RunnerCanvas({
  playerY,
  obstacles,
  score,
  isGameOver,
  gameStarted,
  onTap,
}) {
  const canvasRef = useRef(null);

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-48 bg-gradient-to-b from-blue-900/40 to-blue-950/60 cursor-pointer select-none overflow-hidden border border-border/30 rounded-lg"
      onClick={onTap}
    >
      {/* Sky */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-600/20 to-transparent pointer-events-none" />

      {/* Ground */}
      <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-t from-green-900/60 to-green-800/40">
        <div className="absolute inset-0 flex items-end">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="flex-1 h-0.5 bg-green-700/30 mx-0.5" />
          ))}
        </div>
      </div>

      {/* Player */}
      <motion.div
        className="absolute left-[20%]"
        style={{ top: `${playerY}%`, transform: "translateY(-100%)" }}
      >
        <PixelRunner isGameOver={isGameOver} />
      </motion.div>

      {/* Obstacles */}
      <AnimatePresence>
        {obstacles.map((obs) => (
          <motion.div
            key={obs.id}
            className="absolute"
            style={{
              left: `${obs.x}%`,
              top: `${GROUND_Y}%`,
              transform: "translateY(-100%)",
            }}
            exit={{ opacity: 0 }}
          >
            <PixelRock />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Score */}
      <div className="absolute top-3 left-3 font-pixel text-sm text-primary">
        {score}
      </div>

      {/* Start prompt */}
      {!gameStarted && !isGameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="text-center">
            <p className="font-pixel text-xs text-foreground mb-2">RUNNER MINIGAME</p>
            <p className="text-[10px] text-muted-foreground mb-3">Tap or press SPACE to jump</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onTap}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-pixel text-[9px] hover:brightness-110"
            >
              START
            </motion.button>
          </div>
        </div>
      )}

      {/* Game over */}
      {isGameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="text-center">
            <p className="font-pixel text-xs text-destructive mb-2">GAME OVER</p>
            <p className="text-lg font-pixel text-foreground mb-4">{score} Points</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onTap}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-pixel text-[9px] hover:brightness-110"
            >
              TRY AGAIN
            </motion.button>
          </div>
        </div>
      )}

      {/* Tap hint */}
      {gameStarted && !isGameOver && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
          <span className="font-pixel text-[7px] text-muted-foreground/50 animate-pulse">
            TAP OR SPACEBAR TO JUMP
          </span>
        </div>
      )}
    </div>
  );
}
