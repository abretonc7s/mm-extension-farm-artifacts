# Recipe coverage — PR #45067 (TAT-3490), update-branch run (rebase onto 5b44454253)

This is an `update-branch` task whose checklist has no recipe step; step 8 is the proof mode
(lint parity gate + targeted tests on the conflicted files).

> **Read Addendum 2 at the bottom first.** It supersedes the runtime status in the "Runtime state"
> and "Summary" sections below and in `recipe-quality.json`: the recipe now runs **green
> end-to-end on this slot (28/28)**, so AC1/AC2 are proven live rather than carried forward. The
> AC1/AC2 rows in the table below are current; the prose in those two later sections is kept for
> history and is marked stale.

## What actually changed in the rebase

Rebasing `83b1e4340c` → `f5e8cc529b` over 34 incoming `main` commits produced 3 conflict hunks in
2 product files plus 1 test mock, and one silent (non-conflicting) breakage. Of the 14 PR-touched
files, 8 differ pre- vs post-rebase:

| File | Why it differs | Behaviour re-decided? |
|---|---|---|
| `ui/components/app/perps/cancel-order/cancel-order-modal.tsx` | manual conflict resolution ×2 | **yes** — see below |
| `shared/constants/perps-events.ts` | manual resolution + re-added `ERROR_TYPE.VALIDATION` / `ERROR_MESSAGE_KEY` that `main` pruned | no — values restored to the controller contract |
| `app/scripts/messenger-client-init/perps-controller-init.test.ts` | rebase-fallout fix (`f5e8cc529b`) | no — mock wiring only |
| `app/scripts/messenger-client-init/perps-controller-init.ts` | `main`'s removal of the attribution-context plumbing, auto-merged | no — `guardCancelOrder` / `ORDER_UNKNOWN_COIN` retry is byte-identical |
| `app/_locales/en/messages.json`, `app/_locales/en_GB/messages.json`, `test/jest/console-baseline-unit.json`, `cancel-order-modal.test.tsx` | `main`-side churn merged around the PR's additions | no |

The one genuinely re-decided behaviour is the cancel failure path. `main` restructured
`handleCancel` so a `success: false` result throws into `catch` instead of being handled inline,
and deleted `trackPerpsErrorScreenViewed`. The resolution routes both `success: false` and
rejections through the `catch` block, which already contains the PR's already-closed quiet-close
and its `translatePerpsError` call — so AC2 and AC5's cancel half are reached by a **different code
path** than the parent run proved them on. That is why the unit evidence below matters more than
it did last time, and why AC2 is downgraded to a carry-forward that the unit suite corroborates
rather than a clean inherit.

## Claim status

| # | Claim | Proof mode | Verdict | Basis in this run |
|---|---|---|---|---|
| AC1 | Cancelling a live open order from the market-detail modal removes it on HyperLiquid | state | **PROVEN LIVE** | No longer carry-forward: the recipe now runs green end-to-end on this slot (`recipe-run-rev3/`, 28/28), cancelling a live resting order and asserting it is gone on the provider. |
| AC2 | A cancel for an order the provider no longer holds open closes the dialog with a neutral "no longer open" notice | mixed | **PROVEN LIVE** + unit | The recipe creates an order, cancels it out of band via `metamask.perps.close_orders`, drives the modal into the already-closed path and waits on `perps-toast-cancel-order-already-closed` before capturing. Unit tests additionally cover both the `success: false` and thrown variants. |
| AC3 | A stale streamed balance is caught by a fresh account-state read before a doomed withdrawal | state | PROVEN by unit tests | `perps-withdraw-page.test.tsx` passes post-rebase, incl. the `stale_balance_shortfall` assertion, after `ERROR_TYPE.VALIDATION` / `ERROR_MESSAGE_KEY.INSUFFICIENT_BALANCE` were restored to the pruned constants mirror. |
| AC4 | `ORDER_UNKNOWN_COIN` on cancel is retried once after `init()` rehydrates the asset map | state | PROVEN by unit tests | `perps-controller-init.test.ts` 141/141 post-rebase, incl. the retry-throw regression test. Initially 4 failures from the mock regression; fixed in `f5e8cc529b`, and the guard source is byte-identical to pre-rebase. |
| AC5 | The UI no longer emits duplicate **`Perp Withdrawal Transaction`** events — the controller is the sole emitter for the withdraw flow | state | PROVEN by unit tests | `perps-withdraw-page.tsx` emits no `Perp Withdrawal Transaction` at all; the only UI-side event left on that page is the `Perp Error` for the *prevented* withdrawal, which the controller never sees because the guard returns before `perpsWithdraw`. `perps-withdraw-page.test.tsx` covers both. **Scope corrected:** this claim covers the withdrawal half only — see the note below. |

**AC5 scope correction.** An earlier revision of this document stated AC5 as covering
`Perp Withdrawal Transaction` *and* `Perp Order Cancel Transaction`. Only the withdrawal half is
true. The cancel modal still emits `Perp Order Cancel Transaction` from the UI on the success path
(`cancel-order-modal.tsx:169`) and the generic-failure path (`:198`); both predate this PR and are
outside its scope. What this PR does guarantee for cancel is narrower and now accurate: the
already-closed path emits **no** UI transaction event, because `TradingService.cancelOrder` already
emitted one (submitted, then failed with the provider message) for that same attempt — verified in
`node_modules/@metamask/perps-controller/dist/services/TradingService.mjs:423-455` and wired to
MetaMetrics via `app/scripts/controllers/perps/infrastructure.ts:176`. Asserted by
`not.toHaveBeenCalledWith('Perp Order Cancel Transaction', …)` in both already-closed tests.

