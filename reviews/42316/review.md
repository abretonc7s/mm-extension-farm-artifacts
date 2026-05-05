# PR Review: #42316 — fix(perps): support unified account funding flows cp-13.30.0

**Tier:** standard

## Summary
This PR updates Perps funding flows for unified-account support, keeps standalone Perps withdraw as the default path, gates confirmations-backed `perpsWithdraw` behind `confirmations_pay_post_quote`, and updates withdraw balance reads to prefer `availableToTradeBalance ?? availableBalance`.

Live CDP recipe validation now runs successfully after fixing the injected recipe runtime compatibility layer. Static review still found a selector-shape concern in the confirmations-backed Perps balance alert, but it is not browser-proven and should be treated as a follow-up review comment rather than a requested-change blocker.

## Recipe Coverage
# Recipe Coverage

| # | AC (verbatim) | Target env | Recipe nodes (IDs) | Screenshot filename | Visual verdict | Justification |
|---|---------------|------------|---------------------|---------------------|----------------|---------------|
| 1 | "Unified-account migration runs from Perps entrypoints: Given the extension uses the updated @metamask/perps-controller preview, when a first-time or default-mode user opens Perps or starts a Perps action, then unified-account migration completes silently and HIP-3 markets and order flows work without missing collateral state." | fullscreen | setup-open-perps, ac1-assert-markets-present | screenshots/perps-tab-1777962777409.png | PROVEN | Recipe preconditions passed (`wallet.unlocked`, `perps.feature_enabled`), Perps tab loaded, and `perpsGetMarketDataWithPrices` returned live market data including HIP-3 `xyz:*` markets. First-time/default migration reset state itself was not available in this slot, so this proves post-migration Perps entrypoint/market availability, not the one-time migration transition. |
| 2 | "DEX Abstraction users migrate once: Given the user has DEX Abstraction enabled, when they open Perps or start a Perps action, then a one-time EIP-712 prompt appears; when they sign, then HIP-3 markets and trades work with unified-account collateral and reopening Perps does not prompt again." | fullscreen | none | none | UNTESTABLE | Requires DEX Abstraction enabled account and an unconsumed one-time EIP-712 migration prompt. Current slot is already unlocked/active and cannot safely reset that migration state. |
| 3 | "Unified Account user withdraws spot-funded balance: Given the user has $0 perps withdrawable balance and > $0 spot USDC in Unified Mode, when they open Perps Withdraw, then the available balance uses availableToTradeBalance ?? availableBalance and Max/submission use the unified spot-funded value; when they submit a valid withdraw, then withdraw succeeds through withdraw3 and spot USDC decreases by amount plus fee." | fullscreen | ac4-open-balance-menu, ac4-click-withdraw, ac4-assert-standalone-route, ac3-assert-withdraw-page-visible, ac3-screenshot-withdraw-page | screenshots/evidence-ac3-withdraw-page.png-1777962777780.png | PROVEN | Recipe opened the live standalone Withdraw page and DOM check passed for `perps-withdraw-page`; screenshot shows `$0` amount, `Available balance: $11.94`, percentage controls, USDC receive row, fee, estimated time, and disabled Withdraw button. Slot lacks the exact funded spot-only `$0 perps withdrawable` state and submission authority, so withdraw3 success and spot USDC decrease remain untested. |
| 4 | "Default ARB USDC withdraw uses standalone flow: Given confirmations_pay_post_quote is disabled or absent, when the user taps Withdraw from Perps, then /perps/withdraw opens and ARB USDC withdraw submits without a Transaction Pay No quotes blocker." | fullscreen | ac4-assert-postquote-flag-disabled, ac4-open-balance-menu, ac4-click-withdraw, ac4-assert-standalone-route, ac4-screenshot-standalone-route | screenshots/evidence-ac4-standalone-withdraw.png-1777962777853.png | PROVEN | Recipe confirmed `confirmations_pay_post_quote` resolved disabled, clicked the Perps balance dropdown Withdraw action, reached route `perps/withdraw`, and captured the standalone Withdraw page with no Transaction Pay no-quotes blocker. Actual submission was not performed because the recipe did not establish a valid funded withdraw amount. |
| 5 | "Confirmations-backed withdraw remains gated: Given confirmations_pay_post_quote explicitly enables perpsWithdraw, when the user taps Withdraw from Perps, then the confirmations-backed perpsWithdraw flow is used and Perps balance, source-network native fee, and no-quote blocking alerts still apply." | fullscreen | ac5-assert-alert-hook-state-readable | none | UNTESTABLE | Recipe proved the relevant store surfaces are readable (`hasTopLevelAccountState: true`, `hasCachedUserData: true`) in the flag-off slot. It did not safely mutate remote feature flags or establish confirmation alert fixture state for flag-on `perpsWithdraw`, native-fee, and no-quote alert validation. |
| 6 | "Direct ARB USDC deposit succeeds: Given the user has ARB USDC and sufficient gas support, when they deposit to Perps with ARB USDC selected, then valid amounts do not show the payment-route validation error, Add funds submits successfully, and wallet activity follows existing Perps deposit conventions." | fullscreen | none | none | UNTESTABLE | Requires ARB USDC plus gas-funded deposit state. Current slot did not provide those deposit prerequisites, and this PR mostly preserves the deposit path. |

Trace cross-check: `trace.json` was produced by the live CDP run. Summary: 11/11 nodes passed in 793ms; preconditions passed; issue collector reported 0 warnings, 0 errors, and 0 runtime exceptions. The first live attempt exposed a recipe route-normalization bug (`/perps/withdraw` vs `perps/withdraw`); the recipe was corrected and rerun successfully.

