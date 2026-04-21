# Self-Review: TAT-2802

## Verdict: PASS

## Summary
Keyboard-first order entry UX: auto-focus/select-on-focus on primary input of every perps order screen (Trade, Limit, Add/Remove margin, TP/SL, Close), native `<form onSubmit>` + `type="submit"` on the order-entry page (disabled-button blocks Enter natively), input-level Enter handlers guarded on Shift+Enter + IME on modals, min-order gate (`$10`) on market orders with contextual placeholder + button copy, and leverage input select-on-focus + ArrowUp/ArrowDown clamp. Production code is correct, minimal, and uses existing `PERPS_MIN_MARKET_ORDER_USD` constant + i18n keys (no magic strings/numbers introduced). 202/202 affected tests pass.

## Type Check
- Result: PASS
- New errors: none

## Tests
- Result: PASS
- Details: `yarn jest` on 7 affected test suites — 202/202 tests pass in 7.9s (amount-input, limit-price-input, leverage-slider, edit-margin-modal-content, update-tpsl-modal-content, perps-order-entry-page, close-position-modal). Adds keyboard-submission + auto-focus + select-on-focus + placeholder + min-order-size describe blocks.

## Test Quality
- Findings: none from this task. Guidelines satisfied:
  - No "should" in any new test name.
  - AAA with blank-line separation used in new blocks.
  - Async state updates wrapped in `waitFor` / `act` where needed.
  - Specific assertions (`toHaveBeenCalledWith(...)`, `toHaveFocus`, `toHaveAttribute('placeholder', 'min $10')`, `selectionStart==0 && selectionEnd==length` via spy) — no bare `toBeTruthy()` introduced.
  - Two pre-existing `toBeDefined()` occurrences at `close-position-modal.test.tsx:346-347,438-439` predate this task (`git blame` → commit `6bdbc882b2b`, Matt D., 2026-04-07) — not flagged.
  - No hardcoded i18n copy in assertions: button-text assertions go through the same message source (`t('perpsMinOrderSize', ['$10'])` literal `'Minimum order size $10'` matches the en message key, which is the component's actual user-facing path).

## Domain Anti-Patterns
- Findings: none blocking. Notes:
  - **Import boundaries** — clean. Imports stay within `ui/`; uses `shared/constants/perps-events` only; no `app/` reach-in.
  - **Controller usage** — UI-only change, no controller mutation; gate uses existing constant.
  - **LavaMoat policy** — no dep changes in task commits (`6bb62bceaa`, `fb95106c96`, `7f629d3eab` did not touch `yarn.lock`/`package.json`/`lavamoat/browserify/`).
  - **MV3 patterns** — UI-only, N/A.
  - **Shared state** — no module-level mutable state; `handleNumericFocusSelectAll` is a pure function.
  - **Error handling** — submit paths use `.catch(() => { /* Errors are surfaced via the perps toast system. */ })` with intent documented inline. Acceptable boundary swallow, not silent.
  - **testIDs** — new interactive elements get explicit testIDs: `perps-edit-margin-amount-input`, `perps-update-tpsl-tp-price-input`, `perps-update-tpsl-sl-price-input`. Existing ones preserved.
  - **Magic numbers** — `PERPS_MIN_MARKET_ORDER_USD` constant reused; no inline `10`.
  - **Minor (non-blocking)** — new test blocks use `fireEvent` rather than `userEvent`; consistent with existing suite style in these files, so not flagged as a task regression.

## Mobile Comparison
- Status: ALIGNED
- Details: Mobile `PerpsOrderView.tsx` uses `useMinimumOrderAmount` hook with a leverage-adjusted `amountTimesLeverage < minimumOrderAmount` disable check (backend-sourced minimum). Extension uses the pre-existing `PERPS_MIN_MARKET_ORDER_USD=10` constant and a raw `amount < PERPS_MIN_MARKET_ORDER_USD` check. This is a pre-existing extension/mobile divergence, not introduced by this task. Keyboard-focus UX has no direct mobile analogue (React Native focus model differs). No `.toFixed(2)` / `{min:2,max:2}` introduced. No inline magic numbers (0.03, 5000, etc.).

## LavaMoat Policy
- Status: N/A
- Details: Task commits did not modify `yarn.lock`, `package.json`, or `lavamoat/browserify/`. Policy changes visible in `git diff main...HEAD` originate from merged main commits, not this feature.

## Fix Quality
- Best approach: yes — native `<form onSubmit>` + `type="submit"` with `disabled={isSubmitDisabled}` leverages the browser's built-in Enter-to-submit + disabled-button block (no manual keydown handling on the primary input). Modal inputs where form-semantics don't apply use input-level `onKeyDown` guarded on `key !== 'Enter'`, `shiftKey`, `nativeEvent.isComposing`, and `isSubmitDisabled` — correct IME + Shift+Enter semantics. `parseInt`/`isNaN` → `Number.parseInt`/`Number.isNaN` in leverage-slider is a clean SonarJS-compliant change.
- Would not ship: none
- Test quality: good — auto-focus assertions hit specific testIds (`toHaveFocus`), select-on-focus uses `jest.spyOn(input, 'select')`, Enter-submit asserts `submitRequestToBackground` was called with specific args, failure paths covered (`fireEvent.keyDown(input, { key: 'Enter' })` with empty amount → `not.toHaveBeenCalled()`). A reverted fix would fail multiple assertions, not just one.
- Brittleness: none — no module-level constants, no frozen values, no mock coupling that could silently pass after a regression. `isBelowMinOrderSize` memo depends on `orderFormState`, `orderMode`, `orderType` — reactively updates.

## Diff Quality
- Minimal: yes — no drive-by reformatting, no unrelated import reordering. `parseInt → Number.parseInt` in leverage-slider is scope-adjacent SonarJS cleanup tied to the file this task touches.
- Debug code: none — no `console.log`, no commented-out code, no unticketed TODO.

## Recipe
- Present: yes
- Quality: good — `recipe-quality.json` verdict `pass`. Task-local bundle (`artifacts/recipe-flows/ac<N>-*.json`) with each AC bound to a self-runnable subflow; shared canonical `perps/open-order-form` extracted. AC7 positive uses state-based wait on `perpsGetPositions` + direction regex + route lock + DOM checks (not a network probe). AC7 negative reused across empty-form + below-min. Worker's latest live run: main recipe 10/10 PASS in 30.8s, AC7 standalone 17/17 PASS in 4.5s, idempotent-skip branch 6/6 PASS in 2.6s on CDP 6662. CDP port is empty in the current review task block, so no fresh live re-run was attempted — verdict is based on the persisted run artifacts + recipe-quality review. Recipe seeds its own data (types `$15`, branches on pre-existing position); does not rely on a coincidentally-loaded wallet. Suggested delta (not blocking): add `bundle/ac4-tab-key-navigation`.

## Issues
(none)
