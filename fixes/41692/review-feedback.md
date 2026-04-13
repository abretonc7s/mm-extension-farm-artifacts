# Self-Review: TAT-2831

## Verdict: PASS

## Summary
The worker updated the perps order-entry page so zero-balance new orders no longer show an enabled trade CTA, and the CTA label now changes to `Add funds`. The implementation is narrow, type-safe, covered by a targeted Jest test, and validated end-to-end with the recipe trace.

## Type Check
- Result: PASS
- New errors: none

## Tests
- Result: PASS
- Details: `yarn jest ui/pages/perps/perps-order-entry-page.test.tsx --no-coverage` passed (`50` tests). Recipe replay on CDP `6664` also passed and produced a successful `trace.json`.

## Test Quality
- Findings: none found

## Domain Anti-Patterns
- Findings: none found

## Mobile Comparison
- Status: DIVERGES
- Details: Mobile `PerpsOrderView` currently derives an insufficient-funds CTA from available balance and minimum order amount at [/Users/deeeed/dev/metamask/metamask-mobile-ref/app/components/UI/Perps/Views/PerpsOrderView/PerpsOrderView.tsx:1216] and shows the zero-balance warning state at [/Users/deeeed/dev/metamask/metamask-mobile-ref/app/components/UI/Perps/Views/PerpsOrderView/PerpsOrderView.tsx:1291]. The extension change at [ui/pages/perps/perps-order-entry-page.tsx](/Users/deeeed/dev/metamask/metamask-extension-4/ui/pages/perps/perps-order-entry-page.tsx:404) instead relabels the primary CTA to `Add funds`. This is a product divergence, but it appears intentional for this ticket and is backed by the recipe expectations.

## LavaMoat Policy
- Status: OK
- Details: No dependency or lockfile changes were present, and no LavaMoat policy update was needed.

## Fix Quality
- Best approach: yes — for this PR, the balance gate and label swap are implemented in the narrowest place that owns the sticky submit CTA, at [perps-order-entry-page.tsx](/Users/deeeed/dev/metamask/metamask-extension-4/ui/pages/perps/perps-order-entry-page.tsx:404) and [perps-order-entry-page.tsx](/Users/deeeed/dev/metamask/metamask-extension-4/ui/pages/perps/perps-order-entry-page.tsx:993). Longer-term, CTA semantics could be centralized with the shared order-entry/mobile insufficient-funds model to reduce divergence.
- Would not ship: none
- Test quality: good — the new test at [perps-order-entry-page.test.tsx](/Users/deeeed/dev/metamask/metamask-extension-4/ui/pages/perps/perps-order-entry-page.test.tsx:443) asserts both disabled state and the translated label, and it would fail if the fix were reverted.
- Brittleness: none

## Diff Quality
- Minimal: yes — the diff only touches the page gate/label logic and a single focused test.
- Debug code: none

## Recipe
- Present: yes
- Quality: good — the recipe seeds its own zero-balance account state via `setup-inject-zero-balance-account`, asserts the disabled submit CTA and `Add funds` label, and the recorded trace shows the AC nodes executed successfully.

## Issues
