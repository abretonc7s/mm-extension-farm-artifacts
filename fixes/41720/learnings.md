# Learnings — TAT-2794

- **Fix already in main:** The bug was resolved in PR #41696 (TAT-2911) before this task's branch was created. Checking `git log --oneline -5 -- <file>` early would have surfaced this immediately — saves all investigation time.

- **PR number gap:** `1097d7a4fa` fixed both TAT-2794 and TAT-2911 but only referenced the latter. Cross-referencing related PRs in the ticket would close the loop faster.

- **Screen recording fails silently:** `record-window.sh` outputs "output file not created" with no diagnostic detail when ScreenCaptureKit permissions are missing. The fix: check `tccutil status ScreenCapture` before attempting recording so the agent can skip video gracefully without repeated failed attempts.

- **Recipe assertion field paths:** `last.field` syntax doesn't work for `eval_sync` results — use the JSON key directly (e.g., `"field": "hasPercent"` not `"field": "last.hasPercent"`). This cost 3 retry loops before the correct pattern was found.
