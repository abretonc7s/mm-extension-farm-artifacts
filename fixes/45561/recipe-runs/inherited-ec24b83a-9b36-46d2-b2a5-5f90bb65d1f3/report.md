# TAT-3763 — Perps available-to-trade percentage truncated on initial load

## Summary

The Perps order form seeded its initial `balancePercent` rounded to two decimals, so the percentage
pill next to the size slider rendered a value like `0.44` whose text overflowed the pill's fixed
`4.5rem` field and was clipped by the browser — the reported `22...`. Rounding the seed to a whole
percent makes initial load agree with the slider's `step={1}` grid and with every user-driven write
path, which is why the value already "corrected itself" the moment the user touched the slider.

## Root cause

`ui/hooks/perps/usePerpsOrderForm.ts:75` (pre-fix) —
`balancePercent: Math.round(initialBalancePercent * 100) / 100`.

Data flow:

1. `usePerpsOrderForm.ts:67-75` — on mount in `new` mode, `initialMarginRequired = defaultAmount /
   leverage` (`$10 / 3` from `TRADING_DEFAULTS`), then
   `initialBalancePercent = (initialMarginRequired / balance) * 100`. Against the slot's live
   tradeable balance of `756.36 USDC` that is `0.4407…`, stored as `0.44`.
2. `usePerpsOrderForm.ts:300-305` / `357-361` / `403-425` — the 2-decimal value lands in
   `formState.balancePercent` via the initial state, the reset sync, and the balance-change sync.
3. `order-entry.tsx:320` → `AmountInput`'s `balancePercent` prop.
4. `amount-input.tsx:90-91` seeds the pill's text as `String(balancePercent)` → `"0.44"`;
   `amount-input.tsx:484` feeds the same raw value to `PerpsSlider`, whose `step` is `1`.
5. `amount-input.tsx:488` renders it in a fixed `4.5rem` field. Measured live, `scrollWidth` (50px)
   exceeds `clientWidth` (45px), so the text is clipped.

Line 75 was the **only** producer of a fractional `balancePercent`. All five other writers already
round to whole numbers — `handleSliderChange` (`amount-input.tsx:299`, `step={1}`),
`handleAmountChange` (`:187`), `handleTokenAmountChange` (`:252`), `handlePercentInputChange`/`Blur`
(`:325`/`:351`, `parseInt`), and `handleLeverageChange` (`usePerpsOrderForm.ts:607`) — which is
exactly why the defect was confined to initial load.

**Mobile alignment:** mobile's `usePerpsOrderForm.ts:194` carries the identical 2-decimal expression,
but mobile keeps `balancePercent` as internal form state and never renders it. The visible percentage
pill is Extension-only, so the Extension surfaced a precision mobile never displays. Fixing at the
hook keeps the single source of truth consistent for all three consumers (pill, slider thumb, and the
`ORDER_SIZE_PERCENT` analytics property at `perps-order-entry-page.tsx:667`). This is a percentage,
not a fiat value, so `perps-rules-decimals.md`'s `formatCurrencyWithMinThreshold` rule does not apply
and no `toFixed` was introduced.

## Changes

| File | Change |
|---|---|
| `ui/hooks/perps/usePerpsOrderForm.ts` | Seed `balancePercent` with `Math.round(initialBalancePercent)` instead of `Math.round(initialBalancePercent * 100) / 100`, with a comment explaining the pill/slider contract. |
| `ui/hooks/perps/usePerpsOrderForm.test.ts` | Added two revert-sensitive regression tests for whole-percent seeding (including the ticket's `22.22 → 22` case); retuned one existing test's balance fixture from 1000 to 100 so its 10x-vs-3x assertion stays meaningful under whole-percent rounding. |

Commit: `91f094d46f` (local only — not pushed).

## Test plan

**Automated**

- `yarn jest ui/hooks/perps/usePerpsOrderForm.test.ts --no-coverage` → **41 passed**.
- Revert check: with the one-line fix reverted, the two new tests fail (`Expected: 22, Received:
  22.22`), confirming they are revert-sensitive rather than tautological.
- `mm-harness check diff --profile fast` → **pass** (policy-suppressions, eslint, oxfmt, jest).
- `yarn lint:changed && yarn verify-locales --quiet && yarn circular-deps:check` → **pass**
  (0 errors; 9 pre-existing `react-hooks/refs` warnings in untouched code).
- `node temp/recipe/runtime/coverage-analyze.js` → **VERDICT: PASS** (98% of the changed file).
- Recipe `artifacts/recipe.json` → **pass, exit 0, 24/24 nodes** against the rebuilt extension.
- Baseline recipe `artifacts/recipe-baseline.json` → **pass, exit 0, 24/24 nodes** against the
  unfixed tree, which is what makes the before-evidence captures honest.

**Manual (Gherkin)**

```gherkin
Feature: Perps available-to-trade percentage on initial load

  Background:
    Given the wallet is unlocked
    And the active account has a non-zero Perps tradeable balance

  Scenario: Initial load shows a clean rounded percentage
    When I open the Perps order form for a market at "#/perps/trade/ETH"
    Then the percentage pill beside the size slider shows a whole number
    And its text is not clipped or truncated
    And the slider thumb sits on its step=1 grid

  Scenario: Moving the slider still shows the correct value
    Given I am on the Perps order form
    When I click the size slider and press ArrowRight three times
    Then the percentage pill shows "3"
    And the size and margin rows update to match
```

## Evidence

All under `temp/tasks/fix/tat-3763-0815-072210/artifacts/`:

| Artifact | What it shows |
|---|---|
| `before-evidence-ac1-initial-load-percent.png` | Unfixed build: pill clipped to `0...` |
| `after-ac1-initial-load-percent.png` | Fixed build: clean `0 %`, fully visible |
| `before-evidence-ac2-after-slider-interaction.png` / `after-ac2-after-slider-interaction.png` | Interaction path, identical before and after (`3 %`) — non-regression. Marked `omit` in the evidence manifest as a redundant pair. |
| `before.mp4` / `after.mp4` | Full recipe replays (both verified to contain a `moov` atom) |
| `probe-baseline-initial-load.json` | Buggy state: `"0.44"`, `percentIsInteger: false`, `percentIsClipped: true`, `sliderIsOnStepGrid: false` |
| `probe-initial-load.json` | Fixed state: `"0"`, `percentIsInteger: true`, `percentIsClipped: false`, `sliderIsOnStepGrid: true` |
| `probe-after-interaction.json` | Post-interaction: `"3"`, integer, unclipped |
| `recipe.json` / `recipe-baseline.json` | Verify and baseline recipes |
| `recipe-run/trace.json` / `baseline-run/trace.json` | Node-level execution proof, 24/24 `ok: true` each |
| `recipe-coverage.md` | Per-AC coverage matrix — **2/2 ACs PROVEN**, 0 weak, 0 missing |
| `recipe-quality.json` | Recipe self-grade — verdict `pass` |
| `evidence-manifest.json` | Which evidence the gateway should embed in the PR body |

Every screenshot records `provider=capture-helper` in its run's `artifact-manifest.json` — no
`Page.captureScreenshot`, DOM-raster, or `macos-screencapture` fallback.

## Ticket

[TAT-3763](https://consensyssoftware.atlassian.net/browse/TAT-3763) — *[Bug]: Perps - Available to
trade percentage shows truncated decimal on initial load (e.g. "22...")*
