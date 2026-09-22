# PR #45986 — review comment triage

PR intent (from description + TAT-3853): make the unfunded Perps trade-screen CTA an
**enabled** `Add funds to trade` control, add a hint and a labeled available-balance
`Add funds` control, and instrument the unfunded deposit funnel
(click → deposit opened → deposit confirmed → order submitted).

Live fetch: 14 top-level inline review comments, 9 issue comments, 7 reviews
(1 `CHANGES_REQUESTED` from geositta, review `5242211383`).

- 3 inline threads are cursor[bot] findings from earlier commits and already have
  author replies at current HEAD (ids 3919978743, 3920285641, 4003393370) — no new reply.
- 9 issue comments are routine status automation (CLA, CODEOWNERS, 5× build-ready,
  SonarQube quality gate). **9 skipped without reply**, none actionable.

## Triage

| # | ID | Author | File | Triage | Action |
|---|----|--------|------|--------|--------|
| 1 | 4042083223 | geositta | ui/pages/perps/perps-order-entry-page.tsx:1144 | REAL | Add `getTradeableBalanceRaw` so absent/unparseable balance is "unknown", not a fundable zero |
| 2 | 4042083233 | geositta | ui/pages/perps/perps-order-entry-page.tsx:2169 | REAL | Funnel stores `{address, confirmedAt}`; consume requires a confirmed deposit for the same address |
| 3 | 4042083239 | geositta | ui/components/app/perps/perps-deposit-toast.tsx:71 | REAL | Fire-once ref keyed on deposit-result identity so `deposit_confirmed` cannot double-count |
| 4 | 4042083242 | geositta | ui/components/app/perps/order-entry/components/amount-input/amount-input.tsx:416 | REAL | Pass `hasNoAvailableBalance` down as the single source of truth; drop the child's threshold import |
| 5 | 4042083247 | geositta | ui/pages/perps/perps-order-entry-page.tsx:2318 | REAL | Derive `PerpsButtonLocation` from the `as const` instead of widening to `string` |
| 6 | 4042083249 | geositta | ui/pages/perps/perps-order-entry-page.tsx:2347 | REAL | Add non-deprecated `ORDER_FORM_FOOTER` location for the footer CTA |
| 7 | 4042083252 | geositta | ui/pages/perps/perps-order-entry-page.tsx:2380 | REAL | Collapse the duplicated branch into one helper taking `{buttonLocation, hasPerpBalance}` |
| 8 | 4042083254 | geositta | ui/components/app/perps/hooks/usePerpsDepositConfirmation.ts:91 | REAL | Always emit `has_perp_balance` (true/false), never omit it |
| 9 | 4042083257 | geositta | ui/pages/perps/perps-order-entry-page.tsx:2338 | REAL | Track the click before the eligibility branch, with a `geo_block_modal`/`deposit` outcome |
| 10 | 4042083259 | geositta | ui/components/app/perps/order-entry/components/amount-input/amount-input.tsx:433 | REAL | Drop redundant `onClick` guard; make both branches gate on `onAddFunds` symmetrically |
| 11 | 4042083262 | geositta | ui/components/app/perps/constants.ts:76 | REAL | Correct the threshold rationale comment; name the $10 minimum in the hint copy |

Totals: **11 REAL, 0 FALSE POSITIVE, 0 OUT OF SCOPE** (+3 already-replied bot threads, 9 skipped status comments).

## Recipe re-validation (step 10)

`RECIPE_SOURCE=family-inherited` (trusted), `HAS_RECIPE=yes`.

**Result: PASS** — `temp/tasks/fix/45986-0923-000830/artifacts/recipe-run/summary.json`.
All 13 nodes executed against `branch + origin/main` (post-rebase). The AC2 screenshot
(`screenshots/after-ac2-unfunded-cta.png`, `metadata.provider = capture-helper`, not the
CDP fallback) shows the live post-fix UI: `Available to trade 0.00 USDC` with a labeled
**Add funds** row control, an enabled **Add funds to trade** footer CTA, and the revised
hint copy from comment 11 — "Add at least $10 to your Perps account to place this order."

