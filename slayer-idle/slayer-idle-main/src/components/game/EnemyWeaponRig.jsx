import React, { useEffect, useMemo } from "react";
import { motion, useAnimation } from "framer-motion";
import {
  combatTriRowMinStyle,
  computeEnemyWeaponLayout,
  weaponHandPadFromLayout,
} from "@/lib/weaponTriColumnLayout";
import {
  COMBAT_HITBOX_BOSS_CLASS,
  COMBAT_HITBOX_BOSS_ROW_CLASS,
  COMBAT_HITBOX_SLOT_CLASS,
  COMBAT_HITBOX_SLOT_ROW_CLASS,
} from "@/lib/laneScene";
import { useCombatSlotNominalPx } from "@/hooks/useCombatSlotNominalPx";
import { WEAPON_EMOJI_TYPO_BOSS, WEAPON_EMOJI_TYPO_NORMAL } from "@/lib/characterEmojiStyles";

const WEAPON_TEXT_NORMAL = `block ${WEAPON_EMOJI_TYPO_NORMAL}`;
const WEAPON_TEXT_BOSS = `block ${WEAPON_EMOJI_TYPO_BOSS}`;

function HitboxWithIdle({
  enemyHitboxRef,
  isBoss,
  idleAnimClass,
  facePlayerRotationDeg,
  flexCol,
  feetVisualAlignPx = 0,
  children,
}) {
  const sizeClass = flexCol
    ? isBoss
      ? COMBAT_HITBOX_BOSS_CLASS
      : COMBAT_HITBOX_SLOT_CLASS
    : isBoss
      ? COMBAT_HITBOX_BOSS_ROW_CLASS
      : COMBAT_HITBOX_SLOT_ROW_CLASS;

  const idleMotion = (
    <div className={`flex h-full w-full items-end justify-center ${idleAnimClass}`}>{children}</div>
  );
  const feetShift =
    feetVisualAlignPx !== 0 ? (
      <div
        className="flex h-full w-full items-end justify-center origin-bottom"
        style={{ transform: `translateY(${feetVisualAlignPx}px)` }}
      >
        {idleMotion}
      </div>
    ) : (
      idleMotion
    );
  return (
    <div ref={enemyHitboxRef} className={sizeClass}>
      {facePlayerRotationDeg != null ? (
        <div
          className="flex h-full w-full items-end justify-center"
          style={{
            transform: `rotate(${facePlayerRotationDeg}deg)`,
            transformOrigin: "bottom center",
          }}
        >
          {feetShift}
        </div>
      ) : (
        feetShift
      )}
    </div>
  );
}

export function EnemyWeaponRig({
  enemyHit,
  enemyDying,
  playerHit,
  enemyHitboxRef,
  isBoss = false,
  showWeapons = true,
  idleAnimClass = "animate-enemy-idle-march",
  facePlayerRotationDeg = null,
  feetVisualAlignPx = 0,
  children,
}) {
  const slotPx = useCombatSlotNominalPx();
  const layout = useMemo(() => computeEnemyWeaponLayout(isBoss, isBoss ? null : slotPx), [isBoss, slotPx]);
  const handPad = weaponHandPadFromLayout(layout);

  const attackControls = useAnimation();
  const weaponLeftControls = useAnimation();
  const weaponRightControls = useAnimation();

  useEffect(() => {
    if (!playerHit) return;
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
  const wt = isBoss ? WEAPON_TEXT_BOSS : WEAPON_TEXT_NORMAL;

  const rowStyle = combatTriRowMinStyle(layout, { gaitPadding: false });

  if (!showWeapons) {
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
            <div
              className="relative inline-flex items-end justify-center"
              style={{ minHeight: layout.slotH }}
            >
              <HitboxWithIdle
                enemyHitboxRef={enemyHitboxRef}
                isBoss={isBoss}
                idleAnimClass={idle}
                facePlayerRotationDeg={faceDeg}
                flexCol={false}
                feetVisualAlignPx={feetVisualAlignPx}
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
          <div
            className="inline-flex items-stretch justify-center gap-0"
            style={rowStyle}
          >
            <div
              className="animate-weapon-sway-enemy-l pointer-events-none z-[15] flex shrink-0 flex-col justify-end items-end pr-0 pt-0"
              style={{ width: layout.leftColW, paddingBottom: handPad }}
              aria-hidden
            >
              <motion.span
                className={`${wt} origin-bottom-right`}
                animate={weaponLeftControls}
                initial={{ rotate: 0, x: 0, y: 0, scale: 1 }}
              >
                <div
                  aria-hidden
                  style={{
                    width: 10,
                    height: 24,
                    backgroundImage: "url(/sprites/weapons/bone.png)",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "224px 144px",
                    backgroundPosition: "0px -4px",
                    imageRendering: "pixelated",
                    transform: "rotate(90deg)",
                    transformOrigin: "bottom right",
                  }}
                />
              </motion.span>
            </div>

            <HitboxWithIdle
              enemyHitboxRef={enemyHitboxRef}
              isBoss={isBoss}
              idleAnimClass={idle}
              facePlayerRotationDeg={faceDeg}
              flexCol
              feetVisualAlignPx={feetVisualAlignPx}
            >
              {children}
            </HitboxWithIdle>

            <div
              className="animate-weapon-sway-enemy-r pointer-events-none z-[15] flex shrink-0 flex-col justify-end items-start overflow-visible pl-0 pt-0"
              style={{
                width: layout.rightColW,
                marginLeft: layout.rightMarginLeft,
                paddingBottom: handPad,
              }}
              aria-hidden
            >
              <motion.span
                className={`${wt} origin-bottom-left`}
                animate={weaponRightControls}
                initial={{ rotate: 0, x: 0, y: 0, scale: 1 }}
              >
                <div
                  aria-hidden
                  style={{
                    width: 32,
                    height: 40,
                    backgroundImage: "url(/sprites/weapons/bone.png)",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "224px 144px",
                    backgroundPosition: "-112px 0px",
                    imageRendering: "pixelated",
                    transform: `translateX(calc(${layout.shieldOutwardRem} - ${layout.shieldTranslateRem}))`,
                  }}
                />
              </motion.span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
