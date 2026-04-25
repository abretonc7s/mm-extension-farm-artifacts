# PR Review: #41949 — feat: Keyboard-first order entry UX: auto-focus, auto-select, Tab navigation & inline validation

**Tier:** standard

## Summary

Delivers keyboard-first order entry UX across the perps surface: autoFocus on primary inputs (size, limit price, margin, TP price, close button), select-all on focus, real-time `$10` minimum validation with submit-button copy swap, Enter-to-submit via native `<form>` semantics, leverage ArrowUp/Down stepping with Enter swallowed. Side fix in `metaRPCClientFactory.ts` hardens malformed-error handling so submit toasts no longer orphan when the background returns an empty `error.message`. Submit/close/update navigation is rewired so route changes happen *after* await — eliminating stuck "Submitting your trade" toasts. PR achieves its stated goal.

## Recipe Coverage

| # | AC (verbatim) | Target env | Recipe nodes | Screenshot | Visual verdict | Justification |
|---|---|---|---|---|---|---|
| 1 | Primary input focused on screen mount | fullscreen | `ac1-size-autofocus.autofocus-proof`, `ac1-limit-autofocus.limit-autofocus-proof`, modal unit tests | evidence-min-order-empty, evidence-limit-autofocus | PROVEN | Blue ring on $ field (empty); blue ring on Limit Price after toggle. Modals (close/edit-margin/TPSL) covered by jest. |
| 2 | Auto-select on focus | fullscreen | `ac2-select-on-focus.select-on-focus` (start=0,end=5), `leverage-keyboard.assert-select-on-focus` (start=0,end=1) | — | PROVEN | Selection range proven via selectionStart/End on size + leverage. |
| 3 | Placeholder reflects min-order constraint | fullscreen | `ac6-empty-button.assert-empty-copy` | evidence-min-order-empty | PROVEN (caveat) | Author moved per-input "min $10" placeholder into submit-button copy (commit `e3f8e6ea`). Spirit satisfied via disabled-button copy "Order size must be at least $10". Deviates from literal ticket wording. |
| 4 | Tab key logical focus sequence | fullscreen | (none) | — | UNTESTABLE | Recipe does not exercise Tab; relies on native DOM order. Manual Tab-walk recommended on Trade + TPSL before merge. |
| 5 | Submit disabled when empty/invalid | fullscreen | `ac6-empty-button`, `ac5-below-min`, `ac7-neg-empty` | evidence-min-order-empty | PROVEN | Empty + below-$10 both keep submit disabled; Enter blocked when disabled. |
| 6 | Real-time inline validation | fullscreen | `ac5-below-min`, `ac5-valid-amount` | evidence-min-order-empty, evidence-valid-amount | PROVEN | Transition disabled→enabled on input change, not deferred. |
| 7 | Behaviour consistent across order screens | fullscreen + jsdom | Recipe (Trade market+limit) + jest unit tests for close/edit-margin/TPSL/leverage | (multiple) | PROVEN | Joint recipe + jest coverage; Reverse position correctly excluded per ticket. |
| 8 | (PR) Enter submits when enabled; ignores Shift+Enter / IME / disabled | fullscreen + jsdom | `ac7-enter-blocked-assert`, `ac7-enter-submit-success`, modal unit tests | evidence-enter-submit-redirect | PROVEN | Live Enter-to-submit flips route to `#/perps/market/ETH` with live position card. Shift+Enter / isComposing guards in jest. |
| 9 | (PR) Leverage Arrow keys + Enter swallowed | fullscreen + jsdom | `leverage-keyboard.assert-arrow-up` (3→4), `assert-arrow-down` (4→3), `leverage-slider.test.tsx` Enter-bubble | — | PROVEN | Step + clamp + Enter-suppress all asserted. |
| 10 | (PR) Submit no-hang | fullscreen | `ac7-enter-submit-success.screenshot-post-submit` | evidence-enter-submit-redirect | PROVEN | Image shows "Order filled — Long 0.0065 ETH" success toast post-submit, not stuck on "Submitting your trade". metaRPCClientFactory empty-message guard not unit-tested. |

Overall recipe coverage: 9/10 ACs PROVEN
Untestable: AC4 (Tab order) — recipe does not press Tab; relies on native DOM order. Manual reviewer must Tab-walk before merge.

> ⚠ Coverage escalation: AC4 not proven in browser.
>   Reason: recipe does not dispatch Tab keydown events; native DOM order assumed and not asserted.
>   Human reviewer must validate manually before merging — Tab-walk Trade screen (size → leverage → submit) and TP/SL modal (TP price → TP % → SL price → SL %).

## Prior Reviews

| Reviewer | State | Date | Addressed? | Notes |
|---|---|---|---|---|
| cursor (bugbot) | COMMENTED (multi) | 2026-04-21..23 | addressed | Bot review feedback rolled into commits up through 2469be68 + 2321f59a. |
| michalconsensys | DISMISSED + COMMENTED | 2026-04-23 | addressed | Author commit `2321f59a` (2026-04-24) "fix: address review comments on PR #41949" pushed after michalconsensys's review. |
| abretonc7s (author self-comments) | COMMENTED | 2026-04-22..24 | n/a | Author response threads. |

