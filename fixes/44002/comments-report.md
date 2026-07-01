# PR 44002 — Comment Triage & Fix Report

PR: feat(perps): [Extension] Spike: de-risk performance impact of the expanded (extended) view
Branch: TAT-3461-feat-spike-expanded-view-perf
Integration: skipped (already up to date with origin/main)

## Triage

| # | Author | File:Line | Triage | Action |
|---|--------|-----------|--------|--------|
| 1 | cursor[bot] (3494838412) | perps-expanded-trade-panel.tsx:184 | ALREADY RESOLVED | TP/SL wrong path — thread already resolved; addressed by prior commit 956fb1b (two-step TP/SL via perpsUpdatePositionTPSL). No action. |
| 2 | cursor[bot] (3494838418) | perps-expanded-trade-panel.tsx:184 | ALREADY RESOLVED | Slippage guards missing — thread already resolved; addressed by prior commit 5999a4f (gated maxSlippageBps). No action. |
| 3 | cursor[bot] (3504485369) | perps-expanded-trade-panel.tsx:145 | REAL | High: slippage guard read stale `formSnapshot` while order placed from `formState` arg. Recompute market/amount from `formState` and require estimate inputs to match the submitted order before trusting the estimate. |
| 4 | cursor[bot] (3504485381) | perps-market-expanded-page.tsx:127 | REAL | Medium: `markets.length === 0` kept endless skeleton on empty hydration. Mirror production detail page — gate skeleton on `marketsLoading` alone; empty+loaded falls through to not-found terminal. |

## CI status (step 6e)

Failing checks:
- `Test lint` — **REAL**. `yarn lint` (tsc) fails with TS2556/TS2322 in this PR's new test files (`never`-typed mock arrays, spread-arg mocks, `undefined` route param). Fix in-scope test files.
- `SonarCloud Code Analysis` — **OUT_OF_SCOPE** (spike PR).
- `check-pr-max-lines` — **OUT_OF_SCOPE** (spike PR).

## Fixes applied

- `ui/components/app/perps/perps-market-expanded/perps-expanded-trade-panel.tsx` — submit-time slippage guard now derived from authoritative `formState`; estimate only trusted when snapshot inputs match the submitted order.
- `ui/pages/perps/perps-market-expanded-page.tsx` — skeleton gated on `marketsLoading` only (mirrors production detail page); empty+loaded → not-found.
- `ui/pages/perps/perps-market-expanded-page.test.tsx` — typed mocks; updated empty-markets test to expect not-found (matches fix #381).
- `ui/components/app/perps/perps-market-expanded/perps-expanded-header.test.tsx` — typed `usePerpsLivePrices` mock (rest args).
- `ui/components/app/perps/perps-market-expanded/perps-expanded-positions-panel.test.tsx` — typed positions/orders mock arrays.

## Summary

- Total comments triaged: 4 inline cursor[bot] + 3 CI checks = 7.
  - REAL: 5 (2 already-resolved from prior commits, 2 fixed this run, 1 CI Test lint fixed this run).
  - OUT_OF_SCOPE: 2 (SonarCloud, check-pr-max-lines — spike).
  - FALSE POSITIVE: 0.
- Commit for fixes: `48791f5167`.
- Files changed: 5 (2 source, 3 test).
- Recipe re-validation: PASS 35/35.
- Merge-main status (step 3): `skipped` (already up to date with origin/main).

## Validation

- Local changed-file gate: PASS (lint:changed, verify-locales, circular-deps).
- oxfmt (PR files): PASS.
- Full tsc (`yarn lint:tsc`): PASS (exit 0) — resolves the `Test lint` CI failure.
- Jest (3 changed test files): 34/34 PASS.
- Coverage: PASS (new code 97%).
- Recipe re-validation (family-inherited, trusted): **PASS 35/35** against branch (already merged with origin/main).
