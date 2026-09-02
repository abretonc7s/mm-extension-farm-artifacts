# Report — TAT-3851 [Extension] Add a "Top movers" section to the Perps tab

**Ticket:** [TAT-3851](https://consensyssoftware.atlassian.net/browse/TAT-3851)

## Summary

Added a "Top movers" section to the Perps tab that ranks the live perps markets by 24h price
change and shows the top eight as a 2-column × 4-row pill grid. A Gainers/Losers toggle flips the
ranking direction in place, and the section header opens the full market list already sorted by
price change in the selected direction.

## Changes

| File | Change |
|---|---|
| `ui/components/app/perps/perps-top-movers/perps-top-movers.tsx` | New section: clickable header, Gainers/Losers toggle, pill grid, skeleton state. |
| `ui/components/app/perps/perps-top-movers/perps-top-mover-pill.tsx` | New pill: token logo, display ticker, signed 24h change coloured by direction. |
| `ui/components/app/perps/perps-top-movers/index.ts` | New barrel export. |
| `ui/components/app/perps/hooks/usePerpsTopMovers.ts` | New hook ranking the live market-list stream by `priceChange`, capped at `TOP_MOVERS_LIMIT`. |
| `ui/components/app/perps/perps-view.tsx` | Renders the section between Watchlist and Explore markets. |
| `ui/components/app/perps/constants.ts` | `PERPS_CONSTANTS.TOP_MOVERS_LIMIT = 8`. |
| `ui/pages/perps/market-list/index.tsx` | Seeds the initial sort from `sort` / `direction` search params, validated against the sort dropdown's own options. |
| `app/_locales/en/messages.json` | `perpsTopMovers`, `perpsTopMoversGainers`, `perpsTopMoversLosers`. |
| `test/mocks/metamask-perps-controller.js` | Added the `SOURCE_SECTION` property key, its `TOP_GAINERS` / `TOP_LOSERS` values, and `BUTTON_CLICKED.TOP_MOVERS` — all present in the real controller package but missing from this hand-maintained Jest mock. |
| Test files | New suites for the hook, section, and pill; new sort-deeplink cases on the market list; a Top-movers presence case on `perps-view`. |

## Acceptance criteria

| AC | Status | Evidence |
|----|--------|----------|
| Perps tab shows a "Top movers" section with a Gainers/Losers toggle | **PASS** | `evidence-ac1-top-movers-section.png` |
| Toggling re-sorts the visible pills without a full page reload/flash | **PASS** | `evidence-ac2-losers-selected.png` + absent-skeleton / present-list assertions |
| Header is clickable, navigating to the market list pre-sorted by 24h price change in the selected direction | **PASS** | `evidence-ac3-market-list-presorted.png` |
| Section renders a skeleton while live data loads | **PASS** | `perps-top-movers.test.tsx` — "renders the loading skeleton while market data is loading" |

Out of scope, as the ticket states: no server-side ranking — this is a client-side sort of
already-fetched market data.

## Test plan

- `yarn jest ui/components/app/perps/perps-top-movers ui/components/app/perps/hooks/usePerpsTopMovers.test.ts ui/components/app/perps/perps-view.test.tsx ui/pages/perps/market-list/index.test.tsx --no-coverage` → **113 passed**.
- `node temp/recipe/runtime/coverage-analyze.js` → **VERDICT: PASS**; 100% line coverage on all three new source files (`usePerpsTopMovers.ts`, `perps-top-movers.tsx`, `perps-top-mover-pill.tsx`).
- `mm-harness check diff --profile fast` → **pass** (policy-suppressions, eslint, oxfmt, jest).
- `mm-harness run artifacts/recipe.json` → **exit 0**, 30/30 nodes.

## Evidence artifacts

| File | What it proves |
|---|---|
| `evidence-ac1-top-movers-section.png` | The section on the Perps tab: header with chevron, Gainers selected, eight markets in a 2×4 grid, all positive and descending. |
| `evidence-ac2-losers-selected.png` | Losers selected: the same section, still on screen, now ranks the biggest fallers in red. |
| `evidence-ac3-market-list-presorted.png` | The market list opened from the header, sort reading "Price change", list ascending — matching the Losers direction. |
| `after.mp4` | The full run: open Perps, toggle, open the pre-sorted market list. |
| `before-perps-tab.png` | The Perps tab before the change (Watchlist, no Top movers). Captured for completeness; **omitted from the PR body** — the section is purely additive, so each after-shot carries its own AC and the before adds no signal. |

**Evidence fit:** AC1/AC2/AC3 are visual or mixed and each have a capture-helper screenshot
preceded by a `ui.wait_for` on the claimed target. AC4 is state-proved by a targeted jest case
rather than a screenshot: the perps stream is warm-cached in this slot, so the initial-loading
frame is not reliably reproducible on screen, and a staged screenshot would be weaker proof than
the assertion pair the test makes.

## Notes for the reviewer

- **`ButtonFilter` exists in `@metamask/design-system-react` 0.38.0.** The ticket's "MMDS gap"
  note holds only for `SegmentedControl` and `FilterButtonGroup`. `ButtonFilter` accepts
  `isActive` and applies its own selected styling, so the planned manual selected-state CSS was
  not needed. `aria-pressed` is set explicitly so the selection is exposed to assistive tech.
- **No feature flag.** Mobile gates this section on `selectPerpsTopMoversEnabledFlag`; the
  extension has no equivalent remote flag, and AC1 states the section shows on the Perps tab. A
  selector against an undefined flag would ship the section permanently dark. Worth confirming
  with product whether a staged rollout is wanted as a follow-up.
- **No live-price merge.** Mobile merges `usePerpsLivePrices` ticks because its base markets come
  from a REST snapshot. The extension's `usePerpsLiveMarketListData` already streams updated
  `change24hPercent`, so an extra all-symbol subscription would add load for no gain.
- **Jest controller mock gap.** `test/mocks/metamask-perps-controller.js` is a hand-maintained
  partial of `@metamask/perps-controller`'s analytics contract and was missing `SOURCE_SECTION`
  entirely. Only the keys this feature emits were added; the mock will keep drifting from the real
  package until it is generated rather than hand-written.
- **Recipe destination.** `recipe.json` lives in `artifacts/` only. If the team wants it as a
  reusable perps recipe it should graduate to `experimental-metamask-recipe-perps` — the ticket
  named no in-repo home, so nothing was added to the product repo.

## Self-Review Fixes

- `app/_locales/en_GB/messages.json:8064` — Mirrored the three new keys (`perpsTopMovers`,
  `perpsTopMoversGainers`, `perpsTopMoversLosers`) into `en_GB` via `yarn verify-locales:fix`.
  `development/verify-locale-strings.js` treats `en_GB` as a compliance locale that must exactly
  mirror `en`, so adding keys to `en` alone broke `yarn verify-locales`. Confirmed the gate now
  exits clean ("No invalid entries!"). This was mine to catch: I ran `lint:changed` during
  validation but not `verify-locales`, which the changed-file gate does not cover.
- `ui/components/app/perps/perps-top-movers/perps-top-movers.test.tsx:93` — Added two cases
  asserting the section's rendered i18n copy against the message file
  (`messages.perpsTopMovers.message` on the header, and both toggle labels), using the
  `enLocale as messages` import that the sibling perps tests in this directory already use.
  Every prior assertion selected by `data-testid`, so a missing or misspelled message key would
  render blank and still pass — which is exactly how the `en_GB` omission slipped through.
  Verified the new assertions are not tautological: temporarily misspelling
  `t('perpsTopMoversGainers')` as `t('perpsTopMoversGainerz')` produced 1 failed / 19 passed, and
  the source file was restored to its committed state afterwards.

### Re-validation after the fixes

- `yarn verify-locales` → clean exit, "No invalid entries!"
- `yarn jest …/perps-top-movers.test.tsx --no-coverage` → **20 passed** (was 18).
- `mm-harness check diff --profile fast` → **pass** (policy-suppressions, eslint, oxfmt, jest).
- `mm-harness run artifacts/recipe.json` → **exit 0, 30/30 nodes**, all three screenshots
  `provider=capture-helper`. `after.mp4` re-recorded against this run.
- `check-task-artifact-contract.mjs` → `TASK_ARTIFACT_CONTRACT_PASS`.

The one recipe side finding (a resource 404) is pre-existing, not introduced — the same 404
appears 8× in `baseline-run/diagnostics-app-log.txt`, captured before any of this work.
