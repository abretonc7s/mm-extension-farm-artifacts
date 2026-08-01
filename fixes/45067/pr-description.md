# PR #45067 — local description delta (not published)

> Local artifact only. Do not publish — the gateway pushes this after human
> approval. No `gh pr edit`/`comment` was run.

## Delta added by this self-review fix pass

Rebased onto `origin/main` `5b44454253`, then addressed four self-review findings
in the perps withdraw/cancel reliability work:

- Cancel failures now show cancel copy ("Order could not be cancelled.") instead
  of the shared map's placement copy — `ORDER_UNKNOWN_COIN`, which this PR's
  retry makes more reachable, was rendering "Order could not be placed." on the
  Cancel order dialog.
- The adopted fresh withdraw balance is keyed on a stream revision rather than
  the streamed value, so a stream that reports an earlier number again no longer
  re-pins a stale, lower balance the user could not clear without leaving the page.
- A blocked withdrawal always says the attempt stopped, instead of silently
  no-opping when the account stream pushes a new balance while the fresh read is in
  flight — the same service-worker wake-up that serves the read is a common trigger
  for that push. That message is retired as soon as a new balance reading arrives, so
  it cannot end up beside a recovered balance and an enabled Submit button — while a
  withdrawal that genuinely failed keeps its message, since the inline line is its
  only feedback on this page.
- The two withdraw error lines carry `perps-withdraw-validation-error` /
  `perps-withdraw-submit-error` testIds, so the guard's only user-visible surface is
  assertable without matching translated copy.
- `perpsToastCancelOrderAlreadyClosed`'s locale description corrected to
  "Success toast text", matching the presentation it is registered with.
- The already-closed cancel path deliberately emits no UI analytics:
  `TradingService.cancelOrder` already reports that attempt, so a UI event would be
  a second, contradictory-status row for one user action.

## Acceptance criteria

| # | Criterion | Status |
|---|---|---|
| AC1 | A live open order cancels from the market-detail modal | **PASS — proven live** (recipe 28/28) |
| AC2 | A cancel for an order no longer open closes with a neutral notice | **PASS — proven live** (recipe stages the race out of band) + unit |
| AC3 | A stale streamed balance is caught by a fresh read before a doomed withdrawal | PASS (unit only — see gap below) |
| AC4 | `ORDER_UNKNOWN_COIN` on cancel is retried once after `init()` | PASS (unit) |
| AC5 | No duplicate `Perp Withdrawal Transaction` analytics from the UI | PASS (unit) — withdrawal half only; the cancel modal's pre-existing UI events are out of scope |

Validation: recipe **pass, 28/28 nodes** against a dist rebuilt from this branch;
69/69 unit tests across the changed suites; `mm-harness check diff --profile fast`
green on eslint, oxfmt, jest and policy-suppressions.

**Known gaps for the reviewer:**

- AC3 — the larger half of the diff and the ticket's biggest failure bucket — has
  no live recipe coverage, because a suspended service worker cannot currently be
  staged in a recipe. It is unit-proven, with three regression tests each verified
  to fail without their fix.
- The fresh-read completeness check only covers the perps leg.
  `getAccountState` also fans out to spot and abstraction reads, and a transient
  failure in either passes the check while silently dropping free spot USDC — so a
  HL Unified-mode user can see a false "Insufficient balance" that clears on the
  next stream tick. Not detectable from `AccountState`; documented in the code, and
  the real fix belongs in the controller.
