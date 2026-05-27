# PR Review: #42972 — feat(perps): pass VIP tier and discount through trading analytics events

**Tier:** standard

## Summary
Adds VIP program context (`vipTier`, `vipDiscount`) to perps background calls (`perpsPlaceOrder`, `perpsClosePosition`, `perpsFlipPosition`) via a shared `buildPerpsVipTrackingData` helper. Also replaces a local `ClosePositionParams` duplicate type with the canonical import from `@metamask/perps-controller`. The change is analytics-only — no order execution or auth impact.

## PR Hygiene
No Jira or linked issue is provided. This review evaluates PR-author claims, not ticket-bound acceptance criteria.

## Recipe Coverage
Recipe skipped — `temp/recipes/` tooling not provisioned in slot. All 3 claims are internal background-call params, not UI-visible behavior.

| # | Claim (verbatim) | Status | Rationale |
|---|------------------|--------|-----------|
| 1 | `perpsPlaceOrder` background call includes `trackingData` with `vipTier` and `vipDiscount` | UNTESTABLE | standard-tier skip — no recipe tooling; verified via code review + unit tests |
| 2 | `perpsClosePosition` background call includes `trackingData` with `vipTier` and `vipDiscount` | UNTESTABLE | standard-tier skip — no recipe tooling; verified via code review + unit tests |
| 3 | `perpsFlipPosition` background call includes `trackingData` with `vipTier` and `vipDiscount` | UNTESTABLE | standard-tier skip — no recipe tooling; verified via code review + unit tests |

Overall recipe coverage: 0/3 ACs PROVEN
Untestable: 1, 2, 3 — recipe tooling not available; claims verified via code review and unit tests

> ⚠ Coverage escalation: All review claims (1, 2, 3) not proven in browser.
>   Reason: Recipe runner (temp/recipes/) not provisioned in this slot. All claims are internal background-call params verifiable only via code review + unit tests.
>   Human reviewer must validate manually before merging.

## Prior Reviews
No prior reviews.

## Acceptance Criteria Validation
| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | `perpsPlaceOrder` includes `trackingData` with `vipTier` and `vipDiscount` | PASS | Code review: `perps-order-entry-page.tsx:1036,1141` attaches `buildPerpsVipTrackingData(...)` to `orderParams.trackingData` before `submitRequestToBackground('perpsPlaceOrder', ...)`. Test at `perps-order-entry-page.test.tsx:1153` asserts `trackingData` structure. |
| 2 | `perpsClosePosition` includes `trackingData` with `vipTier` and `vipDiscount` | PASS | Code review: `close-position-modal.tsx:408` and `perps-order-entry-page.tsx:984` both attach `buildPerpsVipTrackingData(...)`. Test at `perps-order-entry-page.test.tsx:1153` asserts close-via-order-entry. Close-modal test NOT updated (see Fix Quality). |
| 3 | `perpsFlipPosition` includes `trackingData` with `vipTier` and `vipDiscount` | PASS | Code review: `reverse-position-modal.tsx:160` includes `trackingData` inline. Tests at `reverse-position-modal.test.tsx:340,401,625` all assert `trackingData` with `expect.objectContaining`. |

## Code Quality
- **Pattern adherence**: Follows existing codebase patterns — `useVipTier()` hook, `submitRequestToBackground`, conditional spread for optional fields. Dual export from `utils.ts` and `utils/index.ts` matches existing `willFlipPosition` pattern.
- **Complexity**: Appropriate — simple helper function with conditional field inclusion.
- **Type safety**: Good. Uses `ClosePositionParams` from `@metamask/perps-controller` (already includes `trackingData?: TrackingData`). Mock types updated with matching optional fields.
- **Error handling**: N/A — analytics payload enrichment, no error paths to handle.
- **Anti-pattern findings**: None. No import boundary violations, no missing LavaMoat changes, no new UI without `data-testid`.

## Fix Quality
- **Best approach**: Yes. Shared helper `buildPerpsVipTrackingData` centralizes construction. Conditional spread avoids sending null/undefined to analytics. Removing the local `ClosePositionParams` duplicate is a welcome cleanup.
- **Would not ship (suggestion, non-blocking)**: Two test gaps:
  1. `close-position-modal.test.tsx` not updated to assert `trackingData` in `perpsClosePosition` calls — inconsistent with the reverse-position and order-entry tests that were updated.
  2. No unit test for `buildPerpsVipTrackingData` itself in `ui/components/app/perps/utils/trackingData.ts` — the conditional spread logic for `vipTier !== null` and `vipDiscount !== undefined` is untested.
  3. Existing tests never mock `useVipTier` to return a non-null value, so `vipTier`/`vipDiscount` fields are never actually present in test assertions. Tests would pass even if the conditional spread logic were broken.
- **Test quality**: Tests assert `trackingData` structure (`totalFee`, `marketPrice`) but not the VIP-specific fields. This is because `useVipTier()` is unmmocked (returns `null`) and `metamaskFeeRateDiscountPercentage` is likely `undefined` in test context. The tests verify plumbing but not VIP payload correctness.
- **Brittleness**: Low. `useVipTier()` is a stable hook with feature-flag gating. No import-time evaluation concerns.

## Live Validation
- Recipe: skipped (tier: standard, no recipe tooling)
- Result: SKIPPED — code review + unit tests only
- Evidence: 1 orientation screenshot (perps market page loaded)
- Webpack errors: none (baseline `.metamaskprodrc` caching warning only)
- Log monitoring: 10s monitored, no errors

## Correctness
- **Diff vs stated goal**: Aligned. All three background calls now include `trackingData` with VIP context.
- **Edge cases**: `vipTier === null` and `vipDiscount === undefined` correctly omit those fields from the payload. `estimatedFees ?? 0` fallback in reverse-position is safe.
- **Race conditions**: None. `useVipTier()` is a React Query hook — stale/loading returns `null`, which is handled.
- **Backward compatibility**: Preserved. `trackingData` is optional on all types. Controller already accepts it.

## Static Analysis
- lint:tsc: PASS — 0 errors
- Tests: 123/123 pass (23 close-position + 100 order-entry + reverse-position)

## Mobile Comparison
- Status: CANNOT VERIFY
- Details: Local mobile ref repo (`metamask-mobile-ref`) does not contain `vipTier`/`vipDiscount`/`useVipTier` in perps code. PR description claims this is ported from mobile — either the mobile ref is out of date or the mobile PR hasn't merged yet. Cannot confirm behavioral alignment. The extension approach (shared helper, conditional spread, hook injection) is clean regardless.

## Architecture & Domain
- MV3: Correct pattern — uses `submitRequestToBackground` not `getBackgroundPage`.
- LavaMoat: No new dependencies, no policy changes needed.
- Import boundaries: Improved — removed local `ClosePositionParams` duplicate, now imports from `@metamask/perps-controller`.
- Controller usage: Pure analytics enrichment, no new controller methods.

## Risk Assessment
- **LOW** — Analytics-only payload enrichment on existing RPCs. No execution path changes. Optional fields with null-safe conditional spread. Feature-flag gated via `useVipTier()`.

## Recommended Action
COMMENT
- **Suggestion**: Add `trackingData` assertion to `close-position-modal.test.tsx` for consistency with the reverse-position and order-entry test updates.
- **Suggestion**: Add a unit test for `buildPerpsVipTrackingData` covering the conditional spread behavior (vipTier null vs non-null, vipDiscount undefined vs defined).
- **Suggestion**: Add at least one test case that mocks `useVipTier` to return a non-null tier value to verify the VIP fields actually appear in the payload.
