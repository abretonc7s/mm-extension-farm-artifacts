# Bug Fix Report — TAT-2965

## Summary

The back button on the Perps market detail page always navigated to `DEFAULT_ROUTE` (wallet home), ignoring browser history. This caused users to lose their scroll position on the wallet home page and to be redirected to home instead of the market list when navigating back from a market they accessed via the market list.

## Root Cause

`ui/pages/perps/perps-market-detail-page.tsx:671-673` — `handleBackClick` called `navigate(DEFAULT_ROUTE)` unconditionally:

```typescript
const handleBackClick = useCallback(() => {
  navigate(DEFAULT_ROUTE); // always goes to home
}, [navigate]);
```

This hard-navigates to the wallet home route regardless of what screen the user came from, discarding browser history and resetting scroll position.

## Changes

- `ui/pages/perps/perps-market-detail-page.tsx` — Changed `navigate(DEFAULT_ROUTE)` to `navigate(-1)` in `handleBackClick`
- `ui/pages/perps/perps-market-detail-page.test.tsx` — Updated test assertion to expect `navigate(-1)` instead of `navigate('/')`

## Test Plan

**Automated:**
- Unit tests: 73/73 pass (`yarn jest ui/pages/perps/perps-market-detail-page.test.tsx`)
- Coverage: 88% (PASS, threshold 80%)
- Lint: `yarn lint:changed && yarn verify-locales --quiet && yarn circular-deps:check` — all pass
- Recipe: 21/21 nodes pass (see recipe-coverage.md)

**Manual Gherkin steps:**
```
Given I am on the Perps tab in wallet home
When I click "Explore markets" to open the market list
And I click on any market (e.g. ETH)
Then I am on the market detail page
When I click the back (←) button
Then I should be back on the market list
And not on wallet home

Given I am on the Perps tab in wallet home, scrolled down
When I click on a market card in the "Explore markets" section
Then I am on the market detail page
When I click the back (←) button
Then I should be back on wallet home with scroll position restored
```

## Evidence

- `before.mp4` — recipe run on buggy code (fails at ac1-wait-for-market-list as expected)
- `after.mp4` — recipe run on fixed code (21/21 pass)
- `before-ac1-on-market-detail.png` — market detail page before fix
- `after-ac1-after-back-on-market-list.png` — market list shown after pressing back (AC1 PROVEN)
- `after-ac2-after-back-on-home.png` — wallet home shown after pressing back from detail (AC2 PROVEN)

## Ticket

Fixes: [TAT-2965](https://consensyssoftware.atlassian.net/browse/TAT-2965)
