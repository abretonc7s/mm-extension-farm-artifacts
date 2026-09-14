# PR #45986 comment triage

PR: feat(perps): investigate and improve deposit conversion for unfunded trade-screen users
HEAD: `90e908ada2` (rebased onto `origin/main` `e325afe94c`; pushed with lease from `2811940cf1`)

## Triage table

| # | Author | File | Triage | Action |
|---|--------|------|--------|--------|
| 1 | cursor[bot] | ui/pages/perps/perps-order-entry-page.tsx:985 | REAL | Already fixed on this branch. `hasNoAvailableBalance` requires `!isLoadingAccount`; `isSubmitDisabled` includes `isLoadingAccount`. Covered by `does not treat a loading account as unfunded` / `does not show add funds to trade while account state is still loading at zero balance`. Thread already replied (`002b882`) and resolved. No further code change. |
| 2 | cursor[bot] | ui/components/app/perps/order-entry/components/amount-input/amount-input.tsx:425 | REAL | Already fixed on this branch. Labeled Add funds renders only when `!isLoadingAccount && availableBalance < threshold`; `handleAddFunds` returns while loading. Covered by amount-input and order-entry tests. Thread already replied (`948c431`) and resolved. No further code change. |

## Skipped status-only automation (7, no reply)

- github-actions[bot] `5518479240` — CLA signed
- metamask-ci[bot] `5518480911` — CODEOWNERS file list
- metamask-ci[bot] `5518669669` / `5519215424` / `5519515819` / `5619782252` — Builds ready
- sonarqubecloud[bot] `5619660610` — Quality Gate passed

## Reviews

- No `CHANGES_REQUESTED` reviews.
- cursor[bot] reviews `5096627260` and `5096945837` are `COMMENTED` summaries of the two inline findings above.
- abretonc7s replies already exist on both threads; both GraphQL threads `isResolved: true`.

## No-change reason (code)

This round's comment fetch has no open REAL findings that still need a diff. Step 7 will not add a review-fix commit. Step 11 still needs a force-with-lease push because step 3 rebased onto `origin/main` (`integration-status: rebased`).

## Replies

- cursor[bot] `3919978743`: already replied (`abretonc7s` `3920260514`); thread resolved. No second reply.
- cursor[bot] `3920285641`: already replied (`abretonc7s` `3920425023`); thread resolved. No second reply.
- No new top-level issue comment (status-only automation only).

## Recipe re-validation

- Proof kind: mixed (selector waits + capture-helper PNG)
- Result: PASS (13/13 nodes, 6.2s) against `90e908ada2` + `origin/main`
- Artifacts: `artifacts/recipe-run/`
- Screenshot provider: capture-helper (`screenshots/after-ac2-unfunded-cta.png`)
- PNG read: BTC long order form, Available to trade 0.00 USDC, labeled row Add funds, hint "You need funds in your Perps account to place this order.", enabled footer Add funds to trade
- Side findings: 9 non-blocking app warnings/errors; not treated as AC failure

## Totals

- Total comments triaged: 9 (2 REAL, 0 FALSE POSITIVE, 7 OUT OF SCOPE)
- Skipped status-only without reply: 7
- Commit SHA for fixes: none this round (existing `70da0b96bc` and `90e908ada2` already on the branch)
- Files changed this round: none in product; history rewritten onto main (17 PR files)
- Recipe re-validation: PASS
- Integration status: rebased
- Pushed: `90e908ada2` to `origin/TAT-3853-feat-audit-deposit-flow-unfunded-us`
