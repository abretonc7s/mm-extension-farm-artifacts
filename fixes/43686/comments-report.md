# PR #43686 — Comments Report & Triage

**PR:** feat(perps): A/B test "New" badge on Perps tab label in wallet overview
**Branch:** TAT-3382-feat-add-perps-new-badge
**Run:** 43686-0623-204041

## Summary

This is a **re-invocation** of the pr-complete flow. Branch HEAD (`6a27d4b8dc`) is
fully synced with `origin` (0 ahead / 0 behind), working tree clean, and already merged
with latest `origin/main`. **All five review threads were already resolved by prior
farmslot runs**, and every cursor[bot] finding is verified present-and-fixed in current
code. No new code changes were required this run.

## Triage

| # | Author | File:Line | Severity | Triage | Status / Action |
|---|--------|-----------|----------|--------|-----------------|
| 1 | cursor[bot] | ui/store/actions.ts:7709 | High | REAL (already fixed) | `setPerpsTabBadgeSeen` IS registered on background API — `app-state-controller.ts:757` (controller methods), handler `:1335`, action type `app-state-controller-method-action-types.ts:285`, wired via legacy-background-api-service. Thread resolved. |
| 2 | cursor[bot] | shared/constants/app-state.ts:19-20 | Medium | REAL (already fixed) | Perps is NOT in `ACCOUNT_OVERVIEW_TAB_KEY_TO_METAMETRICS_EVENT_NAME_MAP` (only Tokens/DeFi/Activity). No duplicate `Perp Screen Viewed`. Thread resolved + outdated. |
| 3 | cursor[bot] | account-overview-tabs.tsx:127-132 | Medium | REAL (already fixed) | Mount effect (`account-overview-tabs.tsx:154-158`) is gated on `showPerpsTabBadge`, which requires `isPerpsExperienceAvailable` (`:119-122`). Badge can't be marked seen when Perps unavailable. Thread resolved + outdated. |
| 4 | michalconsensys | app-state-controller.test.ts:1112 | — | FALSE POSITIVE (answered) | "Do we need a migration here?" — No: `perpsTabBadgeSeen` is a new field, defaults handled by controller state init. Author replied (`3451236916`), thread resolved. |
| 5 | geositta | test/e2e/feature-flags/feature-flag-registry.ts | — | REAL (already fixed) | A/B flag now mirrors exact production remote JSON (version-scoped threshold array) instead of `{ enabled: false }`, fixed in `eb67e67`. Author replied (`3460274214`), thread resolved. |

### Conversation comments
All three `issues/comments` from `abretonc7s` are farmslot run summaries (own automated
worker reports), not actionable reviewer feedback. NOOP / informational.

## Recipe re-validation (step 10)

- **Recipe:** `artifacts/recipe.json` — "TAT-3382 — Perps tab New badge (control user flow)".
- **Result:** FAIL (3/4 nodes pass). Failing node = `ac1-assert-badge-absent` (`ui.wait_for perps-tab-new-badge expected=absent` timed out).
- **Root cause:** NOT a regression. Live DOM probe confirms the runtime is bucketed into the
  **treatment** variant: `{perpsTab:true, badge:true, badgeText:"New", tabText:"PerpsNew"}`.
  The recipe asserts the **control** assignment (no badge), but per its own description the A/B
  variant is a remote feature flag seeded at fixture launch and cannot be forced to control at
  runtime. This runtime happened to bucket to treatment, so the badge correctly renders — the
  feature is working, not broken.
- **Attribution:** No code changed this run (clean tree, 0 ahead/behind origin); the step-3 merge
  was a no-op (already up to date). The failure is independent of this branch — it is a
  fixture/bucketing condition. Both control and treatment paths are authoritatively validated by
  the 47 passing unit tests (account-overview-tabs, perps-tab-badge, useABTest, persisted-state).
- **Decision (per step-10 rule):** unrelated to this branch → logged as environment variance, not
  blocking. CI parity gate + coverage (PASS, 100% new-code) cover code correctness.

## Verdict
- Total reviewer comments: 5 inline (3 bot, 2 human) + 3 conversation (bot/self reports).
- REAL: 4 (all already fixed in prior commits on this branch). FALSE POSITIVE: 1. OUT OF SCOPE: 0.
- **Commit SHA for fixes (this run):** none — no code changes were required. Branch HEAD `6a27d4b8dc`
  already contains every fix and is 0 ahead / 0 behind origin.
- **Files changed (this run):** none.
- **Recipe re-validation:** FAIL on control-path assertion, attributed to treatment-bucket
  environment variance (see Recipe section) — NOT a regression. Code correctness covered by CI
  gate + 100% new-code coverage + 47 passing unit tests.
- **Merge-main status (step 3):** clean — already up to date with `origin/main`.
- **Step 11 (commit/push):** no-op — nothing to stage, branch already synced.
- **Step 12 (replies/resolve):** no-op — all 5 threads already resolved; human threads already
  have author replies (#5 cites fix commit `eb67e67`); cursor threads resolved by prior handling.
  No new commit to cite, so re-replying would be duplicate noise (consistent with 3 prior runs).

## CI parity gate (step 9) — all green
- `yarn lint:changed`: no changed files to lint (branch fully committed).
- `yarn verify-locales --quiet`: No invalid entries.
- `yarn circular-deps:check`: passed.
- Unit tests (badge feature): 47/47 passed (account-overview-tabs, perps-tab-badge, useABTest, persisted-state).
- Coverage: PASS — new code 100% (25/25 changed lines) after correcting the analyzer's stale-base
  misattribution (the original FAIL flagged `legacy-background-api-service` migration lines that
  belong to main, not this PR).
