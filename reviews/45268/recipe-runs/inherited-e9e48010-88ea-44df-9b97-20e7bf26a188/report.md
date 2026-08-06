# TAT-3686 — Report

**Ticket:** [TAT-3686](https://consensyssoftware.atlassian.net/browse/TAT-3686) —
update extension to latest perps controller

## Summary

Bumped `@metamask/perps-controller` from `^10.0.0` to `^11.0.0` and fixed the two
compile breaks the wider `PerpsErrorCode` and `OrderType` unions cause. No
product behaviour changes; the perps surfaces were driven end-to-end on the live
extension to prove no regression.

## Changes

| File | Change |
| --- | --- |
| `package.json`, `yarn.lock` | `@metamask/perps-controller` `^10.0.0` → `^11.0.0` |
| `ui/components/app/perps/utils/translate-perps-error.ts` | Added translations for the 15 codes v11 adds to `PerpsErrorCode` |
| `ui/components/app/perps/utils/translate-perps-error.test.ts` | Added the same 15 codes to the suite's `PERPS_ERROR_CODES` mock so its exhaustiveness test keeps covering them |
| `ui/components/app/perps/order-entry/order-entry.tsx` | Widened `handleOrderTypeClick` from `'market' \| 'limit'` to `OrderType` |
| `app/_locales/{en,en_GB}/messages.json` | New `perpsExchangeAccountNotFound` key (self-review) |
| `ui/components/app/perps/utils/orderUtils.test.ts` | Coverage for the `parentOrderId` child-link branch v11 makes live (self-review) |
| `attribution.txt` | Regenerated for the dependency change (separate commit) |

Three commits:

1. `feat(perps): update extension to latest perps controller` — bump + code fixes
2. `chore: regenerate attributions for perps-controller v11`
3. `fix: address self-review feedback (TAT-3686)`

**LavaMoat policies: regenerated, no change.** `yarn lavamoat:auto` ran to
completion (exit 0) and produced a zero-line diff across all eight
`lavamoat/webpack/{mv2,mv3}/*/policy.json` files. This differs from the v10 bump
(`48ad866df4`), which did move them, because v11 changes no package edges: the
lockfile diff is the package itself plus its internal `@metamask/superstruct`
range, which resolves to an entry already in the tree. Verified rather than
assumed — nothing to commit.

**`attribution.txt` regeneration has two traps.** First,
`development/generate-attributions.sh` ends with
`git checkout -- .yarnrc.yml .yarn package.json` followed by `yarn`, which
**silently reverts an uncommitted dependency bump** and regenerates against the
old tree. It must be run *after* committing the bump. Second, the resulting diff
is larger than this change alone (114 insertions / 141 deletions): `attribution.txt`
is already stale on main — it records `ip-address 10.2.0` while main's lockfile
resolves `10.4.0` — so regenerating sweeps in drift from earlier commits that did
not regenerate it. Large attribution churn on a dependency bump matches the
precedent set by the v10 bump, so the generated file is committed as-is, in its
own commit.

`EXCHANGE_ACCOUNT_NOT_FOUND` gets its own locale key,
`perpsExchangeAccountNotFound` ("Add funds to start trading."), which is the
actionable message the v11 CHANGELOG asks for. The first pass reused
`perpsAddFundsDescription`; self-review correctly flagged that as coupling an
error message to the balance-actions empty-state copy, so it was decoupled — see
Self-Review Fixes below.

### Runtime breaking changes that needed no change

v11 also adds refusals that `tsc` cannot catch. Each was checked against the
extension's call sites:

- `placeOrder` now rejects `grouping: 'positionTpsl'` / `tpslLinkage: 'position'`,
  rejects an attached TP/SL under `grouping: 'na'`, and rejects `timeInForce` on
  anything but a plain limit order. No production code passes any of these three
  fields — only the local type mirror in `ui/__mocks__/perps/perps-controller`
  declares them — and the refusals only fire when a caller sets them explicitly
  (verified in `dist/utils/hyperLiquidValidation.cjs`).
- `perps-order-entry-page.tsx` already uses the two-step flow v11 requires for
  position-bound TP/SL: `perpsPlaceOrder` without TP/SL, then
  `perpsUpdatePositionTPSL`.
- `editOrder` may now omit `OrderResult.orderId`. It is exposed through the
  messenger but no UI reads `orderId` from its result.
- The Jest stub `test/mocks/metamask-perps-controller.js` builds
  `PERPS_ERROR_CODES` from a Proxy, so it covers new codes without edits.

## Test plan

| Gate | Result |
| --- | --- |
| `yarn lint:tsc` | clean (reported 15 missing codes + the narrowed handler before the fix) |
| `mm-harness check diff --profile fast` | pass — eslint, oxfmt, jest, policy-suppressions |
| `mm-harness run artifacts/recipe.json` | pass, exit 0 |
| `yarn jest translate-perps-error.test.ts` | 41 passed |
| `yarn jest order-entry.test.tsx` | 39 passed |
| `yarn jest orderUtils.test.ts` | 62 passed |
| `coverage-analyze.js` | PASS — 92% overall (translate-perps-error 100%, order-entry 89%) |

## Evidence fit

| Claim | Proof mode | Primary evidence |
| --- | --- | --- |
| C1 — perps home renders on v11 | mixed | `evidence-ac1-perps-home.png` |
| C2 — market detail streams live data on v11 | mixed | `evidence-ac2-market-detail.png` |
| C3 — order-type toggle still switches | mixed | `evidence-ac3-limit-order-type.png` |
| C4 — every v11 `PerpsErrorCode` translated | state | `yarn lint:tsc` + `translate-perps-error.test.ts` |

Intentionally omitted: no `before-*` screenshots. The change is a dependency bump
with two compile-only fixes, so a before image would be identical to the after by
construction. No screenshot for C4 — it is a compile-time claim and a screenshot
would prove nothing about it.

Honest limit: reverting a type widening breaks the build rather than flipping a
recipe assertion. The recipe proves no regression; the compile and unit gates
prove the fix.

## Artifacts

- `approach.md`, `implementation.md`, `report.md`, `learnings.md`
- `recipe.json`, `recipe-coverage.md`, `recipe-quality.json`
- `recipe-run/` — `summary.json`, `trace.json`, `diagnostics.json`, screenshots
- `evidence-ac{1,2,3}-*.png` (no `after.mp4` — see Self-Review Fixes)
- `check-diff/validation-summary.json`

The recipe is task-local. It is a bump regression sweep over perps home, market
detail and order entry, so it is a reasonable candidate to graduate to the perps
recipe library (`experimental-metamask-recipe-perps`) — the ticket names no
in-repo destination, so it stays under `artifacts/` and the destination question
is raised here.

## Side finding — "Unable to connect to Ethereum" banner (not caused by this change)

The slot showed `Unable to connect to Ethereum. Check network connectivity.`
This is a runtime provisioning issue, not a product bug and not a bad Infura key:

- `yarn build:test` compiles `process.env.INFURA_PROJECT_ID` to the placeholder
  `"00000000000000000000000000000000"` — visible in the built bundle as
  `globalThis.INFURA_PROJECT_ID=t??"00000000000000000000000000000000"`.
- The real key reaches the extension only through
  `_flags.testing.infuraProjectId`, which `shared/constants/infura-project-id.ts`
  prefers over the env value. `dist/chrome/manifest.json` has no `_flags`; the
  harness injects them into `temp/recipe/runtime/runtime-dist/manifest.json` at
  launch.
- With the placeholder id, mainnet RPC calls fail, `NetworkController` sets
  `networksMetadata.mainnet.status = 'unavailable'` (the fixture seeds
  `available`), and `useNetworkConnectionBanner` renders the banner. A background
  RPC round-trip (`getCurrentNetworkEIP1559Compatibility`) never resolved, while a
  raw `fetch` to Infura from the same service worker with the real key returned
  `0x1880a67` — confirming reachability was never the problem.
- After `mm-harness launch --verify` (which logs "Configured runtime Infura
  credentials through manifest flags"), status is `available` with
  `EIPS: { 1559: true }` and the banner is gone — visible in the C1 screenshot.

Fix: relaunch through `mm-harness launch` so the flags are injected; do not reuse
a `runtime-dist` refreshed without injection.

## Self-Review Fixes

- `ui/components/app/perps/utils/translate-perps-error.test.ts:171` — added
  `it('maps EXCHANGE_ACCOUNT_NOT_FOUND to perpsExchangeAccountNotFound')`. It was
  the only bespoke mapping in the file with no dedicated assertion; the generic
  exhaustiveness test only checks the value is *a string*, so retargeting it to
  `perpsOrderFailed` would have kept the suite green and silently dropped the
  actionable guidance.
- `ui/components/app/perps/utils/translate-perps-error.ts:88` +
  `app/_locales/{en,en_GB}/messages.json` — `EXCHANGE_ACCOUNT_NOT_FOUND` now maps
  to a dedicated `perpsExchangeAccountNotFound` key ("Add funds to start
  trading.") instead of reusing `perpsAddFundsDescription`. That string belongs to
  the balance-actions empty state (`perps-market-balance-actions.tsx:153`), so
  rewording the empty state would have silently reworded an error message. Follows
  the v10 bump precedent (`48ad866df4`), which added `perpsUnsupportedCollateral`
  to `en` + `en_GB` only; other locales are filled by the translation pipeline.
- `ui/components/app/perps/utils/orderUtils.test.ts:487` — added coverage for the
  `isSameParentByChildLink` branch, which v11 makes live by populating
  `Order.parentOrderId` on real TP/SL children streamed over the WebSocket. The
  pre-existing test at line 461 sets `takeProfitOrderId` *and* `parentOrderId`, so
  all three suppression paths fire at once and it cannot isolate this one. The new
  case leaves `takeProfitOrderId` empty and gives the real trigger an unrelated
  `orderId`, so only the child link can suppress the synthetic row; a companion
  case asserts a non-matching `parentOrderId` still yields the synthetic row.
  Verified load-bearing: stubbing `isSameParentByChildLink = false` fails exactly
  1 test — the new one — while the pre-existing test still passes.
- `temp/tasks/feat/tat-3686-0806-093339/artifacts/recipe-coverage.md:15-16` and
  `recipe-quality.json` — refreshed the quoted figures to the values actually in
  the committed PNGs ($762.37 balance; ETH $1,899.2 +1.65%, 24h volume $1.19M,
  open interest $2.49M, oracle $1,898.7) and corrected the test count to 41. Added
  a note that these are live values so the next re-run must re-read the images —
  the root cause was pinning volatile market data without saying it was a snapshot.

### Re-validation after these fixes

`mm-harness check diff --profile fast` pass (eslint, oxfmt, jest,
policy-suppressions). Focused suites: `orderUtils.test.ts` 62 passed,
`translate-perps-error.test.ts` 41 passed. Rebuilt with `yarn build:test` and
re-ran the recipe against the new dist — **pass, exit 0**; evidence PNGs
re-captured from that run.

### Runtime note

`mm-harness launch --verify` now fails with `EXTENSION_BROWSER_REQUIRED` (and
then hangs) even though CDP is live and the browser is running from the
checkout's own `temp/recipe/runtime/ms-playwright/chromium-1217`. Worked around
by performing the reattach manually: rsync `dist/chrome/` → `runtime-dist/`,
re-inject `_flags.testing.infuraProjectId` into the runtime manifest, then
`chrome.runtime.reload()` over CDP. The reload disables the extension, so it also
needed `chrome.management.setEnabled(..., true)` and a fresh `home.html` tab.
Harness bug, not a product issue — surfaced here rather than worked around
silently.

### `after.mp4` removed from the evidence manifest

The window recorder attaches to a shared screen-capture owner that stops well
before the recipe finishes: repeated attempts produced 2.4 s and 10.3 s clips for
a ~90 s run. Rather than ship a truncated clip labelled as a full run, the video
was deleted and `videos` dropped from `evidence-manifest.json`. Nothing material
is lost — the manifest was already `preferred_mode: "screenshots"` with
`videos.preferred: false`, and the three screenshots carry the visual proof.
