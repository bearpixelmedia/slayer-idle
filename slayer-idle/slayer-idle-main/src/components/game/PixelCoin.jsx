import React from "react";

/**
 * Small pixel-art coin sprite rendered from the village bonfire/environment pack.
 * Falls back to a styled CSS circle if no coin sprite is available in the pack.
 * size: px size of the rendered coin (default 12)
 */
export function PixelCoin({ size = 12, className = "" }) {
  // Pixel Crawler free pack doesn't include a dedicated coin sprite,
  // so we render a clean CSS pixel coin that matches the art style.
  return (
    <span
      className={`inline-block rounded-full shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        background: "radial-gradient(circle at 35% 35%, #ffe066, #f5a623 60%, #c47a00)",
        boxShadow: `0 0 0 1px #a86000, inset 0 1px 0 rgba(255,255,180,0.4)`,
        imageRendering: "pixelated",
      }}
      aria-hidden
    />
  );
}

/**
 * Small pixel-art soul orb (purple glow)
 */
export function PixelSoul({ size = 12, className = "" }) {
  return (
    <span
      className={`inline-block rounded-full shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        background: "radial-gradient(circle at 35% 35%, #d8aaff, #7c3aed 60%, #3b0764)",
        boxShadow: `0 0 0 1px #4c1d95, inset 0 1px 0 rgba(220,180,255,0.4)`,
        imageRendering: "pixelated",
      }}
      aria-hidden
    />
  );
}
