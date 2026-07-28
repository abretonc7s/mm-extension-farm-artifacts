# Recipe coverage — MANUAL-000001 (PR #44324 re-entry)

Recipe: `artifacts/recipe.json` (Protocol v1) · Run: `artifacts/recipe-run/` — **pass, 19/19 nodes**, started 2026-07-28T00:56:43Z.

Proof mode shifted this session: AC3/AC4/AC6/AC7/AC8 are now proved by the owning Jest suites (behaviour) rather than identifier greps, after a grep-only assert was found passing on a stale `closeFeeRate` pattern. AC1/AC2/AC5 remain contract/state asserts because they are version, re-export, and absence claims.

| AC | Proof mode | Primary evidence | Recipe nodes | Verdict | Rationale |
|---|---|---|---|---|---|
| AC1: Extension depends on perps-controller with the TAT-3463 contract | state | `recipe-run/trace.json` + package version command | `ac1-assert-package-version` | PROVEN | Asserts installed version ≥9.1 and the ENTRY_POINT / HL_FEE_RATE / BULK_ACTION_ID / SEARCH_QUERY / TIME_ON_SCREEN_MS / STATUS.SUBMITTED / ACTION.ABANDON_ORDER exports this PR consumes |
| AC2: Analytics imports the controller event/property/value contract | state | `shared/constants/perps-events.ts` asserts | `ac2-assert-controller-reexports`, `ac2-assert-no-local-timestamp-mirror` | PROVEN | File imports from `@metamask/perps-controller`; no local `perps_timestamp` mirror survives |
| AC3: Entry/discovery/UTM via attribution APIs | behaviour | 221 tests across 4 suites | `ac3-attribution-behaviour` | PROVEN | PerpsAttributionContext, usePerpsAttribution, perps-controller-init and infrastructure suites assert UTM accumulation, merged-context forwarding to `perpsSetAttributionContext`, and `mergeAttributionContext` on controller-emitted events |
| AC4: Submitted + terminal analytics for supported ops | behaviour | 185 tests across 4 suites | `ac4-order-lifecycle-behaviour` | PROVEN | Order entry, cancel, close and reverse suites assert the emitted `trackingData` / `hlFeeRate` payloads on place, modify, close, cancel and flip. Serialized (`--runInBand`) against userEvent-timeout flake |
| AC5: No duplicate client MetaMetrics transaction events | state | source command asserts | `ac5-assert-no-duplicate-order-entry-close`, `ac5-assert-no-duplicate-cancel`, `ac5-assert-no-duplicate-close-modal` | PROVEN | Absence claim asserted against stable `MetaMetricsEventName.*` contract identifiers, which do not rot the way local variable names do |
| AC6 (TAT-3144 / TAT-3202): market search funnel | behaviour | 27 tests | `ac6-search-funnel-behaviour` | PROVEN | Debounced query with settled counts, `search_results_shown` / `search_no_results` screen views, `result_rank` on tap, abandonment on clear |
| AC7 (TAT-3136): order abandonment | behaviour | 5 tests | `ac7-abandonment-behaviour` | PROVEN | `abandon_order` on unmount, on a mounted surface going inactive, and on `pagehide`; once only; never after a commit |
| AC8 (TAT-3175 bullet 4): geo-block screen view | behaviour | 5 tests | `ac8-geo-block-screen-view` | PROVEN | `screen_type: geo_block_notif` emitted once per open, re-armed for the next open, silent while closed |
| Screen-view gating fix (market-not-found) | live UI | `recipe-run/live-capture-error-screen.png` | `live-cdp`, `live-ensure-unlocked`, `live-open-perps`, `live-open-unknown-market`, `live-assert-error-screen`, `live-capture-error-screen` | PROVEN | Unknown symbol routes to a single rendered "Market not found" screen — the state whose duplicate screen view this PR removed |

Overall coverage: 8/8 ACs PROVEN plus live UI proof of the gated error screen (untestable: none, weak: 0, missing: 0).

Known coverage limits, stated rather than papered over:
- Event **counts** are proved in the Jest layer only. The harness exposes no analytics-capture action, so the live nodes prove the screen state the events describe, not the emissions themselves.
- `environment_type` on background controller-emitted transaction events (TAT-3335 / TAT-3175 bullet 1) is not covered: it is deferred to perps-controller 9.2.2 and cannot be asserted here.
- `source` on the geo-block screen view (Mobile parity) is not covered because it is not implemented — 3 hosts share one open flag across multiple triggers. Flagged as follow-up in `report.md`.
- Headed live nodes require `caffeinate -disu`; on an idle machine Chrome's compositor suspends and the run aborts before writing artifacts.
