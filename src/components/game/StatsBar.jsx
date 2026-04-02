import React from "react";
import {
  Coins,
  Ghost,
  Trees,
  Sword,
  Gift,
  Skull,
  PiggyBank,
} from "lucide-react";
import { formatNumber } from "@/lib/formatNumber";
import { HUD_THEME } from "@/lib/hudTheme";

function CurrencyPill({ icon: Icon, tone, value, title }) {
  const tones = {
    gold: "border-amber-400/25 bg-gradient-to-br from-amber-500/15 to-amber-600/5 text-primary",
    soul: "border-accent/30 bg-gradient-to-br from-accent/20 to-accent/5 text-accent",
    slayer:
      "border-emerald-400/25 bg-gradient-to-br from-emerald-500/12 to-emerald-600/5 text-emerald-300",
  };
  return (
    <div
      title={title}
      className={`flex min-w-0 max-w-full items-center gap-1.5 rounded-full border px-1.5 py-1 shadow-sm shadow-black/20 sm:gap-2 sm:px-2 sm:py-1.5 ${tones[tone]}`}
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black/30 ring-1 ring-white/10 sm:h-7 sm:w-7">
        <Icon className="h-3 w-3 opacity-95 sm:h-3.5 sm:w-3.5" strokeWidth={2.25} aria-hidden />
      </span>
      <span className="truncate font-pixel text-[7px] tabular-nums tracking-tight sm:text-[8px]">
        {value}
      </span>
    </div>
  );
}

function StatChip({ icon: Icon, label, title }) {
  return (
    <div
      title={title}
      className="flex items-center gap-1 rounded-lg border border-border/50 bg-muted/20 px-1.5 py-1 text-muted-foreground shadow-inner shadow-black/10 sm:gap-1.5 sm:px-2 sm:py-1.5"
    >
      {Icon && (
        <Icon className="h-2.5 w-2.5 shrink-0 opacity-80 sm:h-3 sm:w-3" strokeWidth={2.5} aria-hidden />
      )}
      <span className="font-pixel text-[6px] tabular-nums sm:text-[7px]">{label}</span>
    </div>
  );
}

export default function StatsBar({ state, tapDamage, idleCPS }) {
  if (!state) return null;

  const souls = state.souls ?? 0;
  const slayerPoints = state.slayerPoints ?? 0;

  return (
    <div className={HUD_THEME.statsBar.outer}>
      <div className={HUD_THEME.statsBar.inner}>
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 sm:gap-2">
          <CurrencyPill
            icon={Coins}
            tone="gold"
            value={formatNumber(state.coins)}
            title="Coins"
          />
          {souls > 0 && (
            <CurrencyPill
              icon={Ghost}
              tone="soul"
              value={formatNumber(souls)}
              title="Souls"
            />
          )}
          {slayerPoints > 0 && (
            <CurrencyPill
              icon={Trees}
              tone="slayer"
              value={formatNumber(slayerPoints)}
              title="Slayer points"
            />
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-1 sm:gap-1.5">
          {state.isBossActive && (
            <div
              className="flex items-center gap-1 rounded-lg border border-red-500/40 bg-red-950/50 px-2 py-1 font-pixel text-[6px] uppercase tracking-wide text-red-300 shadow-[0_0_16px_-4px_rgba(248,113,113,0.5)] animate-pulse sm:text-[7px]"
              title="Boss encounter"
            >
              <Skull className="h-3 w-3 text-red-400" strokeWidth={2.5} aria-hidden />
              <span>Boss</span>
            </div>
          )}
          <StatChip
            icon={Sword}
            label={formatNumber(tapDamage)}
            title="Tap damage"
          />
          <StatChip
            icon={Gift}
            label={`${state.itemDrops || 0}/5`}
            title="Item drops this stage"
          />
          {state.stage < 6 && (
            <StatChip
              icon={Skull}
              label={`${state.killCount % 25}/25`}
              title="Kills until next wave"
            />
          )}
          <div className="hidden sm:block">
            <StatChip
              icon={PiggyBank}
              label={`${formatNumber(idleCPS)}/s`}
              title="Idle coins per second"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