No `CHANGES_REQUESTED` reviews. No unaddressed feedback.

## Acceptance Criteria Validation

| # | Criterion | Status | Evidence |
|---|---|---|---|
| 1 | Auto-focus on order screen mount | PASS | recipe `ac1-size-autofocus`, `ac1-limit-autofocus` + 4 jest auto-focus tests |
| 2 | Auto-select on focus | PASS | recipe `ac2-select-on-focus`, `leverage-keyboard.assert-select-on-focus` + 7 jest select-on-focus tests |
| 3 | Placeholder reflects constraint | PASS-with-caveat | submit-button copy serves as constraint indicator (literal placeholder removed e3f8e6ea) |
| 4 | Tab key logical focus sequence | UNTESTABLE | not exercised by recipe; manual reviewer must Tab-walk |
| 5 | Submit disabled when invalid | PASS | recipe `ac5-below-min`, `ac6-empty-button`, `ac7-neg-empty` |
| 6 | Real-time inline validation | PASS | recipe `ac5-below-min` + `ac5-valid-amount` (immediate enable transition) |
| 7 | Behaviour consistent | PASS | recipe Trade+Limit + 8 jest suites covering close/edit-margin/TPSL/leverage |
| 8 | Enter-to-submit | PASS | recipe `ac7-enter-submit-success` + jest Enter handlers |
| 9 | Leverage Arrow keys | PASS | recipe `leverage-keyboard` + jest leverage-slider tests |
| 10 | No-hang submit | PASS | recipe `ac7-enter-submit-success` post-submit toast image |

## Code Quality

- **Pattern adherence:** follows codebase conventions (functional components, hooks, `useCallback`, `useMemo`, `useLayoutEffect`). Numeric handlers consistent across modals. New `data-testid`s added for every modal input touched.
- **Complexity:** appropriate. `isBelowMinOrderSize` memo, `handleFormSubmit` callback, leverage Arrow handler are all single-purpose and well-scoped.
- **Type safety:** fully typed; `MutableRefObject` + ref-callback union for `usdInputRef` is correct. No `as any` introduced. Replaced `parseInt`/`isNaN` with `Number.parseInt`/`Number.isNaN` in leverage-slider — consistency win.
- **Error handling:** Enter handlers `.catch(() => {/* errors via toast */})` — accepted pattern. metaRPCClientFactory now defensively guards against malformed payloads.
- **Anti-pattern findings:** `yarn.lock` bumps `@metamask/perps-controller` 3.0.0 → 3.2.0 with no `lavamoat/policy.json` change in PR — verify `yarn lavamoat:auto` was run if 3.2.0 added new globals/imports (CI will catch if not).

## Fix Quality

- **Best approach:** stuck-toast root-cause fix (await before navigate; emit in-progress toast on the form not via route state) is the correct repair. Replaces the brittle `navigate(-1)` + route-state pattern with deterministic `navigate('/perps/market/<symbol>')`. Pragmatic and minimal.
- **Would not ship:** none. All findings are suggestions/nitpicks.
- **Test quality:**
  - Strong: Enter-to-submit form-tag check (`root.tagName === 'FORM'`, `submitButton.type === 'submit'`, `submitButton.form === root`) directly proves the wiring claim.
  - Strong: leverage Arrow tests assert clamping at both ends with explicit `lastCalledWith` values.
  - Gap: `metaRPCClientFactory.test.js` has no test for the new empty-`message` guard. The fix's behavioral claim — that pending requests are settled rather than orphaned — is not regression-protected.
  - Gap: `perps-order-entry-page.test.tsx` does not unit-test the "navigate after await" change — it only checks final `mockUseNavigate` calls. A jest test asserting `submitRequestToBackground` resolves *before* `navigate` would protect against the regression.
- **Brittleness:**
  - `isBelowMinOrderSize` uses `Number.parseFloat(amount.replace(/,/gu, '')) || 0` — `||` falls back on `0` and `NaN` alike. Intentional; correct.
  - `usdInputRef` `useEffect` re-focus on `formState.type` change can fight live user typing if effect runs while user is mid-stroke, but `mode !== 'close'` and the same-tick `formState.type === 'market'` gate make conflict unlikely in practice.
  - Leverage Arrow handler reads `event.currentTarget.value` directly to dodge stale closure — acknowledged in inline comment. Pragmatic.
  - `PERPS_MIN_MARKET_ORDER_USD = 10` hardcoded; mobile resolves dynamically via `useMinimumOrderAmount` hook (`marketData.minimumOrderSize` first, then `TRADING_DEFAULTS.amount.{mainnet|testnet}` from `@metamask/perps-controller`). Author flags this in the constants comment as TODO. Per-market high-minimum assets bypass the gate.

