# PR #43383 — Comment Triage Report

## Comments

| # | Author | Type | Where | Triage | Action |
|---|--------|------|-------|--------|--------|
| 1 | github-actions[bot] | Bot | conversation | OUT OF SCOPE | CLA signature status — informational, no action |
| 2 | mm-token-exchange-service[bot] | Bot | conversation | OUT OF SCOPE | CODEOWNERS review notice — informational, no action |
| 3 | abretonc7s | User | conversation | OUT OF SCOPE | Auto-generated fix-bug worker report — informational, not a change request |

## Summary
- Inline review comments: 0
- CHANGES_REQUESTED reviews: 0
- Conversation comments: 3 (all informational bot/report posts — none request code changes)
- No bugbot / cursor[bot] findings present.

**No REAL review comments requiring code fixes.** Steps 7/8 (apply fixes, self-review) had nothing to address.

## Recipe re-validation (step 10)
**Result: PASS (3/3) — recipe rewritten to be drift-proof and to drive the form correctly.**

The inherited recipe was broken in two ways; both are fixed:

1. **Hardcoded live balance.** `gate-wait-balance` waited for the literal text `21.38`. The HyperLiquid testnet balance drifted to `20.96 USDC`, so the gate could never match. Fixed: the recipe no longer hardcodes any balance/amount; the driver waits for the live balance to stream in (non-zero) on its own.

2. **Harness can't drive this React form.** The harness `ui.set_input` assigns `el.value = x` directly (`@farmslot/recipe-harness/.../runtime/cdp.js:147`), which updates React's value-tracker and **suppresses `onChange`** — so `handlePercentInputChange` never fires and the amount never recomputes. Proven definitively: from a reset 0% form, a single harness `set_input "100"` leaves the percent at `100` but the amount empty (`"Order size must be at least $10"`). `ui.key_press` (which would fire a real keypress) is rejected by the manifest; `ui.press` only does JS `el.click()` (can't move the MUI slider). The original recipe's historical "8/8 pass" was a **false positive** — it matched a stale "Open long ETH" string left in the DOM by a prior manual drive, not a freshly-driven 100%.

**Fix:** the AC now uses a `command` node running `artifacts/drive-max-size.cjs`, which drives the percentage input via the React-correct **native value-setter** (`Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el),'value').set.call(el,'100')` + dispatch `input`) — the real user keystroke. It only sets the percentage INPUT and lets the app floor-compute the size (it does not write the amount/outcome). It waits for the live balance, drives 0→100%, then asserts the submit button reads "Open long ETH" and that "Insufficient funds" is absent (`assert_exit_code` = 0), and captures a screenshot at the verified moment.

- **3/3 passes**, each starting from a reset 0% form (button "$10 min"), so the pass genuinely required driving to 100% — not vacuous.
- **Visual proof** (`recipe-run/evidence-ac1-submit-actionable.png`): Available 20.96 USDC → Size $62.89 at 100% → Margin $21 ≤ 20.96 → "Open long ETH" enabled, no "Insufficient funds".
- **Drift-proof:** no balance/price/amount hardcoded anywhere.
- Also corroborated by unit tests: `amount-input.test.tsx` 39/39 pass (assert floor → `amount/leverage <= availableBalance`); coverage 97%.

**Harness bug surfaced (out of scope to patch):** `cdp.js` `setInput` should use the native value-setter so React `onChange` fires; the current direct `el.value =` breaks driving for every React-controlled input, not just this form.

## Merge-main status (step 3)
Clean merge of `origin/main` into `TAT-3312-fix-fix-size-slider-funds` — no conflicts, no yarn.lock change. Merge commit `fc47a22dc0`.

## Finalization (step 13)
- **Total comments: 3** (0 REAL, 0 FALSE POSITIVE, 3 OUT OF SCOPE — all informational bot/report posts).
- **Commit pushed:** `c8a48729cb` — "chore: merge main; prettier-format amount-input test" (merge-from-main `fc47a22dc0` + prettier whitespace fix). Pushed `5fbe772ff3..c8a48729cb`.
- **Files changed in this run:** `ui/components/app/perps/order-entry/components/amount-input/amount-input.test.tsx` (prettier whitespace only). No review-fix code (no actionable comments). Recipe/driver changes live under `temp/` (gitignored, not part of the PR).
- **Recipe re-validation:** PASS 3/3 (rewritten drift-proof + native-setter command driver).
- **Merge-main status:** clean.
- **CI parity gate:** `lint:changed` + `verify-locales` + `circular-deps:check` pass; unit tests 39/39; coverage 97%.
