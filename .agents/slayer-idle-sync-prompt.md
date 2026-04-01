# Slayer Idle Base44 Sync — Paste this into the Slayer Idle app builder chat

Please update the following files exactly as shown. These are production-ready — don't modify them.

---

**File: `src/pages.config.js`**

```js
import Game from './pages/Game';
import GameSettings from './pages/GameSettings';
import TitleScreen from './pages/TitleScreen';

export const PAGES = {
    "TitleScreen": TitleScreen,
    "Game": Game,
    "GameSettings": GameSettings,
}

export const pagesConfig = {
    mainPage: "TitleScreen",
    Pages: PAGES,
};
```

---

**File: `src/App.jsx`**

```jsx
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Game from './pages/Game';
import GameSettings from './pages/GameSettings';
import TitleScreen from './pages/TitleScreen';
import { Navigate } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const AuthenticatedApp = () => {
  const { authError, navigateToLogin } = useAuth();

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/" element={<TitleScreen />} />
      <Route path="/Game" element={<Game />} />
      <Route path="/GameSettings" element={<GameSettings />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
```

---

**File: `src/components/game/PlayerRenderer.jsx`**

```jsx
import React, { useRef, useLayoutEffect, useCallback, forwardRef } from "react";
import PlayerSprite from "./PlayerSprite";

function assignRef(ref, node) {
  if (ref == null) return;
  if (typeof ref === "function") ref(node);
  else ref.current = node;
}

const PlayerRenderer = forwardRef(function PlayerRenderer(
  {
    weaponMode = "sword",
    isAttacking = false,
    isHit = false,
    isDead = false,
    fallbackEmoji: _fallbackEmoji,
    className: _className,
    emojiClassName: _emojiClassName,
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
```

---

**File: `src/lib/laneScene.js`**

```js
export const ROAD_FEET_LINE_FROM_BOTTOM_PCT = 24;
export const ROAD_CENTER_FROM_BOTTOM_PCT = ROAD_FEET_LINE_FROM_BOTTOM_PCT;
export const CHARACTER_BASELINE_BOTTOM_PCT = ROAD_FEET_LINE_FROM_BOTTOM_PCT;

export const Z_SHRUB_OVERLAY = 5;
export const Z_COMBAT_ROW = 30;
export const Z_WORLD_COINS = Z_COMBAT_ROW;

export const COMBAT_GROUND_SHADOW_REGULAR =
  "absolute -bottom-6 w-20 -translate-x-1/2 h-1 bg-black/30 rounded-full blur-sm";

export const COMBAT_GROUND_SHADOW_BOSS =
  "absolute -bottom-6 w-40 -translate-x-1/2 h-1 bg-black/30 rounded-full blur-sm";

export const COMBAT_HITBOX_SLOT_CLASS =
  "relative z-0 box-border flex h-16 w-16 shrink-0 flex-col justify-end items-center overflow-visible sm:h-20 sm:w-20 md:h-24 md:w-24";

export const COMBAT_HITBOX_SLOT_ROW_CLASS =
  "relative z-10 box-border flex h-16 w-16 shrink-0 items-end justify-center sm:h-20 sm:w-20 md:h-24 md:w-24";

export const COMBAT_HITBOX_BOSS_CLASS =
  "relative z-10 box-border flex h-36 w-36 shrink-0 flex-col justify-end items-center sm:h-40 sm:w-40 md:h-44 md:w-44";

export const COMBAT_HITBOX_BOSS_ROW_CLASS =
  "relative z-10 box-border flex h-36 w-36 shrink-0 items-end justify-center sm:h-40 sm:w-40 md:h-44 md:w-44";

export const PLAYER_FEET_VISUAL_ALIGN_PX = -10;

export const LANE_CLUSTER_SCALE_ORIGIN = "bottom center";

export const BOSS_ROW_INNER_SCALE = 1.48;

export const BOSS_ROW_VISUAL_LIFT_PX = 18;

const ENEMY_FEET_VISUAL_ALIGN_PX = {
  Zombie: -10,
  Skeleton: -6,
  Orc: -6,
  Ogre: -8,
  Goblin: 0,
  Ghost: 6,
  Pixie: 6,
  Sprite: 6,
  Fairy: 6,
  Genie: 4,
  Sorceress: 4,
  Sorcerer: 4,
  Mage: 4,
};

export function getEnemyFeetVisualAlignPx(enemyName) {
  if (!enemyName) return 0;
  return ENEMY_FEET_VISUAL_ALIGN_PX[enemyName] ?? 0;
}

export function getLaneEnemyBodyScale() {
  return 1;
}

export function feetAlignInlineStyle(px) {
  if (px == null || Number(px) === 0) return undefined;
  return {
    transform: `translateY(${px}px)`,
    transformOrigin: "bottom center",
  };
}
```
