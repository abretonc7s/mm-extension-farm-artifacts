# Comments report (PR 45986)

Skipped status-only issue comments without reply: 4 (CLA, codeowners, Sonar coverage summary, builds/benchmarks).

No CHANGES_REQUESTED reviews. Inline reply posted; thread resolved.

| # | Author | File | Triage | Action |
|---|--------|------|--------|--------|
| 1 | cursor[bot] | ui/pages/perps/perps-order-entry-page.tsx:886 | REAL | Restore `isInitialLoading` so a null account is not treated as $0 |

- Total comments: 5 (1 REAL, 0 FALSE POSITIVE, 4 OUT OF SCOPE / status-only skipped)
- Commit SHA for fixes: `002b882c412dba3dc489e0752d9060612c4dbdd2`
- Files changed: `ui/pages/perps/perps-order-entry-page.tsx`, `ui/pages/perps/perps-order-entry-page.test.tsx`
- Recipe re-validation: PASS
- Integration status: rebased
- Coverage: perps new lines 100%. Analyzer also flagged ramps `payment-method.tsx` (not in this PR).
