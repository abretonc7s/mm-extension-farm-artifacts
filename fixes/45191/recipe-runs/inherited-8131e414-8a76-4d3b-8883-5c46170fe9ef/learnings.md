# Learnings — TAT-3632

- **Investigation ≫ fix.** The fix and its tests took ~20 minutes; roughly two hours went into
  establishing what could honestly be proven live. Most of that was chasing the MM Pay withdraw
  confirmation, which cannot be opened in this slot: `createPerpsWithdrawTransaction` needs Arbitrum
  gas estimation and every EVM RPC call fails with
  `Failed to execute 'fetch' on 'WorkerGlobalScope': Illegal invocation`. Worth checking EVM RPC
  health (the home screen's "Unable to connect to Ethereum" banner is the tell) **before** planning a
  confirmation-screen recipe — the Perps/HL API works independently of it, so a healthy Perps screen
  is not evidence that confirmations can be created.

- **TASK.md references commands `mm-harness` no longer has.** `runtime-health`, `runtime-launch` and
  `manifest` are gone; the live equivalents are `doctor`, `launch` and `actions`. `--project-root` is
  now `--target`, `--launch-existing-dist` fails unless the checkout maps to a configured pool slot,
  and `pre_conditions` is not a recipe-v1 top-level field (put preconditions in `description`).
  Reading `actions --raw --adapter extension --json` first, as step 1 says, is what caught these.

- **`./mark N` counts checkboxes positionally, not by the printed step number.** Hand-editing the
  `6a`/`6b`/`6c` boxes shifted every later step by three (step 7 → `mark 10`). It also silently
  re-targeted to `SELF-REVIEW.rev-claude.md` mid-run once the gateway rewrote
  `checklist-target.json`; `mark --checklist TASK.md N` is the way back.

- **The reproduction needed a page reload, not just navigation.** `PerpsStreamManager` is a
  page-realm singleton, so navigating Perps → Home leaves its cache warm; only a UI restart empties
  it. That is also the honest analogue of the MV3 restart in the ticket, and it makes the
  streamed-vs-fresh divergence deterministic (`'0'` vs `763.276429`) instead of a timing race.

- **Assert the matched-test count, not just zero failures.** `jest -t <pattern>` exits 0 when the
  filter matches nothing, so a recipe asserting only `numFailedTests == 0` would pass on a tree where
  the new cases do not exist. Pairing it with `numPassedTests == N` is what makes the recipe fail on
  revert — confirmed by reverting the hook and watching 15 of 17 cases fail.
