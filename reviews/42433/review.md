# PR Review: #42433 — feat(perps): add compliance gate for restricted wallets

**Tier:** standard

## Summary
The PR wires `@metamask/compliance-controller` into Extension background init, adds compliance selectors/hooks and an access-restricted modal, and gates Perps trading actions while leaving read-only/cancel/withdraw paths open. The implementation is broadly aligned with the stated product goal, with live proof for the compliant-wallet path and code/unit-test proof for blocked returned results.

## Recipe Coverage
| # | AC (verbatim) | Target env | Recipe nodes (IDs) | Screenshot filename | Visual verdict | Justification |
|---|---------------|------------|---------------------|---------------------|----------------|---------------|
| 1 | "Given a wallet address that fails the compliance check, When they attempt users trade, Then a blocking screen/message is shown and order entries are inaccessible (order, modify position, TP/SL, close, modify margin etc.)" | fullscreen | none | none | UNTESTABLE | The live CDP slot has no blocked-wallet compliance fixture or controllable compliance API mock. Code and unit tests cover blocked returned results, but the browser slot could not produce a real blocked compliance response. |
| 2 | "Given a compliant wallet, When they attempt to trade, Then no blocking screen is shown and trading proceeds normally." | fullscreen | setup-navigate-eth-market, ac2-assert-market-detail, ac2-open-modify-menu, ac2-open-add-exposure, ac2-wait-order-entry, ac2-assert-no-restricted-modal, ac2-screenshot-order-entry | evidence-ac2-compliant-order-entry-1778143101055.png | PROVEN | Trace shows 7/7 nodes passed. The selected wallet was checked as blocked=false, add-exposure reached order entry, `access-restricted-modal` was absent, and the screenshot shows the order-entry form with HUD caption `AC2: compliant wallet reaches order entry`. |
| 3 | "Given the compliance check runs on Extension, When it returns a result, Then the logic and UX behavior matches Mobile 7.73 exactly." | fullscreen | none | none | UNTESTABLE | Full runtime parity requires both blocked and compliant compliance responses. Mobile source was compared by code reading, and AC2 was proven for compliant runtime behavior, but blocked-wallet mobile parity could not be exercised without a blocked-wallet fixture/API mock. |

Overall recipe coverage: 1/3 ACs PROVEN
Untestable: AC1 blocked-wallet fixture/API mock unavailable; AC3 blocked-runtime parity requires the same fixture/mock.

## Prior Reviews
No prior reviews.

## Acceptance Criteria Validation
| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | Blocked wallet sees access-restricted UX and cannot access trading actions | UNTESTABLE | No blocked-wallet fixture/API mock in live slot. Unit tests cover blocked API results in `useComplianceGate`; code review confirms gated paths call `gate()` before trading actions. |
| 2 | Compliant wallet proceeds without blocking UX | PASS | Recipe trace 7/7 passed; `ac2-assert-no-restricted-modal` returned `restrictedModalVisible:false`, `orderEntryVisible:true`; screenshot captured order entry. |
| 3 | Extension compliance logic/UX matches Mobile 7.73 | UNTESTABLE | Mobile compliance provider, modal copy, selectors, and feature-flag shape were compared by code reading. Blocked runtime parity could not be exercised in CDP. |

## Code Quality
- Pattern adherence: Follows existing modular controller init, Redux selector, Perps hook, and modal patterns.
- Complexity: Appropriate for a cross-surface gate; no new abstraction beyond the compliance hook/provider.
- Type safety: `yarn lint:tsc` passed.
- Error handling: Compliance hook fails open on rejected background request; blocked results prevent actions and show modal.
- Anti-pattern findings: No `chrome.runtime.getBackgroundPage()` usage, no missing LavaMoat policy for the new dependency, and no migration needed for the new controller default state slot.

## Fix Quality
- **Best approach:** Pragmatic for Extension: action-gated Perps entry points preserve read-only, cancel, and withdraw paths while using the shared compliance controller.
- **Would not ship:** None found.
- **Test quality:** Strong coverage around selectors, provider tracking, and hook gating. One suggestion: the cached-blocked plus API-reject test mocks a raw rejection, but the real controller may return cached statuses on service failure.
- **Brittleness:** The gate waits for the in-flight prefetch and resets stale blocked refs on address changes, which avoids obvious race bugs. Runtime blocked-path validation still needs a fixture.

## Live Validation
- Recipe: generated
- Result: PASS with 7/7 trace nodes passed
- Evidence: 1 screenshot; video skipped (standard tier)
- Webpack errors: none observed in recipe issue artifacts
- Log monitoring: recipe issue monitor clean; no console warnings, errors, or exceptions captured

## Correctness
- Diff vs stated goal: Aligned for the implemented action-gated model.
- Edge cases: Service rejection without returned cached result fails open; selected address changes reset stale blocked refs; empty address skips API.
- Race conditions: No blocking race found in the prefetch/gate handoff.
- Backward compatibility: Preserved; controller state defaults cover users without persisted `ComplianceController` state.

## Static Analysis
- lint:tsc: PASS
- Tests: 6/6 suites passed, 32/32 tests passed

## Mobile Comparison
- Status: ALIGNED
- Details: Extension mirrors Mobile’s compliance feature flag name, controller/service split, selectors over `walletComplianceStatusMap`, access-restricted modal copy/CTA, and support-link behavior. Extension intentionally differs by gating Perps actions directly rather than using Mobile’s global account-group hook, matching the PR’s stated Extension product baseline.

## Architecture & Domain
The new controller/service are registered through messenger-client init and Sentry state masking. The dependency update includes lockfile, attribution, and LavaMoat policy updates across browserify and webpack variants. Perps cancellation and withdraw-only flows remain ungated as required.

## Risk Assessment
- MEDIUM — This touches persisted background state and many Perps trading entry points. The implementation is contained and tested, but live blocked-wallet evidence requires a dedicated compliance fixture before final release confidence.

## Recommended Action
COMMENT
No blocking issues found. Address the test-contract suggestion if the intended fail-open semantics include cached blocked statuses during API outages; otherwise the PR is reasonable to proceed with human validation of a real blocked-wallet fixture.
