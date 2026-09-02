# Recipe coverage — TAT-3845

The ticket specifies no acceptance criteria, so the matrix below covers the three task
claims the PR makes. Trace: `recipe-run/trace.json`, 27/27 nodes `ok=true`.

| # | Claim | Proof mode | Primary evidence | Recipe nodes | Verdict | Rationale |
| --- | --- | --- | --- | --- | --- | --- |
| C1 | The extension declares, resolves, locks and **bundles** `@metamask/perps-controller@15.1.0` | state | `trace.json` (node results); `dist/chrome/*.js` grep hit | `ac1-read-manifest-range`, `ac1-assert-resolved-version`, `ac1-assert-lockfile-resolution`, `ac1-grep-bundled-symbol`, `ac1-assert-bundled-symbol-exit`, `ac1-assert-bundled-symbol-file` | PROVEN | Four independent layers: the `package.json` range, the resolved `node_modules` version (`$.version eq "15.1.0"`), the `yarn.lock` pin, and — the one that cannot be faked by a stale install — a grep for `ORDER_CHASE_MAX_DISTANCE_INVALID` in the built bundle. That symbol first exists in controller 13.0.0, so reverting to `^12.0.0` flips every one of these nodes to FAIL. |
| C2 | Every `PerpsErrorCode` in 15.1.0 maps to an i18n key, and the repo typechecks against the widened union | state | `trace.json`; jest output; `tsc` exit code | `ac2-run-error-code-tests`, `ac2-assert-tests-exit`, `ac2-assert-tests-count`, `ac2-assert-new-codes-mapped`, `ac2-assert-new-codes-exit`, `ac2-assert-new-codes-selected`, `ac2-run-typecheck`, `ac2-assert-typecheck-exit` | PROVEN | The suite runs (`45 passed, 45 total`), then the case naming the five new codes is re-run under a title filter asserting `44 skipped, 1 passed, 45 total` — so the known `jest -t` zero-match vacuous pass cannot slip through. `tsc --noEmit` exiting 0 proves the `satisfies Record<PerpsErrorCode, string>` constraint holds. Dropping any of the five mappings fails the typecheck node; dropping the test case fails the count node. |
| C3 | The Perps UI still renders live market data through the upgraded controller | mixed | `after-ac3-perps-market-live.png`; `trace.json` | `ac3-open-perps`, `ac3-assert-perps-home`, `ac3-open-market-list`, `ac3-wait-market-list`, `ac3-assert-market-list`, `ac3-open-market`, `ac3-wait-market-detail`, `ac3-assert-market-details`, `ac3-clear-capture-orphans`, `ac3-wait-market-price`, `ac3-capture-market` | PROVEN | Perps home reads clean, the market list returns 32 live markets including ETH, and market detail asserts the `price`, `price-change`, `stats` and `chart` features. The screenshot shows ETH with its live price, 24h change, candles and an open position — real controller-served data, not an empty or error shell. `ac3-wait-market-list` gates the count read on a sibling-combinator selector that excludes both the per-row ticker and the eight `market-row-skeleton` placeholders, so it only matches once two hydrated row roots share a parent. Confirmed on a cold browser: the gate blocked 4767ms before the count read, and the run passed 27/27. `artifact-manifest.json` records `provider: capture-helper`, not a `Page.captureScreenshot` fallback. |

## Notes on proof shape

- **C3 is `mixed`, not `visual`.** The PR changes nothing a user can see, so the screenshot
  is reviewer orientation plus liveness proof — it is not the claim. The claim is that the
  surfaces still resolve data, which the `read_visible_state` assertions carry.
- **Hash routing in C3 is a harness limitation, not a shortcut.** The library's
  `page: perps-market-list` and `page: perps-market` navigators wait on `market-list-view`
  and `perps-market-detail-page` test ids that this build's UI does not render, and the
  surface detector labels the market list `unknown` for the same reason. Both time out on
  `main` too, independent of this PR. The recipe therefore routes by hash and asserts the
  rendered contents directly (`require_features`, `minimum_market_count`, the requested
  symbol), which is a stronger assertion than the navigator's test-id presence check.
  Adding those test ids to the product is worth a follow-up but is out of this ticket's scope.
