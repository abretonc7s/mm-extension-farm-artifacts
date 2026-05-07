# TAT-3074 Report

## Summary
Fixed auto-close TP/SL generated trigger prices in the Perps order-entry screen so prices derived from percent input use shared market-aware Perps price precision. BTC and XYZ100 now display whole-number TP prices, PUMP is capped to six decimals, and ETH remains within the mid-range precision rule.

## Root cause
`ui/components/app/perps/order-entry/components/auto-close-section/auto-close-section.tsx:157` computed the TP/SL trigger price from RoE percent, then normalized every generated value with `price.toFixed(8)` and `parseFloat(...).toString()`. That hardcoded precision leaked excessive decimals into the rendered TP/SL price input and diverged from mobile/update-TP/SL formatting, which uses market-aware price precision.

## Changes
- `ui/components/app/perps/order-entry/components/auto-close-section/auto-close-section.tsx` — replaces hardcoded 8-decimal normalization with `formatPerpsFiat(..., PRICE_RANGES_UNIVERSAL)` and strips currency/grouping for editable input values.
- `ui/components/app/perps/order-entry/components/auto-close-section/auto-close-section.test.tsx` — adds focused coverage for BTC, PUMP, xyz:XYZ100, and ETH percent-derived TP prices.

## Test plan
Automated results:
- `yarn lint:changed && yarn verify-locales --quiet && yarn circular-deps:check` — passed.
- `yarn jest ui/components/app/perps/order-entry/components/auto-close-section/auto-close-section.test.tsx --no-coverage` — passed, 49 tests.
- `node temp/runtime/coverage-analyze.js` — PASS, changed file coverage 87%.
- `node validate-recipe.js --recipe temp/tasks/fix/tat-3074-0506-224809/artifacts/recipe.json --cdp-port 6661 --skip-manual` — passed, 29/29 nodes.

Manual Gherkin steps:
- Given MetaMask is unlocked and Perps is active, when the user opens `/perps/trade/BTC`, enables Auto close, and enters 7 in TP %, then the generated TP price has 0 decimals.
- Given the same flow on `/perps/trade/PUMP`, then the generated TP price has 6 decimals.
- Given the same flow on `/perps/trade/xyz:XYZ100`, then the generated TP price has 0 decimals.
- Given the same flow on `/perps/trade/ETH`, then the generated TP price has at most 1 decimal.

## Evidence
- Recipe coverage: `temp/tasks/fix/tat-3074-0506-224809/artifacts/recipe-coverage.md`
- Recipe quality: `temp/tasks/fix/tat-3074-0506-224809/artifacts/recipe-quality.json`
- Evidence manifest: `temp/tasks/fix/tat-3074-0506-224809/artifacts/evidence-manifest.json`
- Before video: `temp/tasks/fix/tat-3074-0506-224809/artifacts/before.mp4`
- After video: `temp/tasks/fix/tat-3074-0506-224809/artifacts/after.mp4`
- Before/after screenshots: `temp/tasks/fix/tat-3074-0506-224809/artifacts/screenshots/`

## Ticket
TAT-3074 — https://consensyssoftware.atlassian.net/browse/TAT-3074

## Self-Review Fixes
- `ui/components/app/perps/order-entry/components/auto-close-section/auto-close-section.tsx:42` — added named low-value trigger-price precision constants for the PUMP/sub-cent generated-price path.
- `ui/components/app/perps/order-entry/components/auto-close-section/auto-close-section.tsx:166` — preserves exactly six decimals for low-value percent-derived TP/SL trigger prices instead of stripping trailing zeros.
- `ui/components/app/perps/order-entry/components/auto-close-section/auto-close-section.test.tsx:735` — added a PUMP regression fixture for the live-market edge case that rounds to `0.002000`.

## Self-Review Fix Attempt: Image Diff Removal
- `app/images/blackfort.png` — restored to the pre-self-review-fix branch version.
- `app/images/default_nft.png` — restored to the pre-self-review-fix branch version.
- `app/images/icon-128.png` — restored to the pre-self-review-fix branch version.
- `app/images/icon-32.png` — restored to the pre-self-review-fix branch version.
- `app/images/icon-512.png` — restored to the pre-self-review-fix branch version.
- `app/images/linea-logo-testnet.png` — restored to the pre-self-review-fix branch version.
- The later self-review task revision changed the local parity gate to exclude repo-wide `lint:images` because those upstream PNGs are known pollution; with that updated gate, the image reversions are valid for this PR.

## Self-Review Fixes: Image/Test Cleanup
- `app/images/blackfort.png` — removed the unrelated binary diff from this branch.
- `app/images/default_nft.png` — removed the unrelated binary diff from this branch.
- `app/images/icon-128.png` — removed the unrelated binary diff from this branch.
- `app/images/icon-32.png` — removed the unrelated binary diff from this branch.
- `app/images/icon-512.png` — removed the unrelated binary diff from this branch.
- `app/images/linea-logo-testnet.png` — removed the unrelated binary diff from this branch.
- `ui/components/app/perps/order-entry/components/auto-close-section/auto-close-section.test.tsx` — replaced the new market-precision regression's `fireEvent.focus`/`fireEvent.change` usage with `userEvent`.
- Verification: `yarn jest ui/components/app/perps/order-entry/components/auto-close-section/auto-close-section.test.tsx --no-coverage` passed with 49 tests; the updated non-image parity gate passed; recipe rerun passed 29/29 on CDP port 6661.
