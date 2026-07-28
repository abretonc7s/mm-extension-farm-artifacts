# Learnings: PR #44324 interactive re-entry

## Analytics wiring (Extension ↔ Mobile parity)

- Screen-view gating pattern: any page with both a normal and an error screen view must gate the normal one on the subject existing (`Boolean(market)`) and give the error one a `resetKey`, or one rendered error screen emits two events and consecutive bad symbols emit one. Fixed on market detail (`10dc57c04b`) and order entry (`1f0c8327c3`) — check this pattern on any new perps screen pair.
- Screen views for a modal belong in the modal, not at its trigger sites: the geo-block notice has 17 triggers across 11 hosts, and one declarative `usePerpsEventTracking({conditions: isOpen})` covers all of them once per open. The cost is losing per-trigger `source` (Mobile sends it), which would need per-trigger state in the 3 hosts whose triggers share one open flag.
- Import shared hooks from their module, not the `hooks/perps` barrel, in components rendered by many hosts: several suites partially mock the barrel, so a barrel import surfaces as `usePerpsEventTracking is not a function` at render in unrelated tests.
- `react-compiler` forbids mutating a hook argument, so a hook cannot reset a caller's `hasCommittedRef`. Reset belongs in the caller's own open/reset effect. Mobile's version does mutate the ref — do not copy that part.
- Extension-only analytics property keys (`query_count`, `time_in_search_ms`, `time_to_tap_ms`) go in the alias layer of `shared/constants/perps-events.ts`; inline snake_case object keys trip `@typescript-eslint/naming-convention`.
- `test/mocks/metamask-perps-controller.js` is a hand-maintained subset. Any new contract value read by product code must be added there or tests silently see `undefined` and assertions fail on missing properties rather than on the real defect.

## Recipes

- Grepping for identifier strings proves text, not behaviour, and rots silently: `ac4` passed for weeks on a stale `hlFeeRate: closeFeeRate` pattern after the local was renamed. Prefer `command` nodes running the owning Jest suites; keep greps only for contract-level names (package version, `MetaMetricsEventName.*`) and absence claims.
- Run multi-suite Jest nodes with `--runInBand`. Perps suites use `userEvent` with a 5.5s per-test timeout and flake under parallel load; both flakes seen this session passed on an idle re-run.
- `ui.navigate page=perps-market` clicks visible market rows, so it cannot reach a nonexistent symbol. Use the verified hash route (`#/perps/market/<symbol>`), and confirm it with `mm-harness call ui.navigate` before writing it into a recipe.
- Recipe Protocol v1 (harness ≥0.22) requires `$schema` + top-level `workflow`, rejects `schema_version`/`validate.workflow`, rejects `intent` on end nodes, and rejects intents that restate the action rather than the human-visible goal. Inherited pre-v1 recipes fail validation outright — migrate before trusting a re-entry.

## Runtime / environment

- **A failed `mm-harness run` leaves the previous run's `summary.json` in place.** Two runs died at browser readiness and the stale artifact still said `pass 18/18`. Always check `startedAt` against the current run before reporting a recipe result.
- Headed CDP proof dies on an idle Mac: `compositor: {status: "suspended", reason: "requestAnimationFrame did not advance within 1000ms"}`. Not port contention — it reproduced on a free port. Wrap long recipe runs in `caffeinate -disu`.
- `mm-harness launch --build --verify` fails on this slot with `Refusing to launch on CDP port 6662: it is held by a browser this harness did not launch`. The build half still completes, and `mm-harness run` is unaffected because it launches its own validation browser. Do not kill the orchestrator's browser to work around it.
- The dist-freshness gate compares dist to `HEAD`, so commit before building or the recipe aborts with `EXTENSION_RUNTIME_NOT_CURRENT`.

## Process

- Never `git stash push` without confirming the tree is actually dirty: on a clean tree the push is a no-op and the following `pop` pops someone else's stash. It conflicted into two unrelated files here; recovery is a targeted `git checkout HEAD -- <paths>` (the failed pop keeps the stash entry).
- Ticket bullets are worth auditing individually against the diff. TAT-3175 bullet 4 and TAT-3136 / TAT-3144 / TAT-3202 were all absent from the PR and absent from its deferred list — found only by reading the tickets, not the PR body.
