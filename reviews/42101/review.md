# PR Review: #42101 — feat: support HyperLiquid unified account tradeable balance

**Tier:** standard (RECIPE_STRATEGY=full-qa)

## Summary

Adds a thin `getTradeableBalance(account)` helper and threads it through the 5 perps surfaces that gate UI on "has funds to trade" (perps home, market list, market detail, order entry, market-balance-actions, `usePerpsMarginCalculations`). Bumps `@metamask/perps-controller` v3 → v4 to pick up the new `availableToTradeBalance` field (`withdrawable + unreserved spot USDC`, HL unified only). Withdraw surfaces deliberately keep reading `availableBalance` (withdrawable-only).

The change achieves its stated goal: an HL unified account funded only by spot USDC is now treated as funded for order entry and add-margin, while withdraw remains withdrawable-only.

## Recipe Coverage

Fixture state used for the live run (`perpsGetAccountState`):
```
availableBalance:        "0"
availableToTradeBalance: "29.6726825"
totalBalance:            "29.6726825"
```
This is the exact target scenario for AC1 — HL unified account with zero withdrawable but spot-USDC funding.

| # | AC (verbatim) | Target env | Recipe nodes | Screenshot | Verdict | Justification |
|---|---|---|---|---|---|---|
| 1 | "HyperLiquid unified accounts funded only by spot USDC are now recognized as tradeable; perps home shows funded balance, order entry is enabled." | fullscreen (home.html) | setup-probe-account, setup-assert-tradeable-positive, ac1-nav-perps-home, ac1-read-home-available, ac1-assert-home-shows-tradeable, ac1-screenshot-home-funded, ac1-nav-order-entry, ac1-screenshot-market-detail, ac1-open-order-entry, ac1-wait-order-entry, ac1-read-submit-button, ac1-screenshot-order-entry | evidence-ac1-home-funded.png, evidence-ac1-market-detail-funded.png, evidence-ac1-order-entry-enabled.png | **PROVEN** | Order-entry page renders "Available to trade: 29.67 USDC" and a visible/enabled "Open long ETH" CTA, despite availableBalance=0. Home perps tab shows $29.67 total balance and the market list (not the empty-state CTA). Both surfaces read `getTradeableBalance(account)`. |
| 2 | "Live updates flow through the existing PerpsStreamManager via the new spotState WS; no extension-side polling added." | N/A (negative arch claim) | n/a | n/a | **UNTESTABLE** | Validated by diff review: no new `setInterval` / polling hook; the new field flows through `usePerpsLiveAccount` / `PerpsStreamManager`, same channel as `availableBalance`. Cannot be proven via screenshot. |
| 3 | "Withdraw screens still display withdrawable-only balance (no behavioral regression)." | fullscreen (home.html) | ac3-nav-withdraw, ac3-wait-withdraw, ac3-read-withdraw-available, ac3-screenshot-withdraw | evidence-ac3-withdraw-zero-balance.png | **PROVEN** | Same account that shows $29.67 tradeable on order-entry renders "Available balance: $0.00" on withdraw, with Withdraw disabled. `perps-withdraw-page.tsx:97` and `perps-withdraw-balance.tsx:22-24` still read `account?.availableBalance`. |
| 4 | "Non-HyperLiquid / non-unified providers fall back to availableBalance unchanged." | N/A | n/a | n/a | **UNTESTABLE** | Slot only has HL mainnet; no non-HL provider fixture. Fallback is covered by the PR's new unit test `"falls back to availableBalance when availableToTradeBalance is absent"` (perps-view.test.tsx) and by the 1-line helper implementation `account?.availableToTradeBalance ?? account?.availableBalance ?? '0'`. |

Overall recipe coverage: **2/4 ACs PROVEN** (untestable: AC2 — negative architectural claim, AC4 — no non-HL provider in slot; weak: 0, missing: 0).

Both untestable ACs are non-blocking — AC2 because it is a negative claim verifiable only by code review and AC4 because the fallback branch is exercised by a new unit test added in this PR. Neither is in the "could have been validated but wasn't" bucket.

## Prior Reviews

| Reviewer | State | Date | Addressed? | Notes |
|----------|-------|------|------------|-------|
| michalconsensys | APPROVED | 2026-04-24T06:53:22Z | n/a (no changes requested) | Approval came after 2 "fix" commits (`use getTradeableBalance`, `improve avail balance telemetry`). One later commit (`cb49fa88 fix(perps): linting`) landed post-approval; it is a lint-only change. |

No `CHANGES_REQUESTED` history to duplicate.

## Acceptance Criteria Validation

