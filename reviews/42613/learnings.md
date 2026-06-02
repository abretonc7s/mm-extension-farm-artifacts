# Learnings — Review of PR #42613 (close-all-positions confirmation modal) — follow-up run

- **Runner action vocabulary drifted from the inherited recipe.** The inherited `recipe.json` used `ext_check_dom` / `eval_sync` / `metamask.wallet.navigate` / `wait_for`, but the current manifest rejects all of these. Live actions are `ui.navigate` / `ui.press` / `ui.set_input` / `ui.scroll` / `ui.wait_for` / `ui.screenshot` / `cdp.target` plus custom `metamask.wallet.*` and `metamask.perps.*`. There is **no DOM-eval action** exposed now — assert via `metamask.perps.read_positions` / `ui.wait_for` on test_ids, not `eval_sync`. Always re-query `manifest --json` before reusing an inherited recipe.

- **Every recipe needs both `title` AND `description`** at top level for the current runner, or it fails pre-flight with `recipe.missing_title` / `recipe.missing_description`. `schema_version: 1` recommended.

- **`metamask.perps.read_positions` can report `count:1` but `positions:[]` / `matchingCount:0` while the UI clearly renders the position.** The adapter's matching filter / hydration lag disagrees with the stream-driven UI (`usePerpsLivePositions`). Treat the DOM screenshot as authoritative for "is the position visible", not the adapter count.

- **Smoke strategy ≠ no visual proof when state is free.** RECIPE_STRATEGY=smoke says "skip visual capture, run backend regression", but if the slot already has a live position you can opportunistically prove AC1/AC2/AC4 **non-destructively** by opening the modal and pressing *cancel* (`perps-close-all-positions-modal-cancel`) — never the submit. This gave fresh current-branch live proof on top of the mandated smoke run.

- **The `perps-lifecycle.recipe.json` smoke is testnet-safe.** It uses `profile: clean_market_testnet`, opens/closes a ~$11 **testnet** ETH position, and tears down. Safe to run on a slot showing `isTestnet:false` because `metamask.perps.start_state` switches the network. 19 nodes, ~60s.

- **Live fee reconciliation is observable and worth checking visually.** The AC2 modal showed Margin $5.20 − Fees $0.02 = Receive $5.18 — exact. This confirms the `youWillReceive = roundedMargin − roundedFees` fix (cc776be5) reconciles the displayed rows, which a DOM/unit assert alone wouldn't visibly prove.

- **Perps close-all selectors (still current):** button `perps-close-all-positions`; modal `perps-close-all-positions-modal`; submit `perps-close-all-positions-modal-submit`; cancel `perps-close-all-positions-modal-cancel`; values `perps-close-all-total-margin-value` / `perps-close-all-fees-value` / `perps-close-all-receive-value`. Fees show `--` until loaded.

- **Mobile parity check for close-all:** extension mirrors mobile `usePerpsCloseAllCalculations.ts` (margin=ΣmarginUsed PnL-inclusive, receive=margin−fees, per-symbol fees, MetaMask-only discount). Documented intentional divergences: extension omits rewards/points display, uses `PERPS_FALLBACK_FEE_RATES` on RPC failure (mobile→undefined), and uses `pos.positionValue` for fee notional vs mobile `size×livePrice`. Don't flag these as bugs.

- **Baseline-noise guards that prevented bad comments:** `yarn lint:tsc` succeeds with exit 0 and **empty stdout** — don't read empty output as a crash. The global `@metamask/perps-controller` jest `moduleNameMapper` stub (jest.config.js) is intentional (fixes ESM transitive imports). console-baseline-unit.json entries for the two new test files are expected.

- **Test-gap pattern for batch handlers:** resolved-failure (`{success:false, failureCount}`) and rejected-promise (`mockRejectedValue`) are *different* branches in `handleCloseAllConfirm`. The PR added resolved-failure coverage (partial + all-fail) but the outer `catch` (rejection) remains untested — a common sibling gap worth a one-line suggestion.
