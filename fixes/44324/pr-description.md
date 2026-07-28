# Consume perps controller analytics contract in MetaMask Extension

> Local draft only — not published. The gateway publishes after human approval.

## What this does

Replaces the Extension's hand-maintained perps analytics enums with the canonical
contract from `@metamask/perps-controller`, and stops emitting the transaction events the
controller now owns (emitting them client-side would double-count). Adds the ticket-gap
coverage: order abandonment (TAT-3136), the market-search funnel (TAT-3144 / TAT-3202),
and the geo-block screen view (TAT-3175).

## Reviewer notes

### 1. Dependency is pinned to a local patch — needs a follow-up

`package.json` pins `@metamask/perps-controller` to a **local yarn patch of exactly
9.2.1**, not a semver range:

```
"@metamask/perps-controller": "patch:@metamask/perps-controller@npm%3A9.2.1#~/.yarn/patches/@metamask-perps-controller-npm-9.2.1-727f87b8bb.patch"
```

The patch rewrites two `require("file:///home/runner/work/hyperliquid/...")` statements
that the published tarball ships with — absolute build-machine paths that would fail at
runtime. It is a legitimate workaround for an upstream packaging bug, but it means the
Extension carries a private patch into production and no longer picks up 9.2.x patch
releases.

**Follow-up required:** drop the patch and restore a semver range once upstream
republishes a tarball without the absolute `require` paths.

### 2. Breaking analytics-schema change — notify data consumers before release

`PERPS_EVENT_PROPERTY.TIMESTAMP` changes from `perps_timestamp` to the controller's
`timestamp`. This renames that property on **every** perps event, client- and
controller-emitted. It is correct per the contract, but any dashboard, saved query, or
alert keyed on `perps_timestamp` will silently stop matching.

This should be communicated to the data consumers before this ships, not discovered
afterwards.

### 3. Extension-only analytics values

Two things are deliberately not sourced from the controller contract, because the
contract does not export them:

- `PERPS_EVENT_VALUE.SOURCE.BOTTOM_NAV_BAR` — has live consumers
  (`usePerpsBottomNavSource`), so it is kept as an Extension override. Collapse it into
  the alias pattern once the controller adds a bottom-nav source.
- `query_text`, `query_length`, `has_results`, `active_chips` on `PERPS_SEARCH_QUERY` —
  mobile sends these; the controller contract has no keys for them, so they live in the
  Extension-only block alongside `QUERY_COUNT` / `TIME_IN_SEARCH_MS`.

### 4. Known behavioural divergence from mobile (not fixed here)

The search `mode` property can now report `discovery` when a category chip is active,
matching mobile's rule. But note the underlying difference: **Extension search bypasses
the category filter entirely** (`filterMarketsByQuery(allMarkets, …)` — it searches all
markets and ignores the chip), whereas mobile's filter narrows search results (mobile
even has a "Clear filter" CTA for the search + filter empty state).

So in the Extension `discovery` means "a chip is selected", while in mobile it means
"a chip is narrowing these results". The funnels are comparable in shape but not
identical in meaning. Making Extension search respect the category filter is a product
decision and was left out of scope.

### 5. One client analytics emit is deliberately retained (margin failures)

Every client transaction event the controller now owns has been removed — with one
exception. `edit-margin-modal-content.tsx` still emits `PerpsRiskManagement` FAILED on the
`{ success: false }` branch, because the pinned 9.2.1 does **not** cover that path:
`TradingService.updateMargin` tracks only inside `if (result.success)` and in its `catch`,
while `HyperLiquidProvider.updateMargin` catches its own errors and *returns*
`{ success: false }`. Without the client emit, every provider-rejected margin adjustment
("No position found", "Insufficient balance") would report no terminal risk event at all —
a regression against main. Every sibling flow (close, batch close, cancel, flip, TP/SL)
does cover its `{ success: false }` path, so margin is the only exception.

The emit mirrors the controller's own margin event shape and is marked
`REMOVE when the controller bump lands`. **Follow-up:** delete it in the same PR that bumps
past core #9471, or it will double-count.

### 6. PR size

The PR is ~5,386 counted lines against the repo's 1,000-line `check-pr-max-lines` limit
(~2,835 tests/mocks, ~2,551 source). It needs either a split — the attribution provider and
the market-search funnel are the two natural seams — or an explicit exemption.

## Verification

- `yarn lint:eslint` over all 57 changed files, `yarn lint:tsc`, `yarn lint:format`,
  `yarn lint:styles`, `yarn verify-locales`, `yarn circular-deps:check` — all pass.
- 743 tests across the 21 changed suites pass (309 in the six suites touched by the
  review-fix pass, 434 in the rest).
- LavaMoat webpack policies regenerated with `yarn lavamoat:auto`; the only delta is
  `URL` for `@nktkas/rews`, which the 2.x -> 4.x bump introduced.
- All 8 acceptance criteria proved by the validation recipe's nodes: contract/state
  asserts for the version, re-exports and duplicate-emission absence; behaviour proof via
  the owning Jest suites for attribution, order lifecycle, search funnel, abandonment and
  geo-block.
- Live UI proof of the market-not-found screen-view gating fix (screenshot in the task
  artifacts).
- See `artifacts/report.md` and `artifacts/recipe-coverage.md` for the full evidence,
  including what is *not* covered (event counts are proved at the Jest layer only; the
  harness exposes no analytics-capture action).