| # | Criterion | Status | Evidence |
|---|---|---|---|
| 1 | HL unified spot-USDC-only account recognized as tradeable (home funded, order entry enabled) | PASS | ac1-screenshot-order-entry — "Available to trade: 29.67 USDC" + enabled "Open long ETH" CTA while availableBalance=0 |
| 2 | Live updates via PerpsStreamManager (no new polling) | PASS (code review) | No `setInterval` / new polling hook in diff; new field flows via existing `usePerpsLiveAccount` |
| 3 | Withdraw screens keep withdrawable-only balance | PASS | ac3-screenshot-withdraw — "Available balance: $0.00" + disabled Withdraw on the same account |
| 4 | Non-HL / non-unified providers fall back | PASS (unit test) | `getTradeableBalance.ts:16` nullish coalescing + `perps-view.test.tsx` fallback test |

## Code Quality

- Pattern adherence: follows codebase conventions. Helper placed with peer helpers in `ui/hooks/perps/`; imports the type from `@metamask/perps-controller`; strict `Pick<AccountState, 'availableBalance' | 'availableToTradeBalance'>` input signature keeps call sites honest.
- Complexity: minimal — single-line coalesce with JSDoc. No state, no memoization needed.
- Type safety: ok. Optional `availableToTradeBalance?` on `AccountState` mock (`ui/__mocks__/perps/perps-controller/index.ts:895`) mirrors the upstream v4 type. No `as any`.
- Error handling: not needed at this layer (null/undefined handled by coalesce).
- Anti-pattern findings: none material. Naming nit below in Fix Quality.

## Fix Quality

- **Best approach:** Yes. Centralizing the "which balance reflects buying power" decision behind one helper avoids five separate divergent reads and keeps the withdrawable/tradeable split explicit per surface. The alternative (adding the merge inside a HyperLiquid-specific adapter on the extension side, the way mobile does — see "Mobile Comparison") would put provider-specific math into the extension, which is exactly what the controller-v4 move avoids. Ship this.
- **Would not ship:** nothing.
- **Test quality:** good where it counts. `perps-view.test.tsx` adds two tests that directly assert the bug-fix behavior — one drives the `availableBalance=0, availableToTradeBalance=100` scenario and asserts `HAS_PERP_BALANCE=true`; the other drives `availableToTradeBalance=undefined` and asserts the fallback. **Both tests would fail if the PR were reverted** (the original `Number.parseFloat(account.availableBalance) > 0` returns false for 0). There is no direct unit test for `usePerpsMarginCalculations` now reading tradeable instead of withdrawable — the coverage is indirect via the helper — but that hook is a thin passthrough, so incremental value is low.
- **Brittleness:** low. Nullish-coalesce, no import-time eval, no frozen constants. The mocks add `availableToTradeBalance` consistently alongside the `availableBalance: '0', totalBalance: '0'` trio in the three `*.test.tsx` files, so there is no mock/prod skew.

Minor naming nit: `getTradeableBalance` is a pure function, not a hook, yet lives under `ui/hooks/perps/`. Peer helpers (`marginUtils.ts`) do the same, so this matches the local convention — noting for future cleanup, not blocking. Not filed as a line comment.

## Live Validation

- Recipe: generated (generate-ui mode)
- Result: PASS — 17/17 nodes (trace.json), auto-issue review clean (0 warnings, 0 errors, 0 exceptions)
- Evidence: 6 screenshots (baseline, evidence-ac1-home-funded, evidence-ac1-market-detail-funded, evidence-ac1-order-entry-enabled, evidence-ac3-withdraw-zero-balance, final) + trace.json. Video skipped (standard tier; record-window.sh is full-only).
- Webpack errors: none (`temp/runtime/webpack.log` tail shows clean bundle completion for service worker + primary).
- Log monitoring: auto-capture across the full recipe run (service worker + home page) returned 0 warnings / 0 errors / 0 exceptions.

## Correctness

- Diff vs stated goal: aligned. All five trade-surface call sites switched to `getTradeableBalance`; both withdraw surfaces left on `availableBalance`.
- Edge cases covered:
  - `account == null`: helper returns `'0'` (coalesce chain). Order-entry `availableBalance <= 0` branch renders the "no balance" CTA.
  - `availableToTradeBalance == null` (non-unified / non-HL): fallback to `availableBalance`. Tested.
  - `availableBalance == null` and `availableToTradeBalance == null`: returns `'0'` (final coalesce). Verified by inspection.
  - Order-entry tests (`perps-order-entry-page.test.tsx`) now set both fields to `'0'` in the three "no balance" fixtures so the assertion still holds post-change.
- Race conditions: none introduced. No new subscriptions; live updates reuse the existing `usePerpsLiveAccount` channel.
- Backward compatibility: preserved. Optional field on `AccountState`; all call sites still accept an undefined `account`.

