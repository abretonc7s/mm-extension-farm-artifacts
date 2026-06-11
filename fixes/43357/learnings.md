# Reviewer-driven learnings — PR #43357 (perps slippage config)

- **Fixture seed vs HTTP mock drift:** reviewer caught that disabling `perpsSlippageConfig2` only in the seeded `RemoteFeatureFlagController` state left `mockEligibleFeatureFlags` returning the production default (`enabled:true`) — fix-bug should treat the seeded remote-flag state and the `/v1/flags` HTTP mock as a single source of truth and override the flag in both places at once.

- **Background refetch overwrites seed:** `updateRemoteFeatureFlags` refetches on load/UI open when external services are on, silently overriding pre-seeded flags — when an E2E fixture depends on a non-default flag value, always assume the background controller will re-fetch and assert the mock mirrors the seed.

- **Disabling a gate flag needs both halves:** turning off a submit-gating flag (slippage estimate) in only one layer can leave the submit button permanently disabled mid-test without an obvious error — when a flag gates interactivity, verify the off-state survives the controller's async refresh, not just the initial render.

- **Reuse the seed constant in the mock:** the durable fix references `PERPS_ELIGIBLE_REMOTE_FEATURE_FLAGS.perpsSlippageConfig2` rather than a duplicated literal — fix-bug should derive mock override values from the same constant the fixture seeds to prevent future drift.
