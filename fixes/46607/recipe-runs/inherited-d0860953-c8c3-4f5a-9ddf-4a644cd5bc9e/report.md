# TAT-3175 report

**Summary:** Extension `Perp UI Interaction` button taps sent the button name as `button_type`; mobile and the perps-controller contract use `button_clicked`. The 14 call sites now emit `button_clicked`, and the unused `BUTTON_TYPE` alias is gone. The other two asks already work (with one caveat below).

**Root cause:** `shared/constants/perps-events.ts:26` (pre-fix) defined an extension-only `PERPS_EVENT_PROPERTY.BUTTON_TYPE = 'button_type'`. The button-click handlers in `perps-support-learn.tsx:88`, `perps-market-balance-actions.tsx:99`, `market-list/index.tsx:616` and `perps-market-detail-page.tsx:866` used it, while `perps-top-movers.tsx:124` already used `BUTTON_CLICKED`.

**Ticket asks:**
1. `environment_type`: UI-emitted perps events already carry it (`fullscreen` in the captured payloads). Background controller events (`Perp Account Setup`, trade transactions) report `background`. Fixing those needs `@metamask/perps-controller` to forward a UI surface in `trackingData` (see `app/scripts/controllers/perps/infrastructure.ts:199`), so it's a follow-up and not part of this change.
2. `screen_type = geo_block_notif`: already emitted by `PerpsGeoBlockModal` (`perps-geo-block-modal.tsx:62`). Covered by the existing unit test. Can't be triggered live because this slot isn't geo-blocked.
3. `button_clicked`: fixed.

**Changes**
- `shared/constants/perps-events.ts`: remove the `BUTTON_TYPE` alias
- `ui/components/app/perps/perps-market-balance-actions/perps-market-balance-actions.tsx`: deposit/withdraw/tutorial now use `button_clicked`
- `ui/components/app/perps/perps-support-learn/perps-support-learn.tsx`: tutorial/support/feedback now use `button_clicked`
- `ui/pages/perps/market-list/index.tsx`: category filter now uses `button_clicked`
- `ui/pages/perps/perps-market-detail-page.tsx`: trade/margin/exposure/tutorial buttons now use `button_clicked`
- Tests: balance-actions, support-learn (new case), market-list (new assertion), market-detail (shared `track` mock + margin assertion)

**Test plan**
- Jest: 4 affected suites pass (178 tests). The same suites fail 7 tests when the source fix is reverted. Geo-block test passes.
- `mm-harness check diff --profile fast`: pass. `lint:changed`, `verify-locales`, `circular-deps:check`: pass. Coverage: PASS.
- Recipe `recipe.json`: exits 0. `recipe-baseline.json` passed on the pre-fix build, asserting `button_type=tutorial` with no `button_clicked`.
- Manual (Gherkin):
  - Given MetaMetrics is on and the wallet is on the Perps tab
  - When I tap "Learn the basics of perps"
  - Then the `Perp UI Interaction` event has `interaction_type=button_clicked`, `button_clicked=tutorial`, `environment_type=fullscreen` and no `button_type`

**Evidence:** `before-ui-interaction-event.json` / `after-ui-interaction-event.json` (captured Segment payloads), `trace.json`, `recipe-coverage.md`, `recipe-quality.json`, `after-ac3-perps-home.png` (orientation), `before.mp4` (after.mp4 dropped in the self-review pass; see below).

**Env notes:** Payload capture needed `SEGMENT_HOST=http://localhost:8667` and a dummy `SEGMENT_WRITE_KEY` in the gitignored `.metamaskrc`. The original is saved as `metamaskrc.orig`. The first `--build` launch left the browser on a stale service worker. Reloading the extension then disabled it in the Chrome profile, and I re-enabled it from chrome://extensions.

**Dashboards:** extension events stop sending `button_type`. Any extension chart keyed on it should switch to `button_clicked`, which is what mobile already uses.

**Ticket:** [TAT-3175](https://consensyssoftware.atlassian.net/browse/TAT-3175)

## Self-Review Fixes
- test/mocks/metamask-perps-controller.js:46 — removed the stale `BUTTON_TYPE: 'button_type'` key. The real controller has no such key, and the mock kept the removed alias resolving under jest.
- ui/pages/perps/perps-market-detail-page.test.tsx:1560 — asserts on `MetaMetricsEventName.PerpsUiInteraction` instead of the `'Perp UI Interaction'` string literal (added the import).
- Recipe re-run passes (`button_clicked: tutorial`, no `button_type`). The runtime had been rebuilt without the Segment capture settings, so I re-applied them to `.metamaskrc` for this run and restored the file afterwards. `after.mp4` couldn't be re-recorded because the recipe's `gate-kill-capture-helper` node kills the recorder. I removed it from the evidence manifest, since this pass only changed tests.

## Self-Review Fixes (attempt 2)
- app/scripts/controllers/perps/infrastructure.ts:199 — no code change; I split this out explicitly instead. Controller-emitted events can't carry the UI surface until `@metamask/perps-controller` forwards it (fixed `trackingData` allow-list; deposit/withdraw take no tracking data). Details and acceptance criteria are in `follow-up-ticket.md`. The PR description now says `Refs:` (partial) and names the split. See `no-change-report.md`.

## Self-Review Fixes (attempt 3) — blocked
- artifacts/follow-up-ticket.md:1 — needs a human decision. The options are: (a) product/owner agrees to split controller-emitted `environment_type` out of TAT-3175, and someone files the Core/Extension follow-up (draft in `follow-up-ticket.md`) so it can be linked in the PR; or (b) implement per-request attribution, which first needs `@metamask/perps-controller` to accept and emit `environmentType` in `TrackingData` and in the withdraw/deposit params. The worker can't give product sign-off or create tracker issues (local-only task), and (b) is a Core change outside this repo.

## Scope split accepted (2026-09-24)
- The ticket owner approved splitting controller-emitted `environment_type` out of TAT-3175. It's filed as [TAT-4006](https://consensyssoftware.atlassian.net/browse/TAT-4006) (epic TAT-3083, "Relates" to TAT-3175). Record: `split-acceptance.md`.
- The "all perps events" criterion is **not** done: UI-emitted events have `environment_type`, but controller-emitted events stay open until TAT-4006 (and its Core change) lands. The PR description uses `Refs:` plus a `Follow-up: TAT-4006` line.
- Focused validation on HEAD `d238873a38`: 5 perps suites pass (184 tests), `check diff --profile fast` passes, the PR template check passes, and the artifact contract passes.
- A fresh Codex `gpt-6-sol` review of `85fc51e2f7..d238873a38` is prepared but **not run yet**: `review/run-codex-gpt-6-sol.sh` (read-only sandbox, refuses to run if HEAD moved) with `review/codex-gpt-6-sol-prompt.md`. The verdict will be written to `review/codex-gpt-6-sol-verdict.md`. Nothing is approved until it runs.
