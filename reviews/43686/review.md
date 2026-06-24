# PR Review: #43686 — feat(perps): A/B test "New" badge on Perps tab label in wallet overview

**Tier:** standard (RECIPE_STRATEGY: full-qa)

## Summary
Adds a remote-flag-gated A/B test (`perpsTAT3382AbtestTabBadge`) that shows a "New" badge on the wallet-overview Perps tab label for the treatment variant. The badge is dismissed (persisted via `AppStateController.perpsTabBadgeSeen`) the first time Perps becomes the effective active tab — click, `?tab=perps`, persisted default, or clamped-default — and the dismissal survives reloads. Exposure (`Experiment Viewed`) fires symmetrically for control/treatment only when the Perps experience is available, and the existing `Perp Screen Viewed` event is enriched with `active_ab_tests`.

The PR achieves its stated goal. The implementation is well-tested (110/110 unit tests pass), type-clean, and makes two well-reasoned, documented divergences from the original ticket wording (see Correctness). The live wallet confirmed both badge states render correctly. No blocking issues found.

## Recipe Coverage
Source: linked ticket description (TAT-3382). Recipe decision: generate-ui. Target env: fullscreen (home.html).

| # | AC (verbatim) | Target env | Recipe nodes | Screenshot | Verdict | Justification |
|---|---------------|------------|--------------|------------|---------|---------------|
| 1 | "Given flag resolves to control, the Perps tab shows a plain text label — no change from today." | fullscreen | gate-unlock, ac1-nav-home, ac1-wait-perps-tab, ac1-screenshot | evidence-ac1-control-no-badge.png | **PROVEN** | Screenshot: Perps tab present, plain "Perps", no badge. Paired CDP DOM probe: flag=control, badgeInDom=false. trace 5/5 pass, capture-helper snapshot. |
| 2 | "Given flag resolves to treatment ... the tab label shows a \"New\" badge alongside the text." | fullscreen | live CDP DOM observation | — | **PROVEN (live DOM state)** | Observed live: flag=treatment → `perps-tab-new-badge` present, tab text "PerpsNew". No controlled screenshot (remote variant re-bucketed to control; runtime patching disallowed). Unit test asserts badge + "New" text. |
| 3 | "Clicking the Perps tab in treatment dismisses the badge immediately and persists ... via localStorage." | fullscreen | n/a | — | **UNTESTABLE (live)** | Live=control (no badge to dismiss). Unit-test proven (dismiss on click/mount/clamped + persisted-state selector). Persists via AppStateController, not localStorage (see Correctness). |
| 4 | "Given isPerpsExperienceAvailable is false, the Perps tab is not rendered — badge is irrelevant." | fullscreen | n/a | — | **UNTESTABLE (live)** | Perps available in slot; can't force off. Unit-test proven. |
| 5 | "Experiment Viewed fires once per session with the correct flag key and variant." | fullscreen | n/a | — | **UNTESTABLE (live)** | Analytics event. Unit-test proven (useABTest + component exposure tests, control/treatment symmetric). |
| 6 | "The existing NavTabClicked event for the Perps tab carries active_ab_tests with the experiment assignment." | fullscreen | n/a | — | **UNTESTABLE (live)** | Controller enrichment. Unit-test proven (perps-tab-badge enrichment test). Enriches `Perp Screen Viewed`, not `NavTabClicked` (see Correctness). |

Overall recipe coverage: 2/6 ACs PROVEN (AC1 recipe screenshot + DOM; AC2 live CDP DOM state)
Untestable: AC3, AC4, AC5, AC6 — boot-seeded remote variant cannot be deterministically forced at runtime / analytics not observable in slot; all authoritatively unit-test proven (110/110 jest).

> Coverage note (not an escalation — all non-PROVEN ACs are explicitly UNTESTABLE with rationale): AC3–AC6 and a controlled treatment-badge screenshot for AC2 require the treatment assignment to be seeded in the fixture `RemoteFeatureFlagController` at browser launch (orchestrator-level), which the worker cannot do. Both control (no badge) and treatment (badge present) states were directly observed live via read-only CDP DOM, and all six ACs are covered by passing unit tests. A human reviewer with a treatment-seeded build can confirm the badge visually; the behavior is already proven by tests + live DOM.

