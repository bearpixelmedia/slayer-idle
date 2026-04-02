/**
 * HeroPanel.jsx
 *
 * Recruit, level, and manage the three Pixel Crawler heroes.
 * Shows hero sprites via AnimatedSprite, passive bonuses, active ability
 * cooldown buttons, and recruit/level-up cost buttons.
 *
 * Props:
 *   state               — game state (heroes, coins)
 *   heroAbilities       — { shield_wall, backstab, arcane_bomb } from useBuffsAndAbilities
 *   heroPassives        — { damageReduction, tapDamageBoost, soulGainBoost }
 *   heroDPS             — total hero idle DPS number
 *   onRecruit           — (heroId) => void
 *   onLevel             — (heroId) => void
 *   onActivateAbility   — (abilityId) => void
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, ShieldCheck, Swords, Zap } from "lucide-react";
import { HEROES, HERO_BY_ID, MAX_HEROES, getHeroLevelCost, getHeroPassiveValue, getHeroDPS } from "@/lib/heroes";
import { formatNumber } from "@/lib/formatNumber";
import { HUD_THEME } from "@/lib/hudTheme";
import AnimatedSprite from "@/components/game/AnimatedSprite";
import { PixelCoin } from "@/components/game/PixelCoin";
import {
  KNIGHT_SPRITES,
  ROGUE_SPRITES,
  WIZARD_SPRITES,
  resolveAnim,
} from "@/lib/sprites";

// ─── Sprite map ───────────────────────────────────────────────────────────────
const HERO_SPRITES = {
  knight: KNIGHT_SPRITES,
  rogue:  ROGUE_SPRITES,
  wizard: WIZARD_SPRITES,
};

// ─── Passive icon + label ─────────────────────────────────────────────────────
const PASSIVE_META = {
  damageReduction: { icon: "🛡️", label: "DMG BLOCK", color: "text-blue-400" },
  tapDamageBoost:  { icon: "⚔️", label: "TAP BOOST", color: "text-red-400" },
  soulGainBoost:   { icon: "✨", label: "SOUL BOOST", color: "text-purple-400" },
};

// ─── Ability icon map ─────────────────────────────────────────────────────────
const ABILITY_ICONS = {
  shield_wall: <ShieldCheck className="w-5 h-5" />,
  backstab:    <Swords       className="w-5 h-5" />,
  arcane_bomb: <Zap          className="w-5 h-5" />,
};

// ─── Cooldown ring (SVG arc) ──────────────────────────────────────────────────
function CooldownRing({ pct }) {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const dash = circ * (1 - pct);
  return (
    <svg
      className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
      viewBox="0 0 48 48"
    >
      <circle cx="24" cy="24" r={r} fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="4" />
      <circle
        cx="24" cy="24" r={r}
        fill="none"
        stroke="#f59e0b"
        strokeWidth="4"
        strokeDasharray={`${circ}`}
        strokeDashoffset={`${dash}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.1s linear" }}
      />
    </svg>
  );
}

// ─── Single hero card ─────────────────────────────────────────────────────────
function HeroCard({ hero, level, coins, heroAbilities, onRecruit, onLevel, onActivateAbility }) {
  const recruited = level >= 1;
  const levelCost  = recruited ? getHeroLevelCost(hero.id, level) : hero.unlockCost;
  const canAfford  = (coins ?? 0) >= levelCost;
  const passiveVal = recruited ? getHeroPassiveValue(hero.id, level) : 0;
  const heroDPS    = recruited ? getHeroDPS(hero.id, level) : 0;
  const abilityId  = hero.ability.id;
  const abilityState = heroAbilities?.[abilityId];
  const abilityCfgCooldown = hero.ability.cooldown;
  const cooldownPct = abilityState?.cooldownRemaining > 0
    ? abilityState.cooldownRemaining / abilityCfgCooldown
    : 0;
  const canUseAbility = recruited && abilityState && !abilityState.active && abilityState.cooldownRemaining === 0;

  const passiveMeta = PASSIVE_META[hero.passive.type];
  const passiveDisplay = passiveVal > 0
    ? hero.passive.type === "damageReduction"
      ? `${Math.round(passiveVal * 100)}% ${passiveMeta.label}`
      : `+${Math.round(passiveVal * 100)}% ${passiveMeta.label}`
    : null;

  const spriteSet  = HERO_SPRITES[hero.id];
  const idleAnim   = resolveAnim(spriteSet, "idle");

  return (
    <motion.div
      layout
      className={`rounded-lg border-2 overflow-hidden transition-all ${
        recruited
          ? "border-amber-500/60 bg-gradient-to-b from-amber-950/40 to-card/60"
          : "border-border/40 bg-card/30 opacity-70"
      }`}
    >
      {/* Header row */}
      <div className="flex items-center gap-3 px-3 py-2.5">
        {/* Sprite or placeholder */}
        <div className="relative flex-shrink-0 w-10 h-10 rounded-md overflow-hidden bg-black/30 border border-border/30">
          {idleAnim ? (
            <AnimatedSprite
              url={idleAnim.url}
              frameW={idleAnim.frameW}
              frameH={idleAnim.frameH}
              frames={idleAnim.frames}
              fps={idleAnim.fps}
              loop={idleAnim.loop}
              scale={1}
              playing={true}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">
              {hero.id === "knight" ? "🛡️" : hero.id === "rogue" ? "🗡️" : "🔮"}
            </div>
          )}
          {/* Level badge */}
          {recruited && (
            <div className="absolute bottom-0 right-0 bg-amber-600 text-white font-pixel text-[7px] px-1 rounded-tl-sm leading-none py-0.5">
              L{level}
            </div>
          )}
        </div>

        {/* Name + title */}
        <div className="flex-1 min-w-0">
          <div className="font-pixel text-[10px] text-amber-100 font-bold">{hero.name}</div>
          <div className="font-pixel text-[7px] text-muted-foreground italic">{hero.title}</div>
          {recruited && (
            <div className="font-pixel text-[7px] text-yellow-400 mt-0.5">
              {formatNumber(heroDPS)} DPS
            </div>
          )}
        </div>

        {/* Ability button */}
        {recruited && (
          <div className="relative flex-shrink-0 w-12 h-12">
            <button
              onClick={() => canUseAbility && onActivateAbility(abilityId)}
              disabled={!canUseAbility}
              className={`relative w-full h-full rounded-lg border-2 flex flex-col items-center justify-center gap-0.5 transition-all overflow-hidden ${
                canUseAbility
                  ? "border-amber-400/70 bg-amber-950/60 hover:bg-amber-900/70 text-amber-200"
                  : abilityState?.active
                    ? "border-green-400/80 bg-green-900/50 text-green-300"
                    : "border-border/40 bg-card/30 text-muted-foreground/50"
              }`}
              title={hero.ability.description}
            >
              {cooldownPct > 0 && <CooldownRing pct={cooldownPct} />}
              <span className="relative z-10">{ABILITY_ICONS[abilityId]}</span>
              {abilityState?.cooldownRemaining > 0 && (
                <span className="relative z-10 font-pixel text-[7px] text-amber-300">
                  {abilityState.cooldownRemaining}s
                </span>
              )}
              {abilityState?.active && (
                <span className="relative z-10 font-pixel text-[7px] text-green-300">ACTIVE</span>
              )}
              {abilityState?.hitsRemaining > 0 && (
                <span className="relative z-10 font-pixel text-[7px] text-orange-300">
                  ×{abilityState.hitsRemaining}
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Passive stat row */}
      {recruited && passiveDisplay && (
        <div className={`px-3 pb-1.5 flex items-center gap-1.5`}>
          <span className="text-xs">{passiveMeta.icon}</span>
          <span className={`font-pixel text-[7px] ${passiveMeta.color}`}>{passiveDisplay}</span>
        </div>
      )}

      {/* Not recruited: show description */}
      {!recruited && (
        <div className="px-3 pb-1.5">
          <p className="font-pixel text-[7px] text-muted-foreground leading-relaxed">
            {hero.description}
          </p>
        </div>
      )}

      {/* Footer: recruit / level-up button */}
      <div className="px-3 pb-3 pt-1">
        <motion.button
          onClick={() => canAfford && (recruited ? onLevel(hero.id) : onRecruit(hero.id))}
          disabled={!canAfford}
          whileTap={canAfford ? { scale: 0.95 } : {}}
          className={`w-full py-2 rounded-md font-pixel text-[8px] font-bold transition-all flex items-center justify-center gap-2 ${
            canAfford
              ? recruited
                ? "bg-primary text-primary-foreground shadow-md shadow-amber-900/40 ring-2 ring-amber-400/70 hover:brightness-110"
                : "bg-emerald-700/80 text-emerald-100 shadow-md ring-2 ring-emerald-500/50 hover:brightness-110"
              : "bg-muted/30 text-muted-foreground/50"
          }`}
        >
          <span><><PixelCoin size={10} className="inline-block align-middle mr-0.5" />{formatNumber(levelCost)}</></span>
          <span>{recruited ? `LEVEL UP (${level} → ${level + 1})` : "RECRUIT"}</span>
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────
export default function HeroPanel({
  state,
  heroAbilities,
  heroPassives,
  heroDPS,
  onRecruit,
  onLevel,
  onActivateAbility,
}) {
  const [open, setOpen] = useState(true);
  const heroes = state?.heroes || {};
  const recruitedCount = Object.values(heroes).filter((l) => l >= 1).length;
  const coins = state?.coins ?? 0;

  return (
    <div className={`rounded-md ${HUD_THEME.panel.border} overflow-hidden`}>
      {/* Collapsible header */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5
          bg-gradient-to-r from-violet-700/35 via-purple-600/25 to-violet-800/30
          hover:from-violet-600/45 hover:via-purple-500/35
          border-2 border-violet-500/70 shadow-lg shadow-violet-950/40
          ring-1 ring-violet-400/30 transition-all text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl shrink-0 drop-shadow-sm" aria-hidden>⚔️</span>
          <span className="font-pixel text-[10px] sm:text-[11px] text-violet-100 font-bold tracking-wide uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            Heroes
          </span>
          <span className="font-pixel text-[8px] text-violet-300">
            {recruitedCount}/{MAX_HEROES}
          </span>
          {heroDPS > 0 && (
            <span className="font-pixel text-[7px] text-yellow-400">
              +{formatNumber(heroDPS)} DPS
            </span>
          )}
        </div>
        {open
          ? <ChevronUp   className="w-4 h-4 text-violet-200 shrink-0" strokeWidth={2.5} />
          : <ChevronDown className="w-4 h-4 text-violet-200 shrink-0" strokeWidth={2.5} />
        }
      </button>

      {/* Passive summary bar */}
      {open && (heroPassives?.damageReduction > 0 || heroPassives?.tapDamageBoost > 0 || heroPassives?.soulGainBoost > 0) && (
        <div className="flex gap-3 px-3 py-1.5 bg-violet-950/30 border-b border-violet-800/30">
          {heroPassives.damageReduction > 0 && (
            <span className="font-pixel text-[7px] text-blue-400">
              🛡️ {Math.round(heroPassives.damageReduction * 100)}% DMG BLOCK
            </span>
          )}
          {heroPassives.tapDamageBoost > 0 && (
            <span className="font-pixel text-[7px] text-red-400">
              ⚔️ +{Math.round(heroPassives.tapDamageBoost * 100)}% TAP
            </span>
          )}
          {heroPassives.soulGainBoost > 0 && (
            <span className="font-pixel text-[7px] text-purple-400">
              ✨ +{Math.round(heroPassives.soulGainBoost * 100)}% SOULS
            </span>
          )}
        </div>
      )}

      {/* Hero cards */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-y-auto max-h-[480px]"
          >
            <div className="px-2 py-2 space-y-2">
              {HEROES.map((hero) => (
                <HeroCard
                  key={hero.id}
                  hero={hero}
                  level={heroes[hero.id] || 0}
                  coins={coins}
                  heroAbilities={heroAbilities}
                  onRecruit={onRecruit}
                  onLevel={onLevel}
                  onActivateAbility={onActivateAbility}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
