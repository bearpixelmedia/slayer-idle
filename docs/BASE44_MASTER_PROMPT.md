# Slayer Idle — Base44 master prompt & build plan (codebase-aligned)

This document is tailored to **this repository** ([`bearpixelmedia/slayer-idle`](https://github.com/bearpixelmedia/slayer-idle)): React + Vite + Tailwind + shadcn-style UI, Framer Motion, local save in `localStorage`.

---

## 1. What already exists (tell Base44 “extend, don’t restart”)

| Area | Implementation | Key files |
|------|------------------|-----------|
| **Stack** | Vite, React, Tailwind, Base44 client env (`VITE_BASE44_*`) | [`package.json`](../package.json), [`README.md`](../README.md) |
| **Game shell** | Single `Game` page: stats, canvas, abilities, prestige, skill tree, achievements, upgrades | [`src/pages/Game.jsx`](../src/pages/Game.jsx) |
| **Combat loop** | Tap/click to damage enemy; idle DPS tick from upgrades; kill → coins; stage advances every 25 kills | [`src/hooks/useGameState.js`](../src/hooks/useGameState.js), [`src/lib/gameData.js`](../src/lib/gameData.js) |
| **“Runner” feel** | Scrolling ground + run-cycle animation on player emoji; **not** physics jump/runner controls yet | [`src/components/game/GameCanvas.jsx`](../src/components/game/GameCanvas.jsx) |
| **Currencies** | Coins, souls (persistent + prestige gain), Slayer Points (from prestige formula) | `useGameState`, `gameData` prestige helpers |
| **Upgrades** | Sword/boots/armor/pet/ring/scroll/crown/orb with tap vs idle vs “all” tags | [`src/lib/gameData.js`](../src/lib/gameData.js) |
| **Prestige** | Resets run; keeps `unlockedSkills`, `totalKills`, `highestStage`; adds souls + SP | [`useGameState.js`](../src/hooks/useGameState.js) `prestige` |
| **Abilities** | Magnet (bonus coins/s), double damage, auto-clicker; cooldowns | [`useGameState.js`](../src/hooks/useGameState.js), [`AbilityBar.jsx`](../src/components/game/AbilityBar.jsx) |
| **Stages / zones** | 7 named stages with enemy pools and gradients | `STAGES` in [`gameData.js`](../src/lib/gameData.js) |
| **Skill tree (data + UI)** | 8 skills, tiers, prerequisites, SP costs in UI | [`src/lib/skillTree.js`](../src/lib/skillTree.js), [`SkillTree.jsx`](../src/components/game/SkillTree.jsx) |
| **Achievements** | ~16 tracked achievements; damage + offline multipliers | [`src/lib/achievements.js`](../src/lib/achievements.js), [`useAchievements.js`](../src/hooks/useAchievements.js) |
| **Offline** | Modal + partial idle coin accrual (capped) | [`OfflineEarningsModal.jsx`](../src/components/game/OfflineEarningsModal.jsx), `useGameState` |

### Known gaps vs intended design (good Base44 fix prompts)

1. **`getSkillMultipliers` is imported in `useGameState.js` but never applied** — skill unlocks do not yet change damage, idle CPS, or drops.
2. **Unlocking a skill does not deduct Slayer Points** — UI checks `slayerPoints >= cost`, but `unlockSkill` only appends IDs; SP never decreases.
3. **Core fantasy loop** — Design mentions **jump**, **true auto-runner**, **separate soul drops**, **materials**, **minions**, **RNG boxes**, **quests**, **casino/village**, etc. These are **not** in code yet (or only loosely approximated).

---

## 2. Master spec prompt (paste into Base44 AI Controls or top of a long chat)

Use this as the **single source of truth**. For every follow-up, add: *“Respect existing files in this repo; extend `useGameState`, `gameData`, and components under `src/components/game/`.”*

```text
PROJECT: Slayer Idle (Base44 + Vite/React). This is an original medieval-fantasy incremental game inspired by the IDLE + AUTO-RUNNER + light RPG loop (not a clone of any commercial title—original name, assets, and numbers).

WHO / WHAT / WHY
- Who: players who enjoy long progression arcs (casual check-ins to hardcore grinding).
- What: fight through stages, earn coins and souls, buy upgrades, hit intentional walls, prestige for Slayer Points (SP), spend SP on a large skill tree that changes future runs.
- Why: satisfying power growth, frequent early unlocks, depth that stacks in late game.

NON-NEGOTIABLE CORE LOOP
1) Run → kill → earn: character runs forward; player acts (jump, attack, abilities); enemies drop coins and souls.
2) Upgrade: spend coins on weapons, gear, passive multipliers so the next run is faster.
3) Wall: progression must slow sharply at times (by design).
4) Ascend (prestige): reset the CURRENT RUN progress to gain SP (and souls per your formulas); SP unlocks permanent skill tree nodes.
5) Repeat: each loop should feel stronger; new systems unlock over time.

CURRENCIES
- Coins: short-run upgrades.
- Souls: main meta progression currency (carry across prestiges as you already model).
- Slayer Points: ONLY for skill tree (must be spent on unlock, not infinite free unlocks).
- Later: materials for crafting; minion missions; optional premium boosts (design only unless requested).

IDLE VS ACTIVE
- Active play (tapping, timing jump/attack, using abilities, catching RNG boosts) must outperform passive/idle income by a wide margin.
- Idle layer exists for slower parallel progress (minions, offline recap)—never replace the skill ceiling of active play.

MAJOR SYSTEMS (BACKLOG ORDER)
MVP polish on existing repo → then: real runner/jump combat or honest “segment runner” if full physics is too heavy → bow mode & ability bar expansion → RNG boxes/frenzy during runs → quests that gate crafting/zones → minions → crafting & materials → late meta (bosses, armory, casino, village, minigames) as separate features.

VISUAL / UX
- 16-bit pixel fantasy vibe; readable HUD; bento/dashboard layout: Run view on top, scrollable panels for abilities, prestige, skill tree, achievements, shop.
- Mobile-friendly tabs if needed.

MONETIZATION (optional, design-level)
- F2P; optional ads/MTX for boosts; no forced ads; no paywall on core loop.

TECH CONSTRAINTS FOR THIS REPO
- Keep React hooks pattern in useGameState; keep data tables in src/lib (gameData, skillTree, achievements).
- Persist with existing localStorage keys or migrate carefully with a version field in save JSON.
- When adding formulas, centralize in gameData (or a small economy module) so tuning is one place.

CURRENT REPO FACTS (do not contradict)
- Stages: 7 zones in STAGES; stage up every 25 kills.
- Upgrades: UPGRADES + TAP_UPGRADES / IDLE_UPGRADES / ALL_UPGRADES.
- Abilities: magnet, doubleDamage, autoClicker with durations/cooldowns.
- Achievements: ACHIEVEMENTS array drives multipliers via useAchievements.
- Skill tree: SKILLS in skillTree.js; UI in SkillTree.jsx.

REQUIRED FIXES TO ALIGN CODE WITH DESIGN
- Apply getSkillMultipliers(unlockedSkills) to tap damage, idle CPS, and enemy coin/soul rewards (or document where each multiplier applies).
- On skill purchase: deduct skill.cost from slayerPoints atomically with adding skill id; prevent double unlocks and negative SP.
- Ensure soul gains on prestige and any “soul multiplier” skills are consistent end-to-end.
```

---

## 3. First concrete prompt to send Base44 (alignment sprint)

Send **one** message focused on correctness before huge new features:

```text
In this Slayer Idle repo, align the skill tree with the combat economy:

1) Wire getSkillMultipliers(state.unlockedSkills) into useGameState so tap damage, idle damage/CPS, and coin rewards from kills respect damageMultiplier, idleMultiplier, coinDropMultiplier, soulMultiplier from skillTree.js.

2) Fix unlockSkill: when a skill is purchased, subtract skill.cost from slayerPoints (only if prerequisites + SP are valid in the same setState). Keep unlockedSkills and slayerPoints consistent.

3) Add a brief comment in skillTree.js listing which multiplier affects which stat.

Do not rename public components or change the overall Game.jsx layout unless necessary. Preserve localStorage save key idle_slayer_save; if you add fields, default them for old saves.
```

---

## 4. Phased roadmap (one Base44 prompt per phase)

After the alignment sprint, use **one theme per message** (Base44 best practice).

| Phase | Goal | Prompt focus |
|-------|------|----------------|
| **A** | Skill tree + economy honest | Done in §3; tune numbers for “walls” in `getEnemyHP` / `getEnemyReward` / prestige formulas |
| **B** | Runner + jump | Add jump (keyboard + touch): gravity, obstacles or enemy “miss if not jumped,” keep emoji/canvas style; OR “segment runner” (auto-advance lanes, jump = iframe) if full physics is fragile |
| **C** | Souls as drops | Show soul gains on kill; separate soul vs coin in UI; optional zone-specific soul bias |
| **D** | Weapon modes | Bow: hold/charge or lower tap rate but higher soul mult; gate behind skill node |
| **E** | RNG boxes | Random buffs during run (coin/soul mult, short frenzy); timers in UI; bias proc rate upward while actively tapping |
| **F** | Quests | Quest log + objectives (kills, stage, prestige count); rewards unlock crafting UI or zone |
| **G** | Materials + crafting | Material drops in `gameData`; recipe table; permanent small bonuses |
| **H** | Minions | Mission list, timers, offline completion, rewards feed souls/materials |
| **I** | Achievements scale | More achievements with categories; avoid 600+ until performance/UI are sorted—add in batches |
| **J** | Late meta | Boss encounter pattern, armory slot, casino/village as isolated modules |

Between phases, playtest and adjust **one formula file** (`gameData.js`) when possible.

---

## 5. Optional: replace footer copy

[`Game.jsx`](../src/pages/Game.jsx) currently shows `IDLE SLAYER CLONE` — for store/legal comfort, prompt Base44 to change to an original tagline (e.g. “Slayer Idle — tap & prestige RPG”).

---

## 6. References

- Base44 prompt formula & step-by-step builds: [Prompt guide](https://docs.base44.com/Getting-Started/Prompt-guide)
- GitHub sync: [Using GitHub](https://docs.base44.com/Integrations/Using-GitHub)
