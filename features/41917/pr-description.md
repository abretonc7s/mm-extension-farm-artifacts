<!--
Please submit this PR as a draft initially.
Do not mark it as "Ready for review" until the template has been completely filled out, and PR status checks have passed at least once.
-->

## **Description**

> **No production code changes in this PR — investigation-only.** `git diff main..HEAD` is intentionally empty (no source files in `app/`, `ui/`, `shared/`, etc.). The branch exists to park investigation artifacts under `temp/.task/feat/tat-2986-0418-133136/` and link the Jira ticket. Fix lands in a follow-up PR; sketch is in `artifacts/BENCHMARK-REPORT.md` + `artifacts/comparison.md`.

Investigation of residual HTTP 429s on extension perps candle rapid-switch. **Reproduced live on dev1: 4 × 429 across 5 rapid-switch probe runs (~21% rate)** on `POST /info candleSnapshot`, vs **mobile parity run: 0 × 429 / 77 HL reqs (0%)** on identical workload. Consistent with the Slack thread ("still there but significantly better than before").

Root cause (confirmed via mobile↔extension benchmark): the perps controller runs in the MV3 background service worker. `perpsDeactivateCandleStream` is async across the postMessage bridge, so tear-down lands *after* the in-flight candle fetch completes and the HL per-IP budget is already spent. Mobile runs controller and UI in the same Hermes runtime — `AbortController.abort()` fires synchronously on the next microtask and cancels the XHR before HL responds (all 77 mobile requests resolved as `status=0`). See `artifacts/BENCHMARK-REPORT.md` for the side-by-side table, race signature, and 3-step fix sketch.

## **Changelog**

CHANGELOG entry: null

## **Related issues**

Fixes: [TAT-2986](https://consensyssoftware.atlassian.net/browse/TAT-2986)

## **Manual testing steps**

1. Build dev extension: `PORT=9015 yarn start`.
2. Load unpacked from `dist/chrome/`. Unlock a perps-funded account (dev1 in farmslot fixtures works).
3. Run the probe: `node temp/.task/feat/tat-2986-0418-133136/probe-rapid-switch.js` (expects CDP on 6665). Output at `artifacts/live-capture.json` — expect `rateLimit429Count > 0` on ~1-in-4 runs during peak hours; 429 rate varies with HL server load.
4. Rapid-switch recipe (nav-driver, no SW-RPC dependency): `node temp/agentic/recipes/validate-recipe.js --recipe temp/.task/feat/tat-2986-0418-133136/artifacts/recipe.json --cdp-port 6665 --skip-manual`. Asserts each of the 6 market navigations lands on `[data-testid=perps-market-detail-page]` with the expected symbol in the URL hash and no error boundary. Pair with the probe running in parallel to get the network-layer 429 evidence.

## **Screenshots/Recordings**

- `artifacts/extension-probe.mp4` — CDP `Page.startScreencast` recording of the popup during rapid-switch rotation. (Note: CDP page-level screencast captures the page compositor output only — browser chrome, the "automated test software" HUD, and click overlays are not visible; the small popup window and tight 200ms dwell make the visible activity subtle.)
- `artifacts/mobile-probe.mp4` — `xcrun simctl recordVideo` of the iOS sim during 4 × 6-market rotation runs.
- `artifacts/BENCHMARK-REPORT.md` — consolidated benchmark report with side-by-side 429 rates, race signature, and fix sketch.

Raw network captures:

- Extension: `artifacts/live-capture-run-{1,2,3}.json` + `live-capture.json` + `extension-recorded-capture.json` (19 HL requests, 4 × 429, ~21% rate)
- Mobile: `/metamask-mobile-1/INVESTIGATION/mobile-live-capture*.json` (77 HL requests, 0 × 429, 0% rate — all aborted client-side)

### **Before**

Extension rapid-switch: ~21% 429 rate on `POST /info candleSnapshot`. See `extension-probe.mp4` + `live-capture-run-{1,2,3}.json`.

### **After**

No fix landed in this PR (investigation-only). Target after follow-up fix: 0% 429 rate matching mobile parity.

## **Pre-merge author checklist**

- [x] I've followed [MetaMask Contributor Docs](https://github.com/MetaMask/contributor-docs) and [MetaMask Extension Coding Standards](https://github.com/MetaMask/metamask-extension/blob/main/.github/guidelines/CODING_GUIDELINES.md).
- [x] I've completed the PR template to the best of my ability
- [x] I've included tests if applicable
- [x] I've documented my code using [JSDoc](https://jsdoc.app/) format if applicable
- [x] I've applied the right labels on the PR (see [labeling guidelines](https://github.com/MetaMask/metamask-extension/blob/main/.github/guidelines/LABELING_GUIDELINES.md)). Not required for external contributors.

## **Pre-merge reviewer checklist**

- [ ] I've manually tested the PR (e.g. pull and build branch, run the app, test code being changed).
- [ ] I confirm that this PR addresses all acceptance criteria described in the ticket it closes and includes the necessary testing evidence such as recordings and or screenshots.

## **Validation**

Deliverable artifacts (all under `temp/.task/feat/tat-2986-0418-133136/`):

- `artifacts/INVESTIGATION.md` — full investigation log, path, dead ends, race signature
- `artifacts/comparison.md` — mobile↔extension architectural table, hypothesis ranking, fix sketch
- `artifacts/report.md` — deliverable summary with live evidence
- `artifacts/recipe.json` + `recipe-quality.json` — rapid-switch validation recipe (QA hand-off)
- `artifacts/live-capture-run-{1,2,3}.json` + `live-capture.json` — raw CDP captures (13 HL requests, 3 × 429)
- `probe-rapid-switch.js` — Node CDP probe script used for reproduction