Post-rebase test totals: **285/285 passing, 5/5 suites** across the suites covering the PR diff
(`cancel-order-modal.test.tsx`, `perps-controller-init.test.ts`, `perps-withdraw-page.test.tsx`,
`orderUtils.test.ts`, `perps-toast-provider.test.tsx`). `tsc` clean.

## Runtime state — STALE, superseded by Addendum 2

`mm-harness launch --verify` passed after the rebase: full LavaMoat build (79s), profile fixture
prefilled and CDP-validated (`accounts=31 selected=Account 1`), live verify pass. The runtime is
available on CDP 7666 for a recipe run if a later task calls for one. The known blocker for driving
the graph end-to-end is unchanged from the parent run: `metamask.perps.start_state` reads
`isTestnet` from `metamask.PerpsController`, while this build flattens perps controller state onto
`metamask`.

## Summary — STALE, superseded by Addendum 2

2/2 recipe-bound ACs carried forward (AC2's carry-forward corroborated in unit because its code path
changed); 3/3 unit-tested ACs re-verified post-rebase; weak: 1 (AC5 analytics-duplication caveat
inherited from `main`'s restructure); missing: 0.

**Current summary:** 2/2 recipe-bound ACs (AC1, AC2) proven **live**, 28/28 recipe nodes green;
3/3 unit-tested ACs (AC3–AC5) proven by unit tests; weak: 1 — AC3, the ticket's largest bucket, has
no live coverage because a suspended service worker cannot currently be reproduced in a recipe;
missing: 0.

---

## Addendum — self-review fix pass

The self-review returned ISSUES and four code fixes landed on top of the rebase
(`eb8f63d850`; see the "Self-Review Fixes" section of `report.md`). Effect on the
claims above:

- **AC2** — ~~the already-closed path now also emits `Perp Order Cancel Transaction`
  with `cancel_outcome: already_closed`~~ **reverted in the next pass**; that event
  contradicted the controller's own. Behaviour otherwise unchanged: the quiet close
  the screenshot shows is untouched and both tests still assert no `Perp Error`.
- **AC5** — ~~the cancel half gained a distinguishing property~~ **superseded**; see
  the AC5 scope correction above.
- **AC3** — the fresh-balance adoption is now keyed on a stream revision instead
  of the streamed value. Covered by a new regression test
  ("does not re-pin the released fresh balance when the stream reports the earlier
  value again") that was **verified to fail on the pre-fix code** and pass after.
- **AC1, AC4** — untouched by this pass.

Post-fix totals: **108/108** across the three changed suites
(`cancel-order-modal.test.tsx`, `translate-perps-error.test.ts`,
`perps-withdraw-page.test.tsx`); `mm-harness check diff --profile fast` green on
policy-suppressions, eslint, oxfmt and jest.

The recipe was re-run after the fixes and produced the **same** result as before
them — 5/6 nodes green, halting at `setup-select-account` with
`stateHooks.store.getState is unavailable` on this production-build slot. It
therefore adds no new AC evidence and shows no regression. AC1/AC2 remain
carry-forward.

---

## Addendum 2 — second self-review fix pass (supersedes the runtime status above)

**The recipe now passes end-to-end on this slot.** Every "halts at `setup-select-account`" /
"production LavaMoat build, `hasStore: false`" statement earlier in this document and in
`recipe-quality.json` is **out of date**. Current status:

- `mm-harness run` on the current HEAD: **pass, 28/28 nodes** (`artifacts/recipe-run-rev3/`).
- `runtime-health`: `hasStore: true`, `hasSubmitRequest: true`, `perpsManagerInitialized: true`.
- The blocker was the invocation, not the runtime: the checklist's
  `--launch-existing-dist` / `--project-root` form is stale for this harness build. Attaching to
  the live CDP runtime (`--cdp-port 7666`, no `--slot`) works.

AC1 and AC2 are therefore **proven live**, not carried forward. AC1/AC2 rows above have been
updated accordingly.

Changes in this pass:

- **AC3** — the blocked withdrawal now always sets `submitError`, so it cannot be silently
  swallowed when the stream ticks while the fresh read is in flight (the adoption is keyed on the
  revision captured at click time, so it goes inert in that race). New test
  "still tells the user why the withdrawal stopped when the stream ticks mid-read", **verified to
  fail without the fix**. Still unit-only: AC3 has no live recipe coverage, because reproducing a
  suspended service worker in a recipe is not currently feasible. That is a real gap in the
  ticket's largest bucket, not an oversight.
- **AC5** — restated to cover the withdrawal half only; see the scope correction above. The UI
  event added in the previous pass for the already-closed cancel has been removed: it contradicted
  the controller's own `failed` event for the same attempt.

Post-fix totals: **69/69** across the two changed suites (`perps-withdraw-page.test.tsx` 30,
`cancel-order-modal.test.tsx` 39). The withdraw suite's act-warning baseline moved 147 → 148: the
new test deliberately holds `perpsGetAccountState` unresolved across an `act` boundary so the
stream can tick mid-read, which is exactly the condition under test.
