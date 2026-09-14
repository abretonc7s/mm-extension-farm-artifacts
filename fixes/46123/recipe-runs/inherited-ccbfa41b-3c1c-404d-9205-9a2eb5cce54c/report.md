# TAT-3857 review package

Perps now starts market/account/price preload when an eligible wallet unlocks. Home and market-browser readiness use the documented Mobile trace names, mount boundaries, lifecycle tags and Home variants, through Extension's shared trace/endTrace functions. The Perps route UI remains lazy.

Ticket: [TAT-3857](https://consensyssoftware.atlassian.net/browse/TAT-3857)
Draft PR: https://github.com/MetaMask/metamask-extension/pull/46123

## Changes

- Wallet-root preload is gated by unlock, completed onboarding, feature availability, selected account and Basic Functionality. It owns broad prices independently of foreground detail streams.
- Account initialization is serialized; stale responses, replaced owners and released connections cannot complete a newer operation.
- Home uses `Perps Entry To Live Market List`; the browser uses `Perps Market List View`. Both use `perps.operation`. Home waits for orders, positions, account and live markets before completion and reports `empty`, `position` or `order`.
- Connection, market preload and user preload flow through shared tracing. Existing `AccountOverviewPerpsTab` is unchanged. Failed or abandoned entries do not consume cold_process.
- A narrow runtime prerequisite fixes NetworkController's fetch/btoa receiver under LavaMoat in all eight policy overrides. No dependency changes.

## Validation

- 571 tests pass across 15 scoped suites, with no skips. The existing composed-controller trace mock now supplies a deterministic numeric clock.
- Changed executable-line coverage is 234/247, 94.7%; every changed file meets 80%. See coverage-report.json and coverage-all-tests.log.
- Final harness diff gate passes policy-suppression checks, ESLint, oxfmt and changed tests. Policy JSON formatting and circular-dependency checks pass. No repository-wide typecheck was requested or run.
- Final non-test Chrome MV3 LavaMoat build and Ethereum/Linea preflight pass in the preserved profile.
- Final recipe passes 27/27 nodes with stable execution provenance. A second recorded run also passes 27/27. after.mp4 is finalized and the capture-helper screenshot was inspected.
- Edge tests cover timeout, abandonment, duplicate/stale completion, background/resume listener order, pending orders, failed init/ping, stale owner release, account A→B→A, reset during init, provider/network/backend changes, empty markets and persisted/unrelated-symbol data.

The tests exposed and fixed four issues: resume could abandon the replacement trace, failed ping leaked subscriptions, an unrelated symbol's price could claim readiness, and an immediate disconnect bypassed window-close grace.

## Evidence fit

# Acceptance evidence

| AC | Claim | Mode | Nodes | Primary evidence | Result |
| --- | --- | --- | --- | --- | --- |
| AC1 | Unlock starts initialization, controller caches and broad prices before Perps navigation | state | ac1-unlock, ac1-preload | recorded-recipe-run/observed-traces.jsonl | PROVEN |
| AC2 | PerpsLayout remains lazy | state | ac2-lazy | pre-navigation-scripts.json | PROVEN |
| AC3 | Documented Mobile names route through shared tracing | trace | ac3-shared, ac3-browser-trace | recorded-recipe-run/observed-traces.jsonl | PROVEN |
| AC4 | Cold, warm and background-resume context remain distinct | trace | ac4-cold-trace, ac4-warm-trace, ac4-resume-trace | recorded-recipe-run/observed-traces.jsonl | PROVEN |
| AC5 | Entry completes with committed live market rows | mixed | ac5-rows, ac5-state, ac4-cold-trace | recorded-recipe-run/observed-traces.jsonl and screenshots/evidence-ac5-live-markets.png | PROVEN |
| AC6 | AccountOverviewPerpsTab unchanged | state | ac6-regression | recorded-recipe-run/trace.json | PROVEN |

27/27 nodes pass in recorded-recipe-run/summary.json. Provenance passes. Screenshots use capture-helper snapshot. Remote Sentry ingestion and unbiased latency are not proven; local shared tracing is proven.

## Limits and runtime findings

Shared-function observations prove names, tags, routing and completion boundaries. They do not prove remote Sentry ingestion or unbiased latency; this runtime reports Sentry not initialized, and debugger observation perturbs timing. Validate ingestion in an identifiable Sentry-enabled release before calling the dashboard rollout complete. Recipe quality is WARN for that external validation gap.

The harness recorded nonblocking existing/environment findings including resource 404s, Snap account synchronization warnings and a network-provider state-shape error. They did not fail the Perps assertions; diagnostics.json preserves them without attributing them to this change. Wallet/profile, credentials and fixtures were preserved. No trades or transfers were performed.

Only one current Home screenshot is selected for orientation and visible-row proof. Earlier equivalent screenshots are omitted; screenshots cannot prove hidden preload or trace correctness.

## Files

- `app/scripts/controllers/perps/infrastructure.test.ts`
- `app/scripts/controllers/perps/infrastructure.ts`
- `app/scripts/controllers/perps/perps-stream-bridge.test.ts`
- `app/scripts/controllers/perps/perps-stream-bridge.ts`
- `app/scripts/metamask-controller.js`
- `app/scripts/metamask-controller.test.js`
- `lavamoat/webpack/mv2/beta/policy-override.json`
- `lavamoat/webpack/mv2/experimental/policy-override.json`
- `lavamoat/webpack/mv2/flask/policy-override.json`
- `lavamoat/webpack/mv2/main/policy-override.json`
- `lavamoat/webpack/mv3/beta/policy-override.json`
- `lavamoat/webpack/mv3/experimental/policy-override.json`
- `lavamoat/webpack/mv3/flask/policy-override.json`
- `lavamoat/webpack/mv3/main/policy-override.json`
- `shared/lib/trace.ts`
- `ui/components/app/perps/hooks/usePerpsTabExploreData.test.ts`
- `ui/components/app/perps/hooks/usePerpsTabExploreData.ts`
- `ui/components/app/perps/perps-view.test.tsx`
- `ui/components/app/perps/perps-view.tsx`
- `ui/helpers/perps/entry-trace.test.ts`
- `ui/helpers/perps/entry-trace.ts`
- `ui/hooks/perps/stream/usePerpsLiveMarketListData.test.ts`
- `ui/hooks/perps/stream/usePerpsLiveMarketListData.ts`
- `ui/hooks/perps/stream/usePerpsLivePrices.test.ts`
- `ui/hooks/perps/stream/usePerpsLivePrices.ts`
- `ui/hooks/perps/stream/usePerpsViewActive.ts`
- `ui/hooks/perps/usePerpsEntryTrace.test.ts`
- `ui/hooks/perps/usePerpsEntryTrace.ts`
- `ui/hooks/perps/usePerpsPreload.test.ts`
- `ui/hooks/perps/usePerpsPreload.ts`
- `ui/pages/perps/market-list/index.tsx`
- `ui/pages/perps/perps-layout.tsx`
- `ui/pages/routes/routes.component.tsx`
- `ui/providers/perps/PerpsStreamManager.test.ts`
- `ui/providers/perps/PerpsStreamManager.ts`

## Review artifacts

- Full working diff: final.diff
- Product diff: final-product.diff
- PR body preview: pr-description.md
- Recorded run: recorded-recipe-run/summary.json, trace.json, execution-provenance.json and observed-traces.jsonl
- Proof mapping: recipe-coverage.md
- Selected media: evidence-manifest.json and after.mp4

Approved and published as b762a63f39 to draft PR #46123. Final approved gate passes; see check-diff-approved/validation-summary.json. Core PR #10136 Bugbot fix is separately committed and pushed as b52e623c6, with a fix reply and resolved thread.
