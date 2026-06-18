## **Description**

Adds a remote-flag-gated A/B test that shows a "New" badge on the Perps tab label in the wallet overview (treatment variant). The badge dismisses on first Perps-tab click and the dismissal persists across reloads via `AppStateController`. The existing `Perp Screen Viewed` event is reused for the Perps tab open and enriched with `active_ab_tests`.

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

### **Before**

_Evidence will be added after upload._

### **After**

_Evidence will be added after upload._

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
