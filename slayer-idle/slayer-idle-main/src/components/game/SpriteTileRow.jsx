import React from "react";

/**
 * Tiles a sprite image horizontally across a container.
 * Used by ParallaxBackground/ParallaxShrubOverlay when a custom sprite URL is provided.
 * Falls back gracefully if no spriteUrl is given.
 */
export default function SpriteTileRow({ spriteUrl, tileWidth = 200, count = 10, height = "100%" }) {
  if (!spriteUrl) return null;
  return (
    <div style={{ display: "flex", width: "100%", height, overflow: "hidden" }}>
      {Array.from({ length: count }).map((_, i) => (
        <img
          key={i}
          src={spriteUrl}
          alt=""
          draggable={false}
          style={{
            width: tileWidth,
            minWidth: tileWidth,
            height: "100%",
            objectFit: "fill",
            display: "block",
          }}
        />
      ))}
    </div>
  );
}
