import React, { useRef, useEffect, useState, useMemo } from "react";
import { loadGameSettings, getAsepriteJsonUrlForSprite, getSetting } from "@/lib/gameSettings";
import {
  ENEMY_EMOJIS,
  enemyHasWeapons,
  getEnemyIdleAnimClass,
  ZOMBIE_EMOJI_VARIANTS,
  VAMPIRE_EMOJI_VARIANTS,
} from "@/lib/gameData";
import { getEnemyFeetVisualAlignPx } from "@/lib/laneScene";
import { CHARACTER_EMOJI_BOSS, CHARACTER_EMOJI_NORMAL } from "@/lib/characterEmojiStyles";
import { EnemyWeaponRig } from "./EnemyWeaponRig";

function assignRef(ref, node) {
  if (ref == null) return;
  if (typeof ref === "function") ref(node);
  else ref.current = node;
}

function emojiFromInstance(instanceId, variants) {
  if (!instanceId || typeof instanceId !== "string") return variants[0];
  let h = 0;
  for (let i = 0; i < instanceId.length; i++) {
    h = (h * 31 + instanceId.charCodeAt(i)) | 0;
  }
  return variants[Math.abs(h) % variants.length];
}

function baseEmojiForEnemy(enemyName, instanceId) {
  if (enemyName === "Zombie") return emojiFromInstance(instanceId, ZOMBIE_EMOJI_VARIANTS);
  if (enemyName === "Vampire") return emojiFromInstance(instanceId, VAMPIRE_EMOJI_VARIANTS);
  return ENEMY_EMOJIS[enemyName] ?? "👾";
}

export default function EnemyRenderer({
  enemyName,
  enemyHit,
  enemyDying,
  isBoss,
  bossId,
  bossIcon,
  enemyHitboxRef,
  enemyCombatGlyphRef,
  playerHit = false,
  instanceId,
}) {
  const showWeapons = enemyHasWeapons(enemyName);
  const idleAnimClass = enemyDying ? "" : getEnemyIdleAnimClass(enemyName);
  const feetVisualAlignPx = isBoss ? 0 : getEnemyFeetVisualAlignPx(enemyName);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [animationData, setAnimationData] = useState(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [emoji, setEmoji] = useState("👾");

  const enemyType = useMemo(
    () => enemyName?.toLowerCase().replace(/\s+/g, "_") || "default",
    [enemyName]
  );

  const syncSpriteUrl = useMemo(() => {
    const settings = loadGameSettings();
    if (isBoss && bossId) return settings[`boss_${bossId}_icon`] || null;
    return settings[`enemy_${enemyType}`] || null;
  }, [isBoss, bossId, enemyType]);

  useEffect(() => {
    setAnimationData(null);
    setCurrentFrame(0);

    if (!syncSpriteUrl) {
      imgRef.current = null;
      const defaultEmoji = baseEmojiForEnemy(enemyName, instanceId);
      const customEmoji = getSetting(`enemy_${enemyType}_emoji`, defaultEmoji);
      setEmoji(isBoss && bossIcon ? bossIcon : customEmoji);
      return undefined;
    }

    const img = new Image();
    img.src = syncSpriteUrl;
    imgRef.current = img;

    let cancelled = false;
    const jsonUrl = getAsepriteJsonUrlForSprite(syncSpriteUrl);
    if (!jsonUrl) return undefined;

    fetch(jsonUrl)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data) setAnimationData(data);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [syncSpriteUrl, enemyName, enemyType, instanceId, isBoss, bossIcon, bossId]);

  useEffect(() => {
    if (!animationData) return;

    const frames = animationData.frames;
    const frameCount = Array.isArray(frames) ? frames.length : Object.keys(frames).length;
    if (!frameCount) return;

    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frameCount);
    }, animationData.meta?.frameTags?.[0]?.duration || 100);

    return () => clearInterval(interval);
  }, [animationData]);

  useEffect(() => {
    if (!canvasRef.current || !animationData || !imgRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const frames = animationData.frames;
    const frameKeys = Array.isArray(frames) ? Object.keys(frames) : Object.keys(frames);
    const frameKey = frameKeys[currentFrame % frameKeys.length];
    const frame = frames[frameKey];

    if (!frame) return;

    canvas.width = isBoss ? 160 : 64;
    canvas.height = isBoss ? 160 : 64;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const draw = () => {
      const scale = Math.min(canvas.width / frame.frame.w, canvas.height / frame.frame.h);
      const scaledW = frame.frame.w * scale;
      const scaledH = frame.frame.h * scale;
      const offsetX = (canvas.width - scaledW) / 2;
      // Pin frame feet to canvas bottom (centered Y made bosses read “below” the road vs the player).
      const offsetY = canvas.height - scaledH;

      ctx.imageSmoothingEnabled = false;
      ctx.save();
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(
        imgRef.current,
        frame.frame.x,
        frame.frame.y,
        frame.frame.w,
        frame.frame.h,
        offsetX,
        offsetY,
        scaledW,
        scaledH
      );
      ctx.restore();
    };

    if (imgRef.current.complete) draw();
    else imgRef.current.onload = draw;
  }, [animationData, currentFrame, isBoss]);

  if (animationData) {
    return (
      <EnemyWeaponRig
        enemyHit={enemyHit}
        enemyDying={enemyDying}
        playerHit={playerHit}
        enemyHitboxRef={enemyHitboxRef}
        isBoss={isBoss}
        showWeapons={showWeapons}
        idleAnimClass={idleAnimClass}
        feetVisualAlignPx={feetVisualAlignPx}
      >
        <canvas
          ref={(node) => {
            canvasRef.current = node;
            assignRef(enemyCombatGlyphRef, node);
          }}
          className="h-full w-full max-h-full max-w-full object-contain"
          style={{ imageRendering: "pixelated" }}
        />
      </EnemyWeaponRig>
    );
  }

  if (syncSpriteUrl) {
    return (
      <EnemyWeaponRig
        enemyHit={enemyHit}
        enemyDying={enemyDying}
        playerHit={playerHit}
        enemyHitboxRef={enemyHitboxRef}
        isBoss={isBoss}
        showWeapons={showWeapons}
        idleAnimClass={idleAnimClass}
        feetVisualAlignPx={feetVisualAlignPx}
      >
        <img
          ref={(node) => assignRef(enemyCombatGlyphRef, node)}
          src={syncSpriteUrl}
          alt=""
          decoding="async"
          className="h-full w-full max-h-full max-w-full object-contain"
          style={{ imageRendering: "pixelated" }}
        />
      </EnemyWeaponRig>
    );
  }

  return (
    <EnemyWeaponRig
      enemyHit={enemyHit}
      enemyDying={enemyDying}
      playerHit={playerHit}
      enemyHitboxRef={enemyHitboxRef}
      isBoss={isBoss}
      showWeapons={showWeapons}
      idleAnimClass={idleAnimClass}
      feetVisualAlignPx={feetVisualAlignPx}
    >
      <span
        ref={enemyCombatGlyphRef}
        className={isBoss ? CHARACTER_EMOJI_BOSS : CHARACTER_EMOJI_NORMAL}
      >
        {emoji}
      </span>
    </EnemyWeaponRig>
  );
}
