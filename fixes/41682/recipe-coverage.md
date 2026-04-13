# Recipe Coverage Matrix

| # | AC (verbatim) | Target env | Recipe nodes (IDs) | Screenshot filename | Visual verdict | Justification |
|---|---------------|------------|---------------------|---------------------|----------------|---------------|
| 1 | In the "Reverse position" modal, the Fees row displays a calculated fee amount instead of "—" | fullscreen | ac1-press-modify, ac1-wait-menu, ac1-press-reverse, ac1-wait-modal, ac1-assert-fee-displayed, ac1-screenshot-fee | after-ac1-fee-displayed.png | PROVEN | Screenshot shows Fees row with "-<$0.01". Trace confirms feeText="-<$0.01" and hasFee=true. |
| 2 | In the "Reverse position" modal, the submit button text reads "Confirm" instead of "Save" | fullscreen | ac2-assert-confirm-button, ac2-screenshot-confirm | after-ac2-confirm-button.png | PROVEN | Screenshot shows "Confirm" button. Trace confirms buttonText="Confirm" and isConfirm=true. |

Overall recipe coverage: 2/2 ACs PROVEN (untestable: none, weak: 0, missing: 0)
