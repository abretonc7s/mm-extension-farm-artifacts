# PR 45956 — Comment Triage Report

**PR:** [feat(perps): add market category pills to the Perps tab](https://github.com/MetaMask/metamask-extension/pull/45956)
**Branch:** `TAT-3848-feat-add-perps-category-pills` @ `d76f1431b5`
**Ticket:** TAT-3848
**Mode:** interactive PR-complete re-entry (no push, no GitHub replies unless operator asks)

## Context reload

**Inherited context: present** — family `40132b1e-3bc8-446c-aeef-d6f1bdf2aa4d`, root ref TAT-3848.

| Artifact | Path | Notes |
|---|---|---|
| Original task | `inputs/inherited/TASK.md` | original feature-build task |
| Worker report | `inputs/inherited/report.md` | 24 files, +1628/-220; all gates green at time of build |
| Learnings | `inputs/inherited/learnings.md` | 5 entries; see key ones below |
| Validation recipe | `artifacts/recipe.json` (= `inputs/inherited/recipe.json`) | trusted, `family-inherited` provenance |
| Recipe quality | `inputs/inherited/recipe-quality.json` | |
| Recipe coverage | `inputs/inherited/recipe-coverage.md` | |
| Evidence manifest | `inputs/inherited/evidence-manifest.json` | 3 capture-helper PNGs |
| Missing | task recipe library | not needed — single trusted recipe present |

Prior run reported: 25/25 recipe nodes ok, `mm-harness check diff --profile full` green,
`verify-locales` and `circular-deps:check` green, 4 ACs covered (AC1 visual, AC2 mixed, AC3 test,
AC4 state).

Key inherited learnings carried into this session:

- Extension serves from a `runtime-dist` snapshot — every source edit needs `mm-harness launch --verify`
  before the recipe sees it.
- `--profile fast` skips typecheck; `MarketCategory` is a TS **enum**, `MarketType` is the string-literal
  union. Type changes need the full profile.
- `yarn verify-locales` requires `en_GB` byte-identical to `en`.
- Jest-backed recipe nodes need `assert_exit_code: 0` **plus** `assert_output contains "N passed"`.

## Operator directives (this session)

Given mid-run, and they override the PR's current design:

1. **All pills must sit next to each other with none hidden.** The measured overflow + "More" menu
   goes away; the rail wraps instead.
2. **The rail must not appear on Perps home.** Category pills live on the market list only.

These supersede the "Pills that do not fit move into a More menu" behaviour described in the PR body.

## Triage

| # | Source | Author | Where | Issue | Verdict |
|---|---|---|---|---|---|
| R1 | review, CHANGES_REQUESTED (2026-09-03, commit `1917a677`) | geositta | PR-level | Horizontal scroll is a mobile gesture pattern, not a web convention; hurts mouse tracking, keyboard focus tracking and low-vision users. Points at TAT-3854 / newer Figma. | **REAL** — horizontal scrolling was already removed on a later commit (measured fit + More menu). The residual objection — items hidden behind an interaction — is resolved by operator directive 1: nothing is hidden, the rail wraps. |
| R2 | review, CHANGES_REQUESTED (2026-09-08, commit `d76f1431`) | aganglada | PR-level | Follow Figma: products on Perps home (`node-id=13192-28387`) and category pills on market list (`node-id=12608-47643`). | **REAL, partially addressed.** Directive 2 implements the structural half — the pill rail leaves Perps home, so home is free for the separate Products design, and pills remain on the market list. Pixel-level fidelity to both Figma nodes is **not** verifiable in this session (no Figma access) and is left as operator/manual work. |
| C1 | inline review comment `3926005019` (commit `40ec3706`) | cursor[bot] | `ui/components/app/perps/dropdown/dropdown.tsx` | "More menu skips keyboard focus" — `selectedId` is `null` so the focus-the-selected-option path never runs; keyboard users cannot walk the overflowed categories. | **REAL then, MOOT now.** It was already fixed on a later commit (`focusIndexOnOpen` falls back to `0`). Directive 1 deletes the More menu outright, so the `Dropdown` changes it required are reverted and the reported code path no longer exists. |
| C2 | inline review comment `3949510605` (commit `d76f1431`) | cursor[bot] | `ui/pages/perps/market-list/index.tsx:273` | "Stuck New filter cannot return to All" — `?filter=new` is honoured even when `new` is absent from the rail (no uncategorized markets). There is no `All` pill and `onClear` only exists on the active pill, so nothing returns the list to every market. Watchlist already falls back to `all`; `new` does not. | **REAL** — fixed. `new` now falls back to `all` when no uncategorized market exists, mirroring the existing watchlist guard. |

No human issue comments on the PR. No other `CHANGES_REQUESTED` reviews.

## Fixes applied

All in commit `a5d94a0484` (pushed). File-by-file list and validation results in `report.md`.

| Comment | Action |
|---|---|
| C2 stuck `new` filter | `railCategories` keeps the active category on the rail when the data stops offering it; regression test added. Replied on thread [r3978389972](https://github.com/MetaMask/metamask-extension/pull/45956#discussion_r3978389972). |
| C1 More-menu focus | Resolved by removing the menu; `Dropdown` reverted to pre-PR behaviour. Replied on thread [r3978391651](https://github.com/MetaMask/metamask-extension/pull/45956#discussion_r3978391651). |
| R1 geositta | Nothing hidden any more — rail wraps, no scroller, no menu, every pill Tab-reachable. Needs their re-review to dismiss. |
| R2 aganglada | Structural half done (rail off Perps home, pills on market list). Figma fidelity unverified — left as manual work. |

Threads were **not** resolved and the two human reviews were **not** replied to, per operator
instruction (bot threads only).
