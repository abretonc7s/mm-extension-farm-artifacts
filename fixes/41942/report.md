# Fix Report — TAT-2847: Input isn't centered in withdraw flow

## Summary

The hero fiat amount input (`$X.XX`) in the perps withdraw flow was left-aligned in the narrow popup viewport. Adding `className="w-full"` to the container box ensures `justify-content: center` correctly centers the content at all viewport sizes.

## Root Cause

**File:** `ui/components/app/perps/perps-fiat-hero-amount-input/perps-fiat-hero-amount-input.tsx` (line 133)

The outer `Box` in `PerpsFiatHeroAmountInput` had no `className="w-full"`. Without it, the box rendered as content-sized (width = $ symbol + input width, e.g. ~82% of parent for a 9-char amount). In the parent column flex container (`align-items: center`), this content-sized box was centered in fullscreen mode but in popup mode (~360px) the box filled nearly the full width with negligible margins, making the amount appear left-aligned.

Measured before fix: `heroBox.width=386px`, `parentBox.width=468px`, `widthRatio=0.82`.
Measured after fix: `widthRatio=1.0`.

## Changes

| File | Change |
|------|--------|
| `ui/components/app/perps/perps-fiat-hero-amount-input/perps-fiat-hero-amount-input.tsx` | Added `className="w-full"` to outer Box at line 133 |
| `ui/components/app/perps/perps-fiat-hero-amount-input/perps-fiat-hero-amount-input.test.tsx` | Added test asserting `w-full` class on container |

## Test Plan

**Automated:**
- Unit tests: 6/6 pass (`yarn jest perps-fiat-hero-amount-input.test.tsx`)
- CI-parity lint gate: pass (`yarn lint:changed && yarn verify-locales --quiet && yarn circular-deps:check`)
- Recipe `tat-2847-withdraw-input-centered`: 7/7 nodes pass. Assertion verifies `heroFillsParent=true` (widthRatio >= 0.95) and `contentCentered=true` (offset <= 20px).

**Manual Gherkin:**
```
Given I am on the perps withdraw page
When I click the "10%" percentage button
Then the amount "$X.XX" should appear horizontally centered
And the left margin should equal the right margin
```

## Evidence

- `before.mp4` — recipe run before fix (assertion fails at ac1-assert-full-width-centered)
- `after.mp4` — recipe run after fix (all nodes pass)
- `after-ac1-withdraw-input-centered.png` — screenshot showing centered amount post-fix
- `recipe-coverage.md` — AC coverage matrix (1/1 PROVEN)
- `recipe-quality.json` — recipe quality assessment (verdict: pass)

## Ticket

[TAT-2847](https://consensyssoftware.atlassian.net/browse/TAT-2847)
