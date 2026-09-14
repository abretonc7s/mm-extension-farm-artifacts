# Comments report — PR #45986

Fetched live from GitHub (not the TASK.md snapshot).

## Totals

- Actionable review comments: 3 (3 REAL, 0 FALSE POSITIVE, 0 OUT OF SCOPE)
- Skipped status-only comments: 8 issue + 1 Bugbot review summary (no replies)
- Commit SHA for this round's fix: `c82dde9e5d5186610b97f59bb50ad552b07dd319`
- Files changed this round: `ui/pages/perps/perps-order-entry-page.tsx`, `ui/pages/perps/perps-order-entry-page.test.tsx`
- Recipe re-validation: PASS (13/13 nodes, capture-helper PNG)
- Integration status: `skipped` (HEAD already contained origin/main at start)

## Actionable comments

| # | Author | File | Triage | Action |
|---|--------|------|--------|--------|
| 1 | cursor[bot] | ui/pages/perps/perps-order-entry-page.tsx:1148 (orig 886) | REAL | Already fixed in 002b882; already replied; thread resolved |
| 2 | cursor[bot] | ui/components/app/perps/order-entry/components/amount-input/amount-input.tsx:425 | REAL | Already fixed in 948c431; already replied; thread resolved |
| 3 | cursor[bot] | ui/pages/perps/perps-order-entry-page.tsx:1350 | REAL | Fixed in c82dde9e5d; replied; thread resolved |

### 1. Unfunded CTA shown while balance loads — `review_comment` 3919978743

`hasNoAvailableBalance` originally dropped the loading wait, so a missing account looked like $0 and the primary button became Add funds to trade. Fixed in 002b882 by requiring `!isLoadingAccount`. Thread already replied and resolved. Recorded as already replied.

### 2. Row CTA ignores account loading — `review_comment` 3920285641

The labeled Add funds row control used the raw zero fallback while the footer waited on loading. Fixed in 948c431 by gating the row control and `handleAddFunds` on `isLoadingAccount`. Thread already replied and resolved. Recorded as already replied.

### 3. Loading account blocks close and modify — `review_comment` 4003393370

The first review-fix restored a loading disable, but as a global `isLoadingAccount ||` on `isSubmitDisabled`. Main only disabled new-order submit while the account hydrates: `(orderMode === 'new' && isLoadingAccount)`. Close and modify already have their own validations (`isInsufficientFunds` is false in close; empty-amount modify is TP/SL-only).

Fix: restore the new-order-only loading guard. Tests cover close and modify remaining enabled while `isInitialLoading` is true.

Reply: https://github.com/MetaMask/metamask-extension/pull/45986#discussion_r4003879598
Thread `PRRT_kwDOAoEEns6iCWPa` resolved.

## Skipped status-only comments (8 issue + 1 review summary)

No replies.

| ID | Author | Why skipped |
|----|--------|-------------|
| 5518479240 | github-actions[bot] | CLA signature |
| 5518480911 | metamask-ci[bot] | CODEOWNERS notice |
| 5518669669 | metamask-ci[bot] | Builds ready [c45015c] |
| 5519215424 | metamask-ci[bot] | Builds ready [002b882] |
| 5519515819 | metamask-ci[bot] | Builds ready [948c431] |
| 5619782252 | metamask-ci[bot] | Builds ready [2811940] |
| 5661250569 | sonarqubecloud[bot] | Quality Gate passed |
| 5661322393 | metamask-ci[bot] | Builds ready [90e908a] |
| review 5195454359 | cursor[bot] | Bugbot summary of comment 3; no extra suggestion |

No `CHANGES_REQUESTED` reviews. No human review comments besides prior author replies.

## Recipe re-validation

PASS. 13/13 nodes. Screenshot `artifacts/recipe-run/screenshots/after-ac2-unfunded-cta.png` is capture-helper (pid selector, Google Chrome for Testing). PNG shows 0.00 USDC, labeled row Add funds, hint, enabled footer Add funds to trade on `#/perps/trade/BTC?direction=long&mode=new`.

check-diff: pass (eslint, oxfmt, jest). Coverage: PASS, new code 93% (26/28).
