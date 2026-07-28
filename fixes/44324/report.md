# PR #44324 — Interactive PR-complete re-entry report

**Branch:** `MANUAL-000001-feat-consume-perps-controller-analy` · **PR:** MetaMask/metamask-extension#44324 (OPEN, `reviewDecision: REVIEW_REQUIRED`)
**Family:** `bda2ae18-62b0-40ec-afd1-8f21a0d9d9e4` (inherited context present)
**Status:** done — closed by operator instruction. Three commits pushed (`1f0c8327c3`, `85d2502662`, `b690bcbcf9`); branch HEAD `b690bcbcf9`. Nothing was posted to GitHub: thread replies, the dismissed-review response, and the review re-request are Arthur's, deferred to the morning.

## Summary

Re-entered the PR, reloaded family context, re-fetched live review state, and triaged all comments. Everything from geositta's CHANGES_REQUESTED review (3 inline findings) was already fixed on-branch in `10dc57c04b`. One finding remained open — carried in the later dismissed review `4678711613`: the order-entry page still emitted both a `trading` and an `error` screen view for an unknown symbol, and its error view did not re-arm between invalid symbols. Confirmed in code and fixed, mirroring the market-detail fix already made for the identical defect.

## Files changed (this session)

| File | Change |
|---|---|
| `ui/pages/perps/perps-order-entry-page.tsx` | `market` memo hoisted above the trading screen-view hook; trading view condition gained `Boolean(market)`; error view gained `resetKey: decodedSymbol` (+21/−9) |
| `ui/pages/perps/perps-order-entry-page.test.tsx` | 2 regression tests: single error view for unknown symbol, error view re-arms for a second unknown symbol (+50) |
| `temp/tasks/.../artifacts/recipe.json` | Task artifact only (not in the PR diff): migrated to Recipe Protocol v1 and un-staled the `hlFeeRate` assertion |

No product change beyond the two `ui/pages/perps/` files.

## Validation

| Check | Result |
|---|---|
| `yarn jest ui/pages/perps/perps-order-entry-page.test.tsx --no-coverage` | **PASS** — 98/98 |
| `yarn lint:changed` | **PASS** (2 files) |
| `yarn verify-locales --quiet` | **PASS** — "No invalid entries!" |
| `yarn circular-deps:check` | **PASS** |
| `mm-harness launch --build --verify` | **PASS** — dist fresh vs HEAD, webpack compiled, fixture READY |
| `mm-harness run artifacts/recipe.json` | **PASS** — 15/15 nodes in 13s |

Recipe nodes were additionally re-executed directly as a cross-check: `artifacts/recipe-run/manual-fallback/assertions.txt` (14/14 assertions PASS).

Caveats, all recorded in `comments-report.md`:
- The recipe needed a schema migration (v0.22 harness rejects the inherited `validate.workflow` shape) and one stale grep pattern updated (`closeFeeRate` → `currentFeeRate`, renamed in `d6893f8f80`). Neither indicates a product regression.
- The first two harness runs failed on a validation-launcher timeout (`lsof spawnSync ETIMEDOUT`, machine contention); the third passed.
- Recipe run reported 6 non-blocking application warnings (`recipe-run/diagnostics.json`), relation to task undetermined.

## Comments triaged

12 review threads + 2 human issue comments. 9 cursor[bot] threads already resolved; 3 geositta threads REAL and already fixed in `10dc57c04b` (still open on GitHub); 1 open finding from the dismissed review — REAL, fixed this session. Full table in `comments-report.md`.

## Commit / push state

**Committed and pushed** at operator request: `1f0c8327c3` — "fix(perps): gate order-entry trading screen view on market" (`960d3aa90c..1f0c8327c3`).

## Post-commit re-verification

| Check | Result |
|---|---|
| Family recipe (migrated) re-run on `1f0c8327c3` | **PASS** — 15/15, 15s (`artifacts/recipe-run-postcommit/`) |
| Original *unmigrated* inherited recipe (`inputs/inherited/recipe.json`) | **FAIL** — still rejected by harness 0.22: `recipe.unsupported_field` ×2, `recipe.missing_schema_ref`, `recipe.missing_workflow`. The archived original is schema-stale; only the migrated `artifacts/recipe.json` runs. |
| Bundled library recipe `perps.smoke` (extension variant) | **PASS** (`artifacts/perps-smoke/`) — non-mutating Perps domain smoke on the live extension |
| `mm-harness run --list` | 6 library recipes resolve normally (perps.smoke, perps.lifecycle, perps.clean-market-testnet, wallet.smoke, runner.smoke, runner.action-validation) |