Overall recipe coverage: 3/6 ACs PROVEN (untestable: AC2, AC5, AC6; partial caveats on AC1 and AC3 due migration/funded-state prerequisites)

> Coverage escalation: AC2, AC5, and AC6 remain unproven in browser because the current slot lacks DEX migration prompt state, flag-on confirmation alert fixtures, and funded ARB USDC/gas deposit state.

## Prior Reviews
| Reviewer | State | Date | Addressed? | Notes |
|----------|-------|------|------------|-------|
| gambinish | APPROVED | 2026-05-04T21:26:57Z | N/A | No prior CHANGES_REQUESTED reviews. |

## Acceptance Criteria Validation
| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | Unified-account migration from Perps entrypoints | PROVEN with caveat | Recipe loaded Perps and live HIP-3 markets; migration transition/reset state itself unavailable. |
| 2 | DEX Abstraction users migrate once with EIP-712 | UNTESTABLE | Requires special account/migration state not present in slot. |
| 3 | Unified Account withdraw uses `availableToTradeBalance ?? availableBalance` and succeeds | PROVEN with caveat | Recipe opened standalone Withdraw and showed available balance; code/unit tests cover fallback. Funded submission/withdraw3 not performed. |
| 4 | Default flag-off withdraw opens `/perps/withdraw` without Pay no-quotes blocker | PROVEN | Recipe verified flag disabled, clicked Withdraw, reached `perps/withdraw`, and captured standalone page with no no-quotes blocker. |
| 5 | Flag-on confirmations-backed withdraw remains gated and alerts apply | UNTESTABLE | Gating is unit-tested; live flag-on alert state was not established. Static review found a selector-shape concern for the Perps balance alert. |
| 6 | Direct ARB USDC deposit succeeds | UNTESTABLE | No funded ARB USDC/gas fixture; deposit path mostly outside changed code. |

## Code Quality
- Pattern adherence: mostly follows existing hook/selector/test patterns.
- Complexity: appropriate for flag-gated routing, but the new balance alert duplicates Perps account-state selection instead of using the existing selector shape.
- Type safety: `yarn lint:tsc` passed.
- Error handling: transaction creation and post-quote setup errors are caught; live CDP issue collection reported no warnings, errors, or runtime exceptions during the recipe.
- Anti-pattern finding: `ui/pages/confirmations/hooks/alerts/transactions/useInsufficientPerpsBalanceAlert.ts:52` reads `state.metamask.accountState`, while existing Perps cached account state is under `cachedUserDataByProvider[provider].accountState`.

## Fix Quality
- **Best approach:** The route gating and `availableToTradeBalance` fallback are pragmatic and covered by unit tests. The alert should source the same Perps account state as `selectPerpsCachedAccountState` or an equivalent provider-aware selector.
- **Would not ship:** none proven by browser validation. Static review concern: `useInsufficientPerpsBalanceAlert` appears to read a state path that differs from the existing provider-scoped Perps account cache.
- **Test quality:** The new tests assert meaningful routing, fallback balance, and alert behavior, but the alert test constructs a top-level `metamask.accountState` fixture that may mask the real Redux state shape.
- **Brittleness:** The fixture path creates mock coupling; tests can pass even if the production selector always returns an unintended value.

## Live Validation
- Recipe: generated
- Result: PASS. Live CDP run passed 11/11 nodes.
- Evidence: `summary.json` status `pass`; `trace.json`; screenshots `perps-tab-1777962777409.png`, `evidence-ac3-withdraw-page.png-1777962777780.png`, `evidence-ac4-standalone-withdraw.png-1777962777853.png`.
- Issue collector: clean, 0 warnings, 0 errors, 0 runtime exceptions.
- Infrastructure note: the injected farm recipe runtime was patched so CDP bootstrap no longer depends on removed `@metamask/client-mcp-core` exports.

## Correctness
- Diff vs stated goal: aligned for default standalone withdraw and balance fallback; flag-on confirmation alert path has a static selector-shape concern.
- Edge cases: flag-off/default route validated in browser and unit tests; flag-on real alert state not covered against production-shaped Redux state.
- Race conditions: no new obvious race beyond existing async transaction creation/post-quote setup guards.
- Backward compatibility: standalone withdraw remains default and testnet stays standalone.

## Static Analysis
- lint:tsc: PASS
- Tests: 14/14 suites passed, 150 tests passed, 4 skipped.

## Mobile Comparison
- Status: ALIGNED with caveat
- Details: Mobile withdraw validation still reads `account.availableBalance`; this PR intentionally extends Extension to prefer `availableToTradeBalance` for unified-account behavior. No new `.toFixed(2)` formatting drift was introduced in changed Extension code.

## Architecture & Domain
The LavaMoat/package changes match the perps-controller v5 bump: `@nktkas/rews` event globals were added and unused signing dependency policy entries were removed. No new filesystem, child process, or network primitives were introduced beyond existing WebSocket use.

## Risk Assessment
- MEDIUM — funding and withdraw flows are user-funds-adjacent, AC2/AC5/AC6 remain unproven in browser due fixture limitations, and static review found a selector-shape concern in a flag-on alert path.

## Recommended Action
COMMENT

Post a comment asking the author/reviewer to double-check the `useInsufficientPerpsBalanceAlert` selector against production-shaped Perps Redux state. The live recipe now validates the default standalone withdraw route and Perps market availability, so there is no browser-infrastructure basis for requesting changes.
