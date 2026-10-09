# Completed run learnings

- Authorized re-pin to immutable mm-harness 0.82.1 resolved the 0.81.0 formatter blocker. Use the supported pin/resolver/resume path; task front door only. Provenance and the exact reason are in harness-repin.md. The old receipt/logs and blocked report remain historical evidence.
- The task wrapper preserves terminal signals. The authorized blocked-to-running transition used the pinned shipped marker API via task/mark, never a handwritten SIGNAL. All later marks explicitly used the task harness checklist front door.
- Controller 19.0.0 makes liquidation user identity optional. UI metadata already passes through unchanged, and the existing badge guards unknown addresses; only the local type needed adjustment. Transform and RTL regressions cover that contract.
- Import Jest's typed it when using it.each: this file's ambient global type otherwise comes from TestFunction. The final full gate catches this even when Jest runtime passes.
- After reload, semantic Perps navigation reached a legacy embedded tab, unlike the baseline standalone page. Verify the existing standalone route against current source, then add an observable watchlist wait before reading loaded markets. Retain failed runs; do not weaken AC assertions or change flags/wallet state.
- Final proof package is recipe-run-3: 14/14 pass, inspected capture-helper screenshot and full-run video, exact installed-version assertion. Older runtime attempts are not publication evidence.
- A 100% coverage report with 0/0 means no executable denominator, not measured runtime coverage. Record the type-only change as N/A.
- Local focused suites passed 437 tests; final full diff gate passed. Self-review found no actionable findings. Handoff domain is empty. Live trades/funding, Firefox runtime, full E2E and all upstream features remain outside proof.

## Historical blocked-run notes

# Learnings

The provenance-locked mm-harness 0.81.0 check diff command picks oxfmt whenever oxfmt.config.mts exists, passing all changed JSON files without respecting the repository's formatter split. This repository excludes **/*.json from oxfmt and uses Prettier for JSON. With a manifest/lockfile/policy-only dependency bump, both the fix and check commands return exit 2, Expected at least one target file.

Confirmed in the installed dist/commands/check.js runFormatterCheck and runFormatterFix: selection is based only on config presence, with no supported formatter override. CLI check help advertises no override. Do not remove repository ignore rules, add unrelated source files, change the diff base, replace tool binaries, or mutate the locked harness to obtain a pass. The harness needs JSON/code formatter routing fixed in a new immutable release, followed by explicit task resume/re-resolution.

Dependency installation, deduplication, allow-scripts reconciliation and LavaMoat policy regeneration passed. All eight browser/build policies received the same utils dependency path changes. No source compatibility edits were required. Baseline proof passed the live read-only Perps guard and failed only at ac1-version on ^17.1.0, as designed. Capture-helper screenshots were inspected.

Task stopped at step 12; no final upgraded runtime proof, focused Jest, self-review, or commit was performed.

## Local closeout

Commit: eb24ce78b01d4a79d0d2ed420fcf4c2d72238bf6, chore(perps): upgrade perps controller to 19.0.0. Exactly 13 product paths; working tree clean. Task artifacts stay ignored/uncommitted. No push or GitHub PR write.


## Follow-up recovery and stability

The Lead removed the orphaned checkout Chrome listener on CDP 7666. Pinned relaunch verification then passed. The unchanged final recipe passed twice after separate fresh reloads, 14/14 each, with both capture-helper PNGs inspected and full-run videos retained in recipe-stability-a and recipe-stability-b. The old Money-adapter mutations error recurred in A while Perps passed; B had no such run-scoped error. evidence-gate.md retains the mechanism, timestamps and historical launcher failures. Do not infer an install race from the earlier missing .cjs search: v19 exports ESM .js files.
