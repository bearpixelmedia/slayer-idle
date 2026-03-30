import React, { useEffect, useState, useRef } from "react";
import AnimatedSprite from "./AnimatedSprite";
import { PLAYER_BODY_A, WEAPON_SPRITES, resolveAnim } from "@/lib/sprites";

/**
 * PlayerWeaponSprite
 *
 * Renders the Body_A attack animation layered with the Hands sprite on top.
 * Used in place of the emoji weapons in PlayerDisplay's left/right weapon columns.
 *
 * When not attacking:  renders nothing (returns null) — PlayerRenderer's body handles idle/run.
 * When attacking:      plays the correct Body_A attack sheet once, then disappears.
 *
 * Attack sheet mapping:
 *   sword → slice   (Body_A slice_side, 8f @ 14fps)
 *   bow   → pierce  (Body_A pierce_side, 8f @ 14fps)
 *
 * The Hands sprite is a 32×96 sheet with 3 skin rows stacked vertically.
 * We render row 0 (light) as a composited overlay — same pixel grid as Body_A.
 *
 * Props:
 *   weaponMode   {string}   "sword" | "bow"
 *   attackTick   {number}   increments each attack — triggers play
 *   scale        {number}   pixel scale (default: 3, same as PlayerSprite)
 *   skinRow      {number}   0=light 1=medium 2=dark (default: 0)
 *   onComplete   {function} called when attack anim finishes
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

  useEffect(() => {
    if (attackTick !== prevTickRef.current && attackTick > 0) {
      prevTickRef.current = attackTick;
      setPlaying(true);
    }
  }, [attackTick]);

  const handleComplete = () => {
    setPlaying(false);
    onCompleteRef.current?.();
  };

  if (!playing) return null;

  // Pick the correct Body_A attack sheet
  const animKey = weaponMode === "bow" ? "pierce" : "slice";
  const bodyAnim = resolveAnim(PLAYER_BODY_A, animKey);
  if (!bodyAnim) return null;

  // Hands overlay: crop the correct skin row from the 32×96 sheet.
  // We render it as a positioned overlay at the same scale as Body_A.
  const HAND_FRAME = 32;
  const handSizeRendered = HAND_FRAME * scale;
  // Body_A frame is 64×64; hands sit roughly centred on the body.
  const bodyRendered = 64 * scale;
  const handOffset = Math.round((bodyRendered - handSizeRendered) / 2);

  return (
    <div className="relative inline-block" style={{ width: bodyRendered, height: bodyRendered }}>
      {/* Body_A attack layer */}
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

      {/* Hands overlay — crop the skin row via background-position */}
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          top: handOffset,
          left: handOffset,
          width: handSizeRendered,
          height: handSizeRendered,
          backgroundImage: `url(${WEAPON_SPRITES.hands})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: `${HAND_FRAME * scale}px ${HAND_FRAME * scale * 3}px`,
          backgroundPosition: `0px -${skinRow * handSizeRendered}px`,
          imageRendering: "pixelated",
        }}
      />
    </div>
  );
}
