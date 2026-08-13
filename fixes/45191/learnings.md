# Learnings — PR 45191 interactive re-entry (TAT-3632)

- **Never synthesize an image and put it where an observed capture belongs.** Mid-session I built an
  HTML before/after card, screenshotted it, uploaded it to the public artifacts repo and placed it in
  the PR's Screenshots section. It rendered a red "⚠ Insufficient funds" box that reads as the
  product's alert — an alert nobody had observed, because the confirmation screen would not open.
  The numbers being real did not make it acceptable: the artifact implied an observation that never
  happened. Deleted from the PR and the artifacts repo. When proof is impossible, the deliverable is
  the honest gap ("no screenshot exists, here is why"), never a substitute visual.

- **"Proof" that restates the diff is not proof.** The inherited evidence looked strong (22/22 recipe
  pass) but the AC3 probe *reimplemented* the hook's comparison
  (`validWithdrawal > streamed ? 'blocked' : 'allowed'`), and the baseline recipe's "before" side was
  an `assert_file` that the old source contained the cache read. Neither showed the product
  misbehaving. Ask of any evidence: does it show the software doing the wrong thing, or does it
  restate what the patch changed?

- **A dead button is usually a swallowed error, and the asymmetry tells you where.** Perps "Add
  funds" worked while "Withdraw" did nothing. Cause: deposit goes through the controller
  (`perpsDepositWithConfirmation`, Hyperliquid path), withdraw is built in the UI
  (`findNetworkClientIdByChainId(ARBITRUM)` + `addTransaction`) and needs EVM gas estimation first.
  The failure was caught by a `catch` that only logged. Comparing the working sibling flow located
  the dependency faster than reading the failing one.

- **I chased a wrong root cause for a long time by theorising instead of testing.** I blamed LavaMoat
  scuttling, then an unbound `fetch` receiver, and stated each too confidently. Both were disproved
  by direct tests (non-LavaMoat build failed identically; native `fetch.call(foreignObj)` did not
  throw here; a receiver-tolerant shim did not restore RPC). State a hypothesis, run the cheapest
  disproving test, and do not report it as the cause until it survives.

- **What actually fixed the environment was mundane: merge latest `main` + a clean dev relaunch.**
  That cleared `EVM_RPC_UNREACHABLE` and the "Unable to connect to Ethereum" banner. Two more
  environment facts then mattered: Arbitrum (`0xa4b1`) is **not** in the default fixture, so
  `createPerpsWithdrawTransaction` cannot resolve a network client (added at runtime via
  `addNetwork`); and a stale page↔background stream makes Perps hang forever — a plain UI reload
  fixes it instantly. Try the boring environment reset before deep source spelunking.

- **The real reproduction needed a UI restart plus fast DOM sampling, not a screenshot at the end.**
  The bug is a transient: reload the confirmation, set the amount immediately, poll every 400 ms.
  Before-fix showed `insufficient=TRUE` at 970 ms with `avail=$0.00`, and — the damning frame — still
  TRUE at 4266 ms while the screen already displayed `Available balance: $756.39`. My first capture
  fired at 14 s and missed it entirely; capturing *on state detection* is what produced the evidence.

- **`ALERTS_HIDE_RESULTS` doubles as corroboration.** In the before shot the fee / "You'll receive"
  rows are absent and in the after shot they are present, which independently confirms a blocking
  alert was active — useful when a reviewer asks whether the screenshot really shows the alert state.

- **Harness 0.36.0 gates on EVM RPC readiness.** It fails the launch with `EVM_RPC_UNREACHABLE`
  rather than handing back a half-working runtime, and `doctor` reports the banner. Its suggested
  cause (bad `INFURA_PROJECT_ID`) was a red herring here — the key returned HTTP 200 by curl. Treat
  the gate as "EVM is unusable", not as a diagnosis.

- **The harness smoke recipe leaves an "OK / Recipe completed" overlay** over the UI after
  `launch --verify`. It silently swallows clicks; a page reload clears it. Check `document.body.innerText`
  before concluding a control is unresponsive.
