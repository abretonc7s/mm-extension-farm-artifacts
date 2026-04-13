# Report — TAT-2893: No restriction on order size above available margin

## Summary

The perps order entry page allowed users to submit orders of any size regardless of available balance. Added a margin-vs-balance check that disables the submit button and shows "Insufficient funds" when the required margin exceeds the available balance, matching mobile's existing `usePerpsOrderValidation` behaviour.

## Root cause

`ui/pages/perps/perps-order-entry-page.tsx:433` — `isSubmitDisabled` checked eligibility, pending state, limit price validity, near-liquidation, and zero price, but never compared margin required (`amount / leverage`) against `availableBalance`. Mobile has this check in `usePerpsOrderValidation.ts:92-100`.

## Changes

| File | Description |
|------|-------------|
| `ui/pages/perps/perps-order-entry-page.tsx` | Added `isInsufficientFunds` useMemo (margin > availableBalance), wired into `isSubmitDisabled`, added `resolvedButtonText` showing "Insufficient funds" when triggered |
| `ui/pages/perps/perps-order-entry-page.test.tsx` | Added 2 tests: submit disabled + text when exceeding balance; submit enabled + normal text when within balance |

## Test plan

- **Unit tests**: 51/51 pass (`yarn jest ui/pages/perps/perps-order-entry-page.test.tsx --no-coverage`)
- **Lint + types**: `yarn lint && yarn verify-locales --quiet && yarn circular-deps:check` — clean (pre-existing tsc errors in unrelated files)
- **Recipe**: 12/12 nodes pass — enters $999M (button disabled, "Insufficient funds"), then $1 (button enabled, "Open Long ETH")
- **Coverage**: 3/3 ACs PROVEN (see `recipe-coverage.md`)

### Manual steps (Gherkin)

```
Given the wallet is unlocked with perps enabled and a funded account
When I navigate to the order entry page for ETH Long
And I enter an amount of 999999999
Then the submit button is disabled
And the submit button text reads "Insufficient funds"
When I change the amount to 1
Then the submit button is enabled
And the submit button text reads "Open Long ETH"
```

## Evidence

| Artifact | Description |
|----------|-------------|
| `before.mp4` | Recipe running against buggy code — fails at button-disabled check |
| `after.mp4` | Recipe running against fixed code — 12/12 pass |
| `after-ac1-button-disabled.png` | $999M entered, button disabled with "Insufficient funds" |
| `after-ac3-button-enabled.png` | $1 entered, button enabled with "Open Long ETH" |

## Ticket

[TAT-2893](https://consensyssoftware.atlassian.net/browse/TAT-2893)
