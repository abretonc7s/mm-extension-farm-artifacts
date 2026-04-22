# TAT-2691 — Persist last-visited Perps route on brief close/reopen

## Ticket
- [TAT-2691](https://consensyssoftware.atlassian.net/browse/TAT-2691) — As a user, I want the extension to reopen on the perp screen if I close it briefly.

## Summary
Persists the active Perps path to the `AppStateController` when `PerpsLayout` mounts and clears it on in-app unmount. When the home screen mounts within a 5-minute TTL and no higher-priority `pendingRedirectRoute` is queued, the saved path is replayed via `setRedirectAfterDefaultPage`, landing the user back on the Perps screen they left. Mirrors the Swaps-style short-window resume pattern referenced in the ticket.

## Behavior
- **Persist on mount**: `PerpsLayout` effect writes `{ path, timestamp: Date.now() }` to `state.metamask.lastVisitedPerpsRoute` every time the active perps pathname/search changes.
- **Clear on in-app unmount**: the same effect's cleanup clears the entry, so intentional in-app navigation out of Perps does NOT trigger a stale resume later.
- **Survive abrupt close**: popup close/extension teardown kills the page before React commits run cleanup — the persisted value survives and the next home mount picks it up.
- **TTL gate**: home mount ignores entries older than `PERPS_REOPEN_TTL_MS` (5 min). Non-`/perps` paths are ignored too (defense in depth).
- **Priority**: an existing `pendingRedirectRoute` wins over the perps resume; the perps entry is still cleared to prevent stale redirects on subsequent mounts.

## Changes

### Backend (AppStateController)
- `app/scripts/controllers/app-state-controller.ts` — added `lastVisitedPerpsRoute: { path, timestamp } | null` state field with `persist: true`, `usedInUi: true`; added `setLastVisitedPerpsRoute(path)` method; registered on `MESSENGER_EXPOSED_METHODS`.
- `app/scripts/controllers/app-state-controller-method-action-types.ts` — regenerated via `yarn messenger-action-types:generate`.
- `app/scripts/metamask-controller.js` — exposed `setLastVisitedPerpsRoute` on the background API.

### UI wiring
- `ui/helpers/constants/routes.ts` — exported `PERPS_REOPEN_TTL_MS = 5 * 60 * 1000`.
- `ui/store/actions.ts` — `setLastVisitedPerpsRoute(path)` thunk calls `submitRequestToBackground`.
- `ui/selectors/selectors.js` — `getLastVisitedPerpsRoute` selector.
- `ui/pages/home/home.container.js` — mapped `lastVisitedPerpsRoute` prop + `clearLastVisitedPerpsRoute` dispatcher.
- `ui/pages/home/home.component.js` — `checkLastVisitedPerpsRoute()` runs in `componentDidMount` and on hydration in `componentDidUpdate`; respects TTL, path prefix, and `pendingRedirectRoute` precedence; always clears the persisted entry after inspection.
- `ui/pages/perps/perps-layout.tsx` — `useEffect` on `[pathname, search]` that writes the full path on mount/update and clears on React unmount.

## Tests
- `app/scripts/controllers/app-state-controller.test.ts` — `setLastVisitedPerpsRoute` stores path + timestamp, clears on `null`. (60 tests pass.)
- `ui/pages/home/home.component.test.tsx` — 5 new `checkLastVisitedPerpsRoute` tests: null, fresh TTL redirect, expired TTL clear-only, non-`/perps` path rejected, `pendingRedirectRoute` precedence. (11 tests pass.)
- `ui/pages/perps/perps-layout.test.tsx` — 3 new tests for persist-on-mount, search query inclusion, background-reject tolerance. (4 tests pass.)

## Recipe
- `artifacts/recipe.json` — 13/13 nodes pass live on CDP 6661 (`node validate-recipe.js --recipe ... --cdp-port 6661 --skip-manual`).
  - AC1: navigate to `/perps/market/BTC`, assert `state.metamask.lastVisitedPerpsRoute` has `{path:'/perps/market/BTC', timestamp: <fresh>}`.
  - AC2: intentional in-app navigation to `#/` triggers PerpsLayout cleanup, state is cleared.
  - AC3: seed state via background while on home, wait until hash becomes `#/perps/market/BTC` and `redirectAfterDefaultPage` is cleared — proves the componentDidUpdate branch that fires on a fresh home mount after popup close/reopen.

## Evidence artifacts
- `artifacts/recipe.json`
- `artifacts/recipe-quality.json`
- `artifacts/evidence-manifest.json`
- `artifacts/report.md` (this file)
- `artifacts/pr-description.md`

## Test plan (reviewer)
1. Navigate to Perps tab → close popup → reopen within 1 minute → lands back on the same Perps screen (no loading, no home-screen flicker).
2. Navigate to Perps → navigate away in-app to Wallet home → close + reopen → lands on home (entry cleared on graceful unmount).
3. Navigate to Perps → wait 6+ minutes → close + reopen → lands on home (TTL expired).
4. Both popup (`popup.html`) and expanded view (`home.html`) should behave identically.

## Live validation
- Recipe executed live on CDP port 6661 against the rebuilt dev bundle on branch `feat/tat-2691-persist-perp-reopen-state`. Result: 13/13 nodes pass. Auto issue review status `review` with 1 non-gating React warning originating in `PerpsView`/`PerpsViewStreamBoundary` — pre-existing, unrelated to this change.
- Evidence screenshots captured under `artifacts/screenshots/` (`evidence-persisted-after-visit-*.png`, `evidence-home-consumed-entry-*.png`).

## Self-Review Fixes (round 2)
- `ui/store/actions.ts:4323` — converted `setLastVisitedPerpsRoute` from plain async to `ThunkAction` for parity with `setPendingRedirectRoute` (forces `forceUpdateMetamaskState` + routes errors via `displayWarning`).
- `ui/pages/home/home.container.js:240` — wrapped in `dispatch(setLastVisitedPerpsRoute(null))` to match the neighbouring `clearPendingRedirectRoute` convention.
- `ui/pages/perps/perps-layout.tsx` — switched from bare `setLastVisitedPerpsRoute(...).catch(...)` to `useDispatch()` + `Promise.resolve(dispatch(setLastVisitedPerpsRoute(...))).catch(...)`; dispatch added to the effect dep array.

## Self-Review Fixes (round 1)
- `app/scripts/controllers/app-state-controller.ts` — added `lastVisitedPerpsRoute` state, metadata, and `setLastVisitedPerpsRoute` method; feature was entirely missing in the original scaffold commit.
- `app/scripts/controllers/app-state-controller-method-action-types.ts` — regenerated so the new action is recognised by the messenger.
- `app/scripts/metamask-controller.js` — exposed `setLastVisitedPerpsRoute` on the background API.
- `ui/helpers/constants/routes.ts:PERPS_REOPEN_TTL_MS` — added shared TTL constant (5 min).
- `ui/store/actions.ts:setLastVisitedPerpsRoute` — UI-side action that calls `submitRequestToBackground`.
- `ui/selectors/selectors.js:getLastVisitedPerpsRoute` — selector for the home container.
- `ui/pages/home/home.container.js` — connected the new selector + dispatcher to `Home`.
- `ui/pages/home/home.component.js:checkLastVisitedPerpsRoute` — implemented TTL + path-prefix + priority logic; wired into `componentDidMount` + `componentDidUpdate`.
- `ui/pages/perps/perps-layout.tsx` — `useEffect` on `[pathname, search]` to persist the active path and clear it on React unmount.
- `app/scripts/controllers/app-state-controller.test.ts` — 2 new tests for the controller method.
- `ui/pages/home/home.component.test.tsx` — 5 new tests for the home redirect logic.
- `ui/pages/perps/perps-layout.test.tsx` — 3 new tests covering persist-on-mount, search query, and background-error tolerance.
- `artifacts/recipe.json`, `artifacts/recipe-quality.json`, `artifacts/evidence-manifest.json`, `artifacts/report.md`, `artifacts/pr-description.md` — populated from empty.
