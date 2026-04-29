# PR Review: #42232 - fix: default stop-loss percentage input to negative

**Tier:** full

## Summary
The PR aligns extension perps stop-loss percentage entry with mobile-style default negative RoE entry, adds liquidation-safety validation for stop-loss triggers, wires the validation into order submit/save gating, and updates tests. The implementation matches the stated goal on the order-entry path, and the changed modal path is covered by Jest but was not browser-proven in this CDP slot.

## Recipe Coverage
# Recipe Coverage

Recipe: `artifacts/recipe.json`

Trace evidence: `artifacts/evidence/trace.json` recorded 39 entries, 33 `ac<N>-` entries, and 0 failures. Runner stdout reported `38/38 passed` in `artifacts/evidence/recipe-run.log`.

| # | AC (verbatim) | Target env | Recipe nodes (IDs) | Screenshot filename | Visual verdict | Justification |
|---|---|---|---|---|---|---|
| 1 | "Initial unsigned SL percentage entry now defaults to negative RoE, so `10` becomes `-10`." | fullscreen | `ac1-set-sl-percent-10`, `ac1-assert-sl-default-negative`, `ac1-screenshot-sl-negative` | `evidence/evidence-ac1-sl-negative.png` | PROVEN | Screenshot shows the SL percent field as `-10`; trace assertion also checks the derived SL price is below current price. |
| 2 | "Leading-zero SL percentage values normalize immediately, so `011` becomes `-11`, matching mobile-style keypad behavior." | fullscreen | `ac2-clear-sl-percent`, `ac2-set-sl-percent-leading-zero`, `ac2-assert-leading-zero`, `ac2-screenshot-leading-zero` | `evidence/evidence-ac2-leading-zero.png` | PROVEN | Screenshot shows `011` normalized to `-11`; trace assertion confirms the derived SL price is below current price. |
| 3 | "Zero remains neutral: `0` does not become `-0`." | fullscreen | `ac3-clear-sl-percent`, `ac3-set-sl-percent-zero`, `ac3-assert-zero-neutral`, `ac3-screenshot-zero-neutral` | `evidence/evidence-ac3-zero-neutral.png` | PROVEN | Screenshot shows the SL percent field as `0` without a negative sign. |
| 4 | "Users can still intentionally enter positive-RoE stop losses with `+10`, or by editing an existing signed value, as long as the resulting trigger price passes current/entry-side and liquidation-safety validation." | fullscreen | `ac4-clear-sl-percent`, `ac4-set-sl-percent-plus`, `ac4-assert-explicit-plus`, `ac4-screenshot-explicit-plus` | `evidence/evidence-ac4-explicit-plus.png` | PROVEN | Screenshot shows explicit `+10` preserved. The order-form path correctly treats the resulting long SL as current-side invalid, so the field remains editable but submit is not allowed for that invalid price. |
| 5 | "In the edit TP/SL modal for an existing perps position, repeat the same stop-loss percentage checks: 10 becomes -10; 011 becomes -11; 0 remains 0; +10 remains +10." | fullscreen | none | none | UNTESTABLE | Browser recipe could create/close a position, but the current CDP route did not expose a visible edit TP/SL modal after row interaction. The changed modal behavior is covered by affected Jest tests. |
| 6 | "For a long position/order, enter a stop-loss price at or below the liquidation price. Expected: a stop-loss liquidation validation error is shown." | fullscreen | `ac6-set-long-liquidation-sl`, `ac6-assert-long-liquidation-error`, `ac6-screenshot-long-liquidation` | `evidence/evidence-ac6-long-liquidation.png` | PROVEN | Trace assertion verifies the liquidation error text. Screenshot shows a long order with SL `$1`, liquidation `$1,576.5`, and disabled submit state. |
| 7 | "For a short position/order, enter a stop-loss price at or above the liquidation price. Expected: the same validation error is shown." | fullscreen | `ac7-nav-eth-market`, `ac7-open-short-form`, `ac7-wait-short-order`, `ac7-set-short-amount`, `ac7-enable-auto-close`, `ac7-set-short-liquidation-sl`, `ac7-assert-short-liquidation-error`, `ac7-screenshot-short-liquidation` | `evidence/evidence-ac7-short-liquidation.png` | PROVEN | Trace assertion verifies the liquidation error text. Screenshot shows a short order with SL `$999999`, liquidation `$3,029.3`, and disabled submit state. |
| 8 | "For liquidation validation, also expect the submit/save action to be disabled." | fullscreen | `ac8-assert-order-disabled`, `ac8-screenshot-order-disabled` | `evidence/evidence-ac8-submit-disabled.png` | PROVEN | Screenshot and trace assertion show the order submit action disabled for liquidation-invalid SL. Modal save disabled is covered by Jest but not browser-proven because AC5 modal setup was untestable in this slot. |
| 9 | "Confirm normal valid TP/SL behavior still works: Enter valid take-profit and stop-loss prices. Expected: no validation errors. Expected: submit/create/update action remains enabled when all other required fields are valid." | fullscreen | `ac9-set-valid-long-tpsl`, `ac9-assert-valid-long-tpsl`, `ac9-screenshot-valid-long-tpsl` | `evidence/evidence-ac9-valid-tpsl.png` | PROVEN | Screenshot shows valid TP/SL values and enabled submit on the order form. The update-modal path is covered by affected Jest tests but not browser-proven because AC5 modal setup was untestable. |
| 10 | "One margin calculation test also still asserted against the fallback balance field after the implementation moved to tradeable balance." | fullscreen | `ac10-probe-tradeable-balance`, `ac10-screenshot-balance-context` | `evidence/evidence-ac10-balance-context.png` | PROVEN | Trace state probe captured account balance context where tradeable balance behavior matters; the direct margin-calculation assertion is covered by affected Jest tests. |