Side findings: 5 pre-existing application warnings/errors (reselect input-selector
warnings, Solana Snap account de-sync, a dehydrated auth-storage query rejection).
None touch the files in this diff; non-blocking.

### Runtime note (framework, not a repo issue)

Each `mm-harness launch` re-snapshots `temp/recipe/runtime/runtime-dist` underneath the
running Chrome, which invalidates the loaded unpacked extension. Chrome then persists
`disable_reasons: [16777216]` for extension `hebhblbkkdabgoldnojllkipeoacjioc` in
`chrome-profile/Default/Secure Preferences`, and every later launch lands on
`ERR_BLOCKED_BY_CLIENT` / `WALLET_STATE_REQUIRED` — `launch --verify` alone does not
recover it. Recovery used twice this run (steps 4 and 10): `mm-harness stop`, kill the
Chrome processes on the CDP port, clear that `disable_reasons` entry, then relaunch.
No repo config was changed for this.

## Final summary (step 13)

- **Total actionable comments: 11** — 11 REAL, 0 FALSE POSITIVE, 0 OUT OF SCOPE.
  All from geositta's `CHANGES_REQUESTED` review `5242211383`. Every one was verified
  against current HEAD before being fixed.
- **Not replied to:** 3 cursor[bot] inline threads already answered at HEAD and already
  resolved (3919978743, 3920285641, 4003393370); 9 status-only issue comments
  (CLA, CODEOWNERS, 5× build-ready, SonarQube) — skipped without reply, none actionable.
- **Commit SHA:** `3bbdb97bf4d0f3dffb8f62ae453f7741c4055986`
- **Threads:** all 11 replied inline with the SHA and resolved via `resolveReviewThread`.

### Files changed in the review-fix commit

| File | Comments addressed |
|------|--------------------|
| `shared/constants/perps-events.ts` | 5, 6, 9 — `ORDER_FORM_FOOTER`, `DEPOSIT_CLICK_OUTCOME`, derived `PerpsButtonLocation` / `PerpsDepositClickOutcome` |
| `ui/hooks/perps/getTradeableBalance.ts` | 1 — new `getTradeableBalanceRaw` sibling accessor |
| `ui/pages/perps/perps-order-entry-page.tsx` | 1, 2, 5, 6, 7, 9, 11 |
| `ui/components/app/perps/utils/unfunded-deposit-funnel.ts` | 2 — `{address, confirmedAt}` funnel with confirm/clear |
| `ui/components/app/perps/perps-deposit-toast.tsx` | 3, 8 — fire-once guard, always-emitted property |
| `ui/components/app/perps/hooks/usePerpsDepositConfirmation.ts` | 8 |
| `ui/components/app/perps/order-entry/components/amount-input/amount-input.tsx` | 4, 10 |
| `ui/components/app/perps/order-entry/order-entry.tsx`, `order-entry.types.ts` | 4 — prop pass-through |
| `ui/components/app/perps/constants.ts` | 11 — corrected threshold rationale |
| `app/_locales/en/messages.json`, `app/_locales/en_GB/messages.json` | 11 — hint names the $10 minimum |
| 5 test files | regression coverage for 1, 3, 4, 8, 9 |

### Validation

- `mm-harness check diff --profile fast`: **PASS** (policy-suppressions, eslint, oxfmt, jest)
- Coverage on changed files: **PASS** — 88% new code (threshold 80%)
- Targeted jest (5 suites): **245 passed**
- Final parity gate (`lint:changed` + `verify-locales` + `circular-deps:check`): **PASS**
- Recipe re-validation: **PASS** (capture-helper screenshot, see above)
- Integration status (step 3): **`rebased`** — clean 4-commit rebase onto `origin/main`,
  `yarn install --immutable` rerun after `yarn.lock` moved; pushed with `--force-with-lease`.
