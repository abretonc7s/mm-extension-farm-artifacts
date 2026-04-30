# PR #41949 Review Comment Triage

Branch: `feat/tat-2802-keyboard-order-entry-ux`

## Context

PR purpose: keyboard-first perps order entry across trade, limit, modify, TP/SL, and close flows. The core acceptance criteria are autofocus, select-on-focus, Enter-to-submit, ArrowUp/ArrowDown leverage stepping, real-time market-order minimum-size validation, and submit/toast behavior that waits for RPC success before navigating.

Merge-main status: clean merge from `origin/main` in `f302c17cc8`.

Recipe re-validation result: FAIL (unrelated recipe-bundle issue). CDP was healthy and the extension page was reloaded, but `validate-recipe.js` failed before exercising product behavior because the inherited recipe references missing shared flow `perps/open-order-form`. Teardown `perps/close-position` completed successfully.

## Triage

| # | Comment ID | Author | File | Triage | Action |
|---|---:|---|---|---|---|
| 1 | 3118571033 | cursor[bot] | `ui/components/app/perps/order-entry/order-entry.tsx` | REAL | Wire the size placeholder through `OrderEntry` only for market orders so limit orders keep the default `0.00` placeholder. |
| 2 | 3123301814 | cursor[bot] | `ui/components/app/perps/order-entry/order-entry.tsx:352` | REAL | Add `OrderEntryProps.usdPlaceholder`, pass it to `AmountInput`, and provide `min $10` from the page for market order mode. |
| 3 | 3123301827 | cursor[bot] | `ui/pages/perps/perps-order-entry-page.tsx:1341` | FALSE POSITIVE | Current branch already sets `type="button"` on `DirectionTabs` and the limit `Mid` button. |
| 4 | 3123597568 | cursor[bot] | `ui/pages/perps/perps-order-entry-page.tsx:1335` | FALSE POSITIVE | Current branch already resolves button text with `isBelowMinOrderSize` before `isInsufficientFunds`. |
| 5 | 3124223200 | cursor[bot] | `ui/components/app/perps/order-entry/components/leverage-slider/leverage-slider.tsx:132` | FALSE POSITIVE | Current branch reads ArrowUp/Down base leverage from `event.currentTarget.value`, avoiding stale React state. |
| 6 | 3124638602 | cursor[bot] | `ui/pages/perps/perps-order-entry-page.tsx` | FALSE POSITIVE | Current branch only calls `handleBackClick()` after successful close/modify/new-order RPC results. |
| 7 | 3124841816 | cursor[bot] | `ui/pages/perps/perps-order-entry-page.tsx:595` | FALSE POSITIVE | Current locale copy says `at least $10`, matching the strict-less-than validation. |
| 8 | 3124841826 | cursor[bot] | `ui/pages/perps/perps-order-entry-page.tsx:986` | FALSE POSITIVE | Current close flow emits the in-progress toast before awaiting the close RPC and navigates only after success. |
| 9 | 3125016570 | cursor[bot] | `ui/pages/perps/perps-order-entry-page.tsx:913` | FALSE POSITIVE | Current new-order in-progress toast includes `tradeActionToastDescription`. |
| 10 | 3129537024 | cursor[bot] | `ui/components/app/perps/order-entry/components/amount-input/amount-input.tsx:215` | REAL | Move token select-all to a post-rerender effect so the selection applies after editing state switches the displayed value. |
| 11 | 3129537035 | cursor[bot] | `ui/pages/perps/perps-order-entry-page.tsx:1018` | FALSE POSITIVE | Current `ORDER_MODE_TOAST_KEYS.modify` has no generic in-progress toast, so modify paths emit only their specific progress toast. |
| 12 | 4281050658 | github-actions[bot] | conversation | OUT OF SCOPE | CLA status notification only. |
| 13 | 4281252988 | metamaskbotv2[bot] | conversation | OUT OF SCOPE | Build artifact notification only. |
| 14 | 4286065240 | metamaskbotv2[bot] | conversation | OUT OF SCOPE | CODEOWNERS notification only. |
| 15 | 4286139254 | metamaskbotv2[bot] | conversation | OUT OF SCOPE | Build artifact notification only. |
| 16 | 4289583052 | metamaskbotv2[bot] | conversation | OUT OF SCOPE | Build artifact notification only. |
| 17 | 4289752873 | abretonc7s | conversation | OUT OF SCOPE | Prior worker report; no new review request. |
| 18 | 4295591655 | metamaskbotv2[bot] | conversation | OUT OF SCOPE | Build artifact notification only. |
| 19 | 4295868113 | metamaskbotv2[bot] | conversation | OUT OF SCOPE | Build artifact notification only. |
| 20 | 4296669494 | metamaskbotv2[bot] | conversation | OUT OF SCOPE | Build artifact notification only. |
| 21 | 4297166186 | metamaskbotv2[bot] | conversation | OUT OF SCOPE | Build artifact notification only. |
| 22 | 4297608899 | metamaskbotv2[bot] | conversation | OUT OF SCOPE | Build artifact notification only. |
| 23 | 4303140321 | metamaskbotv2[bot] | conversation | OUT OF SCOPE | Build artifact notification only. |
| 24 | 4311976026 | abretonc7s | conversation | OUT OF SCOPE | Prior worker report with no actionable content. |
| 25 | 4312101140 | abretonc7s | conversation | OUT OF SCOPE | Prior worker report with no actionable content. |
| 26 | 4312180825 | metamaskbotv2[bot] | conversation | OUT OF SCOPE | Build artifact notification only. |
| 27 | 4319158595 | metamaskbotv2[bot] | conversation | OUT OF SCOPE | Build artifact notification only. |
| 28 | 4319519028 | metamaskbotv2[bot] | conversation | OUT OF SCOPE | Build artifact notification only. |
| 29 | 4331429546 | geositta | conversation | FALSE POSITIVE | Stale against branch tip; current visible back button uses `handleBackButtonClick` with history pop and fallback replace. |
| 30 | 4332078246 | metamaskbotv2[bot] | conversation | OUT OF SCOPE | Build artifact notification only. |
| 31 | 4333266875 | abretonc7s | conversation | OUT OF SCOPE | Automated run summary; no new actionable review request. |
| 32 | 4333281705 | abretonc7s | conversation | OUT OF SCOPE | Existing reply noting the back-button fix. |
| 33 | 4333805832 | metamaskbotv2[bot] | conversation | OUT OF SCOPE | Build artifact notification only. |
| 34 | 4341593422 | abretonc7s | conversation | OUT OF SCOPE | Prior follow-up summary; no new actionable review request. |
| 35 | 4341677777 | metamaskbotv2[bot] | conversation | OUT OF SCOPE | Build artifact notification only. |
| 36 | 4341905744 | metamaskbotv2[bot] | conversation | OUT OF SCOPE | Build artifact notification only. |
| 37 | 4348494666 | metamaskbotv2[bot] | conversation | OUT OF SCOPE | Build artifact notification only. |
| 38 | 4351518029 | sonarqubecloud[bot] | conversation | OUT OF SCOPE | Quality-gate status notification only. |
| 39 | 4351554001 | metamaskbotv2[bot] | conversation | OUT OF SCOPE | Build artifact notification only. |

