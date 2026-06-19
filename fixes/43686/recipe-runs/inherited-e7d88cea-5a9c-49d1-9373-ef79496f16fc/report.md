# TAT-3382 — A/B test "New" badge on Perps tab label

**Ticket:** [TAT-3382](https://consensyssoftware.atlassian.net/browse/TAT-3382)
**Branch:** `TAT-3382-feat-add-perps-new-badge` · **PR:** #43686

## Summary

Adds a remote-flag-gated A/B test (`perpsTAT3382AbtestTabBadge`) that, in the treatment variant, shows a "New" `Tag` badge on the Perps tab label in the wallet overview. The badge is dismissed on first Perps-tab click and the dismissal persists across reloads via `AppStateController` (no `localStorage`). The existing `Perp Screen Viewed` event is reused for the Perps tab open and enriched with `active_ab_tests`.

## Changes

| File | Change |
|---|---|
| `shared/lib/ab-testing/perps-tab-badge.ts` (new) | Flag key, variants, exposure metadata, analytics mapping (→ `Perp Screen Viewed`). |
| `shared/lib/ab-testing/ab-test-analytics.ts` | `registerABTestAnalyticsMapping()` helper (idempotent). |
| `app/scripts/controllers/metametrics-controller.ts` | Registers the mapping so `enrichWithABTests` attaches `active_ab_tests` to the existing `Perp Screen Viewed` event (already fired by `perps-view.tsx`). No new event, no extra emit. |
| `app/scripts/controllers/app-state-controller.ts` | New persisted `perpsTabBadgeSeen` flag + `setPerpsTabBadgeSeen()` setter. |
| `app/scripts/metamask-controller.js` | Bind `setPerpsTabBadgeSeen` in the background `getApi()` so the UI thunk reaches it (required, else dismissal throws). |
| `shared/types/background.ts` | Add `perpsTabBadgeSeen` to `ControllerStatePropertiesEnumerated` (required — without it the flattened state type resolves to `never`). |
| `app/scripts/controllers/app-state-controller-method-action-types.ts` | Auto-generated (`yarn messenger-action-types:generate`) for the new setter. |
| `ui/store/actions.ts` | `setPerpsTabBadgeSeen()` thunk. |
| `ui/selectors/perps/persisted-state.ts` (new) + `index.ts` | `getPerpsTabBadgeSeen` selector. |
| `ui/components/multichain/account-overview/account-overview-tabs.tsx` | `useABTest`, conditional badge in the Perps tab `name`, dismissal on click. |

## Key decisions

- **Persistence via `AppStateController`, not `localStorage`** — mirrors the existing `musdConversionEducationSeen` pattern (`browser.storage.local`, survives reload, testable). The ticket's `localStorage` suggestion was deliberately not followed.
- **Reused the existing `Perp Screen Viewed` event** for AC6 instead of adding a new event. `perps-view.tsx` already fires it when the Perps view loads; the registered analytics mapping enriches that event with `active_ab_tests`. The Perps tab is intentionally **not** added to the tab→event map (that would double-count the screen view alongside `PerpsView`).
- **AC4 needed no code** — the Perps `<Tab>` is already gated by `isPerpsExperienceAvailable`.

## Proof mode per acceptance criterion

| AC | Claim | Proof mode | Primary evidence |
|---|---|---|---|
| AC1 | Control → plain Perps tab, no badge | visual | **Recipe (live)** `ac1-*` + `after-ac1-control-no-badge.png` |
| AC2 | Treatment + unseen → "New" badge shown | state/visual | **Unit test** `renders the New badge … in the treatment assignment` |
| AC3 | Click Perps dismisses badge + persists across reload | state | **Unit tests** `hides the New badge once it has been seen` + `persists the dismissal via AppStateController …` |
| AC4 | `isPerpsExperienceAvailable` false → no Perps tab | state | **Unit test** `does not render the Perps tab when the perps experience is unavailable` |
| AC5 | Experiment Viewed fires once with correct key/variant | log | **Unit test** `fires the Experiment Viewed event with the treatment assignment` |
| AC6 | Perps tab open event carries `active_ab_tests` | state | **Unit test** `enriches the Perp Screen Viewed event with the active treatment assignment` |

### Why AC2/AC3/AC5/AC6 are unit-tested rather than live-recipe proven

The A/B variant is a **remote feature flag**. Forcing `treatment` in the running extension requires editing `dist/chrome/manifest.json` `_flags` and reloading the extension — which destroys the FixtureServer-injected wallet state in this slot. Per project guidance, flags must be **seeded at launch** and the recipe should drive only real user flows. The live recipe therefore proves the control state (AC1); the treatment behaviour is proven authoritatively and reproducibly by unit tests. To prove treatment live, seed `perpsTAT3382AbtestTabBadge={name:'treatment'}` in the launch fixture and re-run with `ac2-/ac3-` nodes.

## Test plan

- `yarn jest ui/components/multichain/account-overview/account-overview-tabs.test.tsx --no-coverage` — 10 passed (6 new).
- `yarn jest shared/lib/ab-testing/perps-tab-badge.test.ts --no-coverage` — 9 passed.
- `yarn jest ui/selectors/perps/persisted-state.test.ts --no-coverage` — 3 passed.
- `yarn jest app/scripts/controllers/app-state-controller.test.ts --no-coverage` — 63 passed (setter test + 4 updated state snapshots).
- `yarn lint:changed && yarn verify-locales --quiet && yarn circular-deps:check` — all pass (13 files).
- Coverage analyzer: **PASS** (perps-tab-badge 100%, persisted-state 100%, account-overview-tabs 85%, ab-test-analytics 97%).
- `yarn lint:tsc` (full type-check): **0 errors** — caught a state-type regression (adding the controller field requires updating `ControllerStatePropertiesEnumerated`, else `MetaMaskState` → `never`); fixed.
- Recipe runner (control): **exit 0**, trace 6/6 nodes pass.

## Evidence artifacts

- `after-ac1-control-no-badge.png` — control: Perps tab present, no "New" badge (capture-helper snapshot).
- `after.mp4` — control user-flow recording (unlock → overview); supplementary (`preferred: false`).
- `recipe.json` + `recipe-run/trace.json` — executed control recipe.
- Screenshots intentionally omitted: no treatment screenshot (variant must be launch-seeded — covered by unit tests).
