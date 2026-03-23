/**
 * Single source for emoji character sizing in the combat row.
 * Player + non-boss enemies must match or weapons (fixed % of slot) look wrong.
 */
export const CHARACTER_EMOJI_NORMAL =
  "inline-flex h-full w-full min-w-0 flex-col items-center justify-end leading-none drop-shadow-lg [line-height:1] text-4xl sm:text-5xl md:text-6xl";

export const CHARACTER_EMOJI_BOSS =
  "inline-flex h-full w-full min-w-0 flex-col items-center justify-end leading-none drop-shadow-lg [line-height:1] text-6xl scale-125";

/** Non-boss — keep in sync with EnemyRenderer WEAPON_TEXT */
export const WEAPON_EMOJI_TYPO_NORMAL =
  "select-none text-[1.35rem] leading-none drop-shadow-md sm:text-[1.65rem] md:text-[2rem] [line-height:1]";

/** Boss — sync with WEAPON_TEXT_BOSS */
export const WEAPON_EMOJI_TYPO_BOSS =
  "select-none text-[1.5rem] leading-none drop-shadow-md sm:text-[1.85rem] md:text-[2.2rem] [line-height:1]";
