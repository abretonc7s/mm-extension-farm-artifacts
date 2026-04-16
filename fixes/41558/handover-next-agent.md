# Handover — Perps Decimal Parity / Connection Follow-up

This document is local-only and intended to let another agent resume the work without reconstructing state from the full session.

## Scope split

There are two separate concerns:

1. Decimal / percent / display parity between extension and mobile
2. Connection / hydration / long-flow instability in extension and mobile runners

Do not mix them.

The decimal-parity work is largely in good shape for the main verified surfaces.
The connection / hydration problem is still separate and reproducible.

## Current code branch

- Repo: `/Users/deeeed/dev/metamask/metamask-extension-3`
- Branch: `fix/tat-2699-fix-perps-decimal-logic`
- Current HEAD during this handoff: `4260b6fbd8`

## High-level status

### Decimal parity

Strong evidence exists that the extension now matches mobile much more closely on the most important validated paths:

- BTC market detail
- BTC order entry
- ETH market detail
- ETH order entry
- ETH position detail
- ETH reverse modal
- ETH remove margin
- ETH close
- withdraw

### Separate connection / hydration issue

The extension still has a route-transition / hydration problem in long flows.

Fresh evidence from this session:

- A delayed extension whole-flow recipe with `1s` waits between screens still failed
- Failure point remained:
  - `btc-market -> btc-order -> eth-market`
  - specifically `eth-market -> wait-price`
- The market page shell mounted, but price/oracle readiness never settled

That means:

- this is not just “moving too fast”
- this is not the same as decimal-parity logic
- this looks like a stream / route-transition / hydration issue on extension

## Main local artifacts

- Review packet:
  - `/Users/deeeed/dev/metamask/metamask-extension-3/temp/.task/fix/41558-0415-1045/artifacts/review-packet-latest.md`
- Share summary:
  - `/Users/deeeed/dev/metamask/metamask-extension-3/temp/.task/fix/41558-0415-1045/artifacts/share-ready-summary.md`
- Matrix:
  - `/Users/deeeed/dev/metamask/metamask-extension-3/temp/.task/fix/41558-0415-1045/artifacts/decimal-parity-matrix-expanded.md`
- Drift report:
  - `/Users/deeeed/dev/metamask/metamask-extension-3/temp/.task/fix/41558-0415-1045/artifacts/drift-sources-report.md`
- Verification evidence:
  - `/Users/deeeed/dev/metamask/metamask-extension-3/temp/.task/fix/41558-0415-1045/artifacts/verification-evidence-latest.md`
- Separate connection follow-up prompt:
  - `/Users/deeeed/dev/metamask/metamask-extension-3/temp/.task/fix/41558-0415-1045/artifacts/connection-issue-followup-prompt.md`

## Recipe inventory

### Extension recipes

- Original screenshot recipe:
  - `temp/agentic/recipes/teams/perps/recipes/pr-41558-decimal-formatting.json`
- Full composed parity recipe:
  - `temp/agentic/recipes/teams/perps/recipes/pr-41558-decimal-parity-expanded.json`
- Matrix recipe:
  - `temp/agentic/recipes/teams/perps/recipes/pr-41558-decimal-matrix.json`
- Temporary delayed reproduction variant created in this session:
  - `temp/agentic/recipes/teams/perps/recipes/pr-41558-decimal-parity-expanded-delayed.json`

### Extension flows

- `temp/agentic/recipes/teams/perps/flows/parity-market-detail-snapshot.json`
- `temp/agentic/recipes/teams/perps/flows/parity-order-entry-snapshot.json`
- `temp/agentic/recipes/teams/perps/flows/parity-eth-position-detail.json`
- `temp/agentic/recipes/teams/perps/flows/parity-eth-reverse-modal.json`
- `temp/agentic/recipes/teams/perps/flows/parity-eth-remove-margin.json`
- `temp/agentic/recipes/teams/perps/flows/parity-eth-close-position.json`
- `temp/agentic/recipes/teams/perps/flows/parity-withdraw-snapshot.json`

### Mobile recipes

Repo:
- `/Users/deeeed/dev/metamask/metamask-mobile-1`

Recipes:
- `scripts/perps/agentic/teams/perps/recipes/mobile-decimal-parity.json`
- `scripts/perps/agentic/teams/perps/recipes/mobile-decimal-parity-expanded.json`
- `scripts/perps/agentic/teams/perps/recipes/mobile-decimal-matrix.json`
- `scripts/perps/agentic/teams/perps/recipes/mobile-decimal-detailed-eth.json`

Flows:
- `scripts/perps/agentic/teams/perps/flows/parity-market-detail-snapshot.json`
- `scripts/perps/agentic/teams/perps/flows/parity-order-entry-snapshot.json`
- `scripts/perps/agentic/teams/perps/flows/parity-eth-position-detail.json`
- `scripts/perps/agentic/teams/perps/flows/parity-eth-reverse-modal.json`
- `scripts/perps/agentic/teams/perps/flows/parity-eth-remove-margin.json`
- `scripts/perps/agentic/teams/perps/flows/parity-eth-close-position.json`
- `scripts/perps/agentic/teams/perps/flows/parity-withdraw-snapshot.json`

## Latest verified recipe status

Confirmed during the session:

- Extension full composed parity:
  - `79/79 passed`
- Extension screenshot validation:
  - `42/42 passed`
- Mobile full composed parity:
  - `20/20 passed` in the latest direct rerun

The mobile whole-flow recipe is currently healthy:

- `mobile-decimal-parity-expanded.json`

It covered:

- BTC market
- BTC order
- ETH market
- ETH order
- SOL market
- FARTCOIN market
- PUMP market
- ETH open position if needed
- ETH position detail
- ETH reverse
- ETH remove margin
- ETH close
- withdraw