## Static Analysis

- lint:tsc: PASS (exit 0, no errors)
- Tests: 162/162 passing, 4 skipped (unrelated pre-existing skips) — `perps-view.test.tsx`, `perps-market-detail-page.test.tsx`, `perps-order-entry-page.test.tsx` all green.

## Mobile Comparison

- Status: DIVERGES (on purpose; arguably better)
- Details: Mobile (`app/components/UI/Perps/utils/hyperLiquidAdapter.ts`) builds `availableBalance` and `totalBalance` from `perpsState.withdrawable` + `spotState.balances` inside the client adapter — the "available" field that the mobile UI reads is already the withdrawable-only number, and mobile's empty-balance check uses `totalBalance === 0` (includes spot via the adapter). Mobile does NOT expose or use a separate `availableToTradeBalance` concept, and mobile's withdraw validation (`useWithdrawValidation.ts:29-30`) reads `account?.availableBalance`, which is also withdrawable-only on mobile.
- The extension takes a cleaner route: delegate the merge to `@metamask/perps-controller@^4.0.0`, which exposes both `availableBalance` (withdrawable) and `availableToTradeBalance` (tradeable) as distinct fields, then pick the right one per surface. No HL-specific math in the UI.
- Behavioral difference worth noting: mobile's home gates on `totalBalance > 0` (has ANY position equity or spot), the extension gates on `availableToTradeBalance > 0` (has tradeable cash). The extension signal is strictly more precise for "can this user place an order?", so the divergence is upside.
- No new `.toFixed(2)` or `{min:2, max:2}` introduced by this PR. `formatCurrency` / `formatCurrencyWithMinThreshold` usage is unchanged.

## Architecture & Domain

- MV3 / service worker: no new background code, no new listeners.
- LavaMoat: `@metamask/perps-controller` v3.1.1 → v4.0.0. The transitive dependency list is unchanged (same `@metamask/abi-utils`, `@metamask/base-controller`, `@metamask/controller-utils`, `@metamask/utils`, `@nktkas/hyperliquid`, `bignumber.js`, `reselect`, `uuid`) plus the already-policy'd `@metamask/messenger`. The existing `"@metamask/perps-controller"` block in `lavamoat/browserify/main/policy.json` already grants the full set, so no policy regeneration was required and none was done. CI lavamoat policy-check will be the authoritative gate.
- Import boundaries: `ui/hooks/perps/getTradeableBalance.ts` imports a type only from `@metamask/perps-controller`, which is already a UI-allowed package.
- Controller / state migrations: not needed — `availableToTradeBalance` is an additive optional field on controller state produced by the v4 provider, not persisted extension state.

## Risk Assessment

- **LOW–MEDIUM** — rationale:
  - The behavioral change is narrowly scoped (5 UI call sites) and strictly widens the set of accounts classified as "has balance" (it cannot make an account stop being funded that was previously funded).
  - `HAS_PERP_BALANCE` telemetry semantics shift: previously = `availableBalance > 0` (withdrawable), now = `availableToTradeBalance > 0` (tradeable). Downstream funnels / dashboards on that property will see a step-change in the denominator for HL unified accounts funded only by spot USDC. Not a bug, but a known telemetry shift to coordinate with analytics.
  - The v3 → v4 controller bump is a major version. The surface relevant to extension (the fields on `AccountState`) is additive based on the diff, but major bumps elsewhere can carry breaking changes in other consumed APIs; I did not audit every call into `@metamask/perps-controller` across the extension to verify API stability. Human reviewer from the perps controller team should confirm no other v3→v4 breaking surface is consumed.

## Recommended Action

**COMMENT** — The live-tested acceptance criteria are proven, tests are meaningful, no would-not-ship defects found. Minor items for the author's awareness only:

1. Coverage escalation for AC2 and AC4:
   > ⚠ Coverage escalation: AC2 (no extension-side polling) validated by diff review only — no live probe. AC4 (non-HL fallback) validated by the new unit test only — no live provider switch.
   > Reason: AC2 is a negative architectural claim; AC4 requires a non-HL provider fixture not present in this slot.
   > Human reviewer should confirm via code that no polling was introduced and that provider swaps still resolve correctly on first paint.

2. Non-blocking: confirm with the perps-controller team that the v3→v4 bump has no other breaking API changes consumed by the extension beyond the additive `availableToTradeBalance` field.

3. Non-blocking telemetry note: the `HAS_PERP_BALANCE` property on `PerpsScreenViewed` events widens to tradeable. Coordinate with analytics before the release cuts.

No line-level findings rise to `must_fix` or `suggestion` against specific file:line diffs. `line-comments.json` is emitted with an empty `comments` array.
