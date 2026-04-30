# TAT-2947 Report

## Summary
Fixed TP/SL RoE percent input display in the Perps Auto close modal so explicit positive and negative signs remain visible after the field blurs. The existing unsigned long stop-loss default behavior is preserved and covered: entering `5` in SL becomes `-5`.

## Root cause
`ui/components/app/perps/update-tpsl/update-tpsl-modal-content.tsx:185` recalculates the displayed RoE percent from the rounded trigger price on blur. That path used `formatRoePercent`, which omits a `+` prefix for positive values, so `+15` SL re-rendered as `14.99` after price conversion. Mobile's equivalent TPSL form displays signed RoE values when not focused; extension now uses a modal-local wrapper to add the positive sign without changing shared formatter behavior.

## Changes
- `ui/components/app/perps/update-tpsl/update-tpsl-modal-content.tsx` — Added signed RoE display formatting for the TP/SL modal and stable test IDs for TP/SL price and percent inputs.
- `ui/components/app/perps/update-tpsl/update-tpsl-modal-content.test.tsx` — Added focused coverage for positive SL sign preservation, negative TP sign preservation, and retained unsigned SL defaulting behavior.

## Test plan
Automated results:
- `node validate-recipe.js --recipe ../tasks/fix/tat-2947-0429-163157/artifacts/recipe.json --cdp-port 6665 --skip-manual` — PASS, 11/11 nodes.
- `yarn lint:changed && yarn verify-locales --quiet && yarn circular-deps:check` — PASS.
- `yarn jest ui/components/app/perps/update-tpsl/update-tpsl-modal-content.test.tsx --no-coverage` — PASS, 52 tests.
- `node temp/runtime/coverage-analyze.js` — PASS.

Manual Gherkin steps:
```gherkin
Given I have an open long perps position
When I open the Auto close modal and enter +15 in Stop loss RoE
Then the Stop loss RoE field keeps a visible + sign after blur

Given I have an open perps position
When I enter -15 in Take profit RoE
Then the Take profit RoE field keeps a visible - sign after blur

Given I have an open long perps position
When I enter 5 in Stop loss RoE
Then the Stop loss RoE field defaults to -5
```

## Evidence
- `before.mp4` — recipe run before the fix, failing at positive SL sign preservation.
- `after.mp4` — recipe run after the fix, passing all AC nodes.
- `after-evidence-ac1-positive-sl-sign.png` — positive SL sign visible.
- `after-evidence-ac2-negative-tp-sign.png` — negative TP sign visible.
- `after-evidence-ac3-unsigned-sl-negative.png` — unsigned SL value defaulted to negative.
- `recipe-coverage.md` — 3/3 ACs proven.
- `recipe-quality.json` — recipe quality verdict: pass.

## Ticket
TAT-2947: https://consensyssoftware.atlassian.net/browse/TAT-2947
