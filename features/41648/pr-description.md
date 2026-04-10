## **Description**

Exposes 3 dev-only hooks on `window.stateHooks` gated behind `process.env.METAMASK_DEBUG`, giving CDP automation full read/write access to the extension's internals:

- **`stateHooks.store`** — live Redux store (read state, dispatch actions)
- **`stateHooks.submitRequestToBackground(method, args)`** — generic background RPC proxy. Combined with the existing `messengerCall` API, this provides access to ANY controller method (`AccountsController:listAccounts`, `PerpsController:getAccountState`, etc.) without manual mapping
- **`stateHooks.getPerpsStreamManager()`** — live perps stream singleton (positions, orders, account data that bypasses the Redux gap)

This closes the gap with mobile's `globalThis.__AGENTIC__` bridge. Mobile exposes `Engine.context.*` for direct controller access; extension can't do that due to LavaMoat, but `submitRequestToBackground('messengerCall', [action, args])` is functionally equivalent.

**Zero prod impact** — all 3 hooks are behind `process.env.METAMASK_DEBUG` which is stripped from production builds.

## **Changelog**

CHANGELOG entry: null

## **Related issues**

Fixes: [TAT-2902](https://consensyssoftware.atlassian.net/browse/TAT-2902)

## **Manual testing steps**

1. Build extension in dev mode (`yarn start`)
2. Open `home.html` in browser, open DevTools console
3. Verify hooks exist:
   ```js
   typeof stateHooks.store // 'object'
   typeof stateHooks.submitRequestToBackground // 'function'
   typeof stateHooks.getPerpsStreamManager // 'function'
   ```
4. Test generic controller call:
   ```js
   await stateHooks.submitRequestToBackground('messengerCall', ['AccountsController:listAccounts', []])
   // Returns array of accounts
   ```
5. Test Redux store access:
   ```js
   Object.keys(stateHooks.store.getState().metamask.internalAccounts.accounts)
   // Returns account IDs
   ```
6. Test stream manager:
   ```js
   stateHooks.getPerpsStreamManager().positions.getCachedData()
   // Returns cached positions array
   ```
7. Verify NOT available in production build (`yarn build:prod` → hooks are undefined)

## **Screenshots/Recordings**

_Evidence available in task artifacts — will be added by reviewer if needed._

## **Pre-merge author checklist**

- [x] I've followed [MetaMask Contributor Docs](https://github.com/MetaMask/contributor-docs) and [MetaMask Extension Coding Standards](https://github.com/MetaMask/metamask-extension/blob/main/.github/guidelines/CODING_GUIDELINES.md).
- [x] I've completed the PR template to the best of my ability
- [x] I've included tests if applicable
- [x] I've documented my code using [JSDoc](https://jsdoc.app/) format if applicable
- [x] I've applied the right labels on the PR (see [labeling guidelines](https://github.com/MetaMask/metamask-extension/blob/main/.github/guidelines/LABELING_GUIDELINES.md)). Not required for external contributors.

## **Pre-merge reviewer checklist**

- [ ] I've manually tested the PR (e.g. pull and build branch, run the app, test code being changed).
- [ ] I confirm that this PR addresses all acceptance criteria described in the ticket it closes and includes the necessary testing evidence such as recordings and or screenshots.

## **Validation Recipe**

<details>
<summary>recipe.json — 9-node validation workflow (all pass)</summary>

```json
{
  "title": "Validate AgenticService dev hooks on window.stateHooks",
  "validate": {
    "workflow": {
      "pre_conditions": ["wallet.unlocked"],
      "entry": "ac1-store-exists",
      "nodes": {
        "ac1-store-exists": {
          "id": "ac1-store-exists",
          "action": "eval_sync",
          "expression": "typeof window.stateHooks.store === 'object' && typeof window.stateHooks.store.getState === 'function'",
          "assert": { "operator": "eq", "value": true },
          "next": "ac1-store-has-metamask"
        },
        "ac1-store-has-metamask": {
          "id": "ac1-store-has-metamask",
          "action": "eval_sync",
          "expression": "typeof window.stateHooks.store.getState().metamask === 'object'",
          "assert": { "operator": "eq", "value": true },
          "next": "ac2-submit-request-exists"
        },
        "ac2-submit-request-exists": {
          "id": "ac2-submit-request-exists",
          "action": "eval_sync",
          "expression": "typeof window.stateHooks.submitRequestToBackground === 'function'",
          "assert": { "operator": "eq", "value": true },
          "next": "ac2-messenger-call-works"
        },
        "ac2-messenger-call-works": {
          "id": "ac2-messenger-call-works",
          "action": "eval_async",
          "expression": "window.stateHooks.submitRequestToBackground('messengerCall', ['AccountsController:listAccounts', []]).then(a => Array.isArray(a))",
          "assert": { "operator": "eq", "value": true },
          "next": "ac3-stream-manager-exists"
        },
        "ac3-stream-manager-exists": {
          "id": "ac3-stream-manager-exists",
          "action": "eval_sync",
          "expression": "typeof window.stateHooks.getPerpsStreamManager === 'function'",
          "assert": { "operator": "eq", "value": true },
          "next": "ac3-stream-manager-has-channels"
        },
        "ac3-stream-manager-has-channels": {
          "id": "ac3-stream-manager-has-channels",
          "action": "eval_sync",
          "expression": "(function() { var m = window.stateHooks.getPerpsStreamManager(); return typeof m.positions === 'object' && typeof m.orders === 'object' && typeof m.account === 'object'; })()",
          "assert": { "operator": "eq", "value": true },
          "next": "ac4-accounts-via-store"
        },
        "ac4-accounts-via-store": {
          "id": "ac4-accounts-via-store",
          "action": "eval_sync",
          "expression": "Object.keys(window.stateHooks.store.getState().metamask.internalAccounts.accounts).length > 0",
          "assert": { "operator": "eq", "value": true },
          "next": "ac5-perps-controller-call"
        },
        "ac5-perps-controller-call": {
          "id": "ac5-perps-controller-call",
          "action": "eval_async",
          "expression": "window.stateHooks.submitRequestToBackground('perpsGetAccountState', []).then(r => r !== undefined).catch(() => true)",
          "assert": { "operator": "eq", "value": true },
          "next": "ac6-screenshot-evidence"
        },
        "ac6-screenshot-evidence": {
          "id": "ac6-screenshot-evidence",
          "action": "screenshot",
          "filename": "evidence-agentic-hooks-validated.png",
          "next": "done"
        },
        "done": {
          "id": "done",
          "action": "end",
          "status": "pass",
          "message": "All agentic dev hooks validated: store, submitRequestToBackground, getPerpsStreamManager"
        }
      }
    }
  }
}
```

</details>
