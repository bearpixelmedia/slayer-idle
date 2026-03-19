# Cursor plan: Emoji → sprite sheets (Slayer Idle)

Use this doc in Cursor with `@docs/CURSOR_PLAN_SPRITE_SHEETS.md` (or paste sections into Composer). It ties your generic sprite spec to **this** Vite + React codebase.

---

## Goal

Replace **large on-canvas character rendering** (player + enemy in the main battle view) with **sprite sheets**, **frame math**, and **state-driven animation** (idle / walk-or-float substitute / attack). Keep the system easy to extend for new enemies and a future player sheet.

**Out of scope for v1 (optional later):** UI chrome still using emoji (upgrade icons in `gameData.js`, skill tree icons, achievement icons, labels like “BOSS”). Those can stay emoji or move to tiny icon sprites in a separate pass.

---

## Current touchpoints (repo map)

| Area | File(s) | Today |
|------|---------|--------|
| Enemy + player visuals | `src/components/game/GameCanvas.jsx` | `ENEMY_EMOJIS[name]`, player `🏹` / `⚔️` |
| Enemy name → visual | `src/lib/gameData.js` | `ENEMY_EMOJIS` map |
| Boss metadata icons | `src/lib/bosses.js` | `icon` strings (UI / future sprite key) |
| Tap particles | `src/components/game/ParticleEffect.jsx`, `src/hooks/useGameState.js` | `emoji` on particle objects |
| Runner | `src/components/game/RunnerCanvas.jsx` | `🏃` (optional second phase) |

Animation today is mostly **CSS** (`animate-float`, `animate-enemy-hit`, etc.) on the emoji `<div>`. Sprites should **either** keep those classes on a wrapper **or** drive scale/offset from Framer — prefer a **wrapper div** + inner sprite so hit/die motion stays stable.

---

## Phase 1 — Asset layout (Vite)

1. Add **`public/assets/`** at project root (Vite serves `/assets/...` from `public`).

Suggested structure (matches your spec):

```text
public/assets/
  characters/
    player_sword.png
    player_bow.png
    # or one player sheet with rows for weapon/mode
  enemies/
    slime.png
    goblin.png
    # … one sheet per enemy type, or shared “generic” + recolor later
  animations/          # optional: VFX sheets (slash, burst)
    slash.png
```

**Sheet rules:** fixed `frameWidth` × `frameHeight`, frames in a **single row** or **rows = animation states**, no drifting alignment between frames. Prefer power-of-two frame sizes (32 / 48 / 64).

---

## Phase 2 — Sprite metadata (single source of truth)

Add a module, e.g. **`src/lib/sprites.js`** (or `src/lib/spriteRegistry.js`), that exports:

1. **`SPRITE_DEFS`** — keyed by logical id (`player_sword`, `enemy_slime`, …), each with:
   - `src` (path under `/assets/...`)
   - `frameWidth`, `frameHeight`
   - `animations`: `{ idle: { row, frames }, walk: { row, frames }, attack: { row, frames } }`  
   - `animationSpeed` (seconds per frame) or per-animation speed overrides

2. **`getEnemySpriteId(enemyName)`** — maps `state.currentEnemyName` (+ boss names from `bosses.js`) to a sprite id. Start by mapping **`ENEMY_EMOJIS` keys** 1:1 to ids; fallback to a `placeholder` sheet.

3. **`getPlayerSpriteId(weaponMode)`** — `"sword"` | `"bow"` → sprite id.

Keep **`ENEMY_EMOJIS`** temporarily as **fallback** (if sheet missing) or delete once every enemy has a sheet — decide in implementation.

---

## Phase 3 — Reusable renderer

Add **`src/components/game/Sprite.jsx`** (name as you like) that accepts:

- `spriteId` or inline `def`
- `animation` — `"idle" | "walk" | "attack"` (or string union from defs)
- `scale` / `className` for layout
- Optional `playing` — if false, pin to frame 0

**DOM v1 (your spec):** fixed-size div, `backgroundImage`, `backgroundPosition: -frame * fw, -row * fh`, `backgroundRepeat: "no-repeat"`, `imageRendering: "pixelated"` (and `WebkitOptimizeContrast` if you need Safari crispness).

**Preload:** small hook or module that `new Image()` for each unique `src` on app/game mount to avoid first-frame flicker.

**Animation loop:**