`perps.smoke` side findings: 10 non-blocking console events (8 warning, 2 error — `Unknown action Object` ×2 and a 404 resource load ×8). Generic runtime noise, unrelated to the analytics gating change; recipe status still pass.

## Original ticket audit (requested after handoff)

Scope note: this is a code-presence audit against ticket summaries. Cross-client `[Analytics]` tickets do not state per-client scope, so "not wired" below means "absent from Extension non-test code", not "in scope and missed".

| Ticket | Status | Extension state |
|---|---|---|
| TAT-3463 core contract | In Review | Consumed — `@metamask/perps-controller@9.2.1`, recipe `ac1`–`ac5` PASS |
| TAT-3288 `source=deeplink` on screen viewed | In Review | **Wired** — `shared/lib/deep-links/routes/perps-attribution.ts` sets `source=deeplink`, per-entry (not session-sticky) in `PerpsAttributionContext` |
| TAT-3335 `environment_type` on **all** perp events | In Review | **Partial** — client-emitted events carry it via `useAnalytics`; background controller-emitted transaction events deliberately deferred to controller 9.2.2 (`app/scripts/controllers/perps/infrastructure.ts:196-206`, also stated in the PR body) |
| TAT-3080 entry_point / discovery_source | Testing | Wired via `trackingData` (recipe `ac4`) |
| TAT-3133 / TAT-3140 UTM propagation | Testing / In Review | Wired — provider accumulation + `mergeAttributionContext` (recipe `ac3`) |
| TAT-3137 `error_type` on error screens | In Review | Wired — `ui/components/app/perps/utils/track-perps-error-screen.ts`; this session's fix removes the duplicate/no-reset defect on the order-entry error path |
| TAT-3135 / TAT-3141 `button_clicked` + `button_location` | Testing | Wired — 7 non-test files reference `BUTTON_CLICKED` |
| TAT-3142 sort/filter interaction | Testing | Wired — market list |
| TAT-3145 add_margin / remove_margin screen types | Testing | Wired — 3 non-test files |
| TAT-3148 `watchlisted` on asset_detail | Testing | Wired — market detail |
| TAT-3084 trade-screen funnel (`PERPS_TRANSACTION_CONSIDERED`) | In Review | Wired — order entry, debounced and gated on genuine size edits |
| TAT-3151 payment_token_selector dismissal | In Progress | PR declares N/A for Extension (no pay-with-token selector) |
| **TAT-3136 order abandonment** (`abandon_order`, `time_on_screen_ms`) | Testing | **Not wired** — 0 non-test occurrences; not listed in the PR's deferred/N-A section either |
| **TAT-3144 / TAT-3202 perps search events** | Testing / In Review | **Not wired** — no `PERPS_SEARCH_QUERY` / `SEARCH_RESULT_TAPPED` in Extension code; not listed as deferred |

Operator decision on TAT-3136 and TAT-3144/TAT-3202: **implement in this PR** (chosen). Evidence they are in scope for the Extension: the Extension already ships the perps market search UI (`ui/pages/perps/market-list/components/search-input/search-input.tsx`), and Mobile — the parity source of truth — implements both (`usePerpsAbandonOrderTracking.ts`, search events in `PerpsMarketListView.tsx`). Neither is N/A the way the payment-token selector (TAT-3151) is.

## Gap implementation — commit `85d2502662`

**TAT-3136 order abandonment.** New `ui/hooks/perps/usePerpsAbandonOrderTracking.ts` emits `abandon_order` (PERPS_UI_INTERACTION) with `time_on_screen_ms` when a trade surface is left uncommitted. Triggers: unmount, a still-mounted modal going inactive, and `pagehide` — the extension popup is dismissed without unmounting React, which Mobile's navigation-based version has no equivalent for. One-shot guard prevents double reporting. Wired into `perps-order-entry-page.tsx` (commit flag set at submit) and `close-position-modal.tsx` (flag set at submit, reset on reopen since the modal stays mounted).

**TAT-3144 / TAT-3202 market search funnel.** `ui/pages/perps/market-list/index.tsx` now emits:
- `Perp Search Query` — debounced 500ms (Mobile parity), waits for markets to settle so counts are never a mid-load zero, carries `search_query`, `results_count`, `mode` (`intent`/`browse`; `discovery` never applies — the Extension has no search chips), `source: perp_market_search`
- `PERPS_SCREEN_VIEWED` with `search_results_shown` / `search_no_results`
- `Perp Search Result Tapped` — `result_rank`, `results_count`, `time_to_tap_ms`; also resolves the session so no abandonment follows
- `Perp Search Abandoned` — on clear or leaving with an unresolved query, with `query_count` and `time_in_search_ms`

