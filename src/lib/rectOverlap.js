/**
 * True when two axis-aligned rects overlap or touch (inclusive edges).
 * Uses viewport coordinates from getBoundingClientRect().
 */
export function rectsOverlap(a, b) {
  return (
    a.left <= b.right &&
    a.right >= b.left &&
    a.top <= b.bottom &&
    a.bottom >= b.top
  );
}