## Final Summary

Total comments: 39 (3 REAL, 9 FALSE POSITIVE, 27 OUT OF SCOPE)

Commit SHA for fixes: `560621c18f`

Files changed:
- `app/images/blackfort.png`
- `app/images/default_nft.png`
- `app/images/icon-128.png`
- `app/images/icon-32.png`
- `app/images/icon-512.png`
- `app/images/linea-logo-testnet.png`
- `ui/components/app/perps/order-entry/components/amount-input/amount-input.test.tsx`
- `ui/components/app/perps/order-entry/components/amount-input/amount-input.tsx`
- `ui/components/app/perps/order-entry/order-entry.test.tsx`
- `ui/components/app/perps/order-entry/order-entry.tsx`
- `ui/components/app/perps/order-entry/order-entry.types.ts`
- `ui/pages/perps/perps-order-entry-page.tsx`

Recipe re-validation result: FAIL (unrelated missing shared flow `perps/open-order-form`; teardown passed).

Merge-main status from step 3: clean. Local branch was later rebased onto the remote branch tip after the remote advanced; pushed without force.

Verification:
- `yarn lint:changed && yarn verify-locales --quiet && yarn circular-deps:check` passed after fixes.
- Affected/targeted Jest suites passed, including `amount-input.test.tsx`, `order-entry.test.tsx`, and leverage coverage from the remote tip.
- `node temp/runtime/coverage-analyze.js` passed with new code at 96%.
