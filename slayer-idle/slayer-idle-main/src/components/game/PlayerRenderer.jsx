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
 * Scale rationale:
 *   Enemy sprites are 32px frames × scale 3 = 96px on screen.
 *   Player sprites are 64px frames. scale=2 → 128px — visually comparable
 *   to enemies and overflows the 64px hitbox slot by ~64px, same order of
 *   magnitude as enemies. scale=3 would produce 192px which is too large
 *   and fights the overflow chain.
 *
 * Props:
 *   weaponMode           — "sword" | "bow"
 *   isAttacking          — true for one tick when player attacks
 *   isHit                — true briefly when player takes damage
 *   isDead               — player death state
 *   fallbackEmoji        — (ignored, kept for API compat)
 *   className            — (ignored, kept for API compat)
 *   onCharacterBoundsChange — ResizeObserver callback for layout system
 *   combatGlyphRef       — ref attached to the visible glyph for hitbox math
 */
const PlayerRenderer = forwardRef(function PlayerRenderer(
  {
    weaponMode = "sword",
    isAttacking = false,
    isHit = false,
    isDead = false,
    fallbackEmoji: _fallbackEmoji,  // kept for API compat, unused
    className: _className,          // kept for API compat, unused
    emojiClassName: _emojiClassName, // kept for API compat, unused
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

  // Report sprite bounds to PlayerDisplay's layout system
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
    /**
     * Mirrors EnemyWeaponRig's inner flex wrapper:
     *   - h-full / w-full fills the hitbox slot
     *   - items-end aligns sprite to the feet baseline
     *   - overflow-visible lets sprite extend upward past the slot
     */
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        alignItems: "flex-end",
        justifyContent: "center",
        overflow: "visible",
      }}
    >
      <div
        ref={setWrapperNode}
        style={{ display: "inline-flex", alignItems: "flex-end", overflow: "visible" }}
      >
        <PlayerSprite
          isDead={isDead}
          isAttacking={isAttacking}
          isHit={isHit}
          isRunning={!isDead}
          weaponMode={weaponMode}
          scale={2}
          flipX={false}
        />
      </div>
    </div>
  );
});

PlayerRenderer.displayName = "PlayerRenderer";
export default PlayerRenderer;
