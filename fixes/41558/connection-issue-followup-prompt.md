# Follow-up Prompt: Perps Connection / Hydration Issue

Use this prompt for a **separate** investigation from the decimal-parity PR.

This follow-up is specifically about:
- route-transition hydration noise
- market-detail oracle intermittence
- fee / live-data stalls
- long-flow recipe reliability

It is **not** about deciding whether extension/mobile use the same formatting logic. The parity work already has strong evidence on that front, especially for `BTC` / `ETH`.

## Prompt

Investigate and fix the Perps connection / hydration instability in extension and, where relevant, compare it against mobile.

Important constraints:
- treat this as a **separate concern** from decimal / percent parity
- do not regress the current parity fixes
- focus on transition-state, stream-state, and orchestration reliability
- preserve existing recipe files unless a reproduction/fix clearly requires adjusting them

## What to reproduce

### Extension symptoms

1. In some long composed runs, `market detail -> order entry -> next market detail` transitions can be noisy.
2. Earlier in the session, `ETH` market detail could fail first-load oracle hydration during the composed flow even though a direct/reloaded entry often worked.
3. `calculateFees` can stall on the live page; extension currently uses a bounded fallback so visible fees recover, but the underlying stall still exists.
4. The long composed extension recipe can be more fragile than single-screen flows, even when the visible page is already usable.

### Mobile symptoms

1. Metro / Hermes CDP can intermittently drop (`WebSocket closed`, `Cannot reach Metro`, etc.).
2. Overlapping recipe runs on the same device/browser can destabilize the bridge.
3. Some flows require using the current-state-specific path, e.g. `ETH` with an open position must use:
   - `Modify`
   - `Increase exposure`
   - type amount

## Reproduction surfaces

### Extension repo

Repo:
- `/Users/deeeed/dev/metamask/metamask-extension-3`

Browser / CDP:
- slot: `macwork-mme-3`
- CDP: `6663`

Primary extension recipes / flows:
- full composed parity recipe:
  - `temp/agentic/recipes/teams/perps/recipes/pr-41558-decimal-parity-expanded.json`
- original screenshot recipe:
  - `temp/agentic/recipes/teams/perps/recipes/pr-41558-decimal-formatting.json`
- current key flows:
  - `temp/agentic/recipes/teams/perps/flows/parity-market-detail-snapshot.json`
  - `temp/agentic/recipes/teams/perps/flows/parity-order-entry-snapshot.json`
  - `temp/agentic/recipes/teams/perps/flows/parity-eth-position-detail.json`
  - `temp/agentic/recipes/teams/perps/flows/parity-eth-reverse-modal.json`
  - `temp/agentic/recipes/teams/perps/flows/parity-eth-remove-margin.json`
  - `temp/agentic/recipes/teams/perps/flows/parity-eth-close-position.json`
  - `temp/agentic/recipes/teams/perps/flows/parity-withdraw-snapshot.json`

Useful commands:

```bash
cd /Users/deeeed/dev/metamask/metamask-extension-3/temp/agentic/recipes
npx tsx status.ts --cdp-port 6663
node validate-recipe.js --recipe teams/perps/recipes/pr-41558-decimal-parity-expanded.json --cdp-port 6663 --skip-manual
node validate-recipe.js --recipe teams/perps/flows/parity-market-detail-snapshot.json --param symbol=ETH --cdp-port 6663 --skip-manual
node validate-recipe.js --recipe teams/perps/flows/parity-order-entry-snapshot.json --param symbol=ETH --param amount=11 --cdp-port 6663 --skip-manual
```

Browser recovery:

```bash
cd /Users/deeeed/dev/metamask/metamask-extension-3
bash /Users/deeeed/dev/farmslot/scripts/reopen-slot-browser.sh --slot macwork-mme-3
```

### Mobile repo

Repo:
- `/Users/deeeed/dev/metamask/metamask-mobile-1`

Metro / CDP:
- Metro: `8061`
- simulator: `mm-1`

Primary mobile recipes / flows:
- full composed parity recipe:
  - `/Users/deeeed/dev/metamask/metamask-mobile-1/scripts/perps/agentic/teams/perps/recipes/mobile-decimal-parity-expanded.json`
