# Learnings: TAT-2830

- **Investigation was fast, fix was trivial.** Root cause was obvious from code reading — hardcoded em-dash and wrong i18n key. The close-position modal in the same directory had the correct fee pattern to copy from. Total code change: ~15 lines.
- **Video recording flaky.** `record-window.sh` failed consistently (both `--pid` and `--window-name` modes). Workaround: CDP screenshots via recipe `screenshot` action. Recipe screenshots are more reliable evidence than screen recordings anyway.
- **Position injection via stateHooks works well.** `perpsInjectPositions()` lets recipes test position-dependent UI without real funded accounts or live API calls. This is the right pattern for all perps modal validation.
- **Mobile-extension map saved time.** Checking `PerpsFlipPositionConfirmSheet.tsx` immediately confirmed the 2x multiplier for flip fee calculation. Without it, would have needed to reason about whether flip is 1x or 2x from first principles.
- **`perps.sufficient_balance` pre-condition blocks mock-only recipes.** Had to remove it from recipe pre-conditions since injected positions don't come with real balances. The `prime-perps-state` flow call is sufficient for priming the stream manager.
