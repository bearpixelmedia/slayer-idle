import React, { useMemo } from "react";
import { loadGameSettings } from "@/lib/gameSettings";

/**
 * PlayerOffhandSprite
 *
 * Renders a static weapon/off-hand icon in the right weapon column,
 * replacing the 🛡️/🎯 emoji.
 *
 * The icon is picked based on the equipped weapon:
 *   - "none"        → second hand (skin-toned fist from Hands.png row)
 *   - bone weapons  → a complementary bone cell (parry / off-hand)
 *   - wood weapons  → a complementary wood cell
 *
 * For bow mode, the right column shows an arrow indicator cell
 * instead of the usual off-hand weapon.
 *
 * Props:
 *   weaponMode  {string}  "sword" | "bow"
 *   scale       {number}  pixel scale (default 3)
 *   skinRow     {number}  0/1/2 — only used for "none" (fist icon)
 */

// ── Off-hand cell definitions ─────────────────────────────────────────────────
// Each weapon option from the settings picker maps to a secondary cell from
// the same sheet, used as the off-hand icon.
//
// Bone sheet (224×144, 7×4 cells @ 32px):
//   r0c0=dagger  r0c1=bone-sword  r0c2=club  r0c3=axe  r0c4=big-axe
//   r1c0=double  r1c1=spear       r1c2=shard r1c3=tip  r1c4=fragment
//
// Wood sheet (192×112, 6×3 cells @ 32px):
//   r0c0=club    r0c1=sword       r0c2=dagger r0c3=staff r0c4=big-staff
//   r1c0=round   r1c1=spear       r1c2=small
//
// Off-hand picks the "other" cell: e.g. if main is r0c0 (dagger), off-hand is r0c1 (bone-sword)
const OFFHAND_MAP = {
  // Fists — use second hand from Hands.png (rendered separately, see below)
  none: null,

  // ── Bone family ──────────────────────────────────────────────────────────
  bone_r0_c0: { sheet: "/sprites/weapons/bone.png", sheetW: 224, sheetH: 144, cellX: 1, cellY: 0, cellSize: 32 }, // bone-sword
  bone_r0_c4: { sheet: "/sprites/weapons/bone.png", sheetW: 224, sheetH: 144, cellX: 3, cellY: 0, cellSize: 32 }, // axe off-hand
  bone_r1_c0: { sheet: "/sprites/weapons/bone.png", sheetW: 224, sheetH: 144, cellX: 0, cellY: 0, cellSize: 32 }, // dagger
  // ── Wood family ──────────────────────────────────────────────────────────
  wood_r0_c0: { sheet: "/sprites/weapons/wood.png", sheetW: 192, sheetH: 112, cellX: 1, cellY: 0, cellSize: 32 }, // wood-sword
  wood_r0_c4: { sheet: "/sprites/weapons/wood.png", sheetW: 192, sheetH: 112, cellX: 3, cellY: 0, cellSize: 32 }, // staff off
  wood_r1_c0: { sheet: "/sprites/weapons/wood.png", sheetW: 192, sheetH: 112, cellX: 0, cellY: 0, cellSize: 32 }, // club
};

// For bow mode right-column: show an arrow shard (bone_r1_c4) as quiver hint
const BOW_OFFHAND = {
  sheet: "/sprites/weapons/bone.png",
  sheetW: 224,
  sheetH: 144,
  cellX: 4,
  cellY: 1,
  cellSize: 32,
};

export default function PlayerOffhandSprite({ weaponMode = "sword", scale = 3, skinRow = 0 }) {
  const settings = useMemo(() => loadGameSettings(), []);
  const weaponId = settings?.player_weapon_id ?? "none";

  const CELL = 32;
  const handPx = CELL * scale;

  // ── Bow mode: always show arrow shard ─────────────────────────────────────
  if (weaponMode === "bow") {
    const ws = BOW_OFFHAND;
    const sheetW = ws.sheetW * scale;
    const sheetH = ws.sheetH * scale;
    return (
      <div
        aria-hidden
        style={{
          width: handPx,
          height: handPx,
          backgroundImage: `url(${ws.sheet})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: `${sheetW}px ${sheetH}px`,
          backgroundPosition: `-${ws.cellX * handPx}px -${ws.cellY * handPx}px`,
          imageRendering: "pixelated",
          opacity: 0.85,
        }}
      />
    );
  }

  // ── Sword mode: no weapon (fists) → second hand from Hands.png ────────────
  if (weaponId === "none") {
    return (
      <div
        aria-hidden
        style={{
          width: handPx,
          height: handPx,
          backgroundImage: `url(/sprites/weapons/hands.png)`,
          backgroundRepeat: "no-repeat",
          backgroundSize: `${handPx}px ${handPx * 3}px`,
          backgroundPosition: `0px -${skinRow * handPx}px`,
          imageRendering: "pixelated",
          opacity: 0.8,
        }}
      />
    );
  }

  // ── Sword mode: weapon equipped → off-hand cell ───────────────────────────
  const ws = OFFHAND_MAP[weaponId];
  if (!ws) return null;

  const sheetW = ws.sheetW * scale;
  const sheetH = ws.sheetH * scale;

  return (
    <div
      aria-hidden
      style={{
        width: handPx,
        height: handPx,
        backgroundImage: `url(${ws.sheet})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: `${sheetW}px ${sheetH}px`,
        backgroundPosition: `-${ws.cellX * handPx}px -${ws.cellY * handPx}px`,
        imageRendering: "pixelated",
        opacity: 0.9,
      }}
    />
  );
}
