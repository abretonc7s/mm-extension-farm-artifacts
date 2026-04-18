# Learnings — TAT-2947

- **Three bugs, one symptom**: The sign-input bug had three interlocking root causes (sign stripped in `formatRoePercent`, isTP inversion in price conversion, `+` blocked in regex). Identifying all three required reading both `update-tpsl-modal-content.tsx` and `auto-close-section.tsx` in full rather than just the area described in the ticket.

- **isTP pattern as smell**: The `isTP: boolean` parameter threading through `priceToPercent`/`percentToPrice` was the primary source of confusion. A unified signed convention where positive = profitable is simpler and matches mobile's approach. The pattern of flipping signs based on TP/SL context should be a code review red flag.

- **Test comments with wrong position**: Tests written in the previous session referenced "ETH: entry=2850" but actually used `mockPositions[2]` (SOL: entry=95, leverage=10). This caused two test failures on resume. Always verify the position variable against `mocks.ts` rather than trusting comment arithmetic.

- **SL presets need negation**: SL presets are labeled "-5%", "-10%" etc. (loss magnitude), but under the signed convention the value passed to `percentToPriceForEdit` must be negated (`-percent`) to express as signed RoE. Missed this initially and had to add `handleSlPresetClick` fix.

- **Extension reload required**: After pushing the fix, the page needs an explicit `Page.reload()` CDP call before the recipe will see the new code. `yarn start` rebuilds don't hot-reload the extension automatically.
