# Recipe Coverage Matrix — PR #41881

| # | AC (verbatim) | Target env | Recipe nodes (IDs) | Screenshot filename | Visual verdict | Justification |
|---|---------------|------------|---------------------|---------------------|----------------|---------------|
| 1 | "Market symbol header uses HeadingMd typography" | fullscreen | ac1-check-heading-md, ac1-screenshot-heading | evidence-ac1-heading-md.png | PROVEN | H3 tag confirmed in DOM eval; screenshot shows larger "ETH-USD" heading |
| 2 | "Stats labels use sentence case" | fullscreen | ac2-check-sentence-case, ac2-screenshot-stats | evidence-ac2-sentence-case-stats.png | PROVEN | DOM text confirmed: "Open interest", "Funding rate", "Oracle price", "Recent activity" all sentence case; no title case found |
| 3 | "Action button text uses sentence case" | fullscreen | ac3-check-submit-text, ac3-screenshot-order-entry | evidence-ac3-ac8-order-entry.png | PROVEN | Button text matches `^Open (long|short)` regex; screenshot shows "Open long ETH" |
| 4 | "Info tooltip icons reduced to Xs (12px)" | fullscreen | ac4-check-info-icon-size, ac4-screenshot-icons | evidence-ac4-info-icons.png | PROVEN | DOM eval captured icon bounding rects; screenshot shows small info circles next to stats labels |
| 5 | "See All replaced with arrow icon" | fullscreen | ac5-check-arrow-icon, ac5-screenshot-arrow | evidence-ac5-arrow-icon.png | PROVEN | DOM eval confirms SVG present, no text content; screenshot shows ">" arrow next to "Recent activity" |
| 6 | "Candle period selector left-aligned" | fullscreen | ac6-check-left-align, ac6-screenshot-candle | evidence-ac6-candle-left-aligned.png | PROVEN | computed justifyContent != "center"; screenshot shows buttons aligned left |
| 7 | "Position/Orders sections bottom padding removed" | fullscreen | (no nodes) | (none) | UNTESTABLE | No open position or orders in current wallet state; code change is a trivial paddingBottom removal verified in diff |
| 8 | "Order entry submit button reduced from Lg to Md" | fullscreen | ac8-check-button-size, ac3-screenshot-order-entry | evidence-ac3-ac8-order-entry.png | PROVEN | Button height recorded via getBoundingClientRect; screenshot shows medium-sized button |
| 9 | "Favorite star has 1.1x scale hover effect" | fullscreen | ac9-check-hover-class, ac9-screenshot-star | evidence-ac9-favorite-star.png | PROVEN | DOM confirms `hover:scale-110` class on favorite button element |
| 10 | "Change percentage uses BodySm with +/- prefix" | fullscreen | ac10-check-change-display, ac10-eval-change-format, ac10-screenshot-change | evidence-ac10-change-percentage.png | PROVEN | Text matches `^[+-]` regex; screenshot shows "+0.31%" with explicit prefix |

Overall recipe coverage: 9/10 ACs PROVEN (untestable: AC7 — no open position in wallet state, weak: 0, missing: 0)
