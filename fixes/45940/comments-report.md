# Comments triage — PR #45940

Skipped without reply: 8 status-only issue comments (CLA, CODEOWNERS, 4 "Builds ready", SonarQube quality gate, author validation-evidence dump).

| # | Author | File | Triage | Action |
|---|--------|------|--------|--------|
| 1 | cursor[bot] | ui/components/app/perps/hooks/usePerpsTopMovers.ts | REAL (already fixed) | Stream-owner bug was fixed in `11168f6638`; reply already posted. No further code change. |
| 2 | cursor[bot] | ui/components/app/perps/perps-top-movers/perps-top-movers.tsx:194 | REAL | Split inset wrapper from the bordered `p-1` track so `twMerge` does not drop `px-4`. |
| 3 | cursor[bot] | ui/components/app/perps/perps-top-movers/perps-top-mover-pill.tsx:30 | REAL | Restore content-width `w-auto shrink-0` so pills wrap instead of clipping in the 400px popup. |
| 4 | Bigshmow | ui/components/app/perps/perps-top-movers/perps-top-movers.tsx:193 | REAL | Same inset/`p-1` merge as #2; apply the suggested wrapper split. |

## Totals

- Total comments triaged: 4 (4 REAL, 0 FALSE POSITIVE, 0 OUT OF SCOPE)
- Skipped without reply: 8
- Commit SHA for fixes: `a7f09b5e65`
- Files changed: `perps-top-movers.tsx`, `perps-top-movers.test.tsx`, `perps-top-mover-pill.tsx`, `perps-top-mover-pill.test.tsx`
- Recipe re-validation: PASS (30/30 nodes, capture-helper)
- Integration status: rebased

## Local validation

- `check diff --profile fast`: PASS (eslint, oxfmt, jest)
- Coverage vs origin/main PR files: PASS, 100% new lines (73/73). First `coverage-analyze.js` FAIL was against stale local `main` (unrelated shield/bridge/unlock files); re-ran `--files` on this PR's sources.

## Recipe re-validation

PASS: 30/30 nodes, exit 0. Screenshots `provider=capture-helper`. Ran attached to live CDP after `--launch-existing-dist` failed verify on a rebase commit-id mismatch.
