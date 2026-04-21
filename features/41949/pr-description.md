## **Description**

Delivers the keyboard-first order entry UX across every perps order surface:

- Auto-focus on the primary input when each screen mounts (size on Trade, limit price on Limit, margin on Add-margin, TP trigger on TP/SL, Close button on Position close).
- Auto-select the existing value on focus so typing replaces it immediately. Applies to the size input, the leverage input, and every modal input.
- Contextual `min $10` placeholder on the size input; disabled submit + `Minimum order size $10` button copy until the amount clears the minimum.
- Inline validation is real-time — no deferred "min order" errors on submit.
- Internal refocus when the user toggles between market and limit order types.
- Pressing Enter from any primary input submits the form when the submit button is enabled. The Trade/Limit page renders as a native `<form>` with an `onSubmit` handler and a `type="submit"` button, so the browser's built-in Enter-to-submit behavior drives it (disabled buttons naturally block submission). Add margin and TP/SL modals wire an Enter keydown directly on their numeric inputs; both paths guard against Shift+Enter and IME composition.
- Leverage input: ArrowUp/ArrowDown now step leverage by 1 (clamped to `minLeverage..maxLeverage`), matching how native numeric inputs behave.

## **Changelog**

CHANGELOG entry: Improved perps order entry with auto-focus, auto-select-on-focus, contextual placeholders, real-time minimum-order-size validation, and Enter-to-submit keyboard shortcut.

## **Related issues**

