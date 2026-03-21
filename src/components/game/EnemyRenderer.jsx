import React, { useRef, useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { getEnemySprite } from "@/lib/gameSettings";
import {
  ENEMY_EMOJIS,
  enemyHasWeapons,
  getEnemyFacePlayerRotationDeg,
  getEnemyIdleAnimClass,
  ZOMBIE_EMOJI_VARIANTS,
  VAMPIRE_EMOJI_VARIANTS,
} from "@/lib/gameData";
import { PLAYER_ANCHOR_LEFT_PCT } from "@/lib/combatHitboxes";

function assignRef(ref, node) {
  if (ref == null) return;
  if (typeof ref === "function") ref(node);
  else ref.current = node;
}
import {
  CHARACTER_EMOJI_BOSS,
  CHARACTER_EMOJI_NORMAL,
  WEAPON_EMOJI_TYPO_BOSS,
  WEAPON_EMOJI_TYPO_NORMAL,
} from "@/lib/characterEmojiStyles";

function emojiFromInstance(instanceId, variants) {
  if (!instanceId || typeof instanceId !== "string") return variants[0];
  let h = 0;
  for (let i = 0; i < instanceId.length; i++) {
    h = (h * 31 + instanceId.charCodeAt(i)) | 0;
  }
  return variants[Math.abs(h) % variants.length];
}

function baseEmojiForEnemy(enemyName, instanceId) {
  if (enemyName === "Zombie") return emojiFromInstance(instanceId, ZOMBIE_EMOJI_VARIANTS);
  if (enemyName === "Vampire") return emojiFromInstance(instanceId, VAMPIRE_EMOJI_VARIANTS);
  return ENEMY_EMOJIS[enemyName] ?? "👾";
}

/** Flex weapon columns: bottoms aligned to character emoji via items-end; gap-0 keeps blades/shield flush to sides. */
const WEAPON_TEXT = `block ${WEAPON_EMOJI_TYPO_NORMAL}`;
const WEAPON_TEXT_BOSS = `block ${WEAPON_EMOJI_TYPO_BOSS}`;

const RIG_WRAP =
  "inline-flex min-h-[4rem] min-w-[5.25rem] items-stretch justify-center gap-0 sm:min-h-[5rem] sm:min-w-[6.75rem] md:min-h-[6rem] md:min-w-[8.25rem]";
const RIG_WRAP_BOSS =
  "inline-flex min-h-[5rem] min-w-[7rem] items-stretch justify-center gap-0 sm:min-h-[6rem] sm:min-w-[9rem] md:min-h-[7rem] md:min-w-[10.5rem]";
/** Bottom padding lifts sword/shield toward “hand” height — emoji art often sits high in the cell. */
const WEAPON_COL_LEFT =
  "animate-weapon-sway-enemy-l pointer-events-none z-[15] flex w-[2rem] max-w-[2.75rem] shrink-0 flex-col justify-end items-end pb-4 pr-0 pt-0 sm:w-[2.35rem] sm:pb-5 md:w-[2.65rem] md:pb-6";
const WEAPON_COL_LEFT_BOSS =
  "animate-weapon-sway-enemy-l pointer-events-none z-[15] flex w-[2.35rem] max-w-[3.25rem] shrink-0 flex-col justify-end items-end pb-5 pr-0 pt-0 sm:w-[2.75rem] sm:pb-6 md:w-[3rem] md:pb-7";
const WEAPON_COL_RIGHT =
  "animate-weapon-sway-enemy-r pointer-events-none z-[15] -ml-[0.62rem] flex w-[1.35rem] max-w-[1.75rem] shrink-0 flex-col justify-end items-start overflow-visible pb-4 pl-0 pt-0 sm:-ml-[0.72rem] sm:w-[1.45rem] sm:pb-5 md:-ml-[0.82rem] md:w-[1.5rem] md:pb-6";
const WEAPON_COL_RIGHT_BOSS =
  "animate-weapon-sway-enemy-r pointer-events-none z-[15] -ml-[0.72rem] flex w-[1.45rem] max-w-[1.9rem] shrink-0 flex-col justify-end items-start overflow-visible pb-5 pl-0 pt-0 sm:-ml-[0.82rem] sm:w-[1.55rem] sm:pb-6 md:-ml-[0.92rem] md:w-[1.65rem] md:pb-7";
const UNARMED_WRAP =
  "relative inline-flex min-h-[4rem] items-end justify-center sm:min-h-[5rem] md:min-h-[6rem]";
const UNARMED_WRAP_BOSS =
  "relative inline-flex min-h-[5rem] items-end justify-center sm:min-h-[6rem] md:min-h-[7rem]";

function HitboxWithIdle({
  enemyHitboxRef,
  isBoss,
  idleAnimClass,
  facePlayerRotationDeg,
  flexCol,
  children,
}) {
  const size = isBoss ? "h-24 w-24" : "h-16 w-16";
  const base = flexCol
    ? `relative z-10 box-border flex shrink-0 flex-col justify-end items-center ${size}`
    : `relative z-10 box-border flex shrink-0 items-end justify-center ${size}`;
  const inner = (
    <div className={`flex h-full w-full items-end justify-center ${idleAnimClass}`}>{children}</div>
  );
  return (
    <div ref={enemyHitboxRef} className={base}>
      {facePlayerRotationDeg != null ? (
        <div
          className="flex h-full w-full items-end justify-center"
          style={{
            transform: `rotate(${facePlayerRotationDeg}deg)`,
            transformOrigin: "bottom center",
          }}
        >
          {inner}
        </div>
      ) : (
        inner
      )}
    </div>
  );
}

function EnemyWeaponRig({
  enemyHit,
  enemyDying,
  playerHit,
  enemyHitboxRef,
  isBoss = false,
  showWeapons = true,
  idleAnimClass = "animate-enemy-idle-march",
  facePlayerRotationDeg = null,
  children,
}) {
  const attackControls = useAnimation();
  const weaponLeftControls = useAnimation();
  const weaponRightControls = useAnimation();

  useEffect(() => {
    if (!playerHit) return;
    // Mirrored from PlayerDisplay melee: lunge toward player (left), sword/shield swing.
    attackControls.start({
      x: [0, -8, 0],
      rotateZ: [0, 12, 0],
      scale: [1, 1.05, 1],
      transition: { duration: 0.14, ease: [0.4, 0, 0.2, 1] },
    });
    weaponLeftControls.start({
      rotate: [0, 48, -8, 0],
      x: [0, -12, 0],
      y: [0, -4, 0],
      transition: { duration: 0.16, times: [0, 0.32, 0.62, 1], ease: [0.4, 0, 0.2, 1] },
    });
    weaponRightControls.start({
      rotate: [0, 14, -4, 0],
      x: [0, -10, 0],
      y: [0, -1, 0],
      transition: { duration: 0.15, times: [0, 0.35, 0.65, 1], ease: [0.4, 0, 0.2, 1], delay: 0.03 },
    });
  }, [playerHit, attackControls, weaponLeftControls, weaponRightControls]);

  const idle = enemyDying ? "" : idleAnimClass;
  const faceDeg = enemyDying ? null : facePlayerRotationDeg;
  const wt = isBoss ? WEAPON_TEXT_BOSS : WEAPON_TEXT;

  if (!showWeapons) {
    const wrap = isBoss ? UNARMED_WRAP_BOSS : UNARMED_WRAP;
    return (
      <motion.div
        className="flex flex-col items-center justify-end origin-bottom"
        animate={{ filter: enemyHit ? "brightness(1.8)" : "brightness(1)" }}
        transition={{ duration: 0.1 }}
      >
        <motion.div
          className="origin-bottom"
          animate={attackControls}
          initial={{ x: 0, rotateZ: 0, scale: 1 }}
        >
          <div className={enemyDying ? "animate-enemy-die inline-block origin-bottom" : undefined}>
            <div className={wrap}>
              <HitboxWithIdle
                enemyHitboxRef={enemyHitboxRef}
                isBoss={isBoss}
                idleAnimClass={idle}
                facePlayerRotationDeg={faceDeg}
                flexCol={false}
              >
                {children}
              </HitboxWithIdle>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="flex flex-col items-center justify-end origin-bottom"
      animate={{ filter: enemyHit ? "brightness(1.8)" : "brightness(1)" }}
      transition={{ duration: 0.1 }}
    >
      <motion.div
        className="origin-bottom"
        animate={attackControls}
        initial={{ x: 0, rotateZ: 0, scale: 1 }}
      >
        <div className={enemyDying ? "animate-enemy-die inline-block origin-bottom" : undefined}>
          <div className={isBoss ? RIG_WRAP_BOSS : RIG_WRAP}>
            <div className={isBoss ? WEAPON_COL_LEFT_BOSS : WEAPON_COL_LEFT} aria-hidden>
              <motion.span
                className={`${wt} origin-bottom-right`}
                animate={weaponLeftControls}
                initial={{ rotate: 0, x: 0, y: 0, scale: 1 }}
              >
                <span
                  className="inline-block origin-bottom-right [transform:rotate(90deg)] [line-height:1]"
                  aria-hidden
                >
                  🗡️
                </span>
              </motion.span>
            </div>

            <HitboxWithIdle
              enemyHitboxRef={enemyHitboxRef}
              isBoss={isBoss}
              idleAnimClass={idle}
              facePlayerRotationDeg={faceDeg}
              flexCol
            >
              {children}
            </HitboxWithIdle>

            <div className={isBoss ? WEAPON_COL_RIGHT_BOSS : WEAPON_COL_RIGHT} aria-hidden>
              <motion.span
                className={`${wt} origin-bottom-left`}
                animate={weaponRightControls}
                initial={{ rotate: 0, x: 0, y: 0, scale: 1 }}
              >
                <span
                  className="inline-block -translate-x-[0.82rem] sm:-translate-x-[0.96rem] md:-translate-x-[1.1rem]"
                  aria-hidden
                >
                  🛡️
                </span>
              </motion.span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function EnemyRenderer({
  enemyName,
  enemyHit,
  enemyDying,
  isBoss,
  bossId,
  bossIcon,
  enemyHitboxRef,
  enemyCombatGlyphRef,
  playerHit = false,
  instanceId,
  enemyScreenLeftPct,
  playerScreenLeftPct = PLAYER_ANCHOR_LEFT_PCT,
}) {
  const showWeapons = enemyHasWeapons(enemyName);
  const idleAnimClass = enemyDying ? "" : getEnemyIdleAnimClass(enemyName);
  const facePlayerRotationDeg = enemyDying
    ? null
    : getEnemyFacePlayerRotationDeg(enemyName, enemyScreenLeftPct, playerScreenLeftPct);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [animationData, setAnimationData] = useState(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [emoji, setEmoji] = useState("👾");

  useEffect(() => {
    let cancelled = false;

    const loadSprite = async () => {
      if (isBoss && bossId) {
        const { getBossSprite } = await import("@/lib/gameSettings");
        const bossSprite = await getBossSprite(bossId);
        if (cancelled) return;
        if (bossSprite) {
          setAnimationData(bossSprite.animationData);
          imgRef.current = new Image();
          imgRef.current.src = bossSprite.spriteUrl;
          return;
        }
      }

      const enemyType = enemyName?.toLowerCase().replace(/\s+/g, "_") || "default";
      const sprite = await getEnemySprite(enemyType);
      if (cancelled) return;

      if (sprite) {
        setAnimationData(sprite.animationData);
        imgRef.current = new Image();
        imgRef.current.src = sprite.spriteUrl;
      } else {
        setAnimationData(null);
        const { getSetting } = await import("@/lib/gameSettings");
        const defaultEmoji = baseEmojiForEnemy(enemyName, instanceId);
        const customEmoji = getSetting(`enemy_${enemyType}_emoji`, defaultEmoji);
        setEmoji(isBoss && bossIcon ? bossIcon : customEmoji);
      }
    };

    loadSprite().catch(() => {
      setAnimationData(null);
      const fallback = baseEmojiForEnemy(enemyName, instanceId);
      setEmoji(isBoss && bossIcon ? bossIcon : fallback);
    });
    return () => {
      cancelled = true;
    };
  }, [enemyName, isBoss, bossId, bossIcon, instanceId]);

  useEffect(() => {
    if (!animationData) return;

    const frames = animationData.frames;
    const frameCount = Array.isArray(frames) ? frames.length : Object.keys(frames).length;
    if (!frameCount) return;

    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frameCount);
    }, animationData.meta?.frameTags?.[0]?.duration || 100);

    return () => clearInterval(interval);
  }, [animationData]);

  useEffect(() => {
    if (!canvasRef.current || !animationData || !imgRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const frames = animationData.frames;
    const frameKeys = Array.isArray(frames) ? Object.keys(frames) : Object.keys(frames);
    const frameKey = frameKeys[currentFrame % frameKeys.length];
    const frame = frames[frameKey];

    if (!frame) return;

    canvas.width = isBoss ? 96 : 64;
    canvas.height = isBoss ? 96 : 64;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const draw = () => {
      const scale = Math.min(canvas.width / frame.frame.w, canvas.height / frame.frame.h);
      const scaledW = frame.frame.w * scale;
      const scaledH = frame.frame.h * scale;
      const offsetX = (canvas.width - scaledW) / 2;
      const offsetY = (canvas.height - scaledH) / 2;

      ctx.imageSmoothingEnabled = false;
      ctx.save();
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(
        imgRef.current,
        frame.frame.x,
        frame.frame.y,
        frame.frame.w,
        frame.frame.h,
        offsetX,
        offsetY,
        scaledW,
        scaledH
      );
      ctx.restore();
    };

    if (imgRef.current.complete) draw();
    else imgRef.current.onload = draw;
  }, [animationData, currentFrame, isBoss]);

  if (animationData) {
    return (
      <EnemyWeaponRig
        enemyHit={enemyHit}
        enemyDying={enemyDying}
        playerHit={playerHit}
        enemyHitboxRef={enemyHitboxRef}
        isBoss={isBoss}
        showWeapons={showWeapons}
        idleAnimClass={idleAnimClass}
        facePlayerRotationDeg={facePlayerRotationDeg}
      >
        <canvas
          ref={(node) => {
            canvasRef.current = node;
            assignRef(enemyCombatGlyphRef, node);
          }}
          className="h-full w-full max-h-full max-w-full object-contain"
          style={{ imageRendering: "pixelated" }}
        />
      </EnemyWeaponRig>
    );
  }

  return (
    <EnemyWeaponRig
      enemyHit={enemyHit}
      enemyDying={enemyDying}
      playerHit={playerHit}
      enemyHitboxRef={enemyHitboxRef}
      isBoss={isBoss}
      showWeapons={showWeapons}
      idleAnimClass={idleAnimClass}
      facePlayerRotationDeg={facePlayerRotationDeg}
    >
      <span
        ref={enemyCombatGlyphRef}
        className={isBoss ? CHARACTER_EMOJI_BOSS : CHARACTER_EMOJI_NORMAL}
      >
        {emoji}
      </span>
    </EnemyWeaponRig>
  );
}
