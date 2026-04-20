# Recipe Coverage Matrix — TAT-2847

| # | AC (verbatim) | Target env | Recipe nodes (IDs) | Screenshot filename | Visual verdict | Justification |
|---|---------------|------------|---------------------|---------------------|----------------|---------------|
| 1 | The hero amount input (`$` symbol + number) is horizontally centered in the withdraw flow screen when a non-zero amount is entered | home.html (fullscreen) | `ac1-click-ten-percent`, `ac1-wait-non-zero-amount`, `ac1-assert-full-width-centered`, `ac1-screenshot-centered` | `after-ac1-withdraw-input-centered.png` | PROVEN | Screenshot shows `$2.789843` with equal margins. Bounding-box eval: `heroFillsParent=true, contentCentered=true, widthRatio=1.0`. Before fix: `heroFillsParent=false, widthRatio=0.82`. |

Overall recipe coverage: 1/1 ACs PROVEN (untestable: none, weak: 0, missing: 0)
