# Self-Review: TAT-2893

## Verdict: PASS

## Summary
Added margin-vs-balance validation to the perps order entry page. When required margin (amount / leverage) exceeds available balance, the submit button is disabled and shows "Insufficient funds". This matches mobile's `usePerpsOrderValidation` logic at lines 92-100. Minimal, correct, well-tested.

## Type Check
- Result: PASS
- New errors: none in changed files (2 pre-existing errors in unrelated files: app-state-controller.ts, metametrics-controller.ts)

## Tests
- Result: PASS
- Details: 51/51 tests pass in perps-order-entry-page.test.tsx. Two new tests added: one for exceeding balance (button disabled + "Insufficient funds" text), one for within balance (button enabled + normal text).

## Test Quality
- Findings: none found
- No "should" in test names, AAA pattern followed, assertions use `messages.insufficientFundsSend.message` (i18n source, not hardcoded string), specific assertions (`.toBeDisabled()`, `.toHaveTextContent()`), both positive and negative cases covered.

## Domain Anti-Patterns
- Findings: none found
- Import boundaries clean, no controller misuse, no LavaMoat impact, no MV3 concerns, no magic strings, existing testIDs used, no new interactive elements without testIDs.

## Mobile Comparison
- Status: ALIGNED
- Details: Extension's `marginRequired > availableBalance` matches mobile's `usePerpsOrderValidation.ts:92-100` pattern exactly. No formatting divergence introduced. Mobile also validates minimum order size (lines 102-117) which extension lacks — separate concern, not a regression.

## LavaMoat Policy
- Status: N/A
- Details: No dependency changes, no policy update needed.

## Fix Quality
- Best approach: yes — minimal `useMemo` + wiring into existing `isSubmitDisabled` + button text override. Matches mobile's validation pattern.
- Would not ship: none
- Test quality: good — tests assert correct behavior for both paths (exceeds/within balance), use concrete numbers tied to mock state with comments explaining the math, would fail if fix is reverted.
- Brittleness: none — reactive deps only, no import-time evaluation, no mock coupling issues.

## Diff Quality
- Minimal: yes — 2 files, +54 −1, all directly required for the fix.
- Debug code: none

## Recipe
- Present: yes
- Quality: good — tests the actual fix (large amount = disabled + "Insufficient funds", small amount = enabled + "Open long"), uses `call` for navigation flow, includes screenshots for evidence. Could not re-run (CDP_PORT not configured for self-review), but worker report confirms 12/12 nodes passed with video evidence.

## Issues

(none)
