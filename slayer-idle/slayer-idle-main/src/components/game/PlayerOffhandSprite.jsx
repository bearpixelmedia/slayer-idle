import React, { useMemo } from "react";
import { loadGameSettings } from "@/lib/gameSettings";

/**
 * PlayerOffhandSprite
 *
 * Renders the off-hand / right-column sprite, replacing the 🛡️/🎯 emoji.
 *
 * Shield cells in the pack:
 *   bone r0c4  — large bone shield  (bone_r0_c4 / shield_bone_large)
 *   bone r1c4  — small bone shield  (bone_r1_c4 / shield_bone_small)
 *   wood r1c4  — wood round shield  (wood_r1_c4 / shield_wood)
 *
 * Off-hand resolution order:
 *   1. If player_shield_id is set (not "auto") → use that specific shield
 *   2. Auto: bow → small bone shield; sword + bone weapon → large bone shield;
 *            sword + wood weapon → wood shield; no weapon → second fist
 *
 * Props:
 *   weaponMode  "sword" | "bow"
 *   scale       pixel scale (default 3)
 *   skinRow     0/1/2 (only used for fists fallback)
 */

const BONE_SHEET = { sheet: "/sprites/weapons/bone.png", sheetW: 224, sheetH: 144, cellSize: 32 };
const WOOD_SHEET = { sheet: "/sprites/weapons/wood.png", sheetW: 192, sheetH: 112, cellSize: 32 };

const SHIELD_BONE_LARGE = { ...BONE_SHEET, cellX: 4, cellY: 0 }; // bone r0c4
const SHIELD_BONE_SMALL = { ...BONE_SHEET, cellX: 4, cellY: 1 }; // bone r1c4
const SHIELD_WOOD       = { ...WOOD_SHEET, cellX: 4, cellY: 1 }; // wood r1c4

// Manual shield picker IDs → shield def
const SHIELD_BY_ID = {
  shield_bone_large: SHIELD_BONE_LARGE,
  shield_bone_small: SHIELD_BONE_SMALL,
  shield_wood:       SHIELD_WOOD,
};

// Auto mapping: equipped weapon → shield
const AUTO_SHIELD = {
  none:       null,              // fists → Hands.png
  bone_r0_c0: SHIELD_BONE_LARGE,
  bone_r0_c4: SHIELD_BONE_LARGE,
  bone_r1_c0: SHIELD_BONE_SMALL,
  wood_r0_c0: SHIELD_WOOD,
  wood_r0_c4: SHIELD_WOOD,
  wood_r1_c0: SHIELD_WOOD,
};

function SheetIcon({ ws, size }) {
  const scale = size / ws.cellSize;
  return (
    <div
      aria-hidden
      style={{
        width: size,
        height: size,
        backgroundImage: `url(${ws.sheet})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: `${ws.sheetW * scale}px ${ws.sheetH * scale}px`,
        backgroundPosition: `-${ws.cellX * size}px -${ws.cellY * size}px`,
        imageRendering: "pixelated",
        opacity: 0.9,
      }}
    />
  );
}

export default function PlayerOffhandSprite({ weaponMode = "sword", scale = 3, skinRow = 0 }) {
  const settings = useMemo(() => loadGameSettings(), []);
  const weaponId  = settings?.player_weapon_id ?? "none";
  const shieldId  = settings?.player_shield_id ?? "auto";

  const size = 32 * scale;

  // ── Resolve shield definition ─────────────────────────────────────────────
  let shield = null;

  if (shieldId !== "auto") {
    // Manual pick
    shield = SHIELD_BY_ID[shieldId] ?? null;
  } else if (weaponMode === "bow") {
    // Bow auto → small bone shield as a parry/guard
    shield = SHIELD_BONE_SMALL;
  } else {
    // Sword auto → match weapon family
    shield = AUTO_SHIELD[weaponId] ?? SHIELD_BONE_LARGE;
  }

  // ── No weapon + auto → show second fist ──────────────────────────────────
  if (!shield && weaponId === "none" && shieldId === "auto") {
    return (
      <div
        aria-hidden
        style={{
          width: size,
          height: size,
          backgroundImage: `url(/sprites/weapons/hands.png)`,
          backgroundRepeat: "no-repeat",
          backgroundSize: `${size}px ${size * 3}px`,
          backgroundPosition: `0px -${skinRow * size}px`,
          imageRendering: "pixelated",
          opacity: 0.8,
        }}
      />
    );
  }

  if (!shield) return null;

  return <SheetIcon ws={shield} size={size} />;
}
