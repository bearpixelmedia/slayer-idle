/**
 * Shared “body + left weapon + right weapon” row geometry from art + slot + rig.
 * Player measures art/slot at runtime; enemies use nominal slot sizes derived from hitbox classes.
 */
import { getPlayerWeaponRig } from "@/lib/playerWeaponRig";

export function computeTriColumnWeaponLayout(art, slot, rig) {
  const sw = slot.w > 8 ? slot.w : 64;
  const sh = slot.h > 8 ? slot.h : 64;
  const aw = art.w > 4 ? Math.min(art.w, sw) : sw * 0.82;
  const ah = art.h > 4 ? Math.min(art.h, sh) : sh * 0.82;

  const scale = aw / 56;

  const leftColW = Math.round(Math.min(Math.max(aw * 0.36 + 6, 26), 44));
  const rightColW = Math.round(Math.min(Math.max(aw * 0.3 + 6, 22), 38));
  const rightOverlap = Math.min(36, Math.max(16, Math.round(sw * 0.34)));
  const shieldSlotBleedRem = 0.38;

  const rowMinWidth = Math.round(leftColW + sw + rightColW - rightOverlap);

  const shieldInkPullRem = 0.34;
  const shieldX = (base) =>
    `${(base * scale * 0.82 + shieldInkPullRem).toFixed(3)}rem`;

  const shieldOutwardRem = "0rem";
  const shieldOutwardRemSm = "0rem";
  const shieldOutwardRemMd = "0rem";

  const rightMarginLeft = `calc(${-rightOverlap}px - ${shieldSlotBleedRem}rem)`;

  return {
    leftColW,
    rightColW,
    rightMarginLeft,
    rowMinWidth,
    artW: aw,
    artH: ah,
    slotW: sw,
    slotH: sh,
    shieldTranslateRem: shieldX(rig.shieldTranslateRem),
    shieldTranslateRemSm: shieldX(rig.shieldTranslateRemSm),
    shieldTranslateRemMd: shieldX(rig.shieldTranslateRemMd),
    shieldOutwardRem,
    shieldOutwardRemSm,
    shieldOutwardRemMd,
  };
}

/** @deprecated Use computeTriColumnWeaponLayout — kept for call sites. */
export function computePlayerWeaponLayout(art, slot, rig) {
  return computeTriColumnWeaponLayout(art, slot, rig);
}

/** Padding under weapon emojis so hands line up with slot bottom — shared by player + enemy rigs. */
export function weaponHandPadFromLayout(layout) {
  return Math.max(6, Math.round(layout.slotH * 0.11));
}

/**
 * Min size for the outer sword–body–shield flex row (player adds gait padding for run sway).
 */
export function combatTriRowMinStyle(layout, { gaitPadding = false } = {}) {
  const extra = gaitPadding ? 32 : 24;
  return {
    minWidth: Math.max(layout.rowMinWidth, layout.slotW + extra),
    minHeight: layout.slotH,
  };
}

/**
 * Horizontal offset (px) from the tri-row’s geometric center to the body column — same math as
 * hero HP bar / shadow; use for enemy nameplate + ground shadow.
 */
export function combatRowCharacterCenterOffsetPx(layout, { gaitPadding = false } = {}) {
  const extra = gaitPadding ? 32 : 24;
  const { leftColW, slotW, rowMinWidth } = layout;
  const rowWidthPx = Math.max(rowMinWidth, slotW + extra);
  const charCenter = leftColW + slotW / 2;
  return charCenter - rowWidthPx / 2;
}

/**
 * Non-boss: same slot px as player/combatSlotNominal (Tailwind breakpoints). Boss: fixed large slot.
 * Uses the same tri-column math + default melee rig as the hero.
 */
export function computeEnemyWeaponLayout(isBoss, slotPx) {
  const rig = getPlayerWeaponRig("sword", {});
  if (isBoss) {
    const slot = { w: 144, h: 144 };
    const art = { w: slot.w * 0.9, h: slot.h * 0.9 };
    return computeTriColumnWeaponLayout(art, slot, rig);
  }
  const sw = slotPx?.w > 0 ? slotPx.w : 64;
  const sh = slotPx?.h > 0 ? slotPx.h : 64;
  const slot = { w: sw, h: sh };
  const art = { w: slot.w * 0.88, h: slot.h * 0.88 };
  return computeTriColumnWeaponLayout(art, slot, rig);
}
