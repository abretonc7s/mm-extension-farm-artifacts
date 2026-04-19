# Recipe Coverage Matrix — TAT-2965

| # | AC (verbatim) | Target env | Recipe nodes (IDs) | Screenshot filename | Visual verdict | Justification |
|---|---------------|------------|---------------------|---------------------|----------------|---------------|
| 1 | After navigating from the market list to a market detail page and pressing back, the user returns to the market list (not wallet home). | fullscreen (home.html) | ac1-press-back, ac1-wait-for-market-list, ac1-assert-on-market-list, ac1-screenshot-back-result | after-ac1-after-back-on-market-list.png | PROVEN | Screenshot clearly shows the Markets list page with "Markets" header and market rows visible after pressing back. The assertion confirmed `market-list-view` testID is present. |
| 2 | After navigating from wallet home (explore markets section) to a market detail page and pressing back, the user returns to wallet home (not a broken/unexpected route). | fullscreen (home.html) | ac2-press-back, ac2-wait-for-home, ac2-assert-on-home, ac2-screenshot-back-home | after-ac2-after-back-on-home.png | PROVEN | Screenshot shows wallet home page on Perps tab with "Explore markets" section visible after pressing back. The assertion confirmed `account-menu-icon` testID is present and `perps-market-detail-page` is absent. |

Overall recipe coverage: 2/2 ACs PROVEN (untestable: none, weak: 0, missing: 0)