Caption audit: every evidence PNG has a visible HUD caption matching its screenshot note/caption metadata, and no orphan `baseline.png` or `final.png` evidence files were present.

Forbidden-pattern audit: no `manual` action, no `switch` default bypass, no skip-string `eval_sync`, no `wait` action over 500ms, and all task-specific nodes use `ac<N>-`, `setup-`, or `teardown-` prefixes.

Overall recipe coverage: 9/10 ACs PROVEN (untestable: AC5 browser modal path; weak: 0, missing: 0)

Untestable: AC5 browser modal path. Unit coverage exists, but a human reviewer should validate the edit TP/SL modal interaction manually before merging.

> Coverage escalation: AC5 not proven in browser.
> Reason: the current CDP route did not expose a visible edit TP/SL modal after position setup and row interaction.
> Human reviewer must validate the edit TP/SL modal manually before merging.

## Prior Reviews
| Reviewer | State | Date | Addressed? | Notes |
|----------|-------|------|------------|-------|
| cursor | COMMENTED | 2026-04-28T21:24:37Z | N/A | No `CHANGES_REQUESTED`; commits were pushed afterward through `c4cb3734`. |
| geositta | COMMENTED | 2026-04-28T22:22:15Z | N/A | No `CHANGES_REQUESTED`; commits were pushed afterward through `c4cb3734`. |
| cursor | COMMENTED | 2026-04-28T23:09:51Z | N/A | No `CHANGES_REQUESTED`; commits were pushed afterward through `c4cb3734`. |
| geositta | COMMENTED | 2026-04-28T23:53:16Z | N/A | No `CHANGES_REQUESTED`; commits were pushed afterward through `c4cb3734`. |

## Acceptance Criteria Validation
| # | Criterion | Status | Evidence |
|---|---|---|---|
| 1 | Unsigned SL percent `10` defaults to `-10`. | PASS | `ac1-*`; screenshot `evidence-ac1-sl-negative.png`; Jest affected suites passed. |
| 2 | Leading-zero `011` normalizes to `-11`. | PASS | `ac2-*`; screenshot `evidence-ac2-leading-zero.png`; helper and component tests passed. |
| 3 | Zero remains neutral. | PASS | `ac3-*`; screenshot `evidence-ac3-zero-neutral.png`; helper tests passed. |
| 4 | Explicit `+10` is preserved. | PASS | `ac4-*`; screenshot `evidence-ac4-explicit-plus.png`; modal/order tests passed. |
| 5 | Edit TP/SL modal repeats the same SL percent behavior. | UNTESTABLE | Browser modal path unavailable in current CDP route; Jest `update-tpsl-modal-content.test.tsx` passed. |
| 6 | Long SL at/below liquidation shows validation error. | PASS | `ac6-*`; trace assertion verified error text; screenshot shows invalid long context and disabled submit. |
| 7 | Short SL at/above liquidation shows validation error. | PASS | `ac7-*`; trace assertion verified error text; screenshot shows invalid short context and disabled submit. |
| 8 | Liquidation-invalid submit/save action is disabled. | PASS | `ac8-*` proves order submit disabled; modal save disabled covered by Jest. |
| 9 | Valid TP/SL has no errors and keeps action enabled. | PASS | `ac9-*`; screenshot `evidence-ac9-valid-tpsl.png`; Jest passed. |
| 10 | Tradeable-balance behavior is covered. | PASS | `ac10-*` state probe plus Jest tradeable-balance tests passed. |

