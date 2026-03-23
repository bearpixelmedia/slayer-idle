/**
 * Nominal combat character slot (px) aligned with Tailwind `h-16 w-16 sm:h-20 md:h-24` on the
 * player / enemy hitbox wrappers — keeps weapon tri-column math in sync when DOM isn’t measured yet.
 */

export function getCombatSlotNominalPx() {
  if (typeof window === "undefined") return { w: 64, h: 64 };
  const vw = window.innerWidth;
  if (vw >= 768) return { w: 96, h: 96 };
  if (vw >= 640) return { w: 80, h: 80 };
  return { w: 64, h: 64 };
}
