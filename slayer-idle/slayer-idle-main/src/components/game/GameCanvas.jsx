import React, { useRef, useState, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { STAGES } from "@/lib/gameData";
import {
  BOW_ORIGIN_BOTTOM_PCT,
  BOW_ORIGIN_LEFT_PCT,
  resolveCombatEnemyWorldPos,
  isInCombatAlongPath,
  getEnemyScreenAnchorPercent,
  PATH_GAP_TO_SCREEN_PCT,
} from "@/lib/combatHitboxes";
import { getBossForStage, isBossShieldActive } from "@/lib/bosses";
import ParticleEffect from "./ParticleEffect";
import ParallaxBackground from "./ParallaxBackground";
import ParallaxShrubOverlay from "./ParallaxShrubOverlay";
import { loadGameSettings } from "@/lib/gameSettings";
import { rectsOverlap } from "@/lib/rectOverlap";
import EnemyCluster from "./EnemyCluster";
import WorldCoins from "./WorldCoins";
import PlayerDisplay from "./PlayerDisplay";
import FloatingElements from "./FloatingElements";
import BossUI from "./BossUI";
import BowArrows from "./BowArrows";

function GameCanvasComponent({
  state,
  enemyDying,
  floatingCoins,
  floatingSouls,
  floatingDamage,
  slashEffects,
  particles,
  onTap,
  onJump,
  tickWorldCoinCollection,
  onWorldCoinPickup,
  attackTick,
  enemyHit,
  playerHit,
  weaponMode,
}) {
  const canvasRef = useRef(null);
  const playerHitboxRef = useRef(null);
  const enemyHitboxRef = useRef(null);
  /** Visible face bounds (emoji span / canvas / sprite) — preferred for path combat width. */
  const playerCombatGlyphRef = useRef(null);
  const enemyCombatGlyphRef = useRef(null);
  const worldProgressRef = useRef(state?.worldProgress ?? 0);
  React.useEffect(() => {
    worldProgressRef.current = state?.worldProgress ?? 0;
  }, [state?.worldProgress]);
  const pointerPressRef = useRef({ pointerId: null });
  /** Sync refs: hold state + press time (physics reads these every frame). */
  const jumpActiveRef = useRef(false);
  const jumpStartRef = useRef(0);
  /** Increments each new jump attempt (grounded impulse in PlayerDisplay). */
  const [jumpPressId, setJumpPressId] = useState(0);
  const [arrowShots, setArrowShots] = useState([]);
  /** Canvas bounds in viewport coords for portaling arrows above the HUD overlay. */
  const [bowPortalRect, setBowPortalRect] = useState(null);
  const gameSettings = React.useMemo(() => loadGameSettings(), []);
  const stage = STAGES[state?.stage] || STAGES[0];
  const boss = state?.isBossActive ? getBossForStage(state?.stage) : null;
  const showBossWarning = state?.bossWarning && Date.now() < state.bossWarning.warningEndTime;
  const shieldActive =
    state?.isBossActive &&
    boss?.mechanic?.type === "shield_window" &&
    state?.bossFightStartTime
      ? isBossShieldActive(Date.now() - state.bossFightStartTime, boss)
      : false;
  
  // Single source of truth: parallax reads the same worldProgress as EnemyCluster (useGameState).
  // A separate interval + different combat threshold used to desync scrolling from gameplay.
  const runProgress = useRef(state?.worldProgress ?? 0);
  runProgress.current = state?.worldProgress ?? 0;

  React.useEffect(() => {
    window.__gameRunProgress = runProgress;
  }, []);

  /** Map measured sprite/emoji bounds to path half-widths (see combatHitboxes). */
  useLayoutEffect(() => {
    let raf = 0;
    const tick = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const c = canvas.getBoundingClientRect();
        const pw = c.width > 0 ? c.width : 1;
        const setGlyphHalf = (el, glyphKey) => {
          if (!el) return;
          const r = el.getBoundingClientRect();
          if (r.width <= 0) return;
          const wPct = (r.width / pw) * 100;
          window[glyphKey] = (wPct * 0.5) / PATH_GAP_TO_SCREEN_PCT;
        };
        const setSlotHalf = (el, slotKey) => {
          if (!el) return;
          const r = el.getBoundingClientRect();
          if (r.width <= 0) return;
          const wPct = (r.width / pw) * 100;
          window[slotKey] = (wPct * 0.5) / PATH_GAP_TO_SCREEN_PCT;
        };

        const pGlyph = playerCombatGlyphRef.current;
        const pSlot = playerHitboxRef.current;
        if (pGlyph) {
          setGlyphHalf(pGlyph, "__combatPlayerHalfWorldGlyph");
        } else {
          delete window.__combatPlayerHalfWorldGlyph;
          setSlotHalf(pSlot, "__combatPlayerHalfWorld");
        }

        const eGlyph = enemyCombatGlyphRef.current;
        const eSlot = enemyHitboxRef.current;
        if (eGlyph) {
          setGlyphHalf(eGlyph, "__combatEnemyHalfWorldGlyph");
        } else {
          delete window.__combatEnemyHalfWorldGlyph;
          setSlotHalf(eSlot, "__combatEnemyHalfWorld");
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useLayoutEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      setBowPortalRect({ left: r.left, top: r.top, width: r.width, height: r.height });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, []);

  React.useEffect(() => {
    if (typeof tickWorldCoinCollection !== "function") return undefined;
    let raf = 0;
    const step = () => {
      const wp = worldProgressRef.current ?? 0;
      const canvas = canvasRef.current;
      const playerEl = playerHitboxRef.current;
      const touchingCoinIds = [];
      if (canvas && playerEl) {
        const pr = playerEl.getBoundingClientRect();
        if (pr.width > 0 && pr.height > 0) {
          const coinEls = canvas.querySelectorAll("[data-world-coin]");
          for (const el of coinEls) {
            const id = el.getAttribute("data-coin-id");
            if (!id) continue;
            const cr = el.getBoundingClientRect();
            if (cr.width > 0 && cr.height > 0 && rectsOverlap(pr, cr)) {
              touchingCoinIds.push(id);
            }
          }
        }
      }
      tickWorldCoinCollection(wp, touchingCoinIds, onWorldCoinPickup);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [tickWorldCoinCollection, onWorldCoinPickup]);

  /** Bow flight matches BowArrows motion duration; damage + hit flash apply on impact. */
  const BOW_ARROW_FLIGHT_MS = 200;

  const validateAttackAt = React.useCallback((clientX, clientY) => {
    if (!state || state.isDead) return null;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    const enemyWorldPos = resolveCombatEnemyWorldPos({
      isBossActive: state.isBossActive,
      enemyCluster: state.enemyCluster,
      currentClusterIndex: state.currentClusterIndex,
      nextEnemyWorldPos: state.nextEnemyWorldPos,
    });
    if (enemyWorldPos != null && Number.isFinite(enemyWorldPos)) {
      const inCombat = isInCombatAlongPath(
        state.worldProgress,
        enemyWorldPos,
        Boolean(state.isBossActive)
      );
      // Same gate as auto-attack: no tap damage until hitboxes meet on the path (no screen-range sniping).
      if (!inCombat) return null;
    }

    return { x, y };
  }, [state]);

  /** Attack-only press: no jump. Otherwise starts jump + tap feedback. */
  const applyPressAt = React.useCallback(
    (clientX, clientY) => {
      const pos = validateAttackAt(clientX, clientY);
      onJump?.();
      if (pos) {
        if (weaponMode === "bow") {
          const anchor = getEnemyScreenAnchorPercent(state);
          if (anchor) {
            const x0 = BOW_ORIGIN_LEFT_PCT;
            const y0 = BOW_ORIGIN_BOTTOM_PCT;
            const x1 = anchor.leftPct;
            const y1 = anchor.bottomPct;
            const id = Date.now() + Math.random();
            setArrowShots((prev) => [...prev, { id, x0, y0, x1, y1 }]);
            setTimeout(() => {
              setArrowShots((prev) => prev.filter((s) => s.id !== id));
            }, BOW_ARROW_FLIGHT_MS + 120);
            onTap(anchor.leftPct, anchor.bottomPct, { bowFlightMs: BOW_ARROW_FLIGHT_MS });
          } else {
            onTap(pos.x, pos.y);
          }
        } else {
          onTap(pos.x, pos.y);
        }
        return;
      }
      jumpActiveRef.current = true;
      jumpStartRef.current = performance.now();
      setJumpPressId((n) => n + 1);
    },
    [validateAttackAt, onJump, weaponMode, state, onTap]
  );

  const handlePointerDown = React.useCallback(
    (e) => {
      if (!state || state.isDead) return;
      if (e.button != null && e.button !== 0) return;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      pointerPressRef.current = { pointerId: e.pointerId };
      applyPressAt(e.clientX, e.clientY);
    },
    [state, applyPressAt]
  );

  const endJumpHold = React.useCallback((e) => {
    const { pointerId } = pointerPressRef.current;
    if (pointerId != null && e.pointerId !== pointerId) return;
    pointerPressRef.current = { pointerId: null };
    jumpActiveRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  }, []);

  const handlePointerUp = React.useCallback(
    (e) => {
      endJumpHold(e);
    },
    [endJumpHold]
  );

  const handlePointerCancel = React.useCallback(
    (e) => {
      endJumpHold(e);
    },
    [endJumpHold]
  );

  // Space: same rules as pointer — attack at canvas center skips jump
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code !== "Space" || state.isDead) return;
      if (e.repeat) return;
      e.preventDefault();
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const cx = rect.left + rect.width * 0.5;
        const cy = rect.top + rect.height * 0.5;
        applyPressAt(cx, cy);
      } else {
        onJump?.();
        jumpActiveRef.current = true;
        jumpStartRef.current = performance.now();
        setJumpPressId((n) => n + 1);
      }
    };
    const handleKeyUp = (e) => {
      if (e.code !== "Space") return;
      e.preventDefault();
      jumpActiveRef.current = false;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [state.isDead, applyPressAt, onJump]);

  const bowPortal =
    typeof document !== "undefined" &&
    bowPortalRect &&
    createPortal(
      <div
        className="pointer-events-none fixed overflow-visible"
        style={{
          left: bowPortalRect.left,
          top: bowPortalRect.top,
          width: bowPortalRect.width,
          height: bowPortalRect.height,
          zIndex: 55,
        }}
        aria-hidden
      >
        <BowArrows shots={arrowShots} />
      </div>,
      document.body
    );

  /** Above HUD overlay (z-30) so boss warning / mechanic text is not covered by the stats bar. */
  const bossUiPortal =
    typeof document !== "undefined" &&
    createPortal(
      <div className="pointer-events-none fixed inset-0 z-[38]" aria-live="polite">
        <BossUI
          showBossWarning={showBossWarning}
          isBossActive={state?.isBossActive}
          boss={boss}
          shieldActive={shieldActive}
          bossHitsReceived={state?.bossHitsReceived}
          bossMechanic={boss?.mechanic}
        />
      </div>,
      document.body
    );

  return (
    <div
      ref={canvasRef}
      className={`relative w-full flex-1 bg-gradient-to-b ${stage.bgGradient} cursor-pointer select-none overflow-hidden touch-none`}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      <ParallaxBackground />
      <ParallaxShrubOverlay />
      <WorldCoins worldCoins={state?.worldCoins} playerWorldPos={state?.worldProgress} />
      <PlayerDisplay
        playerHP={state.playerHP}
        playerMaxHP={state.playerMaxHP}
        enemyHit={enemyHit}
        playerHit={playerHit}
        weaponMode={weaponMode}
        gameSettings={gameSettings}
        jumpPressId={jumpPressId}
        jumpActiveRef={jumpActiveRef}
        jumpStartRef={jumpStartRef}
        attackTick={attackTick ?? 0}
        playerHitboxRef={playerHitboxRef}
        combatGlyphRef={playerCombatGlyphRef}
      />
      <EnemyCluster
        cluster={state.enemyCluster ?? []}
        currentIndex={state.currentClusterIndex}
        isBossActive={state.isBossActive}
        enemyHP={state.enemyHP}
        enemyMaxHP={state.enemyMaxHP}
        currentEnemyName={state.currentEnemyName}
        enemyHit={enemyHit}
        enemyDying={enemyDying}
        boss={boss}
        shieldActive={shieldActive}
        playerWorldPos={state.worldProgress}
        nextEnemyWorldPos={state.nextEnemyWorldPos}
        enemyHitboxRef={enemyHitboxRef}
        enemyCombatGlyphRef={enemyCombatGlyphRef}
        playerHit={playerHit}
      />
      {bowPortal}
      <div className="absolute inset-0 pointer-events-none z-30">
        <FloatingElements
          floatingCoins={floatingCoins}
          floatingSouls={floatingSouls}
          floatingDamage={floatingDamage}
          slashEffects={slashEffects}
        />
        <ParticleEffect particles={particles} />
      </div>
      {bossUiPortal}

      {/* Stage indicator mobile */}
      <div className="sm:hidden absolute top-2 left-2 z-30 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm border border-white/10">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
        <span className="font-pixel text-[7px]" style={{ color: stage.color }}>{stage.name}</span>
      </div>

      {/* Tap hint */}
      <div className="absolute bottom-2 left-1/2 z-30 -translate-x-1/2">
        <span className="font-pixel text-[7px] text-muted-foreground/50 animate-pulse text-center max-w-[95%]">
          CLOSE IN ON THE PATH TO FIGHT · TAP TO ATTACK IN RANGE · JUMP TO COLLECT COINS
        </span>
      </div>
    </div>
  );
}

export default React.memo(GameCanvasComponent);