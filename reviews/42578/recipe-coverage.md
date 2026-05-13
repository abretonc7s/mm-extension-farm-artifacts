# Recipe Coverage Matrix

Source: PR body claims (no Jira acceptance criteria specified)

| # | AC (verbatim) | Target env | Recipe nodes (IDs) | Screenshot filename | Visual verdict | Justification |
|---|---------------|------------|---------------------|---------------------|----------------|---------------|
| 1 | "Then the modal title shows 'Filter' centered" | fullscreen | ac1-open-sort-modal, ac1-wait-sort-modal, ac1-assert-modal-open, ac1-assert-title-filter | evidence-ac1-5-sort-modal-design-*.png | PROVEN | Screenshot shows "Filter" title centered in modal header; assertion confirmed text content equals "Filter" |
| 2 | "And the modal displays a 'SORT BY' section header above the sort field options" | fullscreen | ac2-assert-sort-by-header | evidence-ac1-5-sort-modal-design-*.png | PROVEN | Screenshot shows "SORT BY" header above Volume/Price change/etc; assertion confirmed text presence |
| 3 | "And the modal displays a 'RANK' section header above the direction options" | fullscreen | ac3-assert-rank-header | evidence-ac1-5-sort-modal-design-*.png | PROVEN | Screenshot shows "RANK" header above High to low/Low to high; assertion confirmed text presence |
| 4 | "And a border separator divides the two sections" | fullscreen | ac4-assert-border-separator | evidence-ac1-5-sort-modal-design-*.png | PROVEN | Assertion confirmed border-bottom on last sort field option (fundingRate); visually confirmed in screenshot |
| 5 | "Then the selected option has a grey background highlight AND the selected option does not use blue text or accent AND a checkmark icon appears on the selected option" | fullscreen | ac5-assert-selected-bg, ac5-screenshot-sort-modal, ac5-select-different-field, ac5-assert-new-selection-bg, ac5-screenshot-selection-change | evidence-ac1-5-sort-modal-design-*.png, evidence-ac5-selection-change-*.png | PROVEN | Assertions confirmed bg-hover class on selected item, checkmark SVG present, no blue text (TextDefault color). Selection change screenshot shows bg/check moves correctly. |
| 6 | "Then the currently selected filter option has a grey background AND all option text uses the default color" | fullscreen | ac6-open-filter-dropdown, ac6-assert-menu-visible, ac6-assert-filter-selected-bg, ac6-assert-unselected-text-default, ac6-screenshot-filter-dropdown | evidence-ac6-filter-dropdown-selected-*.png | PROVEN | Screenshot shows "All" selected with grey bg and checkmark; assertion confirmed bg-hover class and aria-selected="true". Text color assertion confirmed selected and unselected options use same TextDefault color. |

Overall recipe coverage: 6/6 ACs PROVEN (untestable: none, weak: 0, missing: 0)
