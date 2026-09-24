# PR #46607 comment triage

| # | Author | File | Triage | Action |
|---|--------|------|--------|--------|
| 1 | CI (Test lint) / operator | ui/pages/perps/perps-order-entry-page.tsx:2366 | REAL | TS2339: `BUTTON_TYPE` used by #45986 (landed on main) after this PR removed the alias. Switched to `BUTTON_CLICKED`. |
| 2 | CI (Test lint) / operator | ui/pages/perps/perps-order-entry-page.test.tsx:2033 | REAL | Same TS2339; expectation now asserts `button_clicked: deposit` and absence of `button_type`. |

Skipped status-only automation: 4 issue comments (github-actions CLA, metamask-ci codeowners, metamask-ci builds, sonarqubecloud). No inline review comments, no REQUEST_CHANGES reviews.

## Summary

- Total comments: 2 actionable (2 REAL, 0 FALSE POSITIVE, 0 OUT OF SCOPE). Source: the Test lint CI job (TS2339), reported by the operator. There were no reviewer comments to reply to.
- Fix commit: `a3b0d9f1b3`. Files: `ui/pages/perps/perps-order-entry-page.tsx`, `ui/pages/perps/perps-order-entry-page.test.tsx`
- Integration: `rebased` onto origin/main (ca97b63ed4), pushed with lease from `d238873a38`.
- Typecheck: full `tsc --noEmit` exit 0. Jest: 3 perps suites, 264 passed. The `check diff --profile fast` and pre-commit parity gates pass.
- Recipe re-validation: PASS (19/19, `recipe-run/`). The Perps entry selector now matches both the tab and bottom-nav layouts. The collector was pinned to 8667 via `SEGMENT_MOCK_PORT` to match the build's SEGMENT_HOST.
- Independent review: Codex `gpt-6-sol` on `a3b0d9f1b3` (`codex-review-a3b0d9f1b3.md`): no findings, 5 suites / 332 tests passed.
- CI on a3b0d9f1b3: Test lint PASS (previously TS2339); 103 pass, 0 fail, 27 pending (e2e shards) at signal time.
