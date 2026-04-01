import React from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import AnimatedSprite from "@/components/game/AnimatedSprite";

// ─── Sprite-based enemy marquee ───────────────────────────────────────────────
// All idle sheets are 128×32 (4 frames, 32×32 each).
const MARQUEE_ENEMIES = [
  { url: "/sprites/enemies/orc/idle.png",           frameSize: 32, frames: 4, fps: 4, filter: "" },
  { url: "/sprites/enemies/skeleton/idle.png",       frameSize: 32, frames: 4, fps: 4, filter: "" },
  { url: "/sprites/enemies/orc_rogue/idle.png",      frameSize: 32, frames: 4, fps: 4, filter: "hue-rotate(160deg)" },
  { url: "/sprites/enemies/skeleton_mage/idle.png",  frameSize: 32, frames: 4, fps: 4, filter: "hue-rotate(200deg)" },
  { url: "/sprites/enemies/orc_warrior/idle.png",    frameSize: 32, frames: 4, fps: 4, filter: "sepia(0.4)" },
  { url: "/sprites/enemies/skeleton_rogue/idle.png", frameSize: 32, frames: 4, fps: 4, filter: "hue-rotate(90deg)" },
  { url: "/sprites/enemies/orc_shaman/idle.png",     frameSize: 32, frames: 4, fps: 4, filter: "hue-rotate(280deg)" },
  { url: "/sprites/enemies/skeleton_warrior/idle.png",frameSize: 32,frames: 4, fps: 4, filter: "sepia(0.6)" },
];

// ─── Hero scene sprites ───────────────────────────────────────────────────────
// Knight, Rogue, Wizard idle: 128×32 (4f @ 32px). Player: 256×64 (4f @ 64px).
const SCENE_HEROES = [
  { url: "/sprites/npcs/knight/idle.png", frameSize: 32, frames: 4, fps: 4, scale: 3, flipX: false },
  { url: "/sprites/npcs/rogue/idle.png",  frameSize: 32, frames: 4, fps: 4, scale: 3, flipX: false },
  { url: "/sprites/npcs/wizard/idle.png", frameSize: 32, frames: 4, fps: 4, scale: 3, flipX: false },
];

const SCENE_ENEMIES = [
  { url: "/sprites/enemies/orc/idle.png",          frameSize: 32, frames: 4, fps: 4, scale: 2.5, flipX: true, filter: "" },
  { url: "/sprites/enemies/skeleton/idle.png",      frameSize: 32, frames: 4, fps: 4, scale: 2.5, flipX: true, filter: "" },
  { url: "/sprites/enemies/orc_warrior/idle.png",   frameSize: 32, frames: 4, fps: 4, scale: 3,   flipX: true, filter: "sepia(0.3)" },
  { url: "/sprites/enemies/skeleton_mage/idle.png", frameSize: 32, frames: 4, fps: 4, scale: 2.5, flipX: true, filter: "hue-rotate(200deg)" },
];

// ─── Feature card icons (using environment sprites as pixel icons) ────────────
const FEATURES = [
  {
    sprite: { url: "/sprites/environment/animated/bonfire_anim.png", frameW: 32, frameH: 32, frames: 4, fps: 8 },
    title: "Strategic\nCombat",
    desc: "Tap & idle fighting",
  },
  {
    sprite: { url: "/sprites/environment/animated/alchemy.png", frameW: 192, frameH: 192, frames: 1, fps: 1, scale: 0.18 },
    title: "Prestige\nSystem",
    desc: "Reset for eternal power",
  },
  {
    sprite: { url: "/sprites/environment/animated/fire.png", frameW: 32, frameH: 48, frames: 4, fps: 10 },
    title: "Multiple\nZones",
    desc: "Explore new realms",
  },
];

// Build marquee array (tripled so seamless loop works on any screen width)
const MARQUEE_FULL = [...MARQUEE_ENEMIES, ...MARQUEE_ENEMIES, ...MARQUEE_ENEMIES, ...MARQUEE_ENEMIES];

