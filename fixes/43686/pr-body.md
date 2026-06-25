## **Description**

Adds a remote-flag-gated A/B test that shows a "New" badge on the Perps tab label in the wallet overview (treatment variant). The badge dismisses the first time Perps becomes the active tab (click, `?tab=perps` direct navigation, or persisted/clamped default) and the dismissal persists across reloads via `AppStateController`. The existing `Perp Screen Viewed` event is reused for the Perps tab open and enriched with `active_ab_tests`.

## **Changelog**

CHANGELOG entry: null

## **Related issues**

Fixes: [TAT-3382](https://consensyssoftware.atlassian.net/browse/TAT-3382)

## **Manual testing steps**

1. With the `perpsTAT3382AbtestTabBadge` flag set to `treatment` and the perps experience enabled, open the wallet overview — the Perps tab shows a "New" badge.
2. Click the Perps tab — the badge disappears immediately.
3. Reload the extension — the badge stays dismissed.
4. With the flag in `control` (or unset), the Perps tab shows no badge.

## **Screenshots/Recordings**

A/B comparison of the Perps tab in the wallet overview: control shows no badge; treatment shows a "New" badge. Dismissal, persistence, exposure and active_ab_tests enrichment are covered by unit tests.

<table>
<tr><td align="center" width="50%"><strong>Control — Perps tab with no New badge</strong><br/><img src="https://raw.githubusercontent.com/abretonc7s/mm-extension-farm-artifacts/main/fixes/43686/recipe-runs/inherited-e7d88cea-5a9c-49d1-9373-ef79496f16fc/after-ac1-control-no-badge.png?sha=05c6553123555779" alt="Control — Perps tab with no New badge" width="400" /></td><td align="center" width="50%"><strong>Treatment — Perps tab with the "New" badge</strong><br/><img src="https://raw.githubusercontent.com/abretonc7s/mm-extension-farm-artifacts/main/fixes/43686/recipe-runs/inherited-e7d88cea-5a9c-49d1-9373-ef79496f16fc/after-treatment-badge.png?sha=0956a736a4a4a2ea" alt="Treatment — Perps tab with the "New" badge" width="400" /></td></tr>
</table>

**Video**
Control user-flow run (unlock → wallet overview). Screenshots are the primary proof.
- After: [artifacts/recipe-runs/inherited-e7d88cea-5a9c-49d1-9373-ef79496f16fc/after.mp4](https://raw.githubusercontent.com/abretonc7s/mm-extension-farm-artifacts/main/fixes/43686/recipe-runs/inherited-e7d88cea-5a9c-49d1-9373-ef79496f16fc/after.mp4?sha=fd75e103c2cbfa73)

## **Pre-merge author checklist**

- [x] I've followed [MetaMask Contributor Docs](https://github.com/MetaMask/contributor-docs) and [MetaMask Extension Coding Standards](https://github.com/MetaMask/metamask-extension/blob/main/.github/guidelines/CODING_GUIDELINES.md).
- [x] I've completed the PR template to the best of my ability
- [x] I’ve included tests if applicable
- [x] I’ve documented my code using [JSDoc](https://jsdoc.app/) format if applicable
- [x] I’ve applied the right labels on the PR (see [labeling guidelines](https://github.com/MetaMask/metamask-extension/blob/main/.github/guidelines/LABELING_GUIDELINES.md)). Not required for external contributors.

## **Pre-merge reviewer checklist**

- [ ] I've manually tested the PR (e.g. pull and build branch, run the app, test code being changed).
- [ ] I confirm that this PR addresses all acceptance criteria described in the ticket it closes and includes the necessary testing evidence such as recordings and or screenshots.

## **Validation Recipe**

<details>
<summary>recipe.json (control user-flow proof; AC2–AC6 covered by unit tests)</summary>

```json
{
  "schema_version": 1,
  "title": "TAT-3382 — Perps tab \"New\" badge (control user flow)",
  "description": "Real user-flow proof against the stable fixture-backed wallet, no flag patching or extension reload. In the default (control) assignment the Perps tab renders in the wallet overview and shows NO \"New\" badge (data-testid=perps-tab-new-badge absent). The treatment variant (badge visible), dismissal-on-click, localStorage-free persistence, Experiment Viewed exposure, and active_ab_tests enrichment are proven authoritatively by unit tests (see report.md), because the A/B variant is a remote feature flag that must be seeded at launch in the fixture's RemoteFeatureFlagController.remoteFeatureFlags — not forced at runtime.",
  "validate": {
    "workflow": {
      "entry": "gate-unlock",
      "nodes": {
        "gate-unlock": {
          "action": "metamask.wallet.ensure_unlocked",
          "intent": "Ensure the wallet is unlocked before proof steps",
          "next": "ac1-nav-home"
        },
        "ac1-nav-home": {
          "action": "ui.navigate",
          "page": "home",
          "intent": "AC1: open the account overview home tab bar",
          "next": "ac1-wait-perps-tab"
        },
        "ac1-wait-perps-tab": {
          "action": "ui.wait_for",
          "test_id": "account-overview__perps-tab",
          "expected": "visible",
          "timeout_ms": 20000,
          "poll_ms": 500,
          "intent": "AC1: the Perps tab is present in the overview tab bar",
          "next": "ac1-assert-badge-absent"
        },
        "ac1-assert-badge-absent": {
          "action": "ui.wait_for",
          "test_id": "perps-tab-new-badge",
          "expected": "absent",
          "timeout_ms": 8000,
          "poll_ms": 500,
          "intent": "AC1: control assignment shows the Perps tab with NO New badge",
          "next": "ac1-screenshot"
        },
        "ac1-screenshot": {
          "action": "ui.screenshot",
          "path": "evidence-ac1-control-no-badge.png",
          "label": "Control — Perps tab with no New badge",
          "note": "AC1: in control the Perps tab label has no 'New' badge",
          "intent": "Capture AC1 orientation proof (Perps tab, no badge)",
          "claims": {
            "must_show": [{ "test_id": "account-overview__perps-tab" }],
            "must_not_show": [{ "test_id": "perps-tab-new-badge" }]
          },
          "next": "done"
        },
        "done": { "action": "end", "status": "pass" }
      }
    }
  }
}
```

</details>

[TAT-3382]: https://consensyssoftware.atlassian.net/browse/TAT-3382?atlOrigin=eyJpIjoiNWRkNTljNzYxNjVmNDY3MDlhMDU5Y2ZhYzA5YTRkZjUiLCJwIjoiZ2l0aHViLWNvbS1KU1cifQ

<!-- CURSOR_SUMMARY -->
---

> [!NOTE]
> **Low Risk**
> UI-only wallet tab labeling with persisted app state and analytics hooks; no auth, payments, or transaction-path changes.
> 
> **Overview**
> Adds an A/B test (`perpsTAT3382AbtestTabBadge`) that can show a **"New"** badge on the wallet overview **Perps** tab label. **Treatment** users see the badge until it is dismissed; **control** does not.
> 
> **Persistence and UI:** New persisted `perpsTabBadgeSeen` state in `AppStateController` (with `setPerpsTabBadgeSeen` wired through background/UI) records dismissal when Perps is the effective active tab—click, `?tab=perps`, or clamped default—not only on tab click. Badge rendering is gated on perps availability, treatment assignment, and not yet seen.
> 
> **Analytics:** Shared `perps-tab-badge` config registers analytics mapping so **`Perp Screen Viewed`** gets `active_ab_tests` enrichment via `registerABTestAnalyticsMapping` in MetaMetrics. `useABTest` gains optional **`trackExposure`** (used so exposure fires only when the Perps tab is shown). Experiment Viewed exposure is symmetric for control/treatment when perps is available.
> 
> Fixtures, state-log snapshots, registry entry, and broad unit tests cover badge visibility, dismissal edge cases, and analytics behavior.
> 
> <sup>Reviewed by [Cursor Bugbot](https://cursor.com/bugbot) for commit 6777fd61c098951fdb2578e567e0f06aaf94d90b. Bugbot is set up for automated code reviews on this repo. Configure [here](https://www.cursor.com/dashboard/bugbot).</sup>
<!-- /CURSOR_SUMMARY -->


