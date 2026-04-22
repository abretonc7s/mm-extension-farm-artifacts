## **Description**

Persists the active Perps route so that briefly closing and reopening the extension returns the user to the same Perps screen instead of the wallet home. The path is written to the `AppStateController` when the Perps layout mounts, cleared when the user navigates out of Perps in-app, and replayed via `setRedirectAfterDefaultPage` on the next home mount if it was saved within the last 5 minutes. Mirrors the short-window resume pattern already used by Swaps, as referenced in the ticket.

Behaviour summary:
- Popup close / extension teardown kills the page before React cleanup fires, so the persisted entry survives.
- Graceful in-app navigation out of `/perps/*` clears the entry, so stale resumes cannot hijack a later home view.
- Home mount enforces `PERPS_REOPEN_TTL_MS` (5 min) and a `/perps` path prefix; an existing `pendingRedirectRoute` takes precedence and the saved entry is always cleared after inspection.
- Works for both popup (`popup.html`) and expanded view (`home.html`).

## **Changelog**

CHANGELOG entry: Reopening the extension within 5 minutes of closing it on a Perps screen now returns the user to that screen instead of the wallet home.

## **Related issues**

Fixes: [TAT-2691](https://consensyssoftware.atlassian.net/browse/TAT-2691)

## **Manual testing steps**

1. Enable Perps and navigate to the Perps tab (e.g. open the BTC market detail).
2. Close the popup/extension.
3. Reopen within 1 minute — you should land back on the same Perps screen with no wallet-home flicker and no full reload of Perps.
4. From the Perps tab, navigate to Wallet home (in-app), then close and reopen — you should land on the wallet home.
5. Visit a Perps screen, wait 6 minutes without reopening, then reopen — you should land on the wallet home (TTL expired).
6. Repeat steps 1–3 in both popup mode and the expanded extension view.

## **Screenshots/Recordings**

_Evidence will be added after upload._

### **Before**

<!-- [screenshots/recordings] -->

### **After**

<!-- [screenshots/recordings] -->

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
<summary>recipe.json</summary>

```json
{
  "title": "TAT-2691 — Persist last-visited Perps route across close/reopen",
  "summary": "Verifies that visiting a perps screen persists state.metamask.lastVisitedPerpsRoute with the path + timestamp, that the background setLastVisitedPerpsRoute(null) action clears it, and that the home redirect consumes the persisted value on reopen.",
  "validate": {
    "workflow": {
      "pre_conditions": ["wallet.unlocked"],
      "entry": "setup-unlock",
      "nodes": {
        "setup-unlock": { "action": "call", "ref": "extension-core/unlock-wallet", "next": "setup-clear-stale" },
        "setup-clear-stale": { "action": "eval_sync", "save_as": "pre_clear", "next": "ac1-navigate-perps" },
        "ac1-navigate-perps": { "action": "call", "ref": "perps/navigate-perps-tab", "next": "ac1-wait-persisted" },
        "ac1-wait-persisted": { "action": "wait_for", "timeout_ms": 5000, "next": "ac1-assert-state" },
        "ac1-assert-state": { "action": "eval_sync", "save_as": "persisted", "next": "ac1-screenshot" },
        "ac1-screenshot": { "action": "screenshot", "filename": "evidence-persisted-after-visit", "next": "ac2-clear-via-background" },
        "ac2-clear-via-background": { "action": "eval_sync", "save_as": "cleared_state", "next": "ac3-simulate-reopen" },
        "ac3-simulate-reopen": { "action": "eval_sync", "save_as": "seeded", "next": "ac3-reload-home" },
        "ac3-reload-home": { "action": "navigate", "target": "Home", "next": "ac3-wait-consumed" },
        "ac3-wait-consumed": { "action": "wait_for", "timeout_ms": 10000, "next": "ac3-assert-consumed" },
        "ac3-assert-consumed": { "action": "eval_sync", "save_as": "consumed", "next": "ac3-screenshot" },
        "ac3-screenshot": { "action": "screenshot", "filename": "evidence-home-consumed-entry", "next": "done" },
        "done": { "action": "end", "status": "pass" }
      }
    }
  }
}
```

See `temp/.task/feat/tat-2691-0421-231135/artifacts/recipe.json` for the full recipe with assertions and expressions.

</details>