Supporting changes: three event names added to `MetaMetricsEventName`; `query_count` / `time_in_search_ms` / `time_to_tap_ms` added to the Extension alias layer in `shared/constants/perps-events.ts` (Mobile emits them, the controller contract does not export them yet, and inline snake_case literals trip `@typescript-eslint/naming-convention`); the Jest controller stub gained the contract values these paths read.

### Gap validation

| Check | Result |
|---|---|
| `yarn jest ui/pages/perps/market-list/index.test.tsx` | **PASS** — 27/27 (4 new search-funnel tests) |
| `yarn jest ui/hooks/perps/usePerpsAbandonOrderTracking.test.ts` | **PASS** — 5/5 |
| `yarn jest ui/pages/perps/perps-order-entry-page.test.tsx` | **PASS** — 99/99 (new abandon call-site test) |
| `yarn jest ui/components/app/perps/close-position/close-position-modal.test.tsx` | **PASS** — 26/26 |
| `yarn lint:changed && yarn verify-locales --quiet && yarn circular-deps:check` | **PASS** — 10 changed files |

TAT-3335 remains partial and is unchanged: the background transaction-event half is blocked on controller 9.2.2.

## Recipe rework

Chosen scope: format upgrade + behaviour nodes + live UI proof. `artifacts/recipe.json` rewritten:

- **Protocol v1** — `$schema` + top-level `workflow`, end node without `intent` (harness 0.22 requirements).
- **Behaviour over greps** — AC3 and AC4 now run the owning Jest suites (`ac3-attribution-behaviour`, `ac4-order-lifecycle-behaviour`) instead of grepping for identifier strings. This is the fix for the failure mode found earlier this session: `ac4` silently passed on a stale `closeFeeRate` pattern after the local was renamed, because it proved text, not behaviour.
- **Contract-level asserts kept** — package version + exported keys, controller re-export, and the AC5 absence claims. AC5 greps for `MetaMetricsEventName.*` identifiers, which are contract names rather than renameable locals, so they do not rot the same way.
- **New AC coverage** — `ac6-search-funnel-behaviour` and `ac7-abandonment-behaviour` cover the gap work above.
- **Live UI proof** — `cdp.target` → `metamask.wallet.ensure_unlocked` → `ui.navigate` to Perps → `ui.navigate` to an unknown symbol → `ui.wait_for` "Market not found" → `ui.screenshot`. This exercises the exact route whose screen-view gating this session fixed, so the analytics claim is anchored to a screen that demonstrably renders.

The harness exposes no analytics-capture action, so event counts stay in the Jest layer; the live nodes prove the screen state those events describe.

### Reworked recipe result

`mm-harness run artifacts/recipe.json` — **PASS, 18/18 nodes, 156s** (`artifacts/recipe-run/`):

| Node | Result |
|---|---|
| `ac1`–`ac2` contract asserts | PASS — perps-controller 9.2.1, re-export intact, no local key mirror |
| `ac3-attribution-behaviour` | PASS — 221 tests across 4 attribution suites |
| `ac4-order-lifecycle-behaviour` | PASS — 185 tests across order entry, cancel, close, reverse |
| `ac5-*` absence asserts | PASS — no duplicate client transaction emissions |
| `ac6-search-funnel-behaviour` | PASS — 27 tests |
| `ac7-abandonment-behaviour` | PASS — 5 tests |
| `live-cdp` → `live-ensure-unlocked` → `live-open-perps` | PASS |
| `live-open-unknown-market` → `live-assert-error-screen` | PASS — "Market not found" matched at `#/perps/market/DOESNOTEXIST` |
| `live-capture-error-screen` | PASS — `recipe-run/live-capture-error-screen.png` shows the single error screen |

Two authoring fixes were needed and are worth carrying forward:
1. `ui.navigate page=perps-market` cannot reach a nonexistent symbol — it clicks visible market rows and fails with "could not find DOESNOTEXIST in the current visible market controls". Replaced with the hash route `#/perps/market/DOESNOTEXIST`, verified live with `mm-harness call` before being written into the recipe.
2. The `ac3`/`ac4` Jest nodes run with `--runInBand`. Running four suites in parallel on a loaded machine flaked one `cancel-order-modal` test on the 5.5s per-test `userEvent` timeout. Confirmed a flake, not a regression: that suite passes at the parent commit (32/32, 49s) and at this commit when the machine is idle (32/32, 21s). It only failed during a run overlapping a webpack build and browser launches.