export default function TitleScreen() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  return (
    <div className="fixed inset-0 bg-background flex flex-col overflow-hidden">
      {/* Sky gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(260,30%,6%)] via-[hsl(270,35%,10%)] to-[hsl(260,20%,8%)]" />

      {/* Glow orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[15%] w-48 h-48 sm:w-72 sm:h-72 bg-accent rounded-full mix-blend-screen filter blur-3xl opacity-20" />
        <div className="absolute top-[5%] right-[10%] w-40 h-40 sm:w-64 sm:h-64 bg-primary rounded-full mix-blend-screen filter blur-3xl opacity-15" />
        <div className="absolute bottom-[20%] left-[5%] w-32 h-32 sm:w-56 sm:h-56 bg-secondary rounded-full mix-blend-screen filter blur-3xl opacity-25" />
      </div>

      {/* Scrolling enemy marquee */}
      <div className="absolute top-[12%] sm:top-[15%] w-full overflow-hidden pointer-events-none">
        <motion.div
          className="flex gap-6 sm:gap-10 whitespace-nowrap items-end"
          animate={reduceMotion ? {} : { x: ["0%", "-50%"] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        >
          {MARQUEE_FULL.map((e, i) => (
            <div key={i} style={{ opacity: 0.35, filter: e.filter || "none", imageRendering: "pixelated" }}>
              <AnimatedSprite
                url={e.url}
                frameSize={e.frameSize}
                frames={e.frames}
                fps={e.fps}
                loop={true}
                playing={!reduceMotion}
                scale={2}
                flipX={i % 2 === 0}
              />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-3 sm:px-6 py-4 gap-4 sm:gap-6 min-h-0">

        {/* Title */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-pixel text-2xl xs:text-3xl sm:text-5xl md:text-6xl text-primary leading-tight drop-shadow-[0_0_20px_hsl(var(--primary)/0.6)]">
            SLAYER
          </h1>
          <h1 className="font-pixel text-2xl xs:text-3xl sm:text-5xl md:text-6xl text-primary leading-tight drop-shadow-[0_0_20px_hsl(var(--primary)/0.6)]">
            IDLE
          </h1>
          <div className="mt-2 h-0.5 w-20 sm:w-32 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto" />
        </motion.div>

        {/* Hero + enemy scene */}
        <motion.div
          className="flex items-end justify-center gap-3 sm:gap-5 py-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {/* Enemies on the left, facing right (flipX=false so they face toward heroes) */}
          {SCENE_ENEMIES.map((e, i) => (
            <div key={`enemy-${i}`} style={{ filter: e.filter || "none", imageRendering: "pixelated" }}>
              <AnimatedSprite
                url={e.url}
                frameSize={e.frameSize}
                frames={e.frames}
                fps={e.fps + i * 0.5}
                loop={true}
                playing={true}
                scale={e.scale}
                flipX={false}
              />
            </div>
          ))}

          {/* Divider glow */}
          <div className="w-px h-16 sm:h-24 bg-gradient-to-b from-transparent via-primary/60 to-transparent mx-1 sm:mx-2 flex-shrink-0" />

          {/* Heroes on the right, facing left toward enemies */}
          {SCENE_HEROES.map((h, i) => (
            <div key={`hero-${i}`} style={{ imageRendering: "pixelated" }}>
              <AnimatedSprite
                url={h.url}
                frameSize={h.frameSize}
                frames={h.frames}
                fps={h.fps + i * 0.3}
                loop={true}
                playing={true}
                scale={h.scale}
                flipX={true}
              />
            </div>
          ))}
        </motion.div>

        {/* Feature cards */}
        <motion.div
          className="grid grid-cols-3 gap-2 sm:gap-4 w-full max-w-sm sm:max-w-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
        >
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-1 p-2 sm:p-4 rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm text-center overflow-hidden"
            >
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12" style={{ imageRendering: "pixelated" }}>
                <AnimatedSprite
                  url={f.sprite.url}
                  frameW={f.sprite.frameW}
                  frameH={f.sprite.frameH}
                  frames={f.sprite.frames}
                  fps={f.sprite.fps}
                  loop={true}
                  playing={!reduceMotion}
                  scale={f.sprite.scale ?? 1.2}
                />
              </div>
              <p className="font-pixel text-[7px] sm:text-[9px] text-foreground leading-tight whitespace-pre-line">{f.title}</p>
              <p className="text-[8px] sm:text-xs text-muted-foreground leading-tight hidden sm:block">{f.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* START button */}
        <motion.button
          type="button"
          onClick={() => navigate("/Game")}
          className="relative font-pixel text-sm sm:text-base text-primary-foreground bg-gradient-to-r from-primary to-accent px-8 py-3 sm:px-14 sm:py-4 rounded-lg shadow-lg shadow-primary/30 active:scale-95 touch-manipulation w-full max-w-[16rem] sm:max-w-xs"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          whileHover={reduceMotion ? undefined : { scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.span
            className="flex items-center justify-center gap-2"
            animate={reduceMotion ? {} : { x: [0, 3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            START GAME →
          </motion.span>
          {/* shimmer */}
          <motion.div
            className="absolute inset-0 rounded-lg bg-white opacity-0"
            animate={reduceMotion ? {} : { opacity: [0, 0.12, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
          />
        </motion.button>

        {/* Tagline */}
        <motion.p
          className="font-pixel text-[8px] sm:text-[10px] text-muted-foreground tracking-widest uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Click · Upgrade · Prestige
        </motion.p>
      </div>

      {/* Ground strip */}
      <div className="relative z-10 h-6 sm:h-8 bg-gradient-to-t from-[hsl(260,20%,5%)] to-transparent flex-shrink-0" />
    </div>
  );
}
