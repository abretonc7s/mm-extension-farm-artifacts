# PR Review: #44035 — feat(perps): single size input with USD/asset denomination toggle

**Tier:** standard

## Summary
The PR implements the stated PR-body behavior: a single Perps size input, USD/BTC toggle, live conversion, USD-backed calculations, percent input behavior, and per-market session persistence. The main blocker is accessibility: the new swap control is a clickable SVG, not a keyboard-focusable button.

PR hygiene: the task has no numbered ticket-bound acceptance criteria; this review evaluates PR-author claims. The linked ticket description says the default should be asset, while the PR body and implementation default to USD. Mobile currently uses USD as the primary amount with token equivalent secondary, so this looks like a ticket/PR wording mismatch to clarify rather than a code blocker.

## Recipe Coverage
# Recipe Coverage

| # | AC (verbatim) | Target env | Recipe nodes (IDs) | Screenshot filename | Visual verdict | Justification |
|---|---|---|---|---|---|---|
| 1 | "The Size field shows a single input with the \"USD\" unit and a swap icon" | fullscreen | setup-open-btc-market, setup-wait-size-input, setup-scroll-size-input, ac1-assert-usd-default, ac1-screenshot-usd-default | evidence-ac1-usd-default.png | PROVEN | Trace asserts exactly one size input, no old token field, USD unit, visible toggle, and accessible label; screenshot visibly shows the single USD Size input and swap icon. |
| 2 | "the input switches to the asset unit (e.g. \"BTC\")" | fullscreen | ac2-enter-usd-size, ac2-toggle-to-asset, ac2-assert-asset-unit, ac2-screenshot-asset-unit | evidence-ac2-asset-unit.png | PROVEN | Trace drives the toggle and asserts BTC unit; screenshot visibly shows the size input in BTC mode. |
| 3 | "the displayed value is the equivalent asset amount at the current price" | fullscreen | ac2-enter-usd-size, ac2-toggle-to-asset, ac2-assert-asset-unit, ac3-assert-equivalent-asset | evidence-ac2-asset-unit.png | PROVEN | The live DOM assertion parses the displayed BTC price and checks the BTC input value is within tolerance of USD size divided by price; the AC2 screenshot shows the same post-toggle value. |
| 4 | "the input switches back to \"USD\" showing the equivalent USD value" | fullscreen | ac4-toggle-back-usd, ac4-assert-usd-return | none | PROVEN | Trace drives the second toggle and asserts USD unit plus numeric USD value equivalent to 9000. Screenshot capture was unstable after AC2, so this is trace/DOM proof rather than image proof. |
| 5 | "the internal USD size used for margin/fees updates to amount x price" | fullscreen | ac5-toggle-to-asset-for-typing, ac5-type-asset-amount, ac5-assert-usd-calculations | none | PROVEN | Trace types 0.1 BTC and the live DOM assertion verifies margin and fee values become non-dash and margin roughly equals asset amount x current price / leverage. |
| 6 | "the size and balance percentage update correctly" | fullscreen | ac6-set-percent, ac6-assert-percent-updates-size | none | PROVEN | Trace sets the percent input to 50 and asserts the percent field, active BTC denomination, positive derived size, and non-dash margin. |
| 7 | "the size input is still in the asset denomination" | fullscreen | ac7-navigate-away, ac7-return-btc-market, ac7-wait-returned-size-input, ac7-assert-persisted-asset | none | PROVEN | Trace navigates away and back to the BTC trade route, then asserts the denomination unit remains BTC in the same session. |

Overall recipe coverage: 7/7 ACs PROVEN (untestable: none, weak: 0, missing: 0)

Overall recipe coverage: 7/7 ACs PROVEN
Untestable: none

## Prior Reviews
No prior reviews.

## Acceptance Criteria Validation
| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | The Size field shows a single input with the "USD" unit and a swap icon | PASS | ac1-assert-usd-default + evidence-ac1-usd-default.png |
| 2 | the input switches to the asset unit (e.g. "BTC") | PASS | ac2-toggle-to-asset, ac2-assert-asset-unit + evidence-ac2-asset-unit.png |
| 3 | the displayed value is the equivalent asset amount at the current price | PASS | ac3-assert-equivalent-asset |
| 4 | the input switches back to "USD" showing the equivalent USD value | PASS | ac4-assert-usd-return |
| 5 | the internal USD size used for margin/fees updates to amount x price | PASS | ac5-assert-usd-calculations |
| 6 | the size and balance percentage update correctly | PASS | ac6-assert-percent-updates-size |
| 7 | the size input is still in the asset denomination | PASS | ac7-assert-persisted-asset |

## Code Quality
- Pattern adherence: mostly follows local component patterns and keeps USD as source of truth.
- Complexity: appropriate; the session store is small and scoped.
- Type safety: `yarn lint:tsc` passed.
- Error handling: adequate for invalid numeric input and zero price fallback.
- Accessibility/fallbacks: missing button semantics for the new toggle.
- Anti-pattern findings: no dependency/LavaMoat, controller, migration, or MV3 issues. New interactive toggle has a `data-testid`, but it renders as an unfocusable SVG.

## Fix Quality
- **Best approach:** pragmatic and aligned with existing order form state. Ideal follow-up is to use an actual icon button component for the toggle.
- **Would not ship:** `ui/components/app/perps/order-entry/components/amount-input/amount-input.tsx:438` creates an interactive SVG without role/focus/keyboard activation.
- **Test quality:** strong unit coverage for conversion, partial token input, slider/percent behavior, and session persistence.
- **Brittleness:** module-level session store is acceptable for the stated current-session scope; tests reset it.

## Live Validation
- Recipe: generated
- Result: PASS, 24/24 trace nodes passed
- Evidence: 2 screenshots; video skipped (standard tier)
- Webpack errors: none observed
- Log monitoring: 30 seconds monitored, no new errors

## Correctness
- Diff vs stated goal: aligned with the PR body claims.
- Edge cases: zero/invalid input and locale-neutral decimal input covered by tests.
- Race conditions: none found in the reviewed state flow.
- Backward compatibility: close-position flow remains separate; no dependency or policy changes.

## Static Analysis
- lint:tsc: PASS
- Tests: 82/82 pass

## Mobile Comparison
- Status: ALIGNED
- Details: Mobile `PerpsAmountDisplay` keeps USD as the primary amount and token amount as an equivalent secondary display. The extension PR’s USD source of truth/default aligns with that mobile behavior, although the linked ticket wording says asset default.

## Architecture & Domain
No controller, migration, LavaMoat, or MV3 service worker impact. The new state is UI-session-only and per asset, matching the PR scope.

## Risk Assessment
- MEDIUM — order-entry UX is high-risk perps surface, and the functionality validated, but the new toggle is not accessible by keyboard.

## Recommended Action
REQUEST_CHANGES

Fix the denomination toggle semantics so it is a real button or exposes equivalent button role, tab focus, and keyboard activation.
