| # | AC (verbatim) | Target env | Recipe nodes (IDs) | Screenshot filename | Visual verdict | Justification |
|---|---------------|------------|---------------------|---------------------|----------------|---------------|
| 1 | Expected behavior: If my position has +30% RoE, I should be able to input a SL of +15% RoE. | fullscreen | ac1-enter-positive-sl, ac1-screenshot-positive-sl | after-evidence-ac1-positive-sl-sign.png | PROVEN | Trace shows `slPercent` as `+14.99` with `hasPositiveSign: true`; screenshot visibly shows the Stop loss percent field with `+14.99%` after blur. |
| 2 | Expected behavior: If my position has a -30% RoE, I should be able to input a TP of -15%. | fullscreen | ac2-enter-negative-tp, ac2-screenshot-negative-tp | after-evidence-ac2-negative-tp-sign.png | PROVEN | Trace shows `tpPercent` as `-14.99` with `hasNegativeSign: true`; screenshot visibly shows the Take profit percent field with `-14.99%` after blur. |
| 3 | Comment: When I have a long position and input “5” in stop loss, it should be -5. | fullscreen | ac3-enter-unsigned-sl, ac3-screenshot-unsigned-sl | after-evidence-ac3-unsigned-sl-negative.png | PROVEN | Trace shows unsigned SL input became `-5` with `defaultedNegative: true`; screenshot visibly shows the focused Stop loss percent field as `-5%`. |

Overall recipe coverage: 3/3 ACs PROVEN (untestable: none, weak: 0, missing: 0)
