# Recipe coverage — MANUAL-000001

| AC | Proof mode | Primary evidence | Recipe nodes | Verdict | Rationale |
|---|---|---|---|---|---|
| AC1: Extension depends on perps-controller with TAT-3463 contract | state | `recipe-run/trace.json` + package version command | `ac1-assert-package-version` | PROVEN | Asserts installed version ≥9.1 and ENTRY_POINT / HL_FEE_RATE / BULK_ACTION_ID / STATUS.SUBMITTED exports |
| AC2: Analytics imports controller event/property/value/types | state | `shared/constants/perps-events.ts` assert | `ac2-assert-controller-reexports`, `ac2-assert-no-local-timestamp-mirror` | PROVEN | File imports from `@metamask/perps-controller`; no local `perps_timestamp` mirror |
| AC3: Entry/discovery/UTM via attribution APIs | state | background API + provider + layout + metrics merge asserts | `ac3-assert-attribution-api-wiring`, `ac3-assert-attribution-provider`, `ac3-assert-layout-provider`, `ac3-assert-metrics-merge-utm` | PROVEN | `perpsSetAttributionContext` exposed; provider syncs UTM; layout mounts provider; `trackPerpsEvent` merges UTM via `mergeAttributionContext` |
| AC4: Submitted + terminal analytics for supported ops | state | trackingData builder + cancel/hlFeeRate asserts + unit tests | `ac4-assert-tracking-data-builder`, `ac4-assert-cancel-tracking-data`, `ac4-assert-place-hl-fee-rate` | PROVEN | `usePerpsAttribution` attaches entryPoint/discoverySource; cancel passes trackingData; place/flip include hlFeeRate; controller TradingService owns submitted+terminal |
| AC5: No duplicate client MetaMetrics transaction events | state | source command asserts | `ac5-assert-no-duplicate-order-entry-close`, `ac5-assert-no-duplicate-cancel`, `ac5-assert-no-duplicate-close-modal` | PROVEN | Order-entry / cancel / close no longer emit Trade/Close/Cancel/Risk transaction tracks |

Overall recipe coverage: 5/5 ACs PROVEN (untestable: none, weak: 0, missing: 0)
