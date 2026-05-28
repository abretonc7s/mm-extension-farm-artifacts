# Learnings — Review of PR #42613 (close-all-positions confirmation modal)

- **CDP eval target matters for perps state.** `stateHooks.submitRequestToBackground(...)` lives on the extension **page** (home.html), NOT on the service worker. A `Runtime.evaluate` against `service-worker.js` returns `"stateHooks.submitRequestToBackground is not a function"`. Use the `home.html` page target (or the recipe runner, which targets the page) for `perpsGetPositions`/`perpsCalculateFees` probes.

- **The assert lib supports fewer operators than the TASK.md reference table.** `lib/assert.js` has `eq/neq/lt/gt/lte/gte/exists/not_null/truthy/falsy/contains/not_contains/matches/one_of/length_*/deep_eq/`. It does NOT support `starts_with`, `is_true`, or `is_false` (the recipe Reference section lists them but they error at runtime with "Unknown operator"). Use `contains`/`matches` for prefix checks and `eq …value:true` for booleans.

- **Recipe paths must be absolute (or repo-root-relative) — not cwd-relative.** Running `validate-recipe.js` from `temp/agentic/recipes`, a `temp/tasks/...` path resolves to `temp/agentic/recipes/temp/tasks/...` and fails ENOENT. Pass the absolute recipe path.

- **Screenshots land in `artifacts/screenshots/`, not `artifacts/evidence/`.** The runner writes per-node screenshots (timestamped) under `screenshots/` next to `summary.json`/`trace.json`. trace nodes carry `ok: true/false` (not `status`). `recipe-issues-review.md` summarises console noise — was `clean` here.

- **Destructive ACs need a non-live proof strategy.** AC3 (confirm → real `perpsClosePositions {closeAll:true}` on a funded mainnet account) and AC5 (requires zero positions) are irreversible/unreachable on a live slot. Prove them via the un-skipped `perps-view.test.tsx` ("calls batch close after confirmation", "does not execute close all when cancelled") and the code path (`{hasPositions && …}` in `perps-positions-orders.tsx`) rather than executing on real funds. A stronger future recipe would stub the background call via CDP and assert the `{closeAll:true}` payload.

- **Perps close-all modal selectors (reusable):** button `perps-close-all-positions`; modal `perps-close-all-positions-modal`; submit `perps-close-all-positions-modal-submit`; cancel `perps-close-all-positions-modal-cancel`; values `perps-close-all-total-margin-value` / `perps-close-all-fees-value` / `perps-close-all-receive-value`. Position cards: `position-card-<SYMBOL>` (filter out `position-card-roe-<SYMBOL>`). Fees show `--` until loaded — `wait_for` on `textContent !== '--'` before screenshotting.

- **Mobile is source of truth — the math matches.** Extension `close-all-positions-modal.tsx` mirrors mobile `usePerpsCloseAllCalculations.ts`: `receive = totalMargin − totalFees`, `marginUsed` is PnL-inclusive (do NOT add unrealizedPnl to receive), per-symbol fee rates, uniform discount `rate × (1 − bips/10000)`. Extension intentionally omits the rewards/points display and uses `PERPS_FALLBACK_FEE_RATES` on fee-fetch failure (mobile leaves fees undefined). Useful for future perps-parity reviews.

- **Baseline-noise guards that prevented bad comments:** `yarn lint:tsc` exits 0 with NO stdout on success (don't mistake empty output for a crash). The `.metamaskprodrc` webpack cache warning is a known non-gating dev warning. The global `@metamask/perps-controller` jest `moduleNameMapper` stub is intentional (fixes ESM transitive imports) — not a smell to flag.

- **Independent rounding produces cent-level display drift.** When margin/fees/receive are each `Math.round(x*100)/100`'d separately, the displayed rows may not reconcile (observed $6.43 − $0.03 ≠ $6.41). Worth a nitpick, not a blocker — common pattern in summary modals.
