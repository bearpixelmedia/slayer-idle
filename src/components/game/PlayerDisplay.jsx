import React, { useEffect, useRef, useMemo, useState, useCallback } from "react";
import { motion, useMotionValue, useAnimation, useTransform, animate } from "framer-motion";
import PlayerRenderer from "./PlayerRenderer";
import { ROAD_CENTER_FROM_BOTTOM_PCT, PLAYER_ANCHOR_LEFT_PCT } from "@/lib/combatHitboxes";
import {
  JUMP_CUT,
  JUMP_GRAVITY_FALL,
  JUMP_GRAVITY_UP,
  JUMP_HOLD_BOOST_ACCEL,
  JUMP_HOLD_BOOST_MS,
  JUMP_V0,
  JUMP_VY_MAX_DOWN,
  JUMP_VY_MAX_UP,
} from "@/lib/playerJumpPhysics";
import { getPlayerWeaponRig } from "@/lib/playerWeaponRig";
import { computePlayerWeaponLayout } from "@/lib/playerWeaponLayout";
import { CHARACTER_EMOJI_NORMAL, WEAPON_EMOJI_TYPO_NORMAL } from "@/lib/characterEmojiStyles";

function PlayerDisplay({
  playerHP,
  playerMaxHP,
  enemyHit,
  playerHit,
  weaponMode,
  gameSettings,
  jumpPressId = 0,
  jumpActiveRef,
  jumpStartRef,
  attackTick = 0,
  playerHitboxRef,
  combatGlyphRef,
}) {
  const isBow = weaponMode === "bow";
  const rig = useMemo(() => getPlayerWeaponRig(weaponMode, gameSettings), [weaponMode, gameSettings]);
  const rigRef = useRef(rig);
  rigRef.current = rig;

  const [characterArtBounds, setCharacterArtBounds] = useState({ w: 0, h: 0 });
  const [hitboxSlotBounds, setHitboxSlotBounds] = useState({ w: 0, h: 0 });
  const slotResizeRef = useRef(null);

  const onCharacterBoundsChange = useCallback((r) => {
    setCharacterArtBounds((prev) => {
      if (Math.abs(prev.w - r.width) < 0.35 && Math.abs(prev.h - r.height) < 0.35) return prev;
      return { w: r.width, h: r.height };
    });
  }, []);

  const setPlayerHitboxNode = useCallback(
    (node) => {
      if (playerHitboxRef && typeof playerHitboxRef === "object") {
        playerHitboxRef.current = node;
      }
      slotResizeRef.current?.disconnect();
      slotResizeRef.current = null;
      if (!node) {
        setHitboxSlotBounds({ w: 0, h: 0 });
        return;
      }
      const ro = new ResizeObserver(([e]) => {
        const { width, height } = e.contentRect;
        setHitboxSlotBounds((prev) => {
          if (Math.abs(prev.w - width) < 0.35 && Math.abs(prev.h - height) < 0.35) return prev;
          return { w: width, h: height };
        });
      });
      ro.observe(node);
      slotResizeRef.current = ro;
    },
    [playerHitboxRef]
  );

  useEffect(
    () => () => {
      slotResizeRef.current?.disconnect();
    },
    []
  );

  const weaponLayout = useMemo(() => {
    const slot =
      hitboxSlotBounds.w > 8 && hitboxSlotBounds.h > 8
        ? hitboxSlotBounds
        : { w: 64, h: 64 };
    const art =
      characterArtBounds.w > 4 && characterArtBounds.h > 4
        ? characterArtBounds
        : { w: slot.w * 0.85, h: slot.h * 0.85 };
    return computePlayerWeaponLayout(art, slot, rig);
  }, [characterArtBounds, hitboxSlotBounds, rig]);

  /** HP bar + ground shadow use row center (50%); offset so they align with the character column, not the whole sword–body–shield row. */
  const characterCenterOffsetPx = useMemo(() => {
    const { leftColW, slotW, rowMinWidth } = weaponLayout;
    const rowWidthPx = Math.max(rowMinWidth, slotW + 32);
    const charCenter = leftColW + slotW / 2;
    return charCenter - rowWidthPx / 2;
  }, [weaponLayout]);

  const y = useMotionValue(0);
  const squash = useMotionValue(1);
  const lean = useMotionValue(0);
  const weaponTiltL = useMotionValue(0);
  const weaponTiltR = useMotionValue(0);
  const weaponTiltLStr = useTransform(weaponTiltL, (t) => `${t}deg`);
  const weaponTiltRStr = useTransform(weaponTiltR, (t) => `${t}deg`);
  const rotateDeg = useTransform(lean, (l) => `${l * 52}deg`);
  const attackControls = useAnimation();
  const weaponLeftControls = useAnimation();
  const weaponRightControls = useAnimation();

  const pyRef = useRef(0);
  const vyRef = useRef(0);
  const groundedRef = useRef(true);
  const prevJumpActiveRef = useRef(false);
  const rafRef = useRef(0);
  const jumpPressIdRef = useRef(jumpPressId);
  const lastProcessedPressIdRef = useRef(0);
  jumpPressIdRef.current = jumpPressId;

  useEffect(() => {
    let lastT = performance.now();

    const step = (now) => {
      const dt = Math.min(0.05, Math.max(0, (now - lastT) / 1000));
      lastT = now;

      const pid = jumpPressIdRef.current;
      if (pid !== lastProcessedPressIdRef.current) {
        lastProcessedPressIdRef.current = pid;
        if (groundedRef.current) {
          vyRef.current = JUMP_V0;
          pyRef.current = 0;
          groundedRef.current = false;
          animate(squash, [1, 0.86, 1.05, 1], {
            duration: 0.15,
            times: [0, 0.18, 0.5, 1],
            ease: [0.22, 1, 0.36, 1],
          });
        }
      }

      if (groundedRef.current) {
        y.set(0);
        lean.set(0);
        weaponTiltL.set(0);
        weaponTiltR.set(0);
        rafRef.current = requestAnimationFrame(step);
        return;
      }

      let py = pyRef.current;
      let vy = vyRef.current;

      const active = jumpActiveRef?.current ?? false;
      if (prevJumpActiveRef.current && !active && vy < 0) {
        vy *= JUMP_CUT;
      }
      prevJumpActiveRef.current = active;

      if (active && vy < 0) {
        const held = now - (jumpStartRef?.current ?? now);
        if (held < JUMP_HOLD_BOOST_MS) {
          vy -= JUMP_HOLD_BOOST_ACCEL * dt;
        }
      }

      const g = vy > 0 ? JUMP_GRAVITY_FALL : JUMP_GRAVITY_UP;
      vy += g * dt;
      vy = Math.max(JUMP_VY_MAX_UP, Math.min(JUMP_VY_MAX_DOWN, vy));
      py += vy * dt;

      if (py >= 0) {
        py = 0;
        vy = 0;
        groundedRef.current = true;
        prevJumpActiveRef.current = false;
        animate(squash, [1, 1.1, 1], { duration: 0.11, times: [0, 0.35, 1], ease: [0.34, 1.2, 0.64, 1] });
      }

      pyRef.current = py;
      vyRef.current = vy;
      y.set(py);
      lean.set(Math.max(-0.22, Math.min(0.28, vy * 0.0002)));

      const r = rigRef.current;
      const j = r.jumpVyToDeg;
      weaponTiltL.set(vy * j * r.jumpTiltL);
      weaponTiltR.set(vy * j * r.jumpTiltR);

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [jumpActiveRef, jumpStartRef, y, lean, squash, weaponTiltL, weaponTiltR]);

  useEffect(() => {
    if (attackTick === 0) return;
    // Light torso lunge — hands/weapons carry the main strike read.
    attackControls.start({
      x: [0, isBow ? 3 : 8, 0],
      rotateZ: [0, isBow ? -6 : -12, 0],
      scale: [1, isBow ? 1.02 : 1.05, 1],
      transition: { duration: 0.14, ease: [0.4, 0, 0.2, 1] },
    });
    if (isBow) {
      weaponLeftControls.start({
        rotate: [0, -10, 0],
        y: [0, -3, 0],
        scale: [1, 1.06, 1],
        transition: { duration: 0.15, ease: [0.4, 0, 0.2, 1] },
      });
      weaponRightControls.start({
        rotate: [0, 18, 0],
        x: [0, 5, 0],
        transition: { duration: 0.15, ease: [0.4, 0, 0.2, 1], delay: 0.02 },
      });
    } else {
      weaponLeftControls.start({
        rotate: [0, -48, 8, 0],
        x: [0, 12, 0],
        y: [0, -4, 0],
        transition: { duration: 0.16, times: [0, 0.32, 0.62, 1], ease: [0.4, 0, 0.2, 1] },
      });
      // Shield: short forward block (enemy is to the right), not a second slash arc.
      weaponRightControls.start({
        rotate: [0, -14, 4, 0],
        x: [0, 10, 0],
        y: [0, -1, 0],
        transition: { duration: 0.15, times: [0, 0.35, 0.65, 1], ease: [0.4, 0, 0.2, 1], delay: 0.03 },
      });
    }
  }, [attackTick, isBow, attackControls, weaponLeftControls, weaponRightControls]);

  return (
    <div
      className="absolute z-[28]"
      style={{
        left: `${PLAYER_ANCHOR_LEFT_PCT}%`,
        top: `calc(100% - ${ROAD_CENTER_FROM_BOTTOM_PCT}%)`,
        transform: "translateY(-50%)",
      }}
    >
      <div
        className="absolute bottom-full z-10 mb-2 w-20 -translate-x-1/2"
        style={{ left: `calc(50% + ${characterCenterOffsetPx}px)` }}
      >
        <div className="h-1.5 bg-muted rounded-full overflow-hidden border border-border/50">
          <motion.div
            className="h-full bg-green-500"
            animate={{ width: `${(playerHP / playerMaxHP) * 100}%` }}
            transition={{ duration: 0.15 }}
          />
        </div>
      </div>
      <motion.div className="drop-shadow-lg" style={{ y }}>
        <motion.div className="origin-bottom" style={{ scaleY: squash, rotate: rotateDeg }}>
          <motion.div
            className="origin-bottom"
            animate={attackControls}
            initial={{ x: 0, rotateZ: 0, scale: 1 }}
          >
            <motion.div
              animate={{
                scale: enemyHit ? 1.06 : 1,
                filter: playerHit ? "brightness(2)" : "brightness(1)",
              }}
              transition={{ duration: 0.12 }}
            >
              {/*
                Stretch side columns to the hero’s height, then justify-end so weapon bottoms match the emoji feet.
                🛡️ fonts often pad asymmetrically — nudge toward the body so it reads attached.
              */}
              <div
                className="relative inline-flex animate-player-gait-row items-end justify-center gap-0"
                style={{
                  minWidth: Math.max(weaponLayout.rowMinWidth, weaponLayout.slotW + 32),
                  "--player-run-dur": `${rig.runDuration}s`,
                  "--weapon-sway-delay-l": `${rig.swayDelayL}s`,
                  "--weapon-sway-delay-r": `${rig.swayDelayR}s`,
                  "--char-art-w": `${weaponLayout.artW}px`,
                  "--char-art-h": `${weaponLayout.artH}px`,
                }}
              >
                <motion.div
                  className="relative z-[30] origin-bottom"
                  style={{ rotate: weaponTiltLStr }}
                >
                  <div
                    className="animate-weapon-sway-l pointer-events-none flex shrink-0 flex-col justify-end items-end pb-0 pr-0 pt-0 sm:pb-px md:pb-0.5"
                    style={{ width: weaponLayout.leftColW }}
                    aria-hidden
                  >
                  <motion.span
                    className={`block origin-bottom-right ${WEAPON_EMOJI_TYPO_NORMAL}`}
                    animate={weaponLeftControls}
                    initial={{ rotate: 0, x: 0, y: 0, scale: 1 }}
                  >
                    {isBow ? (
                      "🏹"
                    ) : (
                      <span
                        className="inline-block origin-bottom-right [line-height:1]"
                        style={{ transform: `rotate(${rig.swordEmojiRotateDeg}deg)` }}
                        aria-hidden
                      >
                        🗡️
                      </span>
                    )}
                  </motion.span>
                  </div>
                </motion.div>

                {/*
                  Fixed-size hitbox wrapper matches the character slot (canvas / emoji) so RAF
                  combat width isn’t shrunk by flex or intrinsic sprite metrics.
                */}
                <div
                  ref={setPlayerHitboxNode}
                  className="relative z-0 box-border flex h-16 w-16 shrink-0 flex-col justify-end items-center sm:h-20 sm:w-20 md:h-24 md:w-24"
                >
                  <PlayerRenderer
                    spriteUrl={isBow ? gameSettings.player_bow : gameSettings.player_sword}
                    fallbackEmoji={isBow ? "🧝" : "🤴"}
                    className="h-full w-full max-h-full max-w-full object-contain"
                    emojiClassName={CHARACTER_EMOJI_NORMAL}
                    onCharacterBoundsChange={onCharacterBoundsChange}
                    combatGlyphRef={combatGlyphRef}
                  />
                </div>

                <motion.div
                  className="relative z-[30] origin-bottom"
                  style={{ rotate: weaponTiltRStr }}
                >
                  <div
                    className="animate-weapon-sway-r pointer-events-none flex shrink-0 flex-col justify-end items-start overflow-visible pb-0 pl-0 pt-0 sm:pb-px md:pb-0.5"
                    style={{
                      width: weaponLayout.rightColW,
                      marginLeft: weaponLayout.rightMarginLeft,
                    }}
                    aria-hidden
                  >
                  <motion.span
                    className={`block origin-bottom-left ${WEAPON_EMOJI_TYPO_NORMAL}`}
                    animate={weaponRightControls}
                    initial={{ rotate: 0, x: 0, y: 0, scale: 1 }}
                  >
                    {isBow ? (
                      "🎯"
                    ) : (
                      <span
                        className="inline-block [transform:translateX(calc(var(--sh-out)-var(--sh-x)))] sm:[transform:translateX(calc(var(--sh-out-sm)-var(--sh-x-sm)))] md:[transform:translateX(calc(var(--sh-out-md)-var(--sh-x-md)))]"
                        style={{
                          "--sh-out": weaponLayout.shieldOutwardRem,
                          "--sh-out-sm": weaponLayout.shieldOutwardRemSm,
                          "--sh-out-md": weaponLayout.shieldOutwardRemMd,
                          "--sh-x": weaponLayout.shieldTranslateRem,
                          "--sh-x-sm": weaponLayout.shieldTranslateRemSm,
                          "--sh-x-md": weaponLayout.shieldTranslateRemMd,
                        }}
                        aria-hidden
                      >
                        🛡️
                      </span>
                    )}
                  </motion.span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
      <div
        className="absolute -bottom-6 w-20 -translate-x-1/2 h-1 bg-black/30 rounded-full blur-sm"
        style={{ left: `calc(50% + ${characterCenterOffsetPx}px)` }}
      />
    </div>
  );
}

export default React.memo(PlayerDisplay);
