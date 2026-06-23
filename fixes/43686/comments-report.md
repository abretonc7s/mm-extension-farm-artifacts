# PR #43686 — Comments Report & Triage

**PR:** feat(perps): A/B test "New" badge on Perps tab label in wallet overview
**Branch:** `TAT-3382-feat-add-perps-new-badge`
**Inherited context:** present (family `e7d88cea-5a9c-49d1-9373-ef79496f16fc`, TAT-3382). Read `inputs/inherited/report.md`, `recipe.json`, `recipe-quality.json`, `evidence-manifest.json`, `inherited-context.json`.

## Context summary

Standalone re-entry on top of inherited Farmslot family context. The PR adds a remote-flag-gated A/B test (`perpsTAT3382AbtestTabBadge`) that shows a "New" badge on the Perps tab in the treatment variant, dismissed on first Perps-tab click and persisted via `AppStateController` (mirrors `musdConversionEducationSeen`). Analytics reuse the existing `Perp Screen Viewed` event, enriched with `active_ab_tests`.

## Triage

| Source | Author | Where | Classification | Resolution |
|---|---|---|---|---|
| review (inline) | geositta | `test/e2e/feature-flags/feature-flag-registry.ts:2277` | **REAL** | Fixed — see below |
| inline | michalconsensys | `app/scripts/controllers/app-state-controller.test.ts:1112` ("Do we need a migration here?") | **FALSE_POSITIVE** (no code change) | No migration needed — explained below; operator replied directly. |
| inline | cursor[bot] | `ui/store/actions.ts` — "Background API missing badge setter" | **FALSE_POSITIVE** (outdated) | `metamask-controller.js:3331` already binds `setPerpsTabBadgeSeen`. |
| inline | cursor[bot] | `shared/constants/app-state.ts` — "Duplicate Perp Screen Viewed events" | **FALSE_POSITIVE** | `app-state.ts:27` maps the Perps tab to a **trace** name (`AccountOverviewPerpsTab`), not the MetaMetrics event. No double-count. |
| inline | cursor[bot] | `account-overview-tabs.tsx` — "Dismisses badge without Perps tab" | **FALSE_POSITIVE** (outdated) | Dismissal effect (`account-overview-tabs.tsx:155`) is gated on `showPerpsTabBadge`, which requires `isPerpsExperienceAvailable`. |
| issue/bot | github-actions, mm-token-exchange, sonarqube | conversation | N/A | CLA/build/quality bots — no action. SonarQube quality gate passed. |

## REAL fix — geositta (feature-flag registry shape)

**Concern:** new A/B flag used the `{ enabled: false }` feature-toggle shape instead of the threshold-array shape required by `docs/ab-testing.md` (DoD: "uses the threshold-array format"; "store the exact remote JSON value … including the threshold array, so E2E mocks exercise the same bucketing path as production").

**Fix:** updated `perpsTAT3382AbtestTabBadge.productionDefault` to mirror the **exact production remote JSON** (operator-confirmed value from the flag dashboard):

```ts
productionDefault: {
  versions: {
    '13.37.0': [
      { name: 'control',   scope: { type: 'threshold', value: 0.5 } },
      { name: 'treatment', scope: { type: 'threshold', value: 1 } },
    ],
  },
},
```

Verified against `@metamask/remote-feature-flag-controller`: the version-scoped wrapper is resolved by `processVersionBasedFlag` → `getVersionData(value, clientVersion)`, then the threshold array is bucketed via `calculateThresholdForFlag(metaMetricsId)` selecting the first group where `threshold <= scope.value`, falling back to control when no `metaMetricsId`. So the E2E mock now drives the same resolution path as production (version select → metaMetricsId bucketing, ~50/50).

Commits: `9e38d8c` (initial threshold array) → `eb67e67` (corrected to exact production version-scoped value).

geositta thread replied + updated: https://github.com/MetaMask/metamask-extension/pull/43686#discussion_r3460274214

## Migration question — michalconsensys

**No migration needed.** `perpsTabBadgeSeen` is added to `getDefaultAppStateControllerState()` (default `false`) which is spread before persisted `state` at controller init (`app-state-controller.ts:802-804`), so existing users automatically get `false`. Migrations are only for transforming/renaming existing persisted data, not adding a new defaulted field. Same pattern as `musdConversionEducationSeen`, which shipped with no migration (none exists in `app/scripts/migrations/`). Operator replied to michal directly.

## Validation

- `yarn lint:changed` — PASS (1 file: feature-flag-registry.ts)
- `yarn verify-locales --quiet` — "No invalid entries!"
- `yarn circular-deps:check` — passed (verified earlier in session; gate later timed out on the slow walk only, lint+locales clean)
- `yarn jest test/e2e/feature-flags/feature-flag-registry.test.ts test/e2e/feature-flags/sync-production-flags.test.ts --no-coverage` — 26/26 PASS
- Recipe: runtime-health PASS (CDP 6661); control recipe run hit `ui.wait_for` timeout (runtime/timing, unrelated to this test-only registry change — registry value affects only the Playwright E2E mock, not the live recipe). Not treated as a regression.
