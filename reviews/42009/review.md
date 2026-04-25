# PR Review: #42009 — feat(perps): memorize perps state when re-opening metamask

**Tier:** standard (full-qa strategy)

## Summary
Persists the active `/perps/*` route into a memory-only `AppStateController.lastVisitedPerpsRoute` (path + timestamp) on PerpsLayout mount, clears it on graceful in-app departure, and replays it via `setRedirectAfterDefaultPage` from the home component when the user reopens within `PERPS_REOPEN_TTL_MS` (5 min). Also defers the controller-owned Perps WebSocket disconnect by 60s after the last UI connection closes (cancelled on reconnect, bypassed on lock) and hydrates `PerpsStreamManager` from controller cache on mount + triggers `startMarketDataPreload()` on `perpsInit` to skip the cold-mount skeleton. Achieves the stated goal: live recipe shows BTC market → in-app home (clears) → seeded ETH path → home redirects to ETH market detail.

## Recipe Coverage

| # | AC (verbatim) | Target env | Recipe nodes (IDs) | Screenshot filename | Visual verdict | Justification |
|---|---------------|------------|---------------------|---------------------|----------------|---------------|
| 1 | "Enable Perps and navigate to the Perps tab (e.g. open the BTC market detail)." — visiting a perps screen persists `lastVisitedPerpsRoute` with path + timestamp. | fullscreen | ac1-navigate-perps, ac1-wait-persisted, ac1-assert-state, ac1-screenshot | evidence-ac1-perps-mount-persists-route-1777125168627.png | PROVEN | After `ext_navigate_hash` to `perps/market/BTC`, wait_for resolves in 502ms with `lastVisitedPerpsRoute = { path: '/perps/market/BTC', timestamp: <fresh> }`. Strict assert pins hash + state shape. Screenshot confirms BTC-USD market detail. |
| 2 | "Close the popup/extension." — persisted entry survives. | popup | n/a | n/a | UNTESTABLE | CDP attach on home.html only; popup JS-context destroy + reopen cannot be driven from this slot. Covered by `home.component.test.tsx` in-app-marker race test + `useLayoutEffect` cleanup ordering review. |
| 3 | "Reopen within 1 minute — you should land back on the same Perps screen." | fullscreen | ac3-decay-marker, ac3-seed-route, ac3-wait-redirect, ac3-assert-redirect, ac3-screenshot | evidence-ac3-home-consumes-entry-redirect-1777125171937.png | PROVEN | After 2s in-app-marker decay (>1500ms), seed `/perps/market/ETH` via background; home `componentDidUpdate` (null→non-null) sets `redirectAfterDefaultPage`; `checkRedirectAfterDefaultPage` navigates. wait_for confirms `hash === '#/perps/market/ETH'` in 503ms. Screenshot confirms ETH-USD market detail. |
| 4 | "Navigate to Wallet home (in-app), then close and reopen — land on home." — in-app leave clears the entry. | fullscreen | ac4-navigate-home, ac4-wait-cleared, ac4-assert-cleared, ac4-screenshot | evidence-ac4-in-app-leave-clears-entry-1777125169316.png | PROVEN | `ext_navigate_hash` to `''` triggers PerpsLayout cleanup → `markPerpsUnmountInApp()` + `setLastVisitedPerpsRoute(null)`. wait_for resolves in 503ms with `lvpr === null` and `hash === '#/'`. Screenshot shows wallet home (ETH/MetaMask USD tokens, no /perps content). |
| 5 | "Wait 6 minutes, reopen — land on home (TTL expired)." | fullscreen | n/a | n/a | UNTESTABLE | No API to back-date the controller timestamp; live 6-min wait impractical. Covered by `home.component.test.tsx` "does not redirect but still clears when TTL has expired". |
| 6 | "Repeat steps 1–3 in both popup mode and the expanded extension view." | popup + fullscreen | n/a | n/a (home.html only) | UNTESTABLE | popup.html target not reachable via CDP without a user gesture. Implementation is single-bundle so home.html proof transfers in principle, but popup-side end-to-end is not exercised. |
| 7 | (Behaviour summary) "an existing `pendingRedirectRoute` takes precedence and the saved entry is always cleared after inspection." | fullscreen | n/a | n/a | UNTESTABLE | Live recipe cannot deterministically order `setPendingRedirectRoute` + `setLastVisitedPerpsRoute` into a single componentDidUpdate cycle. Covered by `home.component.test.tsx` "defers to pendingRedirectRoute when both are set but still clears the persisted perps entry". |