## Live Validation

- Recipe: existed (author's task-local bundle copied to my artifacts dir).
- Result: PASS — 9/9 subflows green; assertion fix needed in `ac5-valid-amount.json` (default `sideLabel` `Long` → `long` to match i18n `perpsOpenLong` = "Open long $1").
- Evidence: 4 AC PNGs + 1 baseline + 1 close-position teardown (no video — slot is sidepanel default but recording was not started; tier=standard does not require video).
- Webpack errors: none — recent log shows clean bundle completion (primary/contentscript/app-init).
- Log monitoring: 21.5s recipe run; 38× home "Unknown action Object" errors + 7× SW HttpRequestError AbortError + 7× SW "Sentry not initialized" — pre-existing background noise unrelated to this PR (issue review status `review`, none `gating`).

## Correctness

- Diff vs stated goal: aligned. Every claim in the PR description maps to a code change + test.
- Edge cases:
  - Covered: empty amount, below-min amount, IME composition (`event.nativeEvent.isComposing`), Shift+Enter, disabled-state Enter.
  - Uncovered: deep-link / page-refresh entry path → back button now goes to `/perps/market/<symbol>` instead of history; per code reading, order-entry is only reached from market-detail (`perps-market-detail-page.tsx:709`), so behavior is strictly equal-or-better than `navigate(-1)`. Concern resolved by code reading, not flagged.
  - Uncovered: `usdInputRef` re-focus race during rapid Market↔Limit toggling.
- Race conditions: stuck-toast fix removed the original race (navigate before await). Leverage stale-closure fix removed batch-key-press race. None observed.
- Backward compatibility: behavior change in back-navigation (`-1` → `/perps/market/<symbol>`) is intentional and aligned with the only real entry path. No external API changes.

## Static Analysis

- lint:tsc: PASS (exit 0)
- Tests: 221/221 PASS across 8 affected suites (211 perps UI + 10 metaRPCClientFactory)

## Mobile Comparison

- Status: DIVERGES (acknowledged via TODO comment in constants.ts)
- Details:
  - `ui/components/app/perps/constants.ts:55-61` — hardcodes `PERPS_MIN_MARKET_ORDER_USD = 10` with comment "Duplicates TRADING_DEFAULTS.amount in @metamask/perps-controller until a shared export exists."
  - Mobile equivalent: `app/components/UI/Perps/hooks/useMinimumOrderAmount.ts` — resolves min from `marketData.minimumOrderSize` first, then falls back to `TRADING_DEFAULTS.amount.mainnet` / `.testnet` from `@metamask/perps-controller` based on `usePerpsNetwork()`.
  - Net: extension is missing (a) per-market `minimumOrderSize` resolution, (b) testnet-vs-mainnet split. Non-blocking for this PR scope (UX-focused), but should be tracked as a follow-up to align with mobile.

## Architecture & Domain

- MV3 implications: none — only UI changes plus one library lib (`metaRPCClientFactory`) error-handling hardening; no service-worker code added.
- LavaMoat: `yarn.lock` bumped `@metamask/perps-controller` 3.0.0→3.2.0 with no `lavamoat/policy.json` change — relies on CI `lavamoat:auto` verification if the new version added globals/imports. Suggest verifying.
- Import boundaries: clean. No `ui/` → `app/scripts/` violations.
- Controller usage: no controller state schema change; only consumer of perps-controller version bump is via existing `submitRequestToBackground` calls.

## Risk Assessment

- **MEDIUM** — risk profile aligns with cursor bugbot's medium-risk note. Justification:
  - Submit-flow rewire (await before navigate, in-progress toast emitted on form not route state) touches the user money path; the test suite covers `mockUseNavigate` calls but does not assert `await` ordering.
  - `metaRPCClientFactory` empty-message guard is correct but untested — applies to *every* background RPC reply, not just perps. A regression here affects all promise-settling background calls.
  - Mitigation: live recipe AC7 positive ran end-to-end successfully (real Hyperliquid mainnet order placed and filled within ~5s); the submit lifecycle is empirically validated this session.

## Recommended Action

**COMMENT** — strong PR. 9/10 ACs proven live, all unit tests pass, fix-quality is good. Block-level concerns:

1. AC4 (Tab key sequence) — manual reviewer must Tab-walk Trade screen and TPSL modal before approving merge. Recipe could not exercise this.
2. Add a `metaRPCClientFactory.test.js` regression test for empty-`message` payloads (the fix's behavioral claim is not unit-protected).
3. Verify `yarn lavamoat:auto` was run for the perps-controller 3.2.0 bump (CI will fail if not, so this is informational).
4. (Suggestion) Track follow-up to consume `useMinimumOrderAmount`-equivalent dynamic minimums from `@metamask/perps-controller` instead of the hardcoded `PERPS_MIN_MARKET_ORDER_USD = 10` constant — matches mobile and protects high-min-notional assets.