## Critical fresh reproduction evidence

### Extension long-flow hydration issue

Delayed whole-flow run:

- Recipe:
  - `temp/agentic/recipes/teams/perps/recipes/pr-41558-decimal-parity-expanded-delayed.json`
- Artifact dir:
  - `/Users/deeeed/dev/metamask/metamask-extension-3/temp/.task/fix/41558-0415-1045/artifacts/extension-parity-expanded-delayed-1s`

Result:

- `4 passed / 1 failed`
- failure at:
  - `eth-market -> wait-price`

Observed behavior:

- `btc-market` passed
- `btc-order` passed
- navigated to `ETH` market page
- page shell mounted
- `wait-price` timed out after ~15s

The readiness gate in `parity-market-detail-snapshot.json` requires:

- non-empty `perps-market-detail-price`
- non-`—` `perps-market-detail-oracle-price`

Interpretation:

- adding `1s` waits between transitions does not fix the issue
- this still looks like route-transition hydration / stream state, not pure speed

### Single-screen retry after bad state

After the delayed whole-flow failure, isolated single-screen market-detail reruns for `ETH` and `SOL` also timed out on the same `wait-price` gate on the same slot.

Interpretation:

- once the slot gets into the bad state, even direct follow-up market-detail checks can remain broken until refresh/recovery

### Human reproduction path

Plain English repro for the extension issue:

1. Start on unlocked extension in perps testnet
2. Open BTC market detail
3. Open BTC order entry and enter `$11`
4. Navigate to ETH market detail
5. ETH market page shell loads
6. Price/oracle readiness does not settle

Do not classify that as decimal-parity failure.
Classify it as connection / hydration / transition-state failure.

## NaN order issue

This is separate from the hydration issue.

### Fresh evidence

User provided console evidence showing:

- `[PerpsParityDebug] liquidation:start ...`
- then immediately:
  - `Error in event handler: Error: "message" must be a non-empty string.`

This strongly suggests:

1. `usePerpsLiquidationPrice` triggers `perpsCalculateLiquidationPrice`
2. background/controller throws an error whose `message` is empty/undefined
3. `metaRPCClientFactory.ts` reconstructs it using `new JsonRpcError(code, message, data)`
4. that constructor itself throws because message is empty

### Relevant files

- `ui/hooks/perps/usePerpsLiquidationPrice.ts`
- `ui/hooks/perps/usePerpsOrderForm.ts`
- `ui/pages/perps/perps-order-entry-page.tsx`
- `app/scripts/lib/metaRPCClientFactory.ts`
- `app/scripts/messenger-client-init/perps-controller-init.ts`

### Likely code-level weakness found

`formStateToOrderParams` does not sanitize all numeric strings before submit.

File:
- `ui/pages/perps/perps-order-entry-page.tsx`

Risk:

- raw string values like `usdAmount: 'NaN'` can potentially escape into `perpsPlaceOrder`
- submit-disable logic does not strongly enforce finite positive parsed amount for all new/modify submits

### Suggested fixes for the NaN issue

1. In `perps-order-entry-page.tsx`, block submit unless parsed amount is finite and `> 0`
2. In `formStateToOrderParams`, sanitize every numeric input before building `OrderParams`
3. In `metaRPCClientFactory.ts`, default empty error message to a safe string before constructing `JsonRpcError`
4. Add better controller-side logging around `perpsCalculateLiquidationPrice` and/or `perpsPlaceOrder`

## Perps logging status

The controller already receives:

- `logger`
- `debugLogger`

via:
- `app/scripts/controllers/perps/infrastructure.ts`

Current issue:

- `debugLogger` uses `createProjectLogger('perps')`
- in the browser this is controlled by the `debug` library namespace, not a dedicated repo env setting
- there is no existing `.metamaskrc` key already wired to turn on `metamask:perps*`

Current reliable manual enablement:

```js
localStorage.debug = 'metamask:perps*'
location.reload()
```

If you want richer local console visibility, patch `infrastructure.ts`:

- make `debugLogger.log(...)` also call `console.debug(...)`
- make `logger.error(...)` also call `console.error(...)` with structured tags/context before Sentry capture

## Current push / PR state

- Branch conflicts were resolved
- Latest pushed branch head at time of handoff: `4260b6fbd8`
- GitHub reported for PR `#41558`:
  - `mergeable: true`
  - `mergeable_state: blocked`

That means:

- merge conflicts are resolved
- any remaining PR block is checks / review state, not code conflicts

## Recommended next actions

Choose one lane and stay focused.

### Lane A — separate connection / hydration follow-up

1. Use the separate prompt:
   - `temp/.task/fix/41558-0415-1045/artifacts/connection-issue-followup-prompt.md`
2. Reproduce with:
   - full delayed extension recipe
   - then single-screen ETH market detail
3. Inspect:
   - price stream activation/deactivation
   - route transition state
   - stream manager cached emission / replay
4. Keep parity logic untouched

### Lane B — separate NaN order follow-up

1. Reproduce bad order state
2. Instrument:
   - `usePerpsLiquidationPrice`
   - `formStateToOrderParams`
   - `metaRPCClientFactory.ts`
3. Fix:
   - submit guard
   - param sanitization
   - safe RPC error reconstruction

### Lane C — if only review/communication is needed

Use these files:

- review packet:
  - `temp/.task/fix/41558-0415-1045/artifacts/review-packet-latest.md`
- share summary:
  - `temp/.task/fix/41558-0415-1045/artifacts/share-ready-summary.md`
- local PR body helper:
  - `PR_DESC.md` at repo root is local-only and intentionally untracked

