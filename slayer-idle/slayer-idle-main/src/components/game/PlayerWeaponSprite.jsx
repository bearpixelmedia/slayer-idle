import React, { useEffect, useState, useRef } from "react";
import AnimatedSprite from "./AnimatedSprite";
import { PLAYER_BODY_A, WEAPON_SPRITES, resolveAnim } from "@/lib/sprites";
import { loadGameSettings } from "@/lib/gameSettings";

/**
 * PlayerWeaponSprite
 *
 * Renders the Body_A attack animation with two composited overlays:
 *   1. Hands.png — skin-toned hand at the correct row
 *   2. Weapon sprite — chosen weapon from the settings picker (optional)
 *
 * When not attacking: renders nothing (PlayerRenderer handles idle/run).
 * When attackTick increments: plays the attack sheet once, then disappears.
 *
 * Attack sheet mapping:
 *   sword → slice  (Body_A slice_side, 8f @ 14fps)
 *   bow   → pierce (Body_A pierce_side, 8f @ 14fps)
 *
 * Props:
 *   weaponMode   {string}   "sword" | "bow"
 *   attackTick   {number}   increments each attack — triggers play
 *   scale        {number}   pixel scale (default 3)
 *   skinRow      {number}   0=light 1=medium 2=dark (from settings)
 *   onComplete   {function}
 */
export default function PlayerWeaponSprite({
  weaponMode = "sword",
  attackTick = 0,
  scale = 3,
  skinRow = 0,
  onComplete,
}) {
  const [playing, setPlaying] = useState(false);
  const prevTickRef = useRef(attackTick);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Load weapon setting once (settings don't hot-reload during a fight, that's fine)
  const weaponSettings = useRef(null);
  if (!weaponSettings.current) {
    const s = loadGameSettings();
    weaponSettings.current = {
      sheet:    s.player_weapon_sheet    ?? null,
      cellX:    s.player_weapon_cell_x   ?? 0,
      cellY:    s.player_weapon_cell_y   ?? 0,
      cellSize: s.player_weapon_cell_size ?? 32,
    };
  }

  useEffect(() => {
    if (attackTick !== prevTickRef.current && attackTick > 0) {
      prevTickRef.current = attackTick;
      // Refresh weapon settings on each new attack so changes in Settings
      // take effect next swing without a page reload.
      const s = loadGameSettings();
      weaponSettings.current = {
        sheet:    s.player_weapon_sheet    ?? null,
        cellX:    s.player_weapon_cell_x   ?? 0,
        cellY:    s.player_weapon_cell_y   ?? 0,
        cellSize: s.player_weapon_cell_size ?? 32,
      };
      setPlaying(true);
    }
  }, [attackTick]);

  const handleComplete = () => {
    setPlaying(false);
    onCompleteRef.current?.();
  };

  if (!playing) return null;

  const animKey = weaponMode === "bow" ? "pierce" : "slice";
  const bodyAnim = resolveAnim(PLAYER_BODY_A, animKey);
  if (!bodyAnim) return null;

  // ── Layout constants ───────────────────────────────────────────────────────
  const BODY_FRAME  = 64;                         // Body_A is 64×64
  const HAND_FRAME  = 32;                         // Hands.png cells are 32×32
  const bodyPx      = BODY_FRAME * scale;         // rendered body size
  const handPx      = HAND_FRAME * scale;         // rendered hand size

  // Centre the hand overlay on the body
  const handTop  = Math.round((bodyPx - handPx) / 2);
  const handLeft = Math.round((bodyPx - handPx) / 2);

  // Weapon overlay — same cell size as hands, centred
  const ws = weaponSettings.current;
  const weaponPx = (ws.cellSize ?? HAND_FRAME) * scale;
  const weaponTop  = Math.round((bodyPx - weaponPx) / 2);
  const weaponLeft = Math.round((bodyPx - weaponPx) / 2);

  // Background-size for full weapon sheet (to hit correct cell via backgroundPosition)
  const sheetW = ws.sheet
    ? (ws.sheet.includes("bone") ? 224 : 192) * scale
    : 0;
  const sheetH = ws.sheet
    ? (ws.sheet.includes("bone") ? 144 : 112) * scale
    : 0;

  return (
    <div
      className="relative inline-block"
      style={{ width: bodyPx, height: bodyPx }}
    >
      {/* ① Body_A attack sheet */}
      <AnimatedSprite
        url={bodyAnim.url}
        frameW={bodyAnim.frameW}
        frameH={bodyAnim.frameH}
        frames={bodyAnim.frames}
        fps={bodyAnim.fps}
        loop={false}
        playing={playing}
        scale={scale}
        flipX={false}
        onComplete={handleComplete}
      />

      {/* ② Hands overlay — skin tone row from Hands.png */}
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          top:    handTop,
          left:   handLeft,
          width:  handPx,
          height: handPx,
          backgroundImage:    `url(${WEAPON_SPRITES.hands})`,
          backgroundRepeat:   "no-repeat",
          backgroundSize:     `${handPx}px ${handPx * 3}px`,
          backgroundPosition: `0px -${skinRow * handPx}px`,
          imageRendering:     "pixelated",
        }}
      />

      {/* ③ Weapon sprite overlay (optional — only when a weapon is selected) */}
      {ws.sheet && (
        <div
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            top:    weaponTop,
            left:   weaponLeft,
            width:  weaponPx,
            height: weaponPx,
            backgroundImage:    `url(${ws.sheet})`,
            backgroundRepeat:   "no-repeat",
            backgroundSize:     `${sheetW}px ${sheetH}px`,
            backgroundPosition: `-${ws.cellX * weaponPx}px -${ws.cellY * weaponPx}px`,
            imageRendering:     "pixelated",
          }}
        />
      )}
    </div>
  );
}
