# TAT-3848 — [Extension] Add market category pills to the Perps tab

**Ticket:** [TAT-3848](https://consensyssoftware.atlassian.net/browse/TAT-3848)
**Branch:** `TAT-3848-feat-add-perps-category-pills` (local only — gateway owns publish)

## Summary

The Perps tab now carries a horizontally scrollable rail of market category pills between the
balance actions and the user's positions. Each pill opens the full market list already narrowed to
that category, giving the tab the discovery route mobile's Products rail provides. Only categories
present in the live market data get a pill, so a pill can never open an empty list.

## Changes

| File | Change |
|---|---|
| `ui/components/app/perps/perps-market-categories/perps-market-categories.tsx` | New: the rail — skeleton while loading, `ButtonFilter` pills inside an `overflow-x-auto` scroller with `role="group"`, navigation + analytics. |
| `ui/components/app/perps/perps-market-categories/perps-market-category-pill.tsx` | New: one category rendered as a `ButtonFilter`. |
| `ui/components/app/perps/perps-market-categories/index.ts` | New barrel. |
| `ui/components/app/perps/hooks/usePerpsMarketCategories.ts` | New: derives `all` + the categories present in live market data. |
| `ui/components/app/perps/perps-view.tsx` | Renders the rail under the balance actions, and its skeleton in the tab's loading branch. |
| `ui/components/app/perps/utils.ts` | New `marketMatchesCategory` — one category predicate shared by the rail and the market list. |
| `ui/components/app/perps/constants.ts` | `MARKET_FILTER_LABEL_KEYS` moved here from `filter-select.tsx` so both surfaces read one label map. |
| `ui/pages/perps/market-list/index.tsx` | `filterByType` delegates its category branch to `marketMatchesCategory`. |
| `ui/pages/perps/market-list/components/filter-select/filter-select.tsx` | Reads the shared label map instead of its private copy. |
| `app/_locales/en/messages.json`, `app/_locales/en_GB/messages.json` | New `perpsMarketCategories` key (the rail's accessible name). |
| 3 test files | 22 new tests across the rail, the pill and the hook. |

## Test plan

| Gate | Result |
|---|---|
| `mm-harness check diff --profile full` | pass — policy-suppressions, eslint, oxfmt, jest, repo-wide typecheck all green |
| `yarn verify-locales --quiet` | `No invalid entries!` |
| `yarn circular-deps:check` | `Circular dependencies check passed.` |
| `mm-harness run artifacts/recipe.json` | pass — 25/25 nodes `ok: true` |
| `node temp/recipe/runtime/coverage-analyze.js` | `VERDICT: PASS` — 100% on all three new source files (only pre-existing `filter-select.tsx` remains untested) |
| Existing perps suites | `perps-view`, `market-list`, `perps/utils`, `perps/constants`: 177 tests pass |

## Evidence fit

| AC | Proof mode | Primary evidence | Notes |
|---|---|---|---|
| AC1 — scrollable `ButtonFilter` pill rail on the tab | visual | `after-ac1-category-pills-visible.png` | Shows the live rail (All / Crypto / Stocks / Commodities) above Watchlist. Paired with `before-perps-tab-no-category-pills.png`. |
| AC2 — pill opens the market list pre-filtered | mixed | `after-ac2-market-list-filtered-crypto.png` | URL `?filter=crypto`, the destination's own filter dropdown reading `Crypto`, crypto-only rows. |
| AC3 — skeleton-gated, no layout jump | test | `recipe-run/trace.json` `ac3-*` | The loading window is sub-second on a warm stream; a screenshot race would be flake, not proof. The named jest assertion checks the skeleton renders at the real pill height and that the two states never coexist. |
| AC4 — keyboard/focus-navigable | state | `recipe-run/trace.json` `ac4-*` | Live CSS-selector assertions on `button[...]:not([disabled]):not([tabindex="-1"])` and `role="group"` + `aria-label`, plus a jest `user.tab()` / `{Enter}` navigation assertion. Focus semantics are invisible in a PNG. |

**Screenshots intentionally omitted:** none beyond the two evidence captures and the baseline. No
screenshot was taken for AC3 or AC4 — both are hidden-behaviour claims, and a picture of the loaded
rail would prove neither.

## Artifacts

- `approach.md`, `implementation.md`, `self-review.md`
- `recipe.json`, `recipe-run/` (`summary.json`, `trace.json`, `artifact-manifest.json`, screenshots)
- `recipe-coverage.md`, `recipe-quality.json`, `evidence-manifest.json`
- `baseline-recipe.json`, `baseline-run/`
- `after.mp4`, `before-perps-tab-no-category-pills.png`, `after-ac1-*.png`, `after-ac2-*.png`
- `check-diff/`, `check-diff-full/`

## Flag for the design-systems team

`@metamask/design-system-react` still ships no `ButtonFilterGroup` — checked the installed 0.35.1
and the latest published 0.38.0; neither exports a group primitive for web. The rail is composed
from `ButtonFilter` + `Box`, as the ticket anticipated. Worth raising so the next filter rail does
not have to re-derive the scroller and group semantics by hand.

## Self-Review Fixes

- `ui/components/app/perps/utils.ts:493` — Documented why `marketMatchesCategory` does not delegate to
  the controller's `matchesCategory`. The reviewer's own analysis prescribed this branch of the
  either/or: the controller counts a HIP-3 market typed `marketType: 'crypto'` as crypto
  (`!isHip3Market(m) || m.marketType === 'crypto'`), the Extension's long-standing `marketSource` rule
  does not, and that rule is what the market list's Crypto filter has always applied. Swapping in
  `matchesCategory` would silently change which markets Crypto shows — a user-visible change that
  belongs in its own ticket, not the one adding the pills. The doc comment no longer claims global
  single-source-of-truth status, names the controller helper, states the divergence, and points at
  `isCryptoMarket` (a mobile-duplicated utility) as the thing to revisit alongside it. No behaviour change.
- `ui/components/app/perps/hooks/usePerpsMarketCategories.test.ts:24` — Typed `createHip3Market`'s
  `marketType` param as the controller's `MarketType` instead of `string`, which let the
  `as Partial<PerpsMarketData>` cast go. The helper now fails to compile if the controller's union changes.
- `ui/components/app/perps/perps-market-categories/perps-market-categories.test.tsx:52` — Dropped the
  `as Partial<PerpsMarketData>` cast on `STOCK_MARKET`; contextual typing already accepts the literal.
- `ui/components/app/perps/perps-market-categories/perps-market-categories.test.tsx:60` — Replaced
  `expect(skeletonPills.length).toBeGreaterThan(0)` with an exact `toHaveLength(SKELETON_PILL_COUNT)`
  against named `SKELETON_PILL_COUNT` / `PILL_HEIGHT` constants, so a changed reserved footprint fails.
- `ui/components/app/perps/perps-market-categories/perps-market-categories.test.tsx:136` — Split the
  skeleton-gating test's two arrange/act cycles into `reserves the rail height with skeleton pills while
  market data loads` and `renders the pills at the reserved skeleton height once market data arrives`,
  restoring the AAA shape so a failure points at one state.
- `artifacts/recipe.json` — AC3's node targeted the old single test by title. It now runs the whole
  `loading state` group and asserts `2 passed`, so the guard also catches either half being dropped.
  `recipe-coverage.md` updated to match.

### Verification after the fixes

- `yarn jest` on the three changed suites: 23 passed (was 22 — the split adds one).
- `mm-harness check diff --profile full`: policy-suppressions, eslint, oxfmt, jest and repo-wide
  **typecheck** all pass. Ran the full profile deliberately rather than `fast`: two of the fixes remove
  type casts, and `fast` skips typecheck, so it could not have verified them.
- Recipe re-run: **pass, 25/25 nodes**, both screenshots `provider: capture-helper`, `ac3-assert-skeleton-test-ran`
  matched `2 passed`. Both evidence PNGs re-opened and confirmed to still show their claims.
- `check-task-artifact-contract.mjs`: `TASK_ARTIFACT_CONTRACT_PASS`.

### Evidence change: video dropped

`after.mp4` was removed from `evidence-manifest.json` and deleted. The slot's shared-screen recorder
stops on its own roughly 25 s in — `record-window.sh` printed its `OK` and finalised the file while the
recipe was still running, across two separate attempts — so the clip only ever covered the opening of a
~2 min run and its mtime was older than `recipe-run/summary.json`. Rather than ship a stale reference or
a partial clip presented as a full-run recording, the manifest now carries only the three capture-helper
screenshots, which fully cover the visual ACs (AC1 and AC2); AC3 and AC4 were never video claims. This
looks like a recorder/slot issue rather than anything in this diff — flagging it, not patching it.
