## **Description**

Aligns the Perps "Recent activity" section header on both the Perps tab and the Perp market detail page so the hover background spans the full section row edge-to-edge, with text/icon inset by 16px via the button's own `px-4` (matching the existing Perps tab pattern). Also normalizes vertical padding on the Perps tab header (`pt-4 mb-2` → `py-3`) to match sibling sections.

Before: on the market detail page, the section parent had `paddingLeft={4}`/`paddingRight={4}` and the inner header button forced `paddingLeft: 0` inline — producing a hover stripe that was inset on both sides instead of edge-to-edge.

After: the parent layout moves to a flex column with no horizontal padding at the section level; the header button uses `px-4` directly so the hover stripe goes edge-to-edge while the text/icon stay properly inset.

## **Changelog**

CHANGELOG entry: null

## **Related issues**

Fixes: [TAT-3077](https://consensyssoftware.atlassian.net/browse/TAT-3077)

## **Manual testing steps**

1. Open the extension with `PERPS_ENABLED=true` and unlock the wallet.
2. Navigate to the Perps tab and scroll to the "Recent activity" section header.
3. Hover the header row. **Expected:** hover background fills the section edge-to-edge; text/chevron stay inset 16px from edges; vertical padding is symmetric.
4. Open any Perp market detail (e.g. ETH) and scroll to the "Recent activity" header.
5. Hover the header row. **Expected:** hover background spans the section edge-to-edge (no inset stripe); inner button no longer carries inline `paddingLeft: 0` / `paddingRight: 0`; text/icon inset via `px-4`.

## **Screenshots/Recordings**

_Visual evidence will be embedded by the gateway from `evidence-manifest.json` once artifacts are uploaded._

## **Pre-merge author checklist**

- [ ] I've followed [MetaMask Contributor Docs](https://github.com/MetaMask/contributor-docs) and [MetaMask Extension Coding Standards](https://github.com/MetaMask/metamask-extension/blob/main/.github/guidelines/CODING_GUIDELINES.md).
- [ ] I've completed the PR template to the best of my ability
- [ ] I've included tests if applicable
- [ ] I've documented my code using [JSDoc](https://jsdoc.app/) format if applicable
- [ ] I've applied the right labels on the PR (see [labeling guidelines](https://github.com/MetaMask/metamask-extension/blob/main/.github/guidelines/LABELING_GUIDELINES.md)). Not required for external contributors.

## **Pre-merge reviewer checklist**

- [ ] I've manually tested the PR (e.g. pull and build branch, run the app, test code being changed).
- [ ] I confirm that this PR addresses all acceptance criteria described in the ticket it closes and includes the necessary testing evidence such as recordings and or screenshots.

## **Validation Recipe**

<details>
<summary>Recipe used to validate the fix</summary>

```json
{
  "title": "TAT-3077 — Perps Recent activity hover bg + alignment",
  "description": "Captures Recent activity styling on (1) Perps tab and (2) Perp market detail page. Forces the hover background on the header and screenshots, so the edge-to-edge hover stripe is visible.",
  "schema_version": 1,
  "validate": {
    "workflow": {
      "pre_conditions": ["wallet.unlocked", "perps.feature_enabled"],
      "entry": "setup-open-position",
      "nodes": {
        "setup-open-position": {
          "action": "call",
          "ref": "perps/open-long-position",
          "params": { "symbol": "ETH", "side": "long", "amount": "10" },
          "next": "setup-close-position"
        },
        "setup-close-position": {
          "action": "call",
          "ref": "perps/close-position",
          "params": { "symbol": "ETH", "percent": "100" },
          "next": "setup-nav-perps-tab"
        },
        "setup-nav-perps-tab": {
          "action": "call",
          "ref": "perps/navigate-perps-tab",
          "next": "ac1-wait-recent-activity"
        },
        "ac1-wait-recent-activity": {
          "action": "wait_for",
          "test_id": "perps-recent-activity-see-all",
          "timeout_ms": 10000,
          "next": "ac1-scroll-recent-activity"
        },
        "ac1-scroll-recent-activity": {
          "action": "scroll",
          "test_id": "perps-recent-activity-see-all",
          "next": "ac1-force-hover"
        },
        "ac1-force-hover": {
          "action": "eval_sync",
          "expression": "(function(){var b=document.querySelector('[data-testid=\"perps-recent-activity-see-all\"]');if(!b)return JSON.stringify({ok:false});b.style.backgroundColor='rgba(255,255,255,0.15)';var br=b.getBoundingClientRect();var pr=b.parentElement.getBoundingClientRect();return JSON.stringify({ok:Math.round(br.left)===Math.round(pr.left)&&Math.round(br.right)===Math.round(pr.right),btnLeft:Math.round(br.left),btnRight:Math.round(br.right),parentLeft:Math.round(pr.left),parentRight:Math.round(pr.right)});})()",
          "assert": { "operator": "eq", "field": "ok", "value": true },
          "save_as": "ac1_hover_bounds",
          "next": "ac1-screenshot-perps-tab"
        },
        "ac1-screenshot-perps-tab": {
          "action": "screenshot",
          "filename": "evidence-ac1-perps-tab-hover",
          "note": "AC1: Perps tab Recent activity header hover bg spans full row (edge-to-edge), text/icon inset via px-4",
          "next": "ac1-clear-hover"
        },
        "ac1-clear-hover": {
          "action": "eval_sync",
          "expression": "(function(){var b=document.querySelector('[data-testid=\"perps-recent-activity-see-all\"]');if(b)b.style.backgroundColor='';return JSON.stringify({ok:true});})()",
          "assert": { "operator": "eq", "field": "ok", "value": true },
          "next": "setup-nav-market-detail"
        },
        "setup-nav-market-detail": {
          "action": "call",
          "ref": "perps/navigate-to-market-detail",
          "params": { "symbol": "ETH" },
          "next": "ac2-wait-recent-activity"
        },
        "ac2-wait-recent-activity": {
          "action": "wait_for",
          "test_id": "perps-market-detail-view-all-activity",
          "timeout_ms": 10000,
          "next": "ac2-scroll-recent-activity"
        },
        "ac2-scroll-recent-activity": {
          "action": "scroll",
          "test_id": "perps-market-detail-view-all-activity",
          "next": "ac2-force-hover"
        },
        "ac2-force-hover": {
          "action": "eval_sync",
          "expression": "(function(){var b=document.querySelector('[data-testid=\"perps-market-detail-view-all-activity\"]');if(!b)return JSON.stringify({ok:false});b.style.backgroundColor='rgba(255,255,255,0.15)';var br=b.getBoundingClientRect();var pr=b.parentElement.getBoundingClientRect();var inlinePadL=b.style.paddingLeft;var inlinePadR=b.style.paddingRight;return JSON.stringify({ok:Math.round(br.left)===Math.round(pr.left)&&Math.round(br.right)===Math.round(pr.right)&&!inlinePadL&&!inlinePadR,btnLeft:Math.round(br.left),btnRight:Math.round(br.right),parentLeft:Math.round(pr.left),parentRight:Math.round(pr.right),inlinePadL:inlinePadL||null,inlinePadR:inlinePadR||null});})()",
          "assert": { "operator": "eq", "field": "ok", "value": true },
          "save_as": "ac2_hover_bounds",
          "next": "ac2-screenshot-market-detail"
        },
        "ac2-screenshot-market-detail": {
          "action": "screenshot",
          "filename": "evidence-ac2-market-detail-hover",
          "note": "AC2: Market detail Recent activity header hover bg spans full row edge-to-edge (no parent L/R inset, no inline padding override)",
          "next": "teardown-done"
        },
        "teardown-done": {
          "action": "end",
          "status": "pass"
        }
      }
    }
  }
}
```

</details>

## **Recipe Workflow**

<details>
<summary>Workflow graph (JSON)</summary>

```json
{
  "description": "Captures Recent activity styling on (1) Perps tab and (2) Perp market detail page. Forces the hover background on the header and screenshots, so the edge-to-edge hover stripe is visible.",
  "hooks": {
    "pre_conditions": [
      "wallet.unlocked",
      "perps.feature_enabled"
    ],
    "setup": [],
    "teardown": []
  },
  "inputs": {},
  "playback": {
    "mode": "off",
    "slow_ms": 1000
  },
  "sourcePath": "",
  "title": "TAT-3077 — Perps Recent activity hover bg + alignment",
  "workflow": {
    "entry": "setup-open-position",
    "nodes": {
      "setup-open-position": {
        "action": "call",
        "ref": "perps/open-long-position",
        "params": {
          "symbol": "ETH",
          "side": "long",
          "amount": "10"
        },
        "next": "setup-close-position",
        "id": "setup-open-position"
      },
      "setup-close-position": {
        "action": "call",
        "ref": "perps/close-position",
        "params": {
          "symbol": "ETH",
          "percent": "100"
        },
        "next": "setup-nav-perps-tab",
        "id": "setup-close-position"
      },
      "setup-nav-perps-tab": {
        "action": "call",
        "ref": "perps/navigate-perps-tab",
        "next": "ac1-wait-recent-activity",
        "id": "setup-nav-perps-tab"
      },
      "ac1-wait-recent-activity": {
        "action": "wait_for",
        "test_id": "perps-recent-activity-see-all",
        "timeout_ms": 10000,
        "next": "ac1-scroll-recent-activity",
        "id": "ac1-wait-recent-activity"
      },
      "ac1-scroll-recent-activity": {
        "action": "scroll",
        "test_id": "perps-recent-activity-see-all",
        "next": "ac1-force-hover",
        "id": "ac1-scroll-recent-activity"
      },
      "ac1-force-hover": {
        "action": "eval_sync",
        "expression": "(function(){var b=document.querySelector('[data-testid=\"perps-recent-activity-see-all\"]');if(!b)return JSON.stringify({ok:false});b.style.backgroundColor='rgba(255,255,255,0.15)';var br=b.getBoundingClientRect();var pr=b.parentElement.getBoundingClientRect();return JSON.stringify({ok:Math.round(br.left)===Math.round(pr.left)&&Math.round(br.right)===Math.round(pr.right),btnLeft:Math.round(br.left),btnRight:Math.round(br.right),parentLeft:Math.round(pr.left),parentRight:Math.round(pr.right)});})()",
        "assert": {
          "operator": "eq",
          "field": "ok",
          "value": true
        },
        "save_as": "ac1_hover_bounds",
        "next": "ac1-screenshot-perps-tab",
        "id": "ac1-force-hover"
      },
      "ac1-screenshot-perps-tab": {
        "action": "screenshot",
        "filename": "evidence-ac1-perps-tab-hover",
        "note": "AC1: Perps tab Recent activity header hover bg spans full row (edge-to-edge), text/icon inset via px-4",
        "next": "ac1-clear-hover",
        "id": "ac1-screenshot-perps-tab"
      },
      "ac1-clear-hover": {
        "action": "eval_sync",
        "expression": "(function(){var b=document.querySelector('[data-testid=\"perps-recent-activity-see-all\"]');if(b)b.style.backgroundColor='';return JSON.stringify({ok:true});})()",
        "assert": {
          "operator": "eq",
          "field": "ok",
          "value": true
        },
        "next": "setup-nav-market-detail",
        "id": "ac1-clear-hover"
      },
      "setup-nav-market-detail": {
        "action": "call",
        "ref": "perps/navigate-to-market-detail",
        "params": {
          "symbol": "ETH"
        },
        "next": "ac2-wait-recent-activity",
        "id": "setup-nav-market-detail"
      },
      "ac2-wait-recent-activity": {
        "action": "wait_for",
        "test_id": "perps-market-detail-view-all-activity",
        "timeout_ms": 10000,
        "next": "ac2-scroll-recent-activity",
        "id": "ac2-wait-recent-activity"
      },
      "ac2-scroll-recent-activity": {
        "action": "scroll",
        "test_id": "perps-market-detail-view-all-activity",
        "next": "ac2-force-hover",
        "id": "ac2-scroll-recent-activity"
      },
      "ac2-force-hover": {
        "action": "eval_sync",
        "expression": "(function(){var b=document.querySelector('[data-testid=\"perps-market-detail-view-all-activity\"]');if(!b)return JSON.stringify({ok:false});b.style.backgroundColor='rgba(255,255,255,0.15)';var br=b.getBoundingClientRect();var pr=b.parentElement.getBoundingClientRect();var inlinePadL=b.style.paddingLeft;var inlinePadR=b.style.paddingRight;return JSON.stringify({ok:Math.round(br.left)===Math.round(pr.left)&&Math.round(br.right)===Math.round(pr.right)&&!inlinePadL&&!inlinePadR,btnLeft:Math.round(br.left),btnRight:Math.round(br.right),parentLeft:Math.round(pr.left),parentRight:Math.round(pr.right),inlinePadL:inlinePadL||null,inlinePadR:inlinePadR||null});})()",
        "assert": {
          "operator": "eq",
          "field": "ok",
          "value": true
        },
        "save_as": "ac2_hover_bounds",
        "next": "ac2-screenshot-market-detail",
        "id": "ac2-force-hover"
      },
      "ac2-screenshot-market-detail": {
        "action": "screenshot",
        "filename": "evidence-ac2-market-detail-hover",
        "note": "AC2: Market detail Recent activity header hover bg spans full row edge-to-edge (no parent L/R inset, no inline padding override)",
        "next": "teardown-done",
        "id": "ac2-screenshot-market-detail"
      },
      "teardown-done": {
        "action": "end",
        "status": "pass",
        "id": "teardown-done"
      }
    }
  }
}
```

</details>
