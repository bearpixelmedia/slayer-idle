# Slayer Idle — Codebase guide (Cursor-first)

This file is tailored to **this repository** ([`bearpixelmedia/slayer-idle`](https://github.com/bearpixelmedia/slayer-idle)): React + Vite + Tailwind + shadcn-style UI, Framer Motion, local save in `localStorage`.

### Which tool uses what here

| Section | **Cursor** | **Base44** |
|---------|------------|------------|
| **§1** — What already exists | **Primary:** read this table; `@` linked files when asking for changes | Optional: copy 2–3 sentences + “extend these files, don’t restart” |
| **§2** — Shorter master spec | Optional `@` reference | **Optional duplicate** of [BASE44_PROMPT_PACK.md](./BASE44_PROMPT_PACK.md) Part A + repo constraints—use **one** of Part A (pack) or §2 (here), not both, to avoid drift |
| **§3** — Alignment sprint | **Primary:** paste **§3 Cursor** into chat + `@useGameState.js` `@skillTree.js` | **§3 Base44:** paste the `text` block into Base44 chat |
| **§4** — Phased roadmap | **Preferred** for economy/math (`gameData.js`, prestige formulas) | **Preferred** for big UI features (quests panel, new tabs) — or paste the matching **Part C** block from the prompt pack |

**Master design spec for Base44 AI Controls:** use **Part A** in [BASE44_PROMPT_PACK.md](./BASE44_PROMPT_PACK.md), not this file alone.

---

## 1. What already exists (tell Base44 “extend, don’t restart”)

**CURSOR:** keep this open as context. **BASE44:** only if you need to remind the builder what’s in the repo.

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
| **Skill tree (data + UI)** | Skills + tiers in `skillTree.js`; UI imports same module (single source of truth) | [`src/lib/skillTree.js`](../src/lib/skillTree.js), [`SkillTree.jsx`](../src/components/game/SkillTree.jsx) |
| **Achievements** | ~16 tracked achievements; damage + offline multipliers | [`src/lib/achievements.js`](../src/lib/achievements.js), [`useAchievements.js`](../src/hooks/useAchievements.js) |
| **Offline** | Modal + partial idle coin accrual (capped) | [`OfflineEarningsModal.jsx`](../src/components/game/OfflineEarningsModal.jsx), `useGameState` |

### Known gaps vs intended design

**Alignment sprint (§3) — implemented in repo:** `getSkillMultipliers` applies to tap damage, idle CPS, kill rewards, and prestige souls; `unlockSkill` deducts SP atomically; multiplier map is documented at the top of [`skillTree.js`](../src/lib/skillTree.js).

**Still open / backlog**

1. **Platformer jump on main slayer canvas** — optional; runner minigame exists separately (`RunnerCanvas` / `useRunnerState`).
2. **Materials, minions, RNG boxes, quests at scale, casino/village** — design backlog (use [BASE44_PROMPT_PACK](./BASE44_PROMPT_PACK.md) Part C).
3. **Some skill `type`s** (e.g. `critMultiplier`, `specialMechanic`) are **placeholders** — descriptions only until combat logic reads them.

---

## 2. Master spec (repo-flavored) — optional for Base44

**BASE44:** Optional. If you already pasted **Part A** from [BASE44_PROMPT_PACK.md](./BASE44_PROMPT_PACK.md) into AI Controls, you **do not need** this block—skip to §3 or Part C in the pack.

If you use this block, add: *“Respect existing files in this repo; extend `useGameState`, `gameData`, and components under `src/components/game/`.”*

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

IMPLEMENTED IN REPO (keep when extending)
- getSkillMultipliers(unlockedSkills): tap damage, idle CPS, kill coin/soul rewards (applyRewardMultipliers), prestige souls (soulMultiplier), SP spend on unlock.
- See §3 for historical prompt text; prefer editing `useGameState.js` + `skillTree.js` in Cursor for balance changes.
```

---

## 3. Alignment sprint (skill tree ↔ economy)

Do this **before** big Part C features. Pick **one** tool (or do the work in Cursor, then push).

### 3a. CURSOR — recommended wording

Copy into Cursor chat (add `@` to files as you attach them):

```text
In this Slayer Idle repo (@src/hooks/useGameState.js @src/lib/skillTree.js), align the skill tree with the combat economy:

1) Wire getSkillMultipliers(state.unlockedSkills) into useGameState so tap damage, idle damage/CPS, and coin rewards from kills respect damageMultiplier, idleMultiplier, coinDropMultiplier, soulMultiplier from skillTree.js.

2) Fix unlockSkill: when a skill is purchased, subtract skill.cost from slayerPoints in the same state update (only if prerequisites + SP are valid). Keep unlockedSkills and slayerPoints consistent.

3) Add a brief comment in skillTree.js listing which multiplier affects which stat.

Do not rename public components or change Game.jsx layout unless necessary. Preserve localStorage key idle_slayer_save; default new fields for old saves.
```

### 3b. BASE44 — paste this block

```text
In this Slayer Idle repo, align the skill tree with the combat economy:

1) Wire getSkillMultipliers(state.unlockedSkills) into useGameState so tap damage, idle damage/CPS, and coin rewards from kills respect damageMultiplier, idleMultiplier, coinDropMultiplier, soulMultiplier from skillTree.js.

2) Fix unlockSkill: when a skill is purchased, subtract skill.cost from slayerPoints (only if prerequisites + SP are valid in the same setState). Keep unlockedSkills and slayerPoints consistent.

3) Add a brief comment in skillTree.js listing which multiplier affects which stat.

Do not rename public components or change the overall Game.jsx layout unless necessary. Preserve localStorage save key idle_slayer_save; if you add fields, default them for old saves.
```

---

## 4. Phased roadmap (after alignment)

**CURSOR** for rows that are mostly numbers (`getEnemyHP`, prestige, `gameData`). **BASE44** (or Part C in the prompt pack) for UI-heavy work (runner, quests UI, minions screen). **One theme per session** either way.

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

## 5. Footer copy

[`Game.jsx`](../src/pages/Game.jsx) uses an original tagline: **SLAYER IDLE • TAP & PRESTIGE RPG** (no “clone” wording).

---

## 6. References & paired doc

- **All Base44 copy-paste prompts (Parts A–D):** [BASE44_PROMPT_PACK.md](./BASE44_PROMPT_PACK.md)
- Base44 prompt formula: [Prompt guide](https://docs.base44.com/Getting-Started/Prompt-guide)
- GitHub sync: [Using GitHub](https://docs.base44.com/Integrations/Using-GitHub)
