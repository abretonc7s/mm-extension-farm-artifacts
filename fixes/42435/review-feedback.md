# Self-Review: TAT-2849

## Verdict: PASS

## Summary
The worker updated the Perps partial-close minimum-notional warning so Extension users are told to increase the close amount or close the full position, rather than set a slider to 100%. The implementation is a minimal locale copy update with affected tests deriving the expected message from the English i18n helper.

## Type Check
- Result: PASS
- New errors: none

## Tests
- Result: PASS
- Details: `yarn jest ui/components/app/perps/close-position/close-position-modal.test.tsx --no-coverage` passed 20/20 tests. The suite output included existing suppressed React `act()` warnings, but no console baseline violations.

## Test Quality
- Findings: none found

## Domain Anti-Patterns
- Findings: none found

## Mobile Comparison
- Status: ALIGNED
- Details: Mobile uses a separate close-position view and validation hook. The comparable mobile copy for minimum/full-close guidance tells users to close 100% instead; the Extension-specific copy now directs users to close the full position without referencing a mobile/slider-specific UI element.

## LavaMoat Policy
- Status: N/A
- Details: No dependency, lockfile, attribution, or LavaMoat policy files changed.

## Fix Quality
- Best approach: yes — the issue is copy-only, and changing the shared locale key is the smallest correct fix for both inline validation and background `ORDER_SIZE_MIN` surfaces.
- Would not ship: none
- Test quality: good — tests assert the localized warning source, absence of slider/slide copy, full-position guidance, disabled submit behavior, and toast description behavior.
- Brittleness: none

## Diff Quality
- Minimal: yes — only the relevant locale messages and affected test expectations changed.
- Debug code: none

## Recipe
- Present: yes
- Quality: good — the recipe seeds an ETH Perps position through the existing `perps/open-long-position` flow, drives the close-position modal, asserts no slider copy, asserts full-position copy, and captures screenshots. Live rerun on CDP `6662` passed `8/8`.

## Visual Evidence
- Status: OK
- Details: Evidence manifest includes a before/after screenshot pair, and the manifest gate emitted no `FAIL_EMPTY` or `MISSING:` lines.

## Issues