- **No video.** `after.mp4` was dropped from `evidence-manifest.json`. `record-window.sh`
  attaches to the shared screen-capture owner, and the recipe's `ac3-clear-capture-orphans`
  node (`pkill -9 -f 'capture-helper'`) terminates that owner mid-run, so the recording
  always finalises ~3s before the run ends and can never satisfy the
  `after.mp4 -nt summary.json` freshness check. The `pkill` node is load-bearing — it is
  what keeps `ui.screenshot` on capture-helper rather than the `Page.captureScreenshot`
  fallback — so the video was dropped rather than the node weakened. With no visual change
  claimed, the screenshot alone carries C3.
- **No `after`/`before` pair.** Baseline was recorded N/A: there is no visual, copy, or
  layout delta, so a before shot would be the same screen.

Overall recipe coverage: 3/3 ACs PROVEN (untestable: none, weak: 0, missing: 0)

---

## Re-validation for the make-merge-ready run (PR #45960)

The matrix above is inherited unchanged from the authoring run — this run altered no product
code and no recipe node, so every claim, proof mode and node binding still stands as written.

Re-ran the same recipe against the **post-rebase** tree (branch replayed onto `origin/main`
`246cf98938`, `yarn install --immutable` re-run), which is what the merge will actually produce:

- `mm-harness run` — **pass, 27/27 nodes**, zero failed nodes
- `artifact-manifest.json` — screenshot `provider: capture-helper` (not the
  `Page.captureScreenshot` fallback)

Overall recipe coverage: 3/3 ACs PROVEN (untestable: none, weak: 0, missing: 0) — unchanged,
re-confirmed post-rebase.

### Not covered by this recipe

The two `perps-tpsl.spec.ts` e2e tests fixed in commit `20bc12bc01` are Mocha/Selenium and sit
outside this recipe's scope; the recipe exercises the live extension over CDP and cannot observe
e2e mock fixtures. Their fix rests on the code-level diagnosis in `comments-report.md` and is
verified by CI, which had not finished at completion time.

---

## Re-validation for the second make-merge-ready round (PR #45960, task `45960-0902-210741`)

Inherited matrix unchanged again. This round altered **no product code, no test, and no recipe
node** — zero comments triaged REAL — so every claim, proof mode and node binding above still
stands exactly as written.

Re-ran the same recipe against the tree the merge will actually produce. The branch was rebased
onto `origin/main` `e6b1571e9e` and `yarn install --immutable` re-run; `mm-harness launch --verify`
then rebuilt `dist/chrome` and reported `dist-freshness: fresh — dist id matches HEAD`, so the
C1 bundle grep ran against a bundle built from the post-merge source, not a stale one.

- `mm-harness run` — **pass, 27/27 nodes**, 72s, zero failed nodes
- `artifact-manifest.json` — screenshot `provider: capture-helper` (not the
  `Page.captureScreenshot` fallback), so C3's visual half is valid review evidence
- `mm-harness check diff --profile fast` — pass on all 12 changed files
  (policy-suppressions, eslint, oxfmt, jest)
- `coverage-analyze.js` — **PASS**, `translate-perps-error.ts` at 100% (20/20)

Overall recipe coverage: 3/3 ACs PROVEN (untestable: none, weak: 0, missing: 0) — unchanged,
re-confirmed against `branch + origin/main e6b1571e9e`.

### Non-blocking side findings from this run

The runner flagged two distinct application errors, neither related to the controller bump:
a `MoneyAccountBalanceService:getMoneyAccountBalance` revert (that service arrived with upstream
`e6b1571e9e`, pulled in by this round's integration) and repeated `home.html` 404s. Both are
environmental to the slot; no perps code path is involved.

### Still not covered by this recipe

Unchanged from the previous round: the two `perps-tpsl.spec.ts` e2e tests are Mocha/Selenium and
sit outside this recipe's CDP scope. They rest on CI, which showed 70 pass / 57 pending / 0 fail
at the time of this run.
