# PR Review: #45268 — feat(perps): update extension to latest perps controller

**Tier:** light

## Summary

The PR correctly upgrades `@metamask/perps-controller` to v11, absorbs the widened error-code and order-type unions, preserves the existing Market/Limit UI behavior, and adds focused regression coverage for streamed TP/SL child deduplication. TypeScript and 145 focused tests pass. No merge-blocking code issue was found.

PR hygiene: the linked Jira description provides no acceptance criteria. This review therefore evaluates PR-author claims, not ticket-bound acceptance criteria. The PR description also says v11 adds 15 error codes, while its own breakdown and the controller changelog enumerate 14 (11 order-validation plus 3 exchange codes); the implementation covers all 14.

## Recipe Coverage

Skipped (tier: light).

Overall recipe coverage: 0/9 review claims PROVEN in browser

Untestable: claims 1-9 — light-tier policy skips recipe generation, CDP validation, and screenshots. Claims 1-5 were validated statically; claims 6-9 rely on the PR author's browser evidence and were not independently reproduced in this review.

## Prior Reviews

No prior reviews.

## Acceptance Criteria Validation

The linked ticket has no acceptance criteria, so the verbatim PR-author review claims are used below.

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | Upgrade to perps-controller v11 and fix the widened error/order type compile breaks | PASS | `package.json`/`yarn.lock` resolve v11; `yarn lint:tsc` passes |
| 2 | New `ORDER_*` codes map to `perpsOrderFailed` and cancel flows remap that key | PASS | Exhaustive map inspection plus `translate-perps-error.test.ts` |
| 3 | `EXCHANGE_ACCOUNT_NOT_FOUND` has dedicated “Add funds to start trading.” copy | PASS | Both English locale files, map inspection, focused Jest test |
| 4 | The widened handler preserves a Market/Limit-only toggle | PASS | Code-path review and OrderTypeToggle/OrderEntry tests |
| 5 | Real TP/SL children with `parentOrderId` suppress duplicate synthetic rows | PASS | Positive and negative branch tests in `orderUtils.test.ts` |
| 6 | Perps home renders controller-backed content under v11 | UNTESTABLE | Browser validation skipped at light tier |
| 7 | ETH market detail streams price/chart/funding/open-interest data | UNTESTABLE | Browser validation skipped at light tier |
| 8 | Selecting Limit reveals the price field and recomputes order values | UNTESTABLE | Browser validation skipped at light tier; related unit tests pass |
| 9 | Switching back to Market hides the limit-price field | UNTESTABLE | Browser validation skipped at light tier; related unit tests pass |

## Code Quality

- Pattern adherence: Follows existing controller error translation, locale, perps form, and colocated-test patterns.
- Complexity: Appropriate and minimal for the dependency upgrade.
- Type safety: The exhaustive `satisfies Record<PerpsErrorCode, string>` map and full `OrderType` handler compile against v11.
- Error handling: Adequate; actionable account-not-found copy is isolated, while generic and cancel-specific fallbacks remain intact.
- Accessibility/fallbacks: Adequate. No affordance markup changed; the existing Market/Limit buttons retain visible names, `aria-pressed`, and stable test IDs. Unknown errors retain the established generic fallback.
- Anti-pattern findings: None. No import-boundary violation, hardcoded chain/network value, or new untestable interactive element was introduced.

## Fix Quality

- **Best approach:** The changes are a pragmatic, minimal v11 adoption. The handler widening follows the upstream type while the toggle continues to constrain runtime values to Market/Limit.
- **Would not ship:** None.
- **Test quality:** The error-map test checks every exported code in its controller mock, TypeScript enforces the real union exhaustively, and the TP/SL tests include both matching-parent and unrelated-parent cases, so reverting the relevant behavior would fail.
- **Brittleness:** No new import-time state, frozen runtime value, or mock-order coupling was found.

## Live Validation

- Recipe: skipped (tier: light)
- Result: SKIPPED
- Evidence: skipped (tier: light)
- Webpack errors: not monitored (tier: light)
- Log monitoring: skipped (tier: light)

## Correctness

- Diff vs stated goal: Aligned.
- Edge cases: Exhaustive error-code coverage, cancel-flow remapping, matching and non-matching parent links, unknown-error fallback, and both toggle values are covered.
- Race conditions: None introduced.
- Backward compatibility: Preserved for current Extension call sites. Production code does not pass the newly rejected `grouping`, `tpslLinkage`, or invalid `timeInForce` combinations; position-bound TP/SL already uses the required two-step flow; no UI consumer reads `editOrder`'s now-optional `orderId`.

## Static Analysis

- lint:tsc: PASS
- Tests: 145/145 pass across 4 suites (`order-entry`, `order-type-toggle`, `orderUtils`, `translate-perps-error`)

## Mobile Comparison

- Status: N/A
- Details: Skipped at light tier.

## Architecture & Domain

The change stays within existing perps UI/utility boundaries and does not add MV3-specific behavior. The lockfile updates the existing controller stanza and its `@metamask/superstruct` range without adding a new package stanza; regenerated LavaMoat policies are unchanged. Attributions were regenerated for the new resolved dependency graph.

## Risk Assessment

- MEDIUM — This is a major trading-controller upgrade and independent browser regression validation was out of scope for the light tier, but the Extension-facing breaking changes are small, statically exhaustive, and covered by focused tests.

## Recommended Action

APPROVE

No code changes are required. A human reviewer performing the pre-merge product check should independently exercise claims 6-9 because this light-tier review did not run the browser recipe.
