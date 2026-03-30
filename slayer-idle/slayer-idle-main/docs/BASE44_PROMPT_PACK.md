# Base44 prompt pack: Slayer Idle

## Where each tool uses this file

**Everything below that is a `text` block or a “Phase N” template is meant to be copied into Base44** (AI Controls or chat). **Do not paste those same blocks into Cursor**—Cursor works better with file paths and “implement X in `useGameState.js`.”

| If you want to… | Use **Base44** | Use **Cursor** |
|-----------------|----------------|----------------|
| Give the app a **lasting design brief** | Paste **Part A** into Base44 **AI Controls** | Optional: `@docs/BASE44_PROMPT_PACK.md` so the AI has context—**you are not pasting Part A as the whole message** |
| **First build** or **MVP refresh** | Paste **Part B** (greenfield **or** existing-repo version) | Say: “Implement Part B goals in this repo” + `@Game.jsx` `@useGameState.js` |
| **Add features** after MVP | Paste **one** block from **Part C** per chat turn | Say: “Do Phase 1 from `@docs/BASE44_PROMPT_PACK.md`” or describe the same feature with `@` files |
| **Runner too heavy** | Paste **Fallback** block | Same, or implement simplified runner locally |
| **See what’s already coded / file map / alignment fixes** | Optional short paste into Base44 | Read **[BASE44_MASTER_PROMPT.md](./BASE44_MASTER_PROMPT.md)** in Cursor (that doc is **Cursor-first**; it also has one Base44-paste block for alignment) |

**Rule of thumb:** **Base44** = paste the pre-written prompts from **this** file. **Cursor** = open the repo, `@` the files you care about, and ask in your own words (or “follow Phase N in BASE44_PROMPT_PACK.md”).

---

