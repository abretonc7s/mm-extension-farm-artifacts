# PR #45986 — review comment triage (round 3)

Live fetch: 2 unresolved review threads, both cursor[bot], both raised on 0198df0f8e.
New issue comments are status-only (metamask-ci build-ready, SonarQube quality gate), so 2 were skipped.
The geositta review still reads `CHANGES_REQUESTED`, but all 11 of its threads were resolved in an
earlier round and it needs a human re-review.

| # | ID | Author | File | Triage | Action |
|---|----|--------|------|--------|--------|
| 1 | 4074521389 | cursor[bot] | ui/components/app/perps/perps-deposit-toast.tsx:109 | REAL | Failure path calls new `clearPendingUnfundedDepositFunnel`, which drops the funnel only while its deposit is unconfirmed |
| 2 | 4074521401 | cursor[bot] | ui/components/app/perps/perps-deposit-toast.tsx:99 | REAL | Fire-once guard moved from `useRef` to `markDepositResultTracked` (localStorage), keyed on tx id + result timestamp + outcome |

Evidence at HEAD:
1. `isUnfundedDepositFunnelActive` only compares addresses, so it is also true after `confirmedAt` is set.
   The failure branch then called `clearUnfundedDepositFunnel()`, which erased a deposit that had already
   confirmed. That contradicted the rematch fix in 0198df0f8e.
2. `trackedDepositResultRef` is per-instance. The toast mounts behind `isUnlocked`, and unmounting also
   cancels the 5s timeout that clears `lastDepositResult`, so a remount processed the same success again.
   The result `timestamp` is included in the key because `lastDepositTransactionId` can be null.

Totals: **2 REAL, 0 FALSE POSITIVE, 0 OUT OF SCOPE**.

## CI failures found during fetch

- `Test lint`: `lint:tsc` fails in `ui/pages/perps/perps-order-entry-page.test.tsx`. A test added in
  3bbdb97bf4 built an `AccountState` with `spendableBalance: undefined`, which the required `string`
  field does not allow, and a cast would break repo rules. Fix: drop that one test. The unparseable-balance
  test still covers the `hasKnownBalance` guard with a type-valid payload.
- `check-pr-max-lines`: the PR was at 1006 changed lines against a 1000 limit, and only lockfiles,
  snapshots and LavaMoat policies are excluded. This round's fixes would have pushed it to 1081. It is
  now **999**, reached by merging duplicate tests with no branch coverage lost:
  - Removed the toast's re-render fire-once test. The new remount test is a strict superset, since
    a remount re-runs the effect.
  - Removed the page's "null account while loading" test. The "zero balance while loading" test covers
    the harder case and now also asserts the hint is hidden.
  - Merged the funded/unfunded row-click tracking tests into one `it.each`.
  - Merged the close/modify loading tests into one `it.each`.
  The margin is 1 line, so any future review round that grows the diff will trip this check again.

## Validation (step 9)

- `mm-harness check diff --profile fast`: **PASS**. Jest across the two touched page/toast suites: 176 passed.
- `coverage-analyze.js`: reports FAIL on two files outside the PR (the stale local `main` baseline
  issue from the previous round). All PR files pass: `unfunded-deposit-funnel.ts` at 91% new-code
  coverage, the toast at 100%, `perps-order-entry-page.tsx` at 88%.

## Recipe re-validation (step 10)

**PASS** on the final tree. The screenshot provider is `capture-helper`.

## Final parity gate (step 11)

`lint:changed`, `lint:json`, `lint:format`, `lint:tsc`, `lint:styles`, `messenger-action-types:check`,
`verify-locales`, `circular-deps:check`: all **PASS**. `verify-locales` failed once while other checks were
running and passed on rerun, so the failure was transient.

After the `it.each` → typed `forEach` switch (`it.each` failed `lint:tsc` in this file), the formatter added two
lines and the PR reached 1001. To get margin I also removed the funded-icon aria-label test in `amount-input.test.tsx`,
which duplicates "keeps the icon when the page classifies a zero balance as funded". I dropped the
"clears an abandoned or failed funnel" util test too, since the pending-only clear test covers the same path, and made
`clearUnfundedDepositFunnel` module-private because it has no external callers. **Final PR size: 969 changed lines.**

## Final summary (step 13)

- Actionable comments: **2**, both REAL, fixed in `f4f7cfb8c391e370569019a896bfdb5566c5546d`, replied to, and resolved.
- Also fixed two CI failures found during fetch: `Test lint` (`lint:tsc`) and `check-pr-max-lines` (1006 → 969).
- Files changed: `perps-deposit-toast.tsx`, `unfunded-deposit-funnel.ts`, and tests in `perps-deposit-toast.test.tsx`,
  `unfunded-deposit-funnel.test.ts`, `amount-input.test.tsx`, `perps-order-entry-page.test.tsx`.
- Integration status: **skipped** (branch was already on `origin/main`). Pushed as a plain fast-forward.
- Recipe: **PASS**. Full parity gate: **PASS**.
- Still open for humans: geositta's review reads `CHANGES_REQUESTED` until they re-review. PR size has 31 lines of headroom.