- smaller baseline recipes:
  - `/Users/deeeed/dev/metamask/metamask-mobile-1/scripts/perps/agentic/teams/perps/recipes/mobile-decimal-parity.json`
  - `/Users/deeeed/dev/metamask/metamask-mobile-1/scripts/perps/agentic/teams/perps/recipes/mobile-decimal-matrix.json`
- current key flows:
  - `/Users/deeeed/dev/metamask/metamask-mobile-1/scripts/perps/agentic/teams/perps/flows/parity-market-detail-snapshot.json`
  - `/Users/deeeed/dev/metamask/metamask-mobile-1/scripts/perps/agentic/teams/perps/flows/parity-order-entry-snapshot.json`
  - `/Users/deeeed/dev/metamask/metamask-mobile-1/scripts/perps/agentic/teams/perps/flows/parity-eth-position-detail.json`
  - `/Users/deeeed/dev/metamask/metamask-mobile-1/scripts/perps/agentic/teams/perps/flows/parity-eth-reverse-modal.json`
  - `/Users/deeeed/dev/metamask/metamask-mobile-1/scripts/perps/agentic/teams/perps/flows/parity-eth-remove-margin.json`
  - `/Users/deeeed/dev/metamask/metamask-mobile-1/scripts/perps/agentic/teams/perps/flows/parity-eth-close-position.json`
  - `/Users/deeeed/dev/metamask/metamask-mobile-1/scripts/perps/agentic/teams/perps/flows/parity-withdraw-snapshot.json`

Useful commands:

```bash
cd /Users/deeeed/dev/metamask/metamask-mobile-1
yarn a:ios
node scripts/perps/agentic/cdp-bridge.js status
./scripts/perps/agentic/validate-recipe.sh scripts/perps/agentic/teams/perps/recipes/mobile-decimal-parity-expanded.json --skip-manual
```

If the wrapper is flaky, pin Metro manually:

```bash
cd /Users/deeeed/dev/metamask/metamask-mobile-1
EXPO_NO_TYPESCRIPT_SETUP=1 yarn expo start --port 8061
```

Then relaunch app:

```bash
xcrun simctl terminate mm-1 io.metamask.MetaMask || true
xcrun simctl openurl mm-1 "expo-metamask://expo-development-client/?url=http%3A%2F%2F192.168.50.42%3A8061"
```

## Known current status

### Extension

- composed extension parity recipe has passed recently:
  - `15 / 15`
- original screenshot recipe is still preserved and runnable
- same-window `BTC` / `ETH` market + order are very close to mobile
- remaining connection/hydration issue is mostly about:
  - wrapper / transition reliability
  - non-`BTC` / `ETH` market-detail oracle intermittence
  - stalled fee RPCs

### Mobile

- composed mobile parity recipe has passed recently
- Metro / CDP remains the main flaky piece
- the dominant mobile issue was bridge / Metro instability and state-path variance, not the same market-detail oracle hydration pattern seen on extension
- do **not** overlap runs on the same device

## Working assumptions for reproduction

1. Use a fresh browser/app state before each major screen when needed.
2. If a value appears after refresh/direct entry but not after long internal navigation, classify that as a hydration / connection issue, not a decimal-parity failure.
3. Prefer sequential single-screen flows when narrowing root cause.
4. Use the composed recipes only after the single-screen flows are stable.

## Specific hypotheses to test

1. Extension `perpsActivatePriceStream` / `perpsDeactivatePriceStream` sequencing during internal perps route transitions.
2. Whether `perpsViewActive(true/false)` gating in the background bridge drops price events during transitions.
3. Whether non-`BTC` / `ETH` market detail receives `markPrice` in the stream manager at all.
4. Whether `perpsCalculateFees` stalls due to upstream/provider/network conditions vs local bridge issues.
5. Whether adding explicit waits or replay/cached emission at the bridge/channel layer eliminates long-flow instability without changing UI logic.

## Deliverables expected

1. Root-cause summary
2. Clear reproduction steps
3. Exact failing/passing recipes/flows
4. Proposed code fix
5. Verification after fix
6. Statement on whether the issue is:
   - extension-only
   - mobile-only
   - shared upstream/provider/network issue

## Important distinction

If refreshed/direct screen validation shows correct values, do **not** classify that as a decimal-parity failure.
Classify it as a connection / hydration / orchestration issue instead.