## Code Quality
- Pattern adherence: follows existing perps React hook/component patterns and uses shared utilities rather than duplicating validation.
- Complexity: appropriate; the new pure helpers keep the duplicated order-form/modal logic small.
- Type safety: `yarn lint:tsc` fails in this checkout. The failures are largely around `availableToTradeBalance` not existing on `AccountState`, plus one unrelated messenger import error; these were not present as changed lines in `/tmp/pr-42232.diff`.
- Error handling: liquidation validation is fail-closed for concrete invalid prices and fail-open for incomplete/unknown inputs, matching existing TP/SL validation behavior.
- Anti-pattern findings: no import-boundary, LavaMoat, controller, MV3, migration, or dependency issue found in the PR diff. The edit TP/SL modal lacks stable input test ids, which made live modal proof hard, but this is a testability gap rather than a merge-blocking code defect in the changed lines.

## Fix Quality
- **Best approach:** shared `tpslInput` and `tpslValidation` helpers are the right pragmatic boundary because both the order form and edit modal need identical signed-percent and liquidation-safety rules.
- **Would not ship:** no PR-specific code defect found. I would not merge without either a passing required typecheck in CI or confirmation that the current `AccountState` type failures are a known baseline unrelated to this PR.
- **Test quality:** strong. Tests cover initial unsigned, leading zeros, zero, explicit signs, delete-leading-minus behavior, long/short liquidation errors, disabled submit/save, and tradeable-balance behavior.
- **Brittleness:** no import-time or stale module-level state issue found. Modal browser automation remains brittle because the live modal path is not reliably reachable with current selectors/flows.

## Live Validation
- Recipe: generated
- Result: PASS for executed recipe nodes; `38/38 passed`, trace recorded 33 AC nodes and 0 failures
- Evidence: 9 AC screenshots; video recording failed to produce `review.mp4` even though `browser.pid` existed, so evidence is screenshots plus trace/logs
- Webpack errors: none found in the checked build completion path
- Log monitoring: recipe run captured 14 non-gating unexpected events: selector memoization warnings, `Unknown action` console errors, and `Sentry not initialized`. HUD warnings occurred twice during network-toggle reloads; all AC nodes passed after those reloads.

## Correctness
- Diff vs stated goal: aligned for order form and unit-covered modal behavior.
- Edge cases: explicit signs, leading zeros, zero, formatted price parsing, long/short liquidation boundaries, and missing liquidation price are covered.
- Race conditions: no new async race found in the reviewed code paths.
- Backward compatibility: preserved; incomplete/unknown inputs remain non-blocking and existing signed values remain editable.

## Static Analysis
- lint:tsc: FAIL — multiple errors, mainly `availableToTradeBalance` missing on `AccountState`, plus a separate messenger import error. The `availableToTradeBalance`/`getTradeableBalance` lines are not present in the PR diff, so no line comment is attached.
- Tests: PASS — 6/6 affected Jest suites, 220/220 tests.

## Mobile Comparison
- Status: ALIGNED
- Details: mobile `PerpsTPSLView` defaults first non-zero stop-loss percentage keypad input to negative while preserving zero and signed edits. Mobile `PerpsOrderView.test.tsx` also validates long/short liquidation warnings and disabled order submission. The extension changes match that behavior.

## Architecture & Domain
No LavaMoat or dependency impact. No controller/state migration needed. The PR stays in UI/shared perps utilities and does not add MV3-sensitive background behavior. The new locale key is structurally valid.

## Risk Assessment
- MEDIUM — this touches perps order-entry and risk-management validation, which can block or allow order submission. The implementation and tests are solid, but the edit TP/SL modal still needs manual browser confirmation because recipe coverage could not reach that modal.

## Recommended Action
COMMENT

No changed-line must-fix finding was found. Before merge, resolve or acknowledge the failing `yarn lint:tsc` result and manually validate AC5 in the edit TP/SL modal.
