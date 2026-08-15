# Reviewer-driven learnings — PR 45191 (TAT-3632)

No human reviewer asked for a code change (0 inline comments, 1 approval). The one REAL
finding came from the previous run's own report: the branch had drifted into conflict with
`main`. The lessons are therefore about integration hygiene, not about the fix's logic.

- `Stale integration beats a correct fix: the previous run diagnosed the conflict, wrote "operator decision required (merge vs rebase)" and stopped — fix-bug should finish the integration itself, since a branch that cannot merge is not done regardless of how green its own validation is.`
- `Conflict diagnosis expires: the inherited report listed only the two locale files, but by this run main had also landed #45257 ("remove 'use no memo' from confirmation alerts") and a colliding test block in useTransactionCustomAmountAlerts.test.ts. Re-derive the conflict set at merge time; never act on a conflict list captured days earlier.`
- `Resolve to the other side's intent, not to your own diff: main deleted alertReasonChangeInSimulationResults and stripped 'use no memo' repo-wide. Taking "ours" wholesale would have silently resurrected a deleted key and re-opted this hook out of React Compiler. Read the commit that produced the other side before choosing a resolution.`
- `Both sides can add at the same anchor: main and this branch each appended a new it() block at the same point in useTransactionCustomAmountAlerts.test.ts. An added/added conflict in a test file is almost always "keep both", not "pick one" — the merged hook listed both alert keys, so both assertions were live.`
- `Re-run the validation recipe after the merge, not only after the fix: the recipe passing pre-rebase says nothing about the merged state. Re-running it here proved the TAT-3632 condition (streamed $0 vs fresh $756.36) still reproduces and the hook still decides from the fresh read on top of new main.`