Overall recipe coverage: 3/7 ACs PROVEN
Untestable: AC2 (CDP target scope), AC5 (no back-dating API), AC6 (popup target unreachable), AC7 (single-componentDidUpdate ordering not deterministic from CDP) — each routed to a specific named unit test.

> ⚠ Coverage escalation: AC2, AC5, AC6, AC7 not proven in browser.
>   Reason: AC2/AC6 — popup.html target not reachable on this CDP attach; AC5 — no API to back-date the controller timestamp; AC7 — recipe cannot deterministically order two app-state dispatches inside one componentDidUpdate cycle.
>   Human reviewer must validate manually before merging by running `gh pr checkout 42009`, opening Perps in popup mode, closing/reopening within 1 min (AC2/AC6), waiting 6 min before reopening (AC5), and triggering a `pendingRedirectRoute`-set background flow on a Perps screen (AC7).

## Prior Reviews
| Reviewer | State | Date | Addressed? | Notes |
|----------|-------|------|------------|-------|
| cursor | COMMENTED | 2026-04-22T09:05:46Z | n/a | Bugbot automated review, no CHANGES_REQUESTED. |
| abretonc7s | COMMENTED (×9) | 2026-04-23 → 2026-04-25 | n/a | Author self-review threads. |
| cursor | COMMENTED (×4) | 2026-04-23 → 2026-04-25 | addressed | Multiple bugbot rounds. Author pushed 11 follow-up commits between 2026-04-23 and 2026-04-25, latest `914d3111` (2026-04-25T06:12) addressing CI feedback. No `CHANGES_REQUESTED` reviews recorded. |

No formal CHANGES_REQUESTED outstanding.

## Acceptance Criteria Validation
| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | Visiting a perps screen persists path + timestamp | PASS | recipe ac1-* nodes (trace.json), `ui/pages/perps/perps-layout.tsx:102-107`, `app/scripts/controllers/app-state-controller.ts:1778-1784`, unit `app-state-controller.test.ts setLastVisitedPerpsRoute` |
| 2 | Persisted entry survives popup teardown | UNTESTABLE | code review: `useLayoutEffect` cleanup at `ui/pages/perps/perps-layout.tsx:116-123` runs in layout phase; popup JS context destroy preempts it. |
| 3 | Reopen within TTL replays redirect | PASS | recipe ac3-* nodes, `ui/pages/home/home.component.js:248-295,379-382`, unit `home.component.test.tsx redirects to the persisted perps path when within the TTL` |
| 4 | In-app leave clears the entry | PASS | recipe ac4-* nodes, `ui/pages/perps/perps-layout.tsx:116-123` cleanup, `ui/helpers/perps/in-app-leave-marker.ts:16-18`, unit `home.component.test.tsx skips the redirect but still clears when PerpsLayout just unmounted in-app` |
| 5 | TTL expired → no resume | UNTESTABLE in CDP, PASS in unit | `ui/pages/home/home.component.js:262 (PERPS_REOPEN_TTL_MS check)`, unit `home.component.test.tsx does not redirect but still clears when TTL has expired` |
| 6 | Works for popup + fullscreen | UNTESTABLE in CDP | Single-bundle implementation; home.html proof transfers in principle |
| 7 | pendingRedirectRoute takes precedence | UNTESTABLE in CDP, PASS in unit | `ui/pages/home/home.component.js:285-294`, unit `home.component.test.tsx defers to pendingRedirectRoute when both are set but still clears the persisted perps entry` |

