# Recipe coverage — TAT-3175

Source of truth: `artifacts/trace.json` (every `ac*` node `ok: true`), captured Segment payloads (`before-/after-ui-interaction-event.json`), jest.

| # | AC (verbatim) | Proof mode | Primary evidence | Recipe nodes (IDs) | Visual file if any | Evidence verdict | Justification |
|---|---------------|------------|------------------|---------------------|--------------------|------------------|---------------|
| 1a | Return environment_type parameter to all perp events (UI-emitted) | state | log | ac1-open-perps-tab, ac1-wait-perps-view, ac1-assert-screen-viewed-env, ac3-assert-ui-interaction | — | PROVEN | Captured Segment payloads: `Perp Screen Viewed` and `Perp UI Interaction` both carry `environment_type=fullscreen`. Already true on main; no code change needed. |
| 1b | Return environment_type parameter to all perp events (background controller-emitted, e.g. `Perp Account Setup`, trade transactions) | state | log | — | — | UNTESTABLE | Split to [TAT-4006](https://consensyssoftware.atlassian.net/browse/TAT-4006) (owner-approved split, see `split-acceptance.md`). Out of Extension scope: these fire from the background `PerpsController`, which has no UI-surface context; `TradingService` forwards only a fixed `trackingData` allow-list (`app/scripts/controllers/perps/infrastructure.ts:199`). Needs a `@metamask/perps-controller` change. Observed value today: `background`. |
| 2 | Return screen_type = geo_block_notif to PERP SCREEN VIEWED event when relevant | state | test | ac2-run-geo-block-test, ac2-assert-geo-block-test | — | PROVEN | Already shipped in `PerpsGeoBlockModal`; `perps-geo-block-modal.test.tsx` "emits a geo_block_notif screen view once while open" passes (asserted `1 passed`). Live trigger impossible: slot is not geo-blocked and eligibility comes from the live geolocation service. |
| 3 | Add parameter button_clicked = ... on PERP UI INTERACTION event | state | log + test | ac3-scroll-learn-basics, ac3-wait-learn-basics, ac3-screenshot-perps-home, ac3-press-learn-basics, ac3-assert-ui-interaction, ac3-read-events | after-ac3-perps-home.png (orientation only) | PROVEN | Before: `{interaction_type: button_clicked, button_type: tutorial}`; after: `{interaction_type: button_clicked, button_clicked: tutorial}`, no `button_type`, count=1. Recipe asserts `button_clicked=tutorial` and `button_type $exists:false` → fails on revert. 7 unit assertions fail on revert. |

Forbidden-pattern scan: no `switch`, no `wait`, no skip-reason reads, no `manual`, no UI value injection; all node IDs prefixed `ac<N>-`/`setup-`/`gate-`/`teardown-`. Screenshot is orientation for a state AC, not the proof.

Overall recipe coverage: 3/4 ACs PROVEN (untestable: 1b — split to TAT-4006, needs a perps-controller change; weak: 0, missing: 0)