- `useState(0)` for frame index
- `useEffect` + `setInterval` **or** `requestAnimationFrame` with accumulated time (smoother under load; recommended if many sprites later)
- Reset frame to `0` when `animation` key changes
- `frame = (frame + 1) % animation.frames`

Export a **`useSpriteAnimation(def, animationKey, opts)`** hook if multiple components need the same logic.

---

## Phase 4 — Wire `GameCanvas.jsx`

1. **Player block** (~lines 91–102): replace emoji with `<Sprite … />` using `weaponMode` → sprite id; choose animation:
   - `attack` while `enemyHit` or a short window after tap (may require lifting a `lastTapAt` or reusing existing `enemyHit` timing from parent — inspect `Game.jsx` / `useGameState.js`)
   - else `idle` (current `animate-run-cycle` can stay on wrapper or be replaced by a 2–4 frame “idle” loop)

2. **Enemy block** (~lines 105–123): replace `{enemyEmoji}` with sprite from `getEnemySpriteId(state.currentEnemyName)`; animation:
   - `attack` or hit-react when `enemyHit`
   - `idle` / subtle loop when floating; boss scale via existing `scale-125` on wrapper

3. Preserve **wrapper** `className` for `animate-enemy-die`, `animate-enemy-hit`, `animate-float` so motion stays familiar.

---

## Phase 5 — Game state hooks (precision)

Inspect **`src/pages/Game.jsx`** + **`src/hooks/useGameState.js`** for:

- When player “attacks” (tap) — expose a **short boolean or timestamp** so the player sprite can show **1 attack cycle** without staying in attack forever.
- When enemy takes damage — already have `enemyHit`; align sprite `attack`/`hurt` duration with that flag’s lifetime.

Document in code (one line) the **intended mapping**, e.g.:

- `enemyHit` → enemy animation `hurt` or row 3 if you add it
- player tap → `attack` for `N` ms or until frames complete

If state does not expose enough granularity, add minimal fields to game state (avoid large refactors).

---

## Phase 6 — Particles & runner (optional)

- **`ParticleEffect.jsx`:** either keep emoji for V1 or allow `spriteId` + tiny sheet for sparks (generic one-sheet VFX).
- **`RunnerCanvas.jsx`:** same `Sprite` component with runner-specific defs.

---

## Phase 7 — Canvas path (when DOM sprites multiply)

If you later render **many** entities on one surface, introduce a **`SpriteManager`** + single `<canvas>` using `drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh)` as in your note. **Do not** start here unless you measure perf issues — `GameCanvas` only has two characters today.

---

## Cursor Composer prompt (drop-in)

Use after Phase 1–2 scaffolding exists, or as one shot with “create files as needed”:

```text
@docs/CURSOR_PLAN_SPRITE_SHEETS.md @src/components/game/GameCanvas.jsx @src/lib/gameData.js @src/hooks/useGameState.js @src/pages/Game.jsx

Implement sprite-sheet rendering for the battle player and enemy per the plan doc.

Requirements:
- Add public/assets structure and placeholder PNGs OR document expected paths; use src/lib/sprites.js for frame metadata and animation rows.
- Add Sprite.jsx + useSpriteAnimation (interval or rAF), preload images.
- Replace emoji player/enemy in GameCanvas with sprites; keep CSS motion wrappers (float, hit, die).
- Map enemy names (including bosses) to sprite ids with fallback.
- Drive idle vs attack (and hurt if defined) from existing state (weaponMode, enemyHit, tap) with minimal useGameState changes if needed.
- Keep emoji for shop/skill UI unless trivial to swap.

Do not refactor unrelated UI. Match existing Tailwind + framer-motion patterns.
```

---

## Verification checklist

- [ ] No flash on first enemy spawn (preload).
- [ ] Swapping `currentEnemyName` resets animation row/frame.
- [ ] Boss names resolve to correct sheets.
- [ ] Bow/sword swap updates player sheet.
- [ ] Pixel art stays crisp (`image-rendering: pixelated`).
- [ ] `npm run build` passes.

---

## “Next level” backlog (not in v1)

- Texture atlas + UV rects instead of per-file sheets  
- Animation blending / crossfade between idle ↔ walk  
- Shared `SpriteManager` + canvas layer for entities + VFX  
- Hit-stop / attack preview frames synced to damage numbers  

---

*Generated for Slayer Idle (Vite + React). Adjust paths if Base44 builder mirrors `public/` differently.*