## Code Quality
- Pattern adherence: Mirrors the existing `pendingRedirectRoute` flow (PR also adds `lastVisitedPerpsRoute` selector + thunk + reducer flag + propTypes + container mapStateToProps in matching shape). PerpsLayout uses `useLayoutEffect` for the cleanup phase deliberately (called out in the comment) so the marker fires before the next mount's `componentDidMount`. Memory-only persistence (`persist: false`, `includeInStateLogs: false` to scrub portfolio paths from support logs) is the right tradeoff.
- Complexity: appropriate for the bug. The marker-bridge between layout-effect cleanup and a passive-effect redux dispatch is the trickiest piece; comment block at `home.component.js:271-284` explains the timing precisely.
- Type safety: `lastVisitedPerpsRoute: { path: string; timestamp: number } | null` is explicit; the home component's PropTypes `shape` mirrors it. The two `as unknown as` casts in the diff are test-only mock typing — standard for this codebase.
- Error handling: dispatches are wrapped in `Promise.resolve(...).catch(() => {})` — fire-and-forget is correct for a navigation hint. `startMarketDataPreload` errors swallowed deliberately (commented).
- Anti-pattern findings: none material. No new `as any`, no `eslint-disable`, no `console.log`. The 1500ms in-app-marker grace is a duplicated magic number — see Fix Quality.

## Fix Quality
- **Best approach:** This is the right minimal fix. Memory-only state + 5-min TTL mirrors the Swaps pattern the ticket references; in-app marker bridges the layout-effect-vs-componentDidMount race that would otherwise re-trigger the resume on graceful navigation.
- **Would not ship:** none — all blocking concerns from prior cursor rounds have been resolved per the latest commit history.
- **Test quality:** strong. `home.component.test.tsx` covers seven distinct branches (null, fresh path, expired, non-perps path, pending-precedence, /perpsNew prefix, in-app marker race) and asserts both the positive (set called with) and the negative (clear always called) sides. Reverting the PR's `if (!pendingApplies && !justLeftPerpsInApp && isFresh && isPerpsPath)` line would correctly fail the suite. `app-state-controller.test.ts` covers set + clear. `perps-stream-bridge.test.ts` adds three grace-window cases (defer, cancel-on-reconnect, lock bypass). `home.component.test.tsx` does not assert that `setRedirectAfterDefaultPage` is called with the `path` argument shape used by `redirectAfterDefaultPage?.shouldRedirect`/`path`; the hand-off point between `checkLastVisitedPerpsRoute` and `checkRedirectAfterDefaultPage` is implicitly covered through live behaviour but not unit-asserted (suggestion comment).
- **Brittleness:**
  - `wasPerpsUnmountedInAppRecently(1500)` — the 1500ms threshold is a magic number duplicated implicitly between `PerpsLayout` (writes the marker on cleanup) and `home.component` (reads with literal `1500`). Pull this into a named constant alongside `PERPS_REOPEN_TTL_MS` so a future tweak to the cleanup-phase ordering keeps both sides in sync.
  - The marker is module-level mutable state — fine in popup (JS context destroy resets it) but in fullscreen/sidepanel where the JS context survives across many in-app navigations, only the time-decay protects it. Acceptable; documented in the file's header.

## Live Validation
- Recipe: generated (mode: generate-internal — primary proof is controller state + URL hash, screenshots secondary)
- Result: PASS — 20/20 drafted ac/setup/teardown nodes ok in `trace.json`
- Evidence: 3 evidence screenshots (ac1, ac3, ac4) + 1 baseline screenshot. No video recording (recipe-driven shots are sufficient on standard tier; full-qa video gating not required when 20/20 nodes pass deterministically).
- Webpack errors: none in `temp/runtime/webpack.log` (latest bundles for primary, contentscript, app-init complete cleanly).
- Log monitoring: `recipe-issues-review.md` reports 1 unrelated background error during the run (`No metadata found for 'autoLockTimeLimit'`) — preferences-controller noise unrelated to this PR. No PR-related warnings/errors/exceptions.

