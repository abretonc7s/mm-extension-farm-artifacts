# PR #43686 — Comments Report & Context Summary

**PR:** feat(perps): [Extension] A/B test "New" badge on Perps tab label in wallet overview
**Branch:** `TAT-3382-feat-add-perps-new-badge` · **HEAD:** `35913bb225`
**Mode:** interactive PR-complete re-entry (stop before terminal SIGNAL).

## Inherited context: present

Farmslot family `e7d88cea-5a9c-49d1-9373-ef79496f16fc` (root TAT-3382). Resolved inherited
artifacts read from `inputs/inherited/`:

- `report.md` — full feature report (changes, key decisions, proof-mode-per-AC, test plan).
- `recipe.json` — control-flow recipe (seeded to `artifacts/recipe.json`, trusted family-inherited).
- `recipe-quality.json` — verdict **WARN**: AC1 proven live; AC2/AC3/AC5/AC6 proven by unit tests
  because the variant is a remote feature flag that must be launch-seeded (runtime forcing needs an
  extension reload that destroys FixtureServer wallet state). Not a defect — a known/accepted constraint.
- `evidence-manifest.json` — inherited evidence package.

Missing (per manifest, expected): worker learnings, recipe-flows bundle, recipe coverage.

**Feature summary:** remote-flag-gated A/B test (`perpsTAT3382AbtestTabBadge`). Treatment shows a "New"
`Tag` badge on the Perps tab label in the wallet overview; dismissed on first Perps-tab click; dismissal
persists via `AppStateController.perpsTabBadgeSeen` (no localStorage). Existing `Perp Screen Viewed` event
is reused and enriched with `active_ab_tests` via an analytics mapping. No new event emitted.

## Live comment triage

Live fetch (step 5/6) — no human review comments, no CHANGES_REQUESTED reviews. All issue comments are
bot builds/CLA/quality-gate plus the operator's own worker-report post. Two `cursor[bot]` **inline review**
comments exist, both filed against the **older** commit `297a56ae` (HEAD is now `35913bb225`).

| # | Source | Severity | Concern | Classification | Resolution |
|---|--------|----------|---------|----------------|------------|
| 1 | cursor[bot] inline `ui/store/actions.ts#L7649-7653` | High | `setPerpsTabBadgeSeen` thunk calls `submitRequestToBackground('setPerpsTabBadgeSeen')` but setter not registered in background `MetamaskController` API — dismissal would throw / not persist. | **REAL — already fixed** | Fixed in commit `f4badbc231`. Setter is bound at `app/scripts/metamask-controller.js:3331-3332` (`setPerpsTabBadgeSeen: appStateController.setPerpsTabBadgeSeen.bind(appStateController)`). Verified in current HEAD. No new change. |
| 2 | cursor[bot] inline `shared/constants/app-state.ts` + `account-overview-tabs.tsx#L147-163` | Medium | Mapping Perps tab into the tab→event map would emit `Perp Screen Viewed` on every tab click, duplicating the event `PerpsView` already fires. | **REAL — already fixed / never shipped** | `ACCOUNT_OVERVIEW_TAB_KEY_TO_METAMETRICS_EVENT_NAME_MAP` (app-state.ts:16-20) contains only Tokens/DeFi/Activity — Perps is **not** in it. `handleTabClick` for the Perps tab only dispatches `setPerpsTabBadgeSeen(true)`; it emits no metametrics event. Perps appears only in the TRACE map (fires `trace()`, not analytics). No duplicate event. Verified in current HEAD. No new change. |

Both bot findings were valid against `297a56ae` and are resolved by the follow-up commit `f4badbc231`
("expose badge setter in background API and avoid duplicate Perps screen-view"). The bots have not
re-reviewed the newer HEAD, so the comments still display as open but are stale.

## Working-tree state

Two files modified but uncommitted at re-entry:
- `shared/lib/ab-testing/ab-test-analytics.ts` — pure Prettier reflow (multi-line `.some()` callback).
- `shared/lib/ab-testing/perps-tab-badge.test.ts` — pure Prettier reflow (multi-line `toStrictEqual`).

No logic change in either; these are `lint:changed:fix` formatting output from a prior pass. Left staged-only
per project git-safety rules (no commit unless operator asks).

## Operator-supplied review comments (handled this session)

Two additional P2 review comments were provided by the operator. Both are **REAL** and were fixed.

| # | Severity | Location | Concern | Classification | Fix |
|---|----------|----------|---------|----------------|-----|
| 3 | P2 | `ui/components/multichain/account-overview/account-overview-tabs.tsx:151-152` | A treatment user who lands directly on `?tab=perps` or has Perps as the persisted default home tab sees the badge, but the click handler never runs (active tab did not change), so `perpsTabBadgeSeen` stays `false` and the badge reappears on every home mount despite being seen. | **REAL — fixed** | Replaced the click-only dismissal in `handleTabClick` with a `useEffect` that marks the badge seen whenever the Perps tab is the active/visible tab (`showPerpsTabBadge && activeTabKey === Perps`). Covers both clicking into Perps and landing on it directly. Still gated on `showPerpsTabBadge` so control/already-seen never marks it seen. Removed `showPerpsTabBadge` from `handleTabClick` deps. |
| 4 | P2 | `shared/lib/ab-testing/perps-tab-badge.ts:10` | New remote A/B key `perpsTAT3382AbtestTabBadge` is not in `test/e2e/feature-flags/feature-flag-registry.ts`. The global remote-flag mock builds production defaults from that registry, so the flag is omitted and the experiment resolves inactive/control unless every test overrides it — badge coverage diverges from production defaults. | **REAL — fixed** | Registered `perpsTAT3382AbtestTabBadge` in the perps cluster of the registry: `type: Remote`, `inProd: true`, `productionDefault: { enabled: false }` (mirrors the `earnCONF1385AbtestPrefilledMaxAmount` AB-test precedent). Resolves to control/inactive by default (production-accurate); tests can still seed a variant. |

### Validation of the two fixes

- **Unit:** `account-overview-tabs.test.tsx` extended (added `route` support + 2 mount tests: treatment-on-mount persists, control-on-mount does not). Existing click-dismissal test still passes — confirms the new effect covers the click path. `feature-flag-registry.test.ts` + `sync-production-flags.test.ts` pass with the new entry. **43/43 pass.**
- **Lint gate:** `lint:changed` / `verify-locales` / `circular-deps:check` all exit 0 (5 changed files).
- **Live CDP (treatment runtime, CDP 6661):** new bundle reloaded → badge shown on home (treatment, unseen) → click Perps → badge gone → reload → badge still gone (persisted). See `live-treatment-proof.json`.

## Verdict

The two original cursor[bot] inline comments were already fixed in `f4badbc231` (no action). The two
operator-supplied P2 review comments are now fixed with unit + live proof. All scoped gates green.