Live-run side findings: 6 non-blocking console events (3 warning, 3 error — `Unknown action Object`, a 404 resource, and an `HttpRequestError: 500` from the service worker). Same class of noise the bundled `perps.smoke` run produced; unrelated to the analytics changes.

## TAT-3175 bullet-by-bullet ("Missing Extension perps events on mixpanel")

Ticket status in Jira is still `To Do`. Its four bullets against this branch:

| # | Bullet | Outcome |
|---|---|---|
| 1 | `environment_type` not returned in perp screen viewed | **Covered** — client-emitted screen views carry it via `useAnalytics`; background transaction events remain deferred to controller 9.2.2 (`app/scripts/controllers/perps/infrastructure.ts:196-206`). Same partial as TAT-3335. |
| 2 | Missing `button_clicked` name/function on PERP UI INTERACTION | **Covered** — 13 `interaction_type: button_clicked` emissions carry `button_type`/`tab_name`/`button_location`, and close/position screen views carry `button_clicked` + `button_location` as properties. |
| 3 | Duplicate between `tap` and `button_clicked`? | **Answered: no duplicate.** Evidence below. |
| 4 | Missing `screen_type: geo_block_notif` in perp screen viewed | **Was a real gap — now implemented** in commit `b690bcbcf9`. Not N/A. |

### Bullet 3 — tap vs button_clicked: no double-fire

Enumerated every emission of each `interaction_type` in perps UI code (excluding tests).

`interaction_type: tap` — 5 sites:
- `ui/components/app/perps/close-position/close-position-modal.tsx:345` — abandon-order snapshot; fires on modal close, not on a click
- `ui/pages/perps/perps-order-entry-page.tsx:618` — abandon-order snapshot; fires on leaving the page
- `ui/pages/perps/perps-order-entry-page.tsx:1193` — `handleDirectionChange` (Long/Short toggle)
- `ui/pages/perps/market-list/index.tsx:395` — `handleMarketSelect` (market row tap)
- `ui/components/app/perps/perps-fill-tag/perps-fill-tag.tsx:61` — ADL "learn more" link

`interaction_type: button_clicked` — 13 sites: `ui/pages/perps/perps-market-detail-page.tsx` (849, 893, 911, 937, 978, 995, 1939), `ui/components/app/perps/perps-support-learn/perps-support-learn.tsx` (87, 99, 120), `ui/components/app/perps/perps-market-balance-actions/perps-market-balance-actions.tsx` (80, 92), `ui/pages/perps/market-list/index.tsx:346`.

No handler emits both:
- `perps-market-detail-page.tsx` holds 7 of the 13 `button_clicked` emissions and **zero** `tap` emissions (`grep -c INTERACTION_TYPE.TAP` = 0).
- `perps-order-entry-page.tsx` holds 2 `tap` emissions and **zero** `button_clicked` emissions (`grep -c` = 0).
- In `market-list/index.tsx` the two live in different handlers: `handleMarketSelect` (tap, row selection) vs `handleFilterChange` (button_clicked, category chip). They cannot fire from one interaction.
- The remaining `tap` sites (fill tag, and the two abandon snapshots) have no `button_clicked` counterpart anywhere in their files.

Note on a related but distinct multi-emission: `handleFilterChange` (`market-list/index.tsx:344-360`) does emit **two** PERPS_UI_INTERACTION events for one click — `button_clicked` then `filter_applied`. That is deliberate funnel design and matches Mobile, which emits the same pair (`PerpsMarketListView.tsx:328-340`). One parity difference worth a follow-up: Mobile's first event uses `interaction_type: market_list_filter` with `button_clicked` as a *property*, whereas the Extension uses `interaction_type: button_clicked`. The controller exports `INTERACTION_TYPE.MARKET_LIST_FILTER` (`market_list_filter`), so aligning is possible — left unchanged here since it is outside the ticket bullets and would alter an event already shipped in this PR.

### Bullet 4 — geo_block_notif: implemented, not N/A