## Correctness
- Diff vs stated goal: aligned. Implementation precisely matches the PR description's behaviour summary, including `pendingRedirectRoute` precedence and the always-clear-after-inspection rule.
- Edge cases: rapid-navigation between Perps screens handled (cleanup only fires on true unmount, not pathname change — comment at `perps-layout.tsx:99-101`); `/perpsNew` prefix attack guarded (split on `?#`, exact eq or `startsWith('/perps/')`); env-mismatch on a stale `pendingRedirectRoute` does not suppress perps resume (mirrors `checkPendingRedirectRoute` env check at `home.component.js:285-288`).
- Race conditions: the layout-vs-passive-effect ordering race is the central engineering concern of this PR and is solved end-to-end (layout cleanup writes synchronous module marker → next home mount reads it before the redux clear lands). Verified live.
- Backward compatibility: new state is additive, default `null`, `persist: false` so no migration; new background method `setLastVisitedPerpsRoute` is additive on the messenger.

## Static Analysis
- lint:tsc: PASS (no errors)
- Tests: 408 pass / 408 in the changed-file suite (`app-state-controller.test.ts`, `perps-stream-bridge.test.ts`, `home.component.test.tsx`, `perps-layout.test.tsx`, `PerpsStreamManager.test.ts`, `selectors.test.js`); 198 pass / 5 skipped of pre-existing skips in `metamask-controller.test.js`.

## Mobile Comparison
- Status: N/A
- Details: No equivalent `lastVisitedPerpsRoute` exists in `metamask-mobile-ref/app/components/UI/Perps/`. The brief-close-reopen scenario does not surface on mobile because the OS preserves the JS context across short backgrounding windows. The PR's reference point is the extension's own Swaps pattern (per the ticket), not a mobile equivalent. No mobile drift introduced.

## Architecture & Domain
- MV3 implications: memory-only `lastVisitedPerpsRoute` is correct — the service worker's in-memory lifetime aligns with the 5-min TTL; persisting to disk would leave stale paths after browser restart. The 60s `PERPS_DISCONNECT_GRACE_MS` deferred WS teardown likewise depends on the service worker staying alive briefly after the last UI connection — also memory-only and bypassed on lock (`metamask-controller.js:8370-8372`).
- LavaMoat impact: none — `yarn.lock` not touched, no new dependencies, no policy file changes.
- Import boundaries: clean. `ui/helpers/perps/in-app-leave-marker.ts` is read by `ui/pages/home/home.component.js` and written by `ui/pages/perps/perps-layout.tsx` — both UI-layer; no controller-layer imports of UI helpers.
- Controller usage: `setLastVisitedPerpsRoute` follows the same `BaseController.update` + `messenger.exposeMethod` pattern as the surrounding controller methods. State metadata correctly sets `persist: false` and `includeInStateLogs: false`.

## Risk Assessment
- MEDIUM — The PR rewrites part of the home-mount redirect ordering and defers WS teardown. The home redirect path has solid unit coverage and live proof on home.html; the popup-only behaviours (AC2/AC6) and the precedence/expiry corners (AC5/AC7) ride on unit tests alone. The deferred WS teardown is gated by a 60s timer + lock-bypass, with three new unit tests (defer, cancel-on-reconnect, lock-bypass) — low blast radius if the timer mis-fires (worst case is a stale WS for 60s, no data corruption). If the popup-side resume regresses post-merge, the user-visible effect is a wallet-home flicker before redirect (existing pre-PR behaviour), not a crash.

## Recommended Action
COMMENT — recommend a manual popup-mode pass on AC2/AC3/AC6 before merging (the home.html proof does not exercise the popup target on this farmslot). Optional follow-ups in line comments are non-blocking.

Specific items:
- Manual: open Perps in popup mode (browser-action toolbar icon), close popup, reopen within 1 min, verify redirect lands on the same `/perps/*` route (AC2 + AC3 in popup env; AC6 popup parity).
- Manual: same in expanded view (already exercised by the recipe — fullscreen).
- Manual: trigger a `pendingRedirectRoute` set on a Perps screen (e.g. via a deep link or background flow) and verify the pending route wins on next home mount AND `lastVisitedPerpsRoute` is cleared (AC7 belt-and-suspenders against the unit-tested behaviour).
- Suggestion (non-blocking): extract the `1500` in-app-marker grace into a named constant; add a debug-only `setLastVisitedPerpsRouteWithTimestamp` to make AC5 testable in CDP.
