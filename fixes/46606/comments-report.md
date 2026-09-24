# PR #46606 comment triage

GitHub: 0 inline review comments, 0 CHANGES_REQUESTED reviews, 4 issue comments (CLA, CODEOWNERS, builds-ready, SonarCloud), all status-only automation, skipped without replies.

Actionable input: private Codex gpt-6-sol review (run 7d676c30), carried in TASK.md, not posted on GitHub.

| # | Author | File | Triage | Action |
|---|--------|------|--------|--------|
| 1 | codex (private review) | ui/pages/perps/perps-order-entry-page.tsx:952 | REAL | Gate `usePerpsAbandonOrderTracking.active` on `market?.symbol === decodedSymbol` so the redirect render never starts an abandon session; add redirect teardown test proving no `abandon_order` |

## Result

- Total comments: 1 (1 REAL, 0 FALSE POSITIVE, 0 OUT OF SCOPE); 4 status-only bot comments skipped.
- Fix commit: a16719e3fe (on top of rebased 822a7399fe). Pushed with lease over b2114111b9.
- Files changed: `ui/pages/perps/perps-order-entry-page.tsx` (abandon `active` gated on `market && market.symbol === decodedSymbol`; the `market` guard avoids `undefined === undefined` when there is no symbol), `ui/pages/perps/perps-order-entry-page.test.tsx` (redirect teardown test).
- Unit: full file 159/159. New test fails with the fix stashed.
- Replies: none posted. The finding came from a private review that was never on GitHub; no inline threads to resolve.
- Integration: rebased onto origin/main (`integration-status.txt` = rebased); yarn.lock changed, `yarn install --immutable` run.
- Validation: `check diff --profile fast` pass; coverage PASS (new lines 100%); final gate `lint:changed && verify-locales && circular-deps:check` pass.

## Recipe re-validation: PASS (44/44)

- Added `metamask.analytics.start_capture`, a flush+reset `command` before each lower-cased landing, and `assert_events` after each redirect: exactly 1 trading `Perp Screen Viewed` for the canonical asset and 0 `abandon_order`.
- Negative control `recipe-negative-control.json`: leaving the redirected form uncommitted makes the same assertion FAIL (`abandon_order` got 1). Run: `recipe-run-negative-control/`.
- Honest limit: in production the route element persists across the `:symbol` change (no remount), so the pre-fix build also emits 0 `abandon_order` live. The review scenario (unmount during the redirect render) is proven by the unit test; the live nodes guard against regressions.
- Recipe repairs needed after rebase: `127.0.0.1:7666` → `7664` (7666 is slot 6), return-home gate tolerates `?landing=` query, `ui.navigate page: perps` → `hash: #/perps-home`.
- Runtime: webpack relaunched with `SEGMENT_HOST=http://localhost:8664` and a dummy `SEGMENT_WRITE_KEY` so events reach the collector. The slot build now carries that host until the next plain relaunch.
- One screenshot (`evidence-ac2-modify-form-route.png`) fell back to CDP; PR body evidence images are unchanged from the prior capture-helper run.

## Framework issues (not patched in repo)

- `metamask.analytics.set_consent` throws on read-back: checks `dataCollectionForMarketing`, replaced by `optedInToMarketing` in #46473. The controller calls succeed before the check.
- `ui.navigate page: perps` waits for `perps-view`, absent after main's layout refactor; times out on the Perps tab.

## Not done (gated by task)

- Fresh final-HEAD independent Codex gpt-6-sol review and green CI are still required before publish/merge. PR body recipe block not updated.
