# PR #44324 — Comments Report (interactive re-entry)

## Context reload (step 3)

Inherited context: **present** (family `bda2ae18-62b0-40ec-afd1-8f21a0d9d9e4`, root `MANUAL-000001`).

Sources read:
- `inputs/inherited-context.json`, `inputs/inherited/TASK.md`
- `inputs/inherited/report.md` — controller analytics contract consumption (`@metamask/perps-controller@^9.2.1`), attribution wiring, duplicate client event removal
- `inputs/inherited/learnings.md` — alias layer in `shared/constants/perps-events.ts`, `mergeAttributionContext` in infrastructure, LavaMoat/hyperliquid caveats
- `inputs/inherited/recipe.json` + `recipe-quality.json` (verdict PASS, 5/5 AC PROVEN, state proof mode)
- Trusted recipe already promoted at `artifacts/recipe.json` (`RECIPE_SOURCE: family-inherited`)

Repo state at re-entry:
- Branch `MANUAL-000001-feat-consume-perps-controller-analy`, clean working tree
- Local HEAD `960d3aa90c` == `origin/MANUAL-000001-feat-consume-perps-controller-analy` (nothing unpushed)
- Prior review-fix commits already on branch: `10dc57c04b` (direction-switch gating, UTM merge, market-not-found), `5ef4165895`, plus LavaMoat MV3 policy fixes `3866c5e93c` / `960d3aa90c`

## Live PR state (step 5–6)

- PR OPEN, `headRefOid` = `960d3aa90c` (== local HEAD), `reviewDecision: REVIEW_REQUIRED`
- Review threads: 12 top-level. 9 `cursor[bot]` threads **resolved**; 3 `geositta` threads **unresolved**
- `geositta` review `4676166565` = CHANGES_REQUESTED (2 findings); later review `4678711613` = **DISMISSED** (was an approve-with-note, dismissed by subsequent pushes) carrying one remaining finding
- 2 human issue comments (both `abretonc7s`, own run/status notes)

## Triage

| # | Source | Author | Where | Verdict | Action |
|---|---|---|---|---|---|
| 1 | inline ×9 | cursor[bot] | order-entry 1275/1573, cancel-order 155, close-position 450, edit-margin 310, reverse-position 171, PerpsAttributionContext 250, deriveTradeAction 37, market-detail 496 | REAL (already fixed) | Fixed in earlier commits on branch; threads resolved. No action. |
| 2 | inline | geositta | `ui/pages/perps/perps-order-entry-page.tsx:516` — direction switch does not reset `hasUserEditedSizeRef`/`lastInputMethodRef` | REAL (already fixed) | Fixed in `10dc57c04b` (`orderDirection` added to reset effect + fake-timer regression test). Thread unresolved — reviewer-side resolution only. |
| 3 | inline | geositta | `ui/providers/perps/PerpsAttributionContext.tsx:279` — forwards latest partial UTM, controller `setAttributionContext` replaces wholesale | REAL (already fixed) | Fixed in `10dc57c04b` (`rememberSessionUtm` returns merged context; test added). Thread unresolved. |
| 4 | inline | geositta | `ui/pages/perps/perps-market-detail-page.tsx:484` — unknown symbol emits both asset_details and error screen views | REAL (already fixed) | Fixed in `10dc57c04b` (market memo hoisted, `Boolean(market)` gate, `resetKey: decodedSymbol`). Thread unresolved. |
| 5 | review body (DISMISSED `4678711613`) | geositta | order entry — "unknown symbol can still emit both trading and error, and the error hook does not reset between invalid symbols" | **REAL — open** | Confirmed in code: `perps-order-entry-page.tsx:348` trading screen view is not gated on `Boolean(market)` (market memo declared later at :459), and the error view at :471 has no `resetKey`. Same defect the market-detail page fix already addressed. **Fixed this session** (step 8). |
| 6 | issue ×2 | abretonc7s | conversation | OUT_OF_SCOPE | Author's own run report / SonarCloud coverage status update. No action. |
| 7 | issue ×18 | bots | conversation | OUT_OF_SCOPE | CI/bot status comments. No action. |

## Fix applied (step 8)

`ui/pages/perps/perps-order-entry-page.tsx` — mirrors the market-detail fix from `10dc57c04b`:
- `market` memo hoisted above the trading `usePerpsEventTracking` call (was declared ~150 lines later)
- trading screen view condition gained `&& Boolean(market)`
- market-not-found error screen view gained `resetKey: decodedSymbol`

`ui/pages/perps/perps-order-entry-page.test.tsx` — two regression tests:
- unknown symbol → exactly 1 `screen_type: error` view, 0 `screen_type: trading` views
- rerender with a second unknown symbol → 2 error views (resetKey re-arm)

## Validation

| Check | Command | Result |
|---|---|---|
| Unit | `yarn jest ui/pages/perps/perps-order-entry-page.test.tsx --no-coverage` | **PASS** — 98/98 tests, 158s |
| Lint gate | `yarn lint:changed && yarn verify-locales --quiet && yarn circular-deps:check` | **PASS** — 2 changed files linted, "No invalid entries!", "Circular dependencies check passed." |
| Runtime | `mm-harness launch --build --verify` | **PASS** — dist fresh, webpack compiled, fixture READY |
| Recipe | `mm-harness run artifacts/recipe.json --adapter extension` | **PASS** — 15/15 nodes, 13s (`artifacts/recipe-run/summary.json`) |

Recipe run side finding: 6 application warning events observed during the run, non-blocking, relation to task undetermined (`artifacts/recipe-run/diagnostics.json`).

### Recipe maintenance needed to run at all (both changes are recipe-only, no product impact)

1. **Schema migration** — the inherited recipe used the old `schema_version` + `validate.workflow` shape; installed `mm-harness@0.22.0` requires Recipe Protocol v1 (`$schema` + top-level `workflow`, and end nodes reject `intent`). Migrated in place at `artifacts/recipe.json`; the original is preserved at `inputs/inherited/recipe.json`.
2. **Stale assertion** — `ac4-assert-place-hl-fee-rate` grepped for `hlFeeRate: closeFeeRate`, but that local was renamed to `currentFeeRate` in `d6893f8f80` (before this re-entry). Updated the pattern; assertion now finds the expected 3 occurrences (place/modify/close). This was a stale recipe, **not** a product regression.

### Runtime blocker encountered (resolved)

First two `mm-harness run` attempts aborted with `Extension validation launcher timed out after 180000ms` plus `failed to resolve browser pid via lsof: spawnSync /bin/sh ETIMEDOUT` (machine contention during the validation-browser unlock). The third attempt after the rebuild succeeded. All 15 assertions were also verified independently by direct execution (`artifacts/recipe-run/manual-fallback/assertions.txt`).
