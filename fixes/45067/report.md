# Update-branch report — PR #45067 (TAT-3490)

## Strategy

- `BRANCH_UPDATE_STRATEGY: rebase` → concrete strategy used: **rebase**.
- Command: `git rebase origin/main`
- Base moved `1bd5a8f781` → `7c97314f3a`.

## Conflicts

**None.** All 7 branch commits replayed cleanly onto `origin/main`.

| Conflicted file | Side preferred | Rationale |
|---|---|---|
| _(none)_ | — | — |

The two new commits on main did not touch any file in this PR's diff:

- `7c97314f3a` — `chore: gate trust and security TDP with remote feature flag (#45059)`
- `8b604ff5ad` — `test(e2e): skip flaky Tron QR popup account derivation test (#45081)`

This branch is perps-only (`ui/**/perps/**`, `shared/constants/perps-events.ts`,
`app/scripts/messenger-client-init/perps-controller-init*`, plus locale and jest-mock
support files), so there was no overlap. Contrast with the previous update in this family,
where main's #44324 (perps controller analytics contract) collided with every perps file —
that reconciliation is already baked into the commits being replayed here and was not
re-litigated by this rebase.

## Deps / LavaMoat

- `package.json` and `yarn.lock`: **not touched** by the update → `yarn install --immutable` skipped (step 5).
- `lavamoat/**`: **not touched** by the update → no policy review needed (step 6).

## Validation (step 8)

| Gate | Result |
|---|---|
| `lint:json` (prettier) | pass |
| `lint:format` (oxfmt, 8370 files) | pass |
| `lint:eslint` | pass **after excluding `temp/**`** — see framework note below |
| `lint:tsc` | pass (exit 0) |
| `lint:styles` (stylelint) | pass |
| `lint:images` | pass |
| `messenger-action-types:check` | pass — all action type files up to date |
| `verify-locales --quiet` | pass — no invalid entries |
| `circular-deps:check` | pass |
| `jest` (4 PR suites) | pass — 271/271 |

No conflicts occurred, so step 8's "tests for conflicted files" had no target. The four suites
covering this PR's diff were run anyway as a post-rebase sanity check, since the base moved:
`cancel-order-modal.test.tsx`, `perps-controller-init.test.ts`, `perps-withdraw-page.test.tsx`,
`orderUtils.test.ts`.

### Framework issue — `yarn lint` fails on framework-injected paths

`yarn lint` (bare) exits 1 with **5821 problems (4633 errors, 1188 warnings)**. Every one of those
4633 errors is in `temp/recipe/runtime/runtime-dist/**` — the webpack bundle snapshot that step 7's
`ensure-runtime-ready.sh` writes into the working tree. The bundles inline `eslint-disable` comments
from their original sources, so ESLint reports `Definition for rule '@typescript-eslint/...' was not
found` against 739 generated files.

Split by path:

| Scope | errors | warnings |
|---|---|---|
| `temp/**` (framework-injected) | 4633 | 750 |
| real repo files | **0** | 438 (pre-existing) |

Per the agent rules this was **not** worked around by editing `.eslintignore`, `.prettierignore`,
`.eslintrc.js`, or any other project config. The check was re-run with the path excluded:

```bash
NODE_OPTIONS='--max-old-space-size=6144' npx eslint . -c ./.eslintrc.js --ext js,ts,tsx,snap --ignore-pattern 'temp/**'
# exit 0 — 438 problems (0 errors, 438 warnings)
```

Zero errors on real repo files, and the 438 warnings are pre-existing (`react-hooks/set-state-in-effect`
and similar) and untouched by this branch. Surfacing here as a framework bug: step 7 (refresh runtime)
and step 8 (`yarn lint`) are in direct conflict as written — running the runtime refresh guarantees the
bare lint gate fails.

## Push

- Command used: `git push --force-with-lease origin TAT-3490-feat-investigate-and-fix-reliabilit`
- Force-with-lease is required because the strategy is `rebase` (branch history rewritten). No bare `--force` was used.

## Risks / manual verification

- **No new risk introduced by this rebase** — the replay was conflict-free, so no PR
  behaviour was re-decided here.
- Carried over from the previous run and still worth a human eye (unchanged by this run):
  the `#/perps` (Perps home) route renders MetaMask's generic error page on this build.
  It is outside this PR's diff — `ui/components/app/perps/perps-view.tsx` was last changed
  by main's #44324 — and outside the validation recipe's path (`#/` and
  `#/perps/market/ETH` both render correctly). Flagged for the perps team, not fixed here.

## Mergeability (step 10)

```
mergeable:         MERGEABLE
mergeStateStatus:  BLOCKED
head:              83b1e4340c71e036ab08675cef7e4b3d2b1fcd25
base:              main
```

`MERGEABLE` is the expected result — no conflicts remain. `BLOCKED` reflects required checks not yet
completed (CI restarted on the force-push) plus required review; it is not a conflict signal.
