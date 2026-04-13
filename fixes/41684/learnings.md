# Learnings — TAT-2830

- **Fix was trivial, reproduction setup was the bottleneck.** The code change was ~15 lines but getting the reverse position modal open via CDP required injecting a mock position into PerpsStreamManager, navigating through the market detail page, and clicking through the modify menu. Knowing the exact testID chain (`perps-modify-cta-button` → `perps-modify-menu-reverse-position` → modal) upfront would have saved time.
- **Page reload required after webpack rebuild.** No HMR in this setup — first recipe run after fix failed because the extension page still served stale code. Always reload via CDP `Page.reload()` before validating.
- **`before.mp4` recording via background process is fragile.** The `record-window.sh` script's moov atom finalization fails when the bash tool kills the process. The `after.mp4` recording worked when the recipe ran quickly and the kill timing was right. Consider using `--max-duration` flag instead of manual SIGTERM.
- **close-position-modal.tsx is the canonical reference** for any reverse-position-modal work — same fee calculation pattern, same formatter, same constant.
