# Recipe Coverage Matrix

| # | AC (verbatim) | Target env | Recipe nodes (IDs) | Screenshot filename | Visual verdict | Justification |
|---|---------------|------------|---------------------|---------------------|----------------|---------------|
| 1 | Flip fee is displayed: The "Reverse position" modal must show a computed fee value (e.g. `$0.XX`) in the Fees row, not a dash (`—`). | fullscreen | ac1-assert-fee-not-dash, ac1-screenshot-fee | after-ac1-fee-visible.png | PROVEN | Screenshot shows "Fees $0.22" in the modal. Trace confirms `feeText: "$0.22"`. Before screenshot showed "—". |
| 2 | Button says "Confirm": The submit button in the "Reverse position" modal must read "Confirm", not "Save". | fullscreen | ac2-assert-confirm-button, ac2-screenshot-confirm | after-ac2-confirm-button.png | PROVEN | Screenshot shows "Confirm" button. Trace confirms `text: "Confirm"`. Before screenshot showed "Save". |

Overall recipe coverage: 2/2 ACs PROVEN (untestable: none, weak: 0, missing: 0)
