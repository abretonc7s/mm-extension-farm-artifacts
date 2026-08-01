# Recipe coverage — PR #45067 (TAT-3490), update-branch run

This is an `update-branch` task: its checklist validates with the lint parity gate and targeted tests
(step 8) and contains no recipe step. The AC evidence below is therefore carried forward from the
parent run, justified by a content check rather than an assumption.

A real `mm-harness run` **was** executed against the live runtime to produce the run package the
artifact contract requires (`artifacts/recipe-run/`). It reached **6/7 executed nodes green** and then
stopped at the known harness blocker:

| Node | Result |
|---|---|
| `gate-status` | ok |
| `gate-fixture` | ok |
| `setup-unlock` | ok |
| `setup-open-home` | ok |
| `setup-wait-app-ready` | ok |
| `setup-select-account` | ok |
| `setup-start-state` | **FAIL** — `Unable to read the current Perps network from persisted controller state.` |

That failure is the harness-library defect already documented by the parent run: the action reads
`isTestnet` from `metamask.PerpsController`, while this build flattens perps controller state onto
`metamask`. It is **not** a product failure and **not** caused by this rebase — the graph never
reaches an AC node. The run package is kept as-is rather than being edited to look like a pass.

## Why the inherited evidence still applies

Every file this PR touches is **byte-identical** before and after the rebase:

```bash
git diff 8059e8a82f 83b1e4340c -- <all 15 PR files> --stat   # → empty
```

The only difference between the pre-rebase and post-rebase trees is main's own two commits
(`#45059` trust/security TDP feature flag under `ui/pages/asset/**`, `#45081` Tron e2e skip under
`test/e2e/**`) — neither overlaps this perps-only branch. The rebase replayed all 7 commits with zero
conflicts, so no behaviour under test was re-decided.

## Claim status (inherited, unchanged)

| # | Claim | Proof mode | Verdict | Basis in this run |
|---|---|---|---|---|
| AC1 | Cancelling a live open order from the market-detail modal removes it on HyperLiquid | state | PROVEN (inherited) | Proven live on testnet in the parent run against branch + `origin/main` `1bd5a8f781`; the cancel-modal code is unchanged since. |
| AC2 | A cancel for an order the provider no longer holds open closes the dialog with a neutral "no longer open" notice | mixed | PROVEN (inherited) | Same — the parent run asserted `perps-toast-cancel-order-already-closed` live after staging the real out-of-band race. Evidence: `recipe-runs/inherited-…/`. |
| AC3 | A stale streamed balance is caught by a fresh account-state read before a doomed withdrawal | state | PROVEN by unit tests | Re-verified in this run: `perps-withdraw-page.test.tsx` passes post-rebase. |
| AC4 | `ORDER_UNKNOWN_COIN` on cancel is retried once after `init()` rehydrates the asset map | state | PROVEN by unit tests | Re-verified in this run: `perps-controller-init.test.ts` passes post-rebase, incl. the retry-throw regression test. |
| AC5 | The UI no longer emits duplicate `Perp Withdrawal Transaction` / `Perp Order Cancel Transaction` | state | PROVEN by unit tests | Re-verified in this run: `cancel-order-modal.test.tsx` + `perps-withdraw-page.test.tsx` pass post-rebase. |

Post-rebase test totals: **271/271 passing** across the four suites covering the PR diff
(`cancel-order-modal.test.tsx`, `perps-controller-init.test.ts`, `perps-withdraw-page.test.tsx`,
`orderUtils.test.ts`).

## Runtime state

Step 7 (`ensure-runtime-ready.sh`) reported `ready via doctor`, and `mm-harness runtime-health`
returned `PASS` on CDP 7666 — so the runtime is available for a recipe run if a later task calls for
one. The known blocker for driving the graph end-to-end is unchanged and recorded in the parent run:
`metamask.perps.start_state` reads `isTestnet` from `metamask.PerpsController` while this build
flattens perps controller state onto `metamask`.

Overall: 2/2 recipe-bound ACs PROVEN (inherited, carry-forward justified by identical file content);
3/3 unit-tested ACs re-verified post-rebase; weak: 0; missing: 0.