Fixes: [TAT-2802](https://consensyssoftware.atlassian.net/browse/TAT-2802)

## **Manual testing steps**

1. Open the extension and navigate to the Perps tab.
2. Tap any market (e.g. ETH) → press **Long**. Confirm the `$` size input is already focused and the submit button reads `Minimum order size $10` and is disabled.
3. Type `5` — submit stays disabled and still reads `Minimum order size $10`.
4. Type `15` — submit enables and reads `Open Long ETH`.
5. Blur and re-focus the size input — existing value should be fully selected.
6. Switch the order type to **Limit** — the limit price input takes focus automatically.
7. Open an existing position, tap **Edit margin** → margin input is focused. Open **TP/SL** → TP trigger input is focused. Open **Close position** → Close button is focused.
8. From any primary input (size, limit price, margin, TP/SL), press **Enter** with a valid value — the submit button fires. Press Enter while disabled (empty / below-min / invalid) — nothing happens. Shift+Enter and IME-composition Enter are ignored.
9. Click into the **leverage** input — its current value should be fully selected so typing replaces it. Press **ArrowUp** to step leverage by +1 (clamped at `maxLeverage`); press **ArrowDown** to step by −1 (clamped at `minLeverage`).

## **Screenshots/Recordings**

<table>
  <thead>
    <tr>
      <th width="50%">Before</th>
      <th width="50%">After — empty size (disabled, min-order copy + placeholder)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><img src="https://raw.githubusercontent.com/abretonc7s/mm-extension-farm-artifacts/main/features/41949/baseline-trade-empty.png" alt="Baseline: Trade screen with empty size, generic 'Open Long' copy, no auto-focus" /></td>
      <td><img src="https://raw.githubusercontent.com/abretonc7s/mm-extension-farm-artifacts/main/features/41949/evidence-min-order-empty.png" alt="After: Size input auto-focused, 'min $10' placeholder, disabled 'Minimum order size $10' submit button" /></td>
    </tr>
    <tr>
      <td colspan="2"><em>Left: main branch — no auto-focus, generic submit copy. Right: feature branch — auto-focused size input, contextual <code>min $10</code> placeholder, and <code>Minimum order size $10</code> submit copy while below the minimum.</em></td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
      <th width="50%">After — valid amount (submit enabled)</th>
      <th width="50%">After — Limit order type (auto-focus moves to limit price)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><img src="https://raw.githubusercontent.com/abretonc7s/mm-extension-farm-artifacts/main/features/41949/evidence-valid-amount.png" alt="After: Entering 15 enables the 'Open Long ETH' submit button" /></td>
      <td><img src="https://raw.githubusercontent.com/abretonc7s/mm-extension-farm-artifacts/main/features/41949/evidence-limit-autofocus.png" alt="After: Switching to Limit order type moves focus to the limit price input" /></td>
    </tr>
    <tr>
      <td><em>Typing a valid amount (<code>15</code>) enables submission and swaps the button copy to <code>Open Long ETH</code> — real-time validation, no deferred error on click.</em></td>
      <td><em>Toggling to <strong>Limit</strong> auto-focuses the limit price input so the user can keep typing without reaching for the mouse.</em></td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
      <th>After — Enter-to-submit (valid amount) redirects to market detail with live position</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><img src="https://raw.githubusercontent.com/abretonc7s/mm-extension-farm-artifacts/main/features/41949/evidence-enter-submit-redirect.png" alt="After: Pressing Enter from the focused size input with a valid 15 amount submits the order and redirects to the ETH market detail page with the new Long position visible" /></td>
    </tr>
    <tr>
      <td><em>With the submit button enabled (<code>$15</code>), pressing <strong>Enter</strong> from the focused size input fires the native form submit, places the order, and the UI lands on the ETH market detail page with the new Long position card visible (<code>perps-position-cta-buttons</code> present). This is the AC7 live-recipe proof.</em></td>
    </tr>
  </tbody>
</table>

> Enter-to-submit is proven live by the AC7 subflow `bundle/ac7-enter-submit-success`, which mirrors the canonical `perps/open-long-position` idempotent pattern end-to-end: `pre_conditions` (wallet.unlocked + perps.feature_enabled + perps.ready_to_trade + perps.sufficient_balance) → balance gate via `perpsGetAccountState.totalBalance > 0` → `branch-position` switch (if an ETH position already exists from a prior run, branch to DOM verify and pass; otherwise full submit path) → `press-long` → `wait-order-form` → `switch-market` → `type-valid $15` → `focus-input` → `key_press Enter` → `wait-market-detail` → **state-based wait on `perpsGetPositions` until the ETH position appears** → DOM verify + `Long Nx` direction regex + route lock to `#/perps/market/ETH` + screenshot. The state-based wait replaces the prior DOM-only poll that hit 45s timeouts — state wait typically resolves in <3s. Negative coverage lives in `bundle/ac7-enter-blocked-assert`, which asserts the empty-form Enter-blocked case (form stays mounted, route still `mode=new`, submit stays disabled). Unit tests remain in place across the three affected suites.

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

Task-local bundle convention: one thin orchestrator recipe + ten AC-focused **self-runnable** subflows, invoked via explicit `bundle/<name>` refs. Live runs on CDP 6662:

- **Main recipe end-to-end:** 10/10 PASS in 30.8s (all subflows green, guarded teardown closes the ETH position opened by AC7 positive).
- **AC7 positive standalone (full Enter path):** 17/17 PASS in 4.5s — `wait-position-in-state` (state-based wait via `perpsGetPositions`) resolved in 2.3s.
- **AC7 positive standalone (idempotent skip branch, pre-existing position):** 6/6 PASS in 2.6s — `branch-position` short-circuits to `verify-position-dom`.

- Main recipe: `temp/.task/feat/tat-2802-0420-210839/artifacts/recipe.json` — pure orchestrator, 11 nodes (10 `call` nodes to `bundle/<name>` subflows + `done` + one-step teardown calling `perps/close-position`).
- Subflow bundle: `temp/.task/feat/tat-2802-0420-210839/artifacts/recipe-flows/` — 10 flat subflow files, each **self-runnable and generically parametrized** (`inputs`: symbol/side/sideLabel/amount with sensible defaults). Each delegates the entire form-open prelude to a single `{ call: perps/open-order-form, params: { symbol, side } }` step — no duplicated setup nodes. Reviewers can run any subflow in isolation via `node temp/agentic/recipes/validate-recipe.js --recipe temp/.task/feat/tat-2802-0420-210839/artifacts/recipe-flows/<ac>.json --cdp-port 6662 --skip-manual` or validate any (symbol, side) combination by passing `--input symbol=BTC --input side=short --input sideLabel=Short`.
- New shared canonical flow: `temp/agentic/recipes/domains/perps/flows/open-order-form.json` — extracted so every subflow (and future callers) can open a fresh `{side}` order form on `{symbol}` in one line. Composition: `perps/ensure-perps-network` → `perps/prime-perps-state` → `perps/navigate-to-market-detail` → `perps/close-position` → `wait-{side}-cta` → `press-{side}` → `wait-order-form`.

<details>
<summary>AC-to-subflow map</summary>

| AC | Subflow ref | Inline nodes | Purpose |
| --- | --- | --- | --- |
| **AC1** | `bundle/ac1-size-autofocus` | 2 | Size input auto-focus + focused testid proof |
| **AC1 (limit)** | `bundle/ac1-limit-autofocus` | 5 | Switch to limit, wait mount, autofocus proof + screenshot |
| **AC2** | `bundle/ac2-select-on-focus` | 3 | Blur + refocus + poll `selectionStart==0 && selectionEnd==length` |
| **AC3** | `bundle/ac3-placeholder` | 1 | Assert `min $10` placeholder on size input |
| **AC5** | `bundle/ac5-below-min` | 2 | Type `5`, assert submit stays disabled with min-order copy |
| **AC5/AC6** | `bundle/ac5-valid-amount` | 3 | Type `{{amount}}`, assert `Open {{sideLabel}} {{symbol}}` + enabled + screenshot (parametric — defaults validate `Open Long ETH`). |
| **AC6** | `bundle/ac6-empty-button` | 2 | Empty-state `Minimum order size $10` disabled copy + screenshot |
| **AC7 (−)** | `bundle/ac7-enter-blocked-assert` | self-runnable | Primes perps, opens fresh empty order form, focuses amount input, presses Enter, asserts `formMounted + hashStillNew + buttonStillDisabled`. Canonical standalone covers the empty-form case. |
| **AC7 (+)** | `bundle/ac7-enter-submit-success` | self-runnable | **Resilient idempotent + parametric.** `pre_conditions` + balance gate via `perpsGetAccountState` + `branch-position` (if `{{symbol}}` position already exists → verify and pass; else full submit path). Switch to market, type `{{amount}}`, focus, press Enter, wait market-detail + **state-based wait on `perpsGetPositions`** + position-live + direction regex `/{{sideLabel}}\s+\d+(?:\.\d+)?x/`, assert route locked to `#/perps/market/{{symbol}}`, form unmounted, screenshot. Mirrors canonical `perps/open-long-position`. |
| **Leverage** (added during PR) | `bundle/leverage-keyboard` | self-runnable | Capture initial leverage; focus the leverage input (blur+refocus); poll `selectionStart==0 && selectionEnd==length`; press ArrowUp; assert value increments (or clamps at `maxLeverage`); refocus; press ArrowDown; assert value decrements (or clamps at `minLeverage`). State-agnostic about the initial value. |

Each subflow delegates its entire form-open prelude to the shared canonical flow `perps/open-order-form` — which itself composes `perps/ensure-perps-network` + `perps/prime-perps-state` + `perps/navigate-to-market-detail` + `perps/close-position` + parameterized CTA press. No subflow repeats plumbing. Main recipe teardown simply calls `perps/close-position`, whose own internal branch makes it a no-op when no position is visible. AC7 positive proof is UI-success-state driven AND backend-state driven (no network probe): redirect + state-wait on `perpsGetPositions` + live position + direction regex + route lock.
</details>