## Prior Reviews
| Reviewer | State | Date | Addressed? | Notes |
|----------|-------|------|------------|-------|
| cursor[bot] | COMMENTED | 2026-06-18 | addressed | 3 findings — all resolved & verified against current code (see below). |
| michalconsensys | COMMENTED → DISMISSED | 2026-06-22/23 | addressed | "Do we need a migration?" → No (new defaulted field, merged on init like `musdConversionEducationSeen`). Verified. |
| geositta | COMMENTED → DISMISSED | 2026-06-23 | addressed | E2E flag registry shape → fixed in 6777fd61 (production threshold-array shape). |
| itsyoboieltr | APPROVED | 2026-06-23 | — | Approved after the final commit. |

No `CHANGES_REQUESTED` reviews. cursor[bot] findings, all verified resolved on current HEAD:
1. "Background API missing badge setter" (High) → `setPerpsTabBadgeSeen` IS registered (`metamask-controller.js:3327`).
2. "Duplicate Perp Screen Viewed events" (Medium) → Perps is absent from `ACCOUNT_OVERVIEW_TAB_KEY_TO_METAMETRICS_EVENT_NAME_MAP`; `handleTabClick` fires no event for Perps → no duplicate.
3. "Dismisses badge without Perps tab" (Medium) → `showPerpsTabBadge` and the mark-seen effect are gated on `isPerpsExperienceAvailable`.

These were already addressed; this review does not re-raise them.

## Acceptance Criteria Validation
| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | control → plain Perps tab, no badge | PASS | Recipe ac1-screenshot + CDP DOM probe (flag=control, badge absent) |
| 2 | treatment + not-clicked → "New" badge | PASS | Live CDP DOM (flag=treatment, badge present, "PerpsNew") + unit test |
| 3 | click dismisses + persists across reloads | PASS (code review + unit tests) | AppStateController persistence; component + selector tests. Persisted via controller, not localStorage |
| 4 | perps unavailable → Perps tab not rendered | PASS (unit tests) | "does not render the Perps tab when unavailable" |
| 5 | Experiment Viewed once/session, correct key+variant | PASS (unit tests) | useABTest exposure + component exposure tests |
| 6 | tab-open analytics event carries active_ab_tests | PASS (unit tests) | perps-tab-badge enrichment test; enriches `Perp Screen Viewed` |

## Code Quality
- Pattern adherence: follows codebase conventions — `useABTest` hook, `registerABTestAnalyticsMapping` mirrors the `defi-referral-ui` pattern, AppStateController field follows `musdConversionEducationSeen`.
- Complexity: appropriate. The `perpsIsEffectiveActiveTab` derivation is the only intricate piece; it is well-commented and fully tested.
- Type safety: clean — `yarn lint:tsc` passes, 0 errors. No `as any`.
- Error handling: adequate — async dismissal thunk is fire-and-forget (idempotent); exposure tracking guards with try/catch.
- Accessibility/fallbacks: badge is a non-interactive `<span>` (no false button/link role); async pre-resolve falls back to control (no badge), no misleading default. Minor nit: accessible name concatenates to "PerpsNew" (no separator).
- Anti-pattern findings: none — no LavaMoat/dep changes, no `getBackgroundPage`, badge has `data-testid`, no UI→app/scripts import, no localStorage, no migration needed.

## Fix Quality
- **Best approach:** Yes, with improvements over the ticket. Using `AppStateController` persisted state instead of the ticket-suggested `localStorage` is the correct choice (proper persistence, state logs, debug snapshot). Dismissing on "effective active tab" rather than click-only correctly covers persisted-default / `?tab=perps` / clamped-default landings.
- **Would not ship:** nothing blocking.
- **Test quality:** strong. Tests assert specific behavior (`setPerpsTabBadgeSeen(true)`, `experiment_id`/`variation_id`, badge text), cover failure paths (control/seen/unavailable do NOT dismiss or render), and would fail if the fix were reverted.
- **Brittleness:** `perpsIsEffectiveActiveTab` (account-overview-tabs.tsx:143) reconstructs the `Tabs` component's internal "clamp to first rendered tab (index 0)" rule. If `Tabs`' default-selection behavior changes, this duplicated logic could silently drift. Non-blocking suggestion.

