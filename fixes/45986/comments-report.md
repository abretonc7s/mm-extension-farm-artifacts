# Comments report — PR 45986

PR intent (TAT-3853): unfunded trade-screen users convert at 4.8% vs Mobile 12.4%. This PR enables Add funds to trade, adds a labeled row control, and instruments the deposit funnel.

## Triage

| # | Author | File | Triage | Action |
|---|--------|------|--------|--------|
| 1 | cursor[bot] | ui/pages/perps/perps-order-entry-page.tsx:887 | REAL | Already fixed in 728d2be6. `hasNoAvailableBalance` waits on `!isLoadingAccount`; `isSubmitDisabled` includes `isLoadingAccount`. Already replied; thread resolved. No new code. |
| 2 | cursor[bot] | ui/components/app/perps/order-entry/components/amount-input/amount-input.tsx:425 | REAL | Already fixed in 2811940cf1. Labeled Add funds waits on `!isLoadingAccount`; icon disabled while hydrating; `handleAddFunds` returns early. Already replied; thread resolved. No new code. |

## Skipped status-only automation (6, no reply)

- github-actions[bot] 5518479240 CLA
- metamask-ci[bot] 5518480911 codeowners
- metamask-ci[bot] 5518669669 builds ready
- metamask-ci[bot] 5519215424 builds ready
- sonarqubecloud[bot] 5519441272 quality gate
- metamask-ci[bot] 5519515819 builds ready + benchmarks

CHANGES_REQUESTED reviews: none.
Human review comments: none.

## Current HEAD check

- `hasNoAvailableBalance` includes `!isLoadingAccount`
- `isSubmitDisabled` includes `isLoadingAccount`
- amount-input labeled button gated on `!isLoadingAccount`
- `handleAddFunds` returns while `isLoadingAccount`

## Totals

- Total comments: 8 (2 REAL, 0 FALSE POSITIVE, 6 OUT OF SCOPE)
- Commit SHA for fixes: none this run (prior fixes still on branch: `728d2be6d41b564cd6a652786c6e0ad2fc0996d3`, `2811940cf14f1fac50ecf84b3cc73dcef9e6ff30`)
- Files changed this run: none (rebase only)
- Recipe re-validation: PASS
- Integration status: rebased

## Replies (step 12)

- 3919978743 already replied (abretonc7s 3920260514). Thread resolved. No second reply.
- 3920285641 already replied (abretonc7s 3920425023). Thread resolved. No second reply.
- Issue comments: status-only, no consolidated top-level response.

## Integration (step 3)

rebased onto origin/main `e62cb0b42abefad10385caacdda0e939aa9a434c`. Pushed `2811940cf14f1fac50ecf84b3cc73dcef9e6ff30` with `--force-with-lease`.

Conflicts in `perps-events.ts`, `usePerpsDepositConfirmation.ts`, `perps-order-entry-page.tsx` resolved by keeping main chart/CTA structure plus this PR's funnel events, PayWithOption import, unfunded hint, and loading guards.

## Recipe re-validation (step 10)

PASS. Live run after rebase + `yarn install` + `mm-harness launch --verify` + `fixtures set`.
Screenshot `recipe-run/screenshots/after-ac2-unfunded-cta.png` from capture-helper: enabled Add funds to trade, hint, labeled Add funds on the available-to-trade row.

`--launch-existing-dist` failed (Playwright Chromium cache). Reran attached to CDP 7662.

## No-change reason (review-fix commit)

No new review-fix commit. Both REAL comments were already fixed and replied on this branch. Push published the rebase onto origin/main only.
