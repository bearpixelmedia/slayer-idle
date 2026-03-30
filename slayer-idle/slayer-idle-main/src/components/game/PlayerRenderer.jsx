import React, { useRef, useLayoutEffect, useCallback, forwardRef } from "react";
import PlayerSprite from "./PlayerSprite";

function assignRef(ref, node) {
  if (ref == null) return;
  if (typeof ref === "function") ref(node);
  else ref.current = node;
}

/**
 * PlayerRenderer
 *
 * Renders the player character using the sprite animation system.
 * Keeps the same external API as before so PlayerDisplay works unchanged.
 *
 * Props:
 *   weaponMode           — "sword" | "bow"
 *   isAttacking          — true for one tick when player attacks
 *   isHit                — true briefly when player takes damage
 *   isDead               — player death state
 *   fallbackEmoji        — (ignored, kept for API compat)
 *   className            — applied to wrapper div
 *   onCharacterBoundsChange — ResizeObserver callback for layout system
 *   combatGlyphRef       — ref attached to the visible glyph for hitbox math
 */
const PlayerRenderer = forwardRef(function PlayerRenderer(
  {
    weaponMode = "sword",
    isAttacking = false,
    isHit = false,
    isDead = false,
    fallbackEmoji,       // kept for API compat, unused
    className,
    emojiClassName,      // kept for API compat, unused
    onCharacterBoundsChange,
    combatGlyphRef,
  },
  ref
) {
  const wrapperRef = useRef(null);
  const onBoundsRef = useRef(onCharacterBoundsChange);
  onBoundsRef.current = onCharacterBoundsChange;

  const setWrapperNode = useCallback(
    (node) => {
      wrapperRef.current = node;
      assignRef(ref, node);
      assignRef(combatGlyphRef, node);
    },
    [ref, combatGlyphRef]
  );

  // Report bounds to PlayerDisplay's layout system
  useLayoutEffect(() => {
    const el = wrapperRef.current;
    if (!el || !onCharacterBoundsChange) return;

    const report = () => {
      const r = el.getBoundingClientRect();
      onBoundsRef.current?.({ width: r.width, height: r.height });
    };

    const ro = new ResizeObserver(report);
    ro.observe(el);
    report();

    return () => ro.disconnect();
  }, [onCharacterBoundsChange]);

  return (
    <div ref={setWrapperNode} className={className} style={{ display: "inline-flex", alignItems: "flex-end" }}>
      <PlayerSprite
        isDead={isDead}
        isAttacking={isAttacking}
        isHit={isHit}
        isRunning={!isDead}
        weaponMode={weaponMode}
        scale={3}
        flipX={false}
      />
    </div>
  );
});

PlayerRenderer.displayName = "PlayerRenderer";
export default PlayerRenderer;
