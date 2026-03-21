/**
 * Derive weapon column sizes and offsets from measured character art + hitbox slot.
 * `art` = intrinsic glyph/sprite rect; `slot` = fixed combat wrapper (h-16 / sm:h-20 / md:h-24).
 */
export function computePlayerWeaponLayout(art, slot, rig) {
  const sw = slot.w > 8 ? slot.w : 64;
  const sh = slot.h > 8 ? slot.h : 64;
  const aw = art.w > 4 ? Math.min(art.w, sw) : sw * 0.82;
  const ah = art.h > 4 ? Math.min(art.h, sh) : sh * 0.82;

  const scale = aw / 56;

  const leftColW = Math.round(Math.min(Math.max(aw * 0.36 + 6, 26), 44));
  const rightColW = Math.round(Math.min(Math.max(aw * 0.3 + 6, 22), 38));
  /** Overlap the hitbox so the shield column sits on the body; cap avoids crossing the sword column. */
  const rightOverlap = Math.min(36, Math.max(16, Math.round(sw * 0.34)));
  /** Small rem nudge — emoji is narrower than the slot (object-contain), px overlap alone leaves a gap. */
  const shieldSlotBleedRem = 0.38;

  const rowMinWidth = Math.round(leftColW + sw + rightColW - rightOverlap);

  /** Rig pull → rem; ink term closes gap between 🛡️ glyph and visible character ink. */
  const shieldInkPullRem = 0.34;
  const shieldX = (base) =>
    `${(base * scale * 0.82 + shieldInkPullRem).toFixed(3)}rem`;

  /** Net translateX = outward − pull; keep outward ~0 so the shield actually meets the sprite. */
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
