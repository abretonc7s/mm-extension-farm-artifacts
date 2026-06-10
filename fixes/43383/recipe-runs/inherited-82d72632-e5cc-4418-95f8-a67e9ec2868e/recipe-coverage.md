# Recipe Coverage — TAT-3312

Bug: extension perps order-entry shows a false "Insufficient funds" error when the size slider is set to 100%.

## Before/after evidence (read directly)

- `before-evidence-ac1-submit-insufficient.png` — buggy build: Size **$64.15** at 100% slider (leverage 3x, Available 21.38 USDC), submit button is grey/disabled reading **"Insufficient funds"**.
- `after-ac1-submit-actionable.png` — fixed build: Size **$64.14** at 100% slider (same balance/leverage), submit button is white/enabled reading **"Open long ETH"**.

The visible delta (64.15 → 64.14; "Insufficient funds" disabled → "Open long ETH" enabled) matches the bug → fix in TASK.md exactly. Confirmed by reading both images.

## Coverage matrix

| # | AC (verbatim) | Proof mode | Primary evidence | Recipe nodes (IDs) | Visual file | Evidence verdict | Justification |
|---|---------------|------------|------------------|---------------------|-------------|------------------|---------------|
| 1 | On the perps order-entry screen with a funded account, setting size to 100% must NOT show "Insufficient funds": submit button shows the normal trade action label ("Open long ETH") and is enabled. | mixed | screenshot + state (ui.wait_for on visible submit-button text) | `setup-navigate-order-entry`, `gate-wait-balance`, `ac1-set-max-size`, `ac1-assert-submit-actionable`, `ac1-screenshot-submit-actionable` | after-ac1-submit-actionable.png (before-evidence-ac1-submit-insufficient.png) | PROVEN | Verify recipe drives the real `balance-percent-input` to 100% via `ui.set_input` (no injection) and asserts the button reads "Open long ETH" (`ac1-assert-submit-actionable`, ok=true). Baseline recipe asserts the buggy "Insufficient funds" (8/8 pass on unfixed build). Reverting the fix makes `ac1-assert-submit-actionable` time out. Screenshots visibly prove the delta. |

## Trace cross-check

- Verify run (`recipe.json` on fixed build): `summary.json` status=pass, 8/8 nodes ok=true (`trace.json`). Every `ac1-*` node ok=true.
- Baseline run (`recipe-baseline.json` on buggy build): status=pass, 8/8 ok=true — confirms the buggy value before the fix.

## Forbidden-pattern scan

No `switch`/`default` routing, no skip-reason strings, no `wait`>500ms (only `ui.wait_for`), no DOM-only visual-ordering claim, all node IDs prefixed `setup-`/`gate-`/`ac1-`/`teardown-`, visual AC has a screenshot, no UNTESTABLE, no UI value injection (input driven via `ui.set_input`). Clean.

Overall recipe coverage: 1/1 ACs PROVEN (untestable: none, weak: 0, missing: 0)
