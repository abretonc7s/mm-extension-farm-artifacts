# PR #43686 — Interactive PR-complete Report

**PR:** feat(perps): [Extension] A/B test "New" badge on Perps tab label in wallet overview
**Branch:** `TAT-3382-feat-add-perps-new-badge` · **Status:** waiting-human (interactive re-entry; no terminal SIGNAL written)

## Summary

Re-entered the Perps "New" badge A/B-test PR. Inherited Farmslot family context (`e7d88cea…`) was present and reloaded.
Triaged all live PR comments and fixed the actionable issues:

- The two **cursor[bot]** inline comments (background API missing setter; duplicate `Perp Screen Viewed`) were already
  resolved by the earlier commit `f4badbc231` — verified against current HEAD, no further change.
- Two **operator-supplied P2** review comments were **REAL** and are now fixed (see below).

## Files changed (this session)

| File | Change |
|---|---|
| `ui/components/multichain/account-overview/account-overview-tabs.tsx` | **Fix P2-A.** Moved Perps badge dismissal from a click-only branch in `handleTabClick` into a `useEffect` that marks the badge seen whenever the Perps tab is the active/visible tab. Covers landing directly on Perps (persisted default tab or `?tab=perps`), which the click handler missed. Removed `showPerpsTabBadge` from `handleTabClick` deps. |
| `ui/components/multichain/account-overview/account-overview-tabs.test.tsx` | Added `route` param to `renderTabs`; added 2 tests (treatment-on-mount persists dismissal; control-on-mount does not). Existing click-dismissal test retained and still passes via the new effect. |
| `test/e2e/feature-flags/feature-flag-registry.ts` | **Fix P2-B.** Registered `perpsTAT3382AbtestTabBadge` (`Remote`, `inProd: true`, `productionDefault: { enabled: false }`) so the E2E global remote-flag mock serves a production-accurate default (resolves to control/inactive). |
| `shared/lib/ab-testing/ab-test-analytics.ts` | Pre-existing Prettier reflow only (no logic). |
| `shared/lib/ab-testing/perps-tab-badge.test.ts` | Pre-existing Prettier reflow only (no logic). |

## Validation

| Check | Result |
|---|---|
| `yarn jest` account-overview-tabs + ab-testing + feature-flag-registry + sync-production-flags | **43/43 pass** (incl. 2 new mount tests) |
| `yarn lint:changed` | exit 0 (5 files) |
| `yarn verify-locales --quiet` | exit 0 (No invalid entries) |
| `yarn circular-deps:check` | exit 0 |
| Live CDP proof (treatment runtime, port 6661) | reload → badge shown → click Perps → badge gone → reload → still gone (persisted). `live-treatment-proof.json` |

### Recipe note

The inherited recipe `artifacts/recipe.json` proves the **control** flow (Perps tab, no badge). In this slot the
running profile's `RemoteFeatureFlagController` resolved the A/B test to **treatment**, so the control recipe times
out at `ac1-assert-badge-absent` (badge is correctly present) — an assignment mismatch, **not** a code defect. The
parent run already proved control live (trace 6/6) when its profile bucketed to control. This session proves the
treatment dismissal/persistence path live instead (above). Forcing a specific variant requires launch-seeding the
flag in the fixture's `RemoteFeatureFlagController` (documented limitation in `recipe-quality.json`).

## Commit / push status

**Not committed, not pushed.** Changes are staged-only-eligible per project git-safety rules. No GitHub replies or
thread resolutions were posted.

## Remaining manual work (operator)

1. Review the two P2 fixes (`account-overview-tabs.tsx`, `feature-flag-registry.ts`) + new tests.
2. Decide whether to also discard the 2 pre-existing Prettier-only reflows in the `shared/lib/ab-testing/*` files or fold them into a commit.
3. Commit the fixes (suggested: `fix(perps): dismiss badge when Perps tab active on mount + register A/B flag in E2E registry`).
4. Optional GitHub replies once committed:
   - To the cursor[bot] "Background API missing badge setter" + "Duplicate Perp Screen Viewed" threads: "Fixed in f4badbc231." (already resolved; bots reviewed the older commit).
   - For the two P2 review comments: reply with the new commit sha + one-line of what changed, then resolve.
5. If a live **treatment** recipe proof is wanted in-PR, launch-seed `perpsTAT3382AbtestTabBadge={name:'treatment'}` in the fixture and add `ac2-/ac3-` nodes.