## Live Validation
- Recipe: generated (generate-ui)
- Result: PASS — control recipe 5/5 nodes pass (trace.json). AC1 proven via screenshot + DOM probe; AC2 proven via live DOM state.
- Evidence: 1 screenshot (evidence-ac1-control-no-badge.png) + trace.json; video skipped (standard tier — video is full-only)
- Webpack errors: none (build complete; PR code confirmed live via new `perpsTabBadgeSeen` field)
- Log monitoring: no `[hud]` warnings in recipe stdout

## Correctness
- Diff vs stated goal: aligned. Two documented divergences from the literal ticket wording, both improvements/necessary adaptations:
  1. **Persistence** — ticket said `localStorage`; PR uses `AppStateController.perpsTabBadgeSeen`. Stronger and correct.
  2. **AC6 analytics event** — ticket said `NavTabClicked`; the extension has NO `NavTabClicked` event for the Perps tab (the tab→event map covers only Tokens/DeFi/Activity). PR enriches `Perp Screen Viewed` (fired by `PerpsView` on tab content mount) instead. The literal AC6 event is unachievable; the adaptation satisfies the intent.
- Edge cases: covered — clamped active tab (Tokens hidden → Perps becomes first), unavailable perps, already-seen, control symmetry. All have unit tests.
- Race conditions: none material — the mark-seen effect dispatches once (deps stable until state flips), and `setPerpsTabBadgeSeen` is idempotent.
- Backward compatibility: preserved — new defaulted controller field, no migration needed; `useABTest` `trackExposure` option defaults to `true`.

## Static Analysis
- lint:tsc: PASS (0 errors)
- Tests: 110/110 pass — perps-tab-badge (config+enrichment), persisted-state selector, useABTest (trackExposure), account-overview-tabs (19 incl. badge render/dismiss/exposure), app-state-controller (63 incl. setPerpsTabBadgeSeen)

## Mobile Comparison
- Status: N/A
- Details: Extension-only A/B test; no mobile `perpsTabBadge` equivalent (mobile parity explicitly out of scope per ticket). No perps price/value surface → no decimal-formatting divergence risk.

## Architecture & Domain
MV3-safe: persistence via `AppStateController` (browser.storage.local) through the standard background messenger (`setPerpsTabBadgeSeen` exposed in `MESSENGER_EXPOSED_METHODS` and bound in `metamask-controller.js`). No LavaMoat policy impact (no dependency changes). Analytics enrichment registered once (idempotent) in the MetaMetrics controller constructor. Import boundaries respected (UI imports shared config; controller imports shared config).

One observation (non-blocking): the `Perp Screen Viewed` enrichment mapping applies to every `Perp Screen Viewed` event (~11 perps surfaces — view, modals, pages), not only the tab open, for bucketed users. This is the standard `active_ab_tests` annotation pattern and only fires for users with an active assignment, but it is broader than the tab-open attribution implied by the AC.

## Risk Assessment
- **LOW** — UI-only tab labeling with persisted app state and analytics hooks; no auth/payments/transaction-path changes. Gated behind a remote flag and behind `isPerpsExperienceAvailable`. Well-tested, type-clean, already human-approved.

## Recommended Action
**COMMENT**

No blocking issues. The PR is well-implemented, well-tested, and already approved by a human reviewer; prior bot/human findings are resolved. Optional, non-blocking improvements:
- `account-overview-tabs.tsx:143` — `perpsIsEffectiveActiveTab` duplicates the `Tabs` clamp-to-first-rendered-tab rule; consider having `Tabs` surface the resolved active tabKey to avoid drift (suggestion).
- `shared/lib/ab-testing/perps-tab-badge.ts:45` — enriching `Perp Screen Viewed` annotates all ~11 perps screen-view surfaces with the experiment assignment, broader than the tab-open AC; confirm this is the intended attribution scope (suggestion).
- `account-overview-tabs.tsx:282` — the badge's accessible name concatenates to "PerpsNew"; consider a separator/aria handling for screen readers (nitpick).
