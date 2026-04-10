# Self-Review: TAT-2901

## Verdict: ISSUES

## Summary
Worker added a `perpsToggleTestnet` action wrapper in `ui/store/actions.ts` and a `METAMASK_DEBUG`-gated toggle in the Developer Options tab. The fix is correct, minimal, and well-tested. Minor nitpicks below.

## Type Check
- Result: PASS
- New errors: none

## Tests
- Result: PASS
- Details: 5/5 tests pass in `developer-options-tab.test.tsx`

## Test Quality
- Findings:
  - **developer-options-tab.test.tsx:69** — "should not render" uses "should" prefix (anti-pattern per project guidelines)
  - **developer-options-tab.test.tsx:78** — "should render" uses "should" prefix
  - **developer-options-tab.test.tsx:87** — "should call" uses "should" prefix
  - Note: pre-existing tests (lines 50, 98) also use "should", so worker followed existing convention. Still flagged per guidelines.

## Domain Anti-Patterns
- Findings: none found

## Mobile Comparison
- Status: N/A
- Details: Change is in developer-options-tab and actions.ts, not perps components/hooks/utils

## LavaMoat Policy
- Status: N/A
- Details: No new dependencies

## Fix Quality
- Best approach: yes — minimal surface area, reuses existing selector (`selectPerpsIsTestnet`) and background action (`perpsToggleTestnet`)
- Would not ship: none
- Test quality: good — covers visibility gate (METAMASK_DEBUG on/off) and click handler invocation
- Brittleness: none — `process.env.METAMASK_DEBUG` is well-established pattern in the codebase

## Diff Quality
- Minimal: yes
- Debug code: none

## Recipe
- Present: yes
- Quality: weak — uses `wait` with `ms: 2500` (2 nodes) instead of `wait_for`; uses `eval_sync` with `parentElement.click()` instead of `press` action; does not use `call` for unlock flow

## Issues
- **developer-options-tab.test.tsx:69,78,87** — test names use "should" prefix (easy fix: rename to declarative style e.g. "renders perps-testnet-toggle when METAMASK_DEBUG is set")
