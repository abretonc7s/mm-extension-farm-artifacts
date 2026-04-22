# Self-Review: TAT-2691

## Verdict: PASS

## Summary
Worker persists the active Perps path in `AppStateController.lastVisitedPerpsRoute` on `PerpsLayout` mount and clears it on intentional in-app unmount; `Home.componentDidMount`/`componentDidUpdate` replays the path through `setRedirectAfterDefaultPage` when the entry is fresh (`PERPS_REOPEN_TTL_MS = 5 min`) and no `pendingRedirectRoute` wins. Implementation mirrors the existing `pendingRedirectRoute` pattern end-to-end (selector + thunk + container + TTL gate + precedence). Correct.

## Type Check
- Result: PASS
- New errors: none (pre-existing TS errors unrelated to changed files remain on `main`)

## Tests
- Result: PASS
- Details: `app-state-controller.test.ts` + `home.component.test.tsx` + `perps-layout.test.tsx` → 75/75 pass, 4/4 snapshots. No console baseline violations.

## Test Quality
- Findings: none found.
- No `should` names in added tests; assertions use specific `toHaveBeenCalledWith({ path: '/perps/market/BTC' })` / `toBe(...)` — a revert of the fix fails them. No hardcoded i18n copy. AAA structure clean.

## Domain Anti-Patterns
- Findings: none found.
- Boundaries: UI→background via thunk + `submitRequestToBackground` (correct bridge). No `app/` import from `ui/`.
- Controller: new field added to existing `AppStateController` with `persist: true`, `usedInUi: true`, `includeInStateLogs: true`, `includeInDebugSnapshot: true`; default `null` so no migration needed for additive field.
- MV3: persistence goes through controller state, not SW module variables.
- Error handling: `perps-layout.tsx:38,42` swallow dispatch errors with justified fire-and-forget comment; thunk itself logs + dispatches `displayWarning` + rethrows — acceptable trade-off since persistence failure must not break the Perps surface.
- Shared state: `PERPS_REOPEN_TTL_MS` is module-level constant (immutable) — correct.
- testIDs: no new interactive elements.

## Mobile Comparison
- Status: N/A
- Details: Mobile has no equivalent close/reopen resume pattern in `/Users/deeeed/dev/metamask/metamask-mobile-ref/app/components/UI/Perps` (`grep -r "lastVisited|reopenRoute|resumePerps|PERPS_REOPEN"` → zero hits). The extension popup/expanded-view lifecycle is the driver; mobile screens do not terminate the same way. No formatting code added, no `.toFixed`/`formatNumber` divergence risk.

## LavaMoat Policy
- Status: N/A
- Details: no `yarn.lock`, `package.json`, or `lavamoat/browserify/**` changes. No new deps.

## Fix Quality
- Best approach: yes — mirrors the existing `pendingRedirectRoute` + `setRedirectAfterDefaultPage` plumbing that the Swaps flow already uses, keeping the home redirect pipeline as the single entry point.
- Would not ship: none.
- Test quality: good — tests assert specific `setRedirectAfterDefaultPage({ path })` args, cover null / fresh / expired / wrong-prefix / pending-precedence branches; perps-layout tests cover mount+unmount, search-query inclusion, and background-rejection tolerance.
- Brittleness: none. `componentDidUpdate` guards the null→value transition so the redirect fires exactly once per hydration. `clearLastVisitedPerpsRoute?.()` is defensively optional-chained even though mapDispatchToProps always wires it — harmless. `ui/pages/home/home.component.test.tsx:216,217` duplicates the TTL literal (`5 * 60_000`) instead of importing `PERPS_REOPEN_TTL_MS`; minor nit, not worth blocking.

## Diff Quality
- Minimal: yes — 12 files, +306/-5, all scoped to the feature. No reformatting, no unrelated imports.
- Debug code: none (no `console.log`, no leftover TODO/FIXME in diff hunks).

## Recipe
- Present: yes
- Quality: good
- Re-run: 13/13 PASS live on CDP 6661 after navigating back to home from a stale perps detail page (first run failed on the pre-existing `verify-unlocked` node because the page was not on home; re-ran clean after reset).
- Covers the fix: AC1 asserts `state.metamask.lastVisitedPerpsRoute` populates with `{path:'/perps/...', timestamp}` after visiting market detail; AC2 asserts intentional nav to `#/` clears the entry via PerpsLayout cleanup; AC3 seeds the entry while on home and waits for `location.hash` to flip to `#/perps/market/BTC` — this is the consumption path that fires on home mount after popup reopen.
- Strict assertions (all `eq`/`truthy`, no `contains`), uses `call` for `extension-core/unlock-wallet` + `perps/navigate-to-market-detail`, seeds its own data via `setLastVisitedPerpsRoute` (does not rely on pre-existing wallet state), teardown resets the field. `recipe-quality.json` present and all 5 checks pass. Auto-issue review status `review` with 2 non-gating events (pre-existing React unmount warning on PerpsView / PerpsViewStreamBoundary — unrelated).

## Issues
(none)