Use this file with [Base44’s prompt guide](https://docs.base44.com/Getting-Started/Prompt-guide): define **function**, **layout**, and **visual style**; build **one feature per message** after MVP.

### Checklist (Base44 only)

1. Copy **Part A** below into Base44 **AI Controls** (or paste at the start of a new project chat) — single source of truth for every follow-up.
2. Send **Part B** as your **first build message** (greenfield). If you already use the GitHub-linked repo, send **Part B (existing repo)** instead.
3. After MVP, send **one Part C prompt per phase**; re-paste the bullets from Part A when context gets stale.
4. If a real-time runner is too heavy, use **Fallback runner prompt** once, then continue Part C.

---

## Base44 vs Cursor (using both) — deeper detail

**Source of truth:** Treat **GitHub + your local repo** as canonical for game logic and state. After you change code in Base44, **pull or copy** those changes into this repo (or push from Cursor first so Base44 builds on the latest).

| Use **Cursor** for | Use **Base44** for |
|--------------------|--------------------|
| `useGameState.js`, prestige/save shape, damage & reward math | Pinning **Part A** in AI Controls and **one Part C message per feature** |
| `gameData.js`, `skillTree.js`, `achievements.js` (tables & formulas) | Layout experiments, new panels/tabs, “make the Run panel taller / mobile tabs” |
| Bugfixes, refactors, TypeScript/types, lint, tests | Quick UI polish, copy/tooltips, color tweaks when you want speed over a clean commit |
| Anything you want **reviewed line-by-line** before it ships | Prototyping a big UI idea you might throw away |

**Workflow that avoids conflicts**

1. **Cursor first** when touching `useGameState.js` / `gameData.js` / prestige or save keys—then **push** to GitHub before a big Base44 pass.
2. **Base44** for the next **single** feature from Part C; start the prompt with: *“The project is synced from GitHub at bearpixelmedia/slayer-idle—only change files that need to change for this feature.”*
3. End of session: if Base44 changed the app, **reconcile** (export/pull per [Base44 + GitHub docs](https://docs.base44.com/Integrations/Using-GitHub)) so Cursor matches production.

**What to paste into Base44 (feature prompts)**

- Always imply context: *“Slayer Idle Vite/React repo; follow MASTER SPEC in AI Controls.”*
- **Good Base44 asks:** “Add a quest panel below achievements; wire to a `QUESTS` array in `src/lib/` with three starter quests.” / “Restyle the skill tree cards to look more 16-bit; don’t change prestige math.” / “Add jump: spacebar + tap upper half of Run panel; keep existing tap-to-attack on enemy.”
- **Better in Cursor:** “Refactor `getEnemyHP` and `getEnemyReward` to use a shared difficulty curve + unit-style tests.” / “Fix skill unlock to deduct SP atomically.” / “Migrate save JSON with a `saveVersion` field.”

Codebase-specific fixes and file map live in [BASE44_MASTER_PROMPT.md](./BASE44_MASTER_PROMPT.md) (including the **alignment sprint** you can run in either tool).

---

## Part A — Master spec (full vision)

**BASE44 — paste this.** (Cursor: do not paste; use `@docs/BASE44_PROMPT_PACK.md` if you need the AI to read it.)

*Paste everything in the block into Base44 AI Controls or the start of a new project chat.*

```text
MASTER SPEC — SLAYER IDLE (original medieval-fantasy incremental game; inspired by idle + auto-runner + light RPG loops; not a clone of any existing commercial game—use original names, art, and balance)

1) PRODUCT ONE-LINER
Long-term incremental game mixing auto-run action with prestige: run → kill → earn → upgrade → intentional wall → ascend → repeat, scaling into absurd power over many loops.

2) WHO / WHAT / WHY
- Who: casual players through hardcore grinders who enjoy long progression arcs.
- What: manage an auto-running character; jump, attack, use abilities; collect coins and souls; buy upgrades; ascend for Slayer Points (SP); unlock a large skill tree that permanently changes future runs.
- Why: satisfying number growth, frequent early unlocks, layered complexity later, chill but grind-heavy tone.

3) CORE LOOP (NON-NEGOTIABLE)
- Auto-run forward; player: jump, attack, trigger abilities.
- Enemies drop coins (upgrades) and souls (main progression currency).
- Spend coins on weapons, gear, passive multipliers—next runs get faster.
- Progress MUST slow hard at walls (by design).
- Ascend (prestige): reset the current run to gain SP; SP unlocks permanent nodes in a huge skill tree (idle bonuses, combat boosts, feature gates like bow, minions, crafting).
- Repeat forever: faster loops, new systems unlocking over time.

4) CURRENCIES AND SINKS
- Coins → weapons, gear, passive income multipliers.
- Souls → main run/meta progression and gating as designed.
- Slayer Points → skill tree only (spent on unlock; not free infinite unlocks).
- Later: materials → crafting permanent upgrades and gear bonuses.

5) MAJOR SYSTEMS (BACKLOG PRIORITY — BUILD IN ORDER)
- MVP: core loop, one zone, sword, jump, simple upgrades, ascend + SP, small skill tree (about 5–15 nodes), basic achievements.
- v1.5: ascension polish, skill tree branches, combat depth, economy walls, bow + special abilities.
- Mid: zones/dimensions (different enemies/rewards; some bias souls vs coins vs materials), quests & achievements at scale (add in batches, e.g. tens then hundreds), RNG boxes/buffs during runs (coin/soul multipliers, frenzy—reward active play).
- Late: minions (idle missions → souls/materials), crafting, casino, village, armory, bosses, minigames—each as its own feature prompt.

6) IDLE VS ACTIVE
Not a pure idle game: idle progress is slow; active play (tapping, timing, abilities, RNG windows) must massively outperform passive/idle. Typical styles: casual few logins/day; optimized short sessions; hardcore long grinds.

7) PROGRESSION PHASES (PACING)
- Early: simple jump + upgrades; feels like a basic incremental.
- Mid: real walls; optimize ascensions and soul farming.
- Late: minions, crafting, stacked systems; progress slows a lot.
- Endgame: very slow scaling; optimization and long idle + activity bursts.

8) LAYOUT
Bento / dashboard hub: main Run panel (action view) on top; clear panels for currencies, Upgrades shop, Ascend, Skill tree, Achievements/Quests; on mobile use tabs so nothing critical is buried.

9) VISUAL STYLE
Retro 16-bit pixel fantasy; readable high-contrast UI; medieval fantasy theme; short tooltips.

10) MONETIZATION (DESIGN-ONLY UNLESS ASKED)
Free-to-play; optional ads and microtransactions for boosts; no forced ads; no paywall on the core loop.

11) SCOPE GUARDRAILS
Original IP only; if full physics auto-runner is constrained on the platform, use an abstracted runner (timed segments, side-scroller-lite, or timing windows) without removing run → earn → ascend → skill tree.
```

---

## Part B — First Base44 prompt (MVP only, greenfield)

**BASE44 — paste this** (first build message, empty project). **Cursor:** skip this block; clone the repo and run `npm run dev` instead.

```text
Create a web game app (single-player) called Slayer Idle—a medieval fantasy incremental game inspired by idle + auto-runner + light RPG loops.

Function: The player runs an auto-forward run where they jump and attack to defeat enemies, collect coins and souls, buy upgrades that make the next run faster, and eventually hit a wall where progress slows. They can Ascend to reset the current run in exchange for Slayer Points, which unlock a few starter nodes in a skill tree that permanently speeds up future runs.

Layout: Use a bento/dashboard layout: a main Run panel (the action view), plus clear panels for Upgrades, Currencies, Ascend, and a Skill Tree tab/section.

Visual style: 16-bit pixel retro fantasy, high-contrast readable UI.

Rules: Active play should feel much faster than leaving it idle. Persist player progress locally or with Base44’s default user data pattern.

MVP scope only: one zone, basic enemies, sword combat, jump, simple upgrades, ascend + SP, small tree (5–15 nodes), basic achievements counter. Do not build casino, village, or minigames yet.
```

### Part B — First prompt (existing GitHub repo)

**BASE44 — paste this** (first message when the app is already this GitHub repo). **Cursor:** use [BASE44_MASTER_PROMPT.md §3](./BASE44_MASTER_PROMPT.md) for the alignment sprint first, then feature work with `@` files.

```text
This repo is Slayer Idle (Vite + React). Extend the existing game—do not rebuild from scratch.

Implement and verify the full MVP loop on top of current code: auto-run feel + tap/attack to kill enemies, coins and souls, upgrade shop, intentional slowdown (walls) via enemy HP/reward scaling, Ascend for Slayer Points, a small skill tree (5–15 nodes) that costs SP and permanently boosts the player, and a basic achievements counter.

Layout: keep the bento/dashboard style—Run panel on top, then abilities, prestige, skill tree, achievements, upgrades.

Visual: 16-bit pixel fantasy, readable UI.

Rules: active play must outperform idle. Preserve localStorage saves or migrate with a save version field.

Do not add casino, village, or minigames in this message.
```

### After Part B — MVP verification (manual)

**You** (playtest in browser / `npm run dev`) — not something to paste into either AI. Confirm: **run / attack** → **earn coins (and souls if implemented)** → **buy upgrades** → **progress slows (wall)** → **Ascend** → **gain SP** → **unlock at least one skill tree node** → **achievements counter updates**. If anything is missing, fix in the next **Base44** message or **Cursor** task before Part C.

---

## Part C — Phased follow-up prompts (one message per phase)

**BASE44 — paste one phase block per chat message.** **Cursor:** same phases, but prompt like: “Implement Phase 1 from BASE44_PROMPT_PACK” + `@useGameState.js` `@GameCanvas.jsx` (Cursor will read the doc; you don’t need to paste the whole `text` block unless you want to).

After MVP works, add **one layer per message**. Each block below is a template for **Base44**.

| Phase | Theme | Send when… |
| ----- | ----- | ---------- |
| 1 | Combat depth | MVP loop is stable |
| 2 | Economy tuning | Combat feels flat or too fast |
| 3 | Ascension polish | Players prestige by accident or don’t understand SP |
| 4 | Skill tree expansion | Starter tree is bought out |
| 5 | Bow / abilities | You want weapon variety |
| 6 | Zones / dimensions | One zone feels done |
| 7 | RNG boxes / frenzies | You want active-play spikes |
| 8 | Quests & achievements | You want goals beyond numbers |
| 9 | Minions | You want a real idle layer |
| 10 | Crafting | You want materials sink |
| 11+ | Late meta | One prompt per feature: casino, village, armory, bosses, minigames |

**Phase 1 — Combat depth**

```text
Add combat depth: clearer attack feedback, more enemy variety or a mini-boss pattern, and explicit run end / death / revive or continue rules. Keep the prestige and currency model from the master spec. One feature slice only.
```

**Phase 2 — Economy tuning**

```text
Tune the economy for intentional walls: adjust enemy HP/reward scaling, coin costs, and soul gains so players feel a real slowdown before the next breakthrough. Expose the logic in one place (e.g. a data/config module) for easy tweaking.
```

**Phase 3 — Ascension polish**

```text
Polish Ascend: show preview of souls and Slayer Points gained, add a confirmation step, and short in-game copy explaining why resetting is good. Do not change the core prestige math unless fixing a bug.
```

**Phase 4 — Skill tree expansion**

```text
Expand the skill tree with branches for idle bonuses, combat boosts, and at least one gate that unlocks a future feature (e.g. bow). Nodes must cost Slayer Points. Follow the master spec idle-vs-active rule.
```

**Phase 5 — Bow / abilities**

```text
Add bow (or second weapon mode) and special abilities with cooldowns and visible UI. Bow should excel at soul farming or a distinct play pattern vs sword. Keep one message worth of scope.
```

**Phase 6 — Zones / dimensions**

```text
Add multiple zones or dimensions with unique enemy sets and different reward biases (souls vs coins vs future materials). Let the player move between unlocked zones from the dashboard.
```

**Phase 7 — RNG boxes / frenzies**

```text
During runs, add random short buffs (coin multiplier, soul boost, frenzy mode) with clear timers on screen. Bias proc rate or strength toward active play. One system, cleanly implemented.
```

**Phase 8 — Quests & achievements**

```text
Add a quest log and tracked achievements that unlock mechanics or areas later. Start with a modest set (e.g. 10–30); we can add hundreds in later batches. Tie rewards to master spec progression.
```

**Phase 9 — Minions**

```text
Add minions: send them on timed missions; rewards are souls and/or materials. This is the main idle layer—slower than active play but meaningful offline.
```

**Phase 10 — Crafting**

```text
Add materials from enemies, a crafting screen, recipes, and permanent or gear bonuses. Integrate with minions and zones without rewriting the whole economy in one shot.
```

**Phase 11+ — Late meta (one prompt each)**

```text
Add [casino | village building | armory | boss fights | named minigame] as a separate module. Do not refactor unrelated systems. Match master spec monetization (optional boosts only).
```

Between phases, use Base44 **Discuss mode** when you only want to plan: [AI chat modes](https://docs.base44.com/Building-your-app/AI-chat-modes).

---

## Part D — How to use this in practice

**BASE44** workflow below. **Cursor:** same order, but commits + push instead of “AI Controls.”

```mermaid
flowchart LR
  master[Part A in AI Controls]
  p1[Part B first build]
  iterate[Playtest]
  pn[Part C one phase at a time]
  master --> p1 --> iterate --> pn
```

- Paste **Part A** once; use **Part B** for the first implementation message.
- On every follow-up, repeat critical rules from Part A if the chat has lost context.
- If Base44 changes files you didn’t ask for, narrow scope with **AI Controls** ([customizing AI chat](https://docs.base44.com/Building-your-app/AI-chat-modes)).

---

## Fallback — Real-time runner impractical

**BASE44 — paste** if runner is unstable. **Cursor:** implement simplified runner locally, or paste this into Base44 if you want the builder to do it.

```text
Replace the full physics auto-runner with a simplified run model: e.g. auto-advancing segments, timing windows for jump/attack, or side-scroller-lite with minimal collision. Keep the same master loop: kill enemies, earn coins and souls, upgrades, walls, Ascend for Slayer Points, skill tree, active faster than idle.
```

---

## See also

- Codebase-specific notes, repo file map, and skill-tree alignment sprint: [BASE44_MASTER_PROMPT.md](./BASE44_MASTER_PROMPT.md)