Reproduce-first check: the Extension **does** have a geo-block screen — `ui/components/app/perps/perps-geo-block-modal/perps-geo-block-modal.tsx` — rendered by 11 hosts and opened from 17 trigger sites (`perps-view.tsx:156,259`; `close-position-modal.tsx:434`; `edit-margin-modal-content.tsx:277`; `reverse-position-modal.tsx:149`; `perps-balance-dropdown.tsx:124`; `cancel-order-modal.tsx:128`; `update-tpsl-modal-content.tsx:461`; `perps-market-balance-actions.tsx:75`; `start-trade-cta.tsx:42`; `perps-order-entry-page.tsx:1206,1658,1684`; `perps-market-detail-page.tsx:841,876,970,1994`). Before this change the component emitted nothing at all — `grep GEO_BLOCK_NOTIF` over `ui/`, `shared/`, `app/scripts/` returned zero hits.

Implemented in the modal itself, not at the 17 trigger sites: one declarative `usePerpsEventTracking` keyed on `isOpen`, so every host reports exactly once per open and the guard re-arms on close. Tests cover single-emission-while-open and re-arm-on-reopen (`perps-geo-block-modal.test.tsx`, 5/5 pass).

Two implementation notes:
- The hook is imported from `hooks/perps/usePerpsEventTracking` rather than the `hooks/perps` barrel. Importing from the barrel broke `perps-balance-dropdown.test.tsx` (8 tests, `TypeError: (0, _perps.usePerpsEventTracking) is not a function`) because that suite partially mocks the barrel. Caught and fixed before commit.
- **Not** included: Mobile also sends `source` on this event, naming the trigger (`PerpsHomeView.tsx:708-714` uses `close_all_positions_button`, `PerpsMarketDetailsView.tsx:570-575` uses `add_funds_action`). The Extension cannot do this from the modal alone — 3 of the 11 hosts have multiple triggers sharing one `isGeoBlockModalOpen` state (order entry ×3, market detail ×4, perps view ×2), so faithful `source` needs per-trigger state plumbing in those hosts. Flagged as follow-up rather than guessed; the ticket bullet asks only for `screen_type`.

### Recipe re-run after the emission change

`artifacts/recipe.json` gained `ac8-geo-block-screen-view`. Re-run: **PASS, 19/19 nodes** (`recipe-run/summary.json`, started 2026-07-28T00:56:43Z) — including `ac8` and all six live UI nodes, with the error-screen screenshot re-captured.

Getting there took three attempts and the first two are worth recording, because both wrote no artifacts and left a **stale** `summary.json` from the previous run (18/18) that would have read as a pass:
1. `--cdp-port 6662` — aborted at browser readiness: `compositor: {status: "suspended", reason: "requestAnimationFrame did not advance within 1000ms"}`.
2. `--cdp-port 6672` (free port, harness launches its own browser) — identical failure, ruling out port contention.
3. Same command wrapped in `caffeinate -disu` — passed 19/19. The cause was display sleep suspending Chrome's compositor, so headed CDP proof cannot run on an idle machine overnight without it.

Also of note: `mm-harness launch --build --verify` fails on this slot with `Refusing to launch on CDP port 6662: it is held by a browser this harness did not launch (pid 49539)`. The build half completes; only the launch/verify half fails. `mm-harness run` is unaffected because it launches its own isolated validation browser. Left alone deliberately — the orchestrator owns that browser.

Suite-level flakes seen while validating this change, both confirmed non-regressions by re-running: `update-tpsl-modal-content.test.tsx` (1 test) and earlier `cancel-order-modal.test.tsx` (1 test), each passing on a re-run once the machine was idle (212/212 and 32/32 respectively).

### Process note

While diagnosing the flake I ran `git stash push` on an already-clean tree, so the following `git stash pop` popped an unrelated pre-existing stash and left a conflict in two files (`perps-positions-orders.tsx`, `perps-view.test.tsx`). Restored both with a targeted `git checkout HEAD -- <paths>`; the popped stash entry was preserved by the failed pop and is still in `git stash list`. No work was lost and no stash was dropped.

## Remaining manual work for the operator

1. ~~Commit + push~~ — done (`1f0c8327c3`).
2. Reply on the three unresolved geositta threads — each already has an author reply pointing at `10dc57c04b`; they need reviewer-side resolution.
3. Reply to the dismissed review `4678711613` noting the order-entry gap it flagged is now fixed with the same pattern as market detail, plus the two regression tests.
4. Re-request review from `geositta` (the approval was dismissed by later pushes; `reviewDecision` is `REVIEW_REQUIRED`).
5. Decide whether the recipe-schema migration should be pushed back to the family artifact so future re-entries don't hit the same validation failure.
