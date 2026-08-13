# TAT-3632 — Before / after

**One test. One live account state. Two code versions. Opposite outcomes.**

The account really holds **$756.392549** withdrawable. The user asks to withdraw **$378** — a little
under half of it. That withdrawal is valid, and no correct implementation may block it.

| | **Before** — `main` @ `bc55c67781` | **After** — this branch @ `6dee7b7a9f` |
|---|---|---|
| Balance source read | streamed `PerpsStreamManager` cache | fresh `perpsGetAccountState` |
| Streamed cache consulted | **yes** | no |
| Fresh read issued | no | **yes** |
| Balance the hook decided against | **`0`** (cache empty after UI restart) | **`756.392549`** |
| Outcome for a valid $378 withdrawal | 🔴 **BLOCKED** | 🟢 **allowed** |
| Alert shown | `insufficientPayTokenBalance` — *"Insufficient funds"* | none |
| Invariant test | ❌ **fails** | ✅ passes |

The user's funds were never insufficient. The pre-fix confirmation said they were, because the
source it read had been emptied by an MV3 UI/service-worker restart.

## Why this is a real before/after and not a restatement of the diff

- **The account state is captured from the running extension, not invented.**
  `probe-perps-balance-divergence.mjs` reloads the extension UI (the observable equivalent of the
  MV3 restart), stays on a non-Perps screen so nothing re-subscribes the account channel, and reads
  both sources read-only. Captured this run in `live-input.json`:

  ```json
  { "streamedAccountPresent": false, "streamedBalance": "0",
    "freshBalance": "756.392549", "validWithdrawal": "378" }
  ```

- **Both columns run the real hook.** Not a reimplementation of its comparison — the actual
  `usePerpsWithdrawInsufficientBalanceAlert`, rendered through
  `renderHookWithConfirmContextProvider` on a `perpsWithdraw` confirmation.

- **The driver file is byte-identical in both runs.** `perpsWithdrawFreshBalanceAB.driver.ts`
  imports nothing the fix introduced, so the same file runs unchanged against both trees. The
  pre-fix leg swaps in `git show bc55c67781:…usePerpsWithdrawInsufficientBalanceAlert.ts` and
  restores it afterwards; the recipe asserts the tree came back clean.

- **The assertion is the user-facing invariant, not an implementation detail.** The driver asserts
  only `blocked === false`. Nothing about which function is called, so the test cannot be "written
  to the fix" — it fails on the old code because the old code blocks a valid withdrawal.

- **Which source each version touched is recorded, not asserted**, so the same driver stays valid
  on both: `streamedCacheConsulted` / `freshReadCalled` flip between the columns.

## Reproduce

```bash
mm-harness run temp/tasks/fix/45191-0812-105020/artifacts/recipe-ab.json \
  --adapter extension --cdp-port 7667 --heal off \
  --artifacts-dir temp/tasks/fix/45191-0812-105020/artifacts/recipe-ab-run \
  --target /Volumes/FD/dev/metamask/metamask-extension-3 --json
```

Result this run: **24 nodes passed / 0 failed**, 8.5 s.

## Files

| File | What it is |
|---|---|
| `recipe-ab.json` | the end-to-end before/after recipe |
| `ab/perpsWithdrawFreshBalanceAB.driver.ts` | the identical driver both versions run |
| `ab/live-input.json` | account state captured from the running extension |
| `ab/prefix-observed.json` | what the pre-fix hook decided |
| `ab/postfix-observed.json` | what the post-fix hook decided |
| `ab/prefix-jest.json` | `numFailedTests: 1` — the bug, as a failing test |
| `ab/postfix-jest.json` | `numPassedTests: 1` |
| `recipe-ab-run/screenshots/live-perps-balance.png` | the live account, capture-helper (no fallback) |

The screenshot reads **Total balance $761.32**; the withdrawable balance the hook uses is
`756.392549`. They differ because total includes open position value (`Bitcoin 2x long`, $10.19)
and unrealized P&L (−$0.27).

## What this still does not show

The hook is rendered in jsdom, not on the real confirmation screen, so there is no video of the
alert appearing in the product. That screen cannot be opened in this slot:
`createPerpsWithdrawTransaction` begins with `findNetworkClientIdByChainId(CHAIN_IDS.ARBITRUM)`, and
live in this runtime that call returns `Invalid chain ID "0xa4b1"` — Arbitrum is not a configured
network here (only `0x1` is). Independently, EVM RPC is unusable: a mainnet gas-estimate call hung
past 60 s and the service worker logs `Failed to execute 'fetch' on 'WorkerGlobalScope': Illegal
invocation`. A UI recording needs a slot with a working Arbitrum client.
