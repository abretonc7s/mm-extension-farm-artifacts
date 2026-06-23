# PR #43686 — Interactive PR-complete report

**PR:** feat(perps): A/B test "New" badge on Perps tab label in wallet overview
**Branch:** `TAT-3382-feat-add-perps-new-badge`
**Mode:** interactive re-entry, operator-supervised. Operator explicitly confirmed completion.

## Summary

Re-opened PR #43686 with inherited Farmslot family context. Triaged all live PR comments. One review comment (geositta) was REAL and required a code change; the rest (3 cursor-bot, 1 migration question) were false positives / no-change. Applied the minimal fix, validated, committed, pushed, and replied to geositta. Operator handled the michal migration reply directly.

## Files changed

| File | Change |
|---|---|
| `test/e2e/feature-flags/feature-flag-registry.ts` | `perpsTAT3382AbtestTabBadge.productionDefault`: `{ enabled: false }` → exact production version-scoped threshold array (`{ versions: { '13.37.0': [control 0.5, treatment 1] } }`). Test-only file; no production/runtime code touched. |

## Commits (pushed to origin)

- `9e38d8c460` — test(perps): use threshold array for badge A/B flag (initial)
- `eb67e67894` — test(perps): mirror exact production value for badge A/B flag (corrected to operator-confirmed dashboard value)

## Validation (exact results)

- `yarn lint:changed` → PASS (feature-flag-registry.ts)
- `yarn verify-locales --quiet` → "No invalid entries!"
- `yarn circular-deps:check` → "Circular dependencies check passed." (clean run earlier in session)
- `yarn jest test/e2e/feature-flags/feature-flag-registry.test.ts test/e2e/feature-flags/sync-production-flags.test.ts --no-coverage` → 26 passed, 26 total
- `metamask-recipe runtime-health` → status PASS, CDP 6661, extension `hebhblbkkdabgoldnojllkipeoacjioc`
- Control recipe run → `ui.wait_for` timeout (runtime/timing, unrelated to test-only registry change; registry default only feeds the Playwright E2E mock, not the live recipe). Not a regression.

## Comments handled

- **geositta** (REAL): registry flag shape → fixed + thread replied/updated (`#discussion_r3460274214`).
- **michalconsensys** (migration question): no migration needed (new defaulted AppState field, spread before persisted state). Operator replied directly.
- **cursor[bot] ×3**: all false positives / outdated against current HEAD (setter binding present, trace-name not event-name, dismissal gated on `isPerpsExperienceAvailable`).

## Committed / pushed?

**Yes** — operator explicitly requested commit + push during this interactive session. Both commits are on `origin/TAT-3382-feat-add-perps-new-badge`. CI + review bots re-running on push.

## Remaining manual work

- michal migration thread: operator replied directly; resolve thread if satisfied.
- geositta thread: reply posted; resolve once geositta acks.
- No fresh approval expected to be required — michalconsensys already APPROVED and MetaMask does not dismiss stale approvals on push (verify if repo policy differs).
