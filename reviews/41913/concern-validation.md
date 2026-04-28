# Concern Validation

- Potential concern checked: pending toast may appear before confirmation. Validation: recipe node `ac2-set-unapproved-deposit` plus `ac2-assert-unapproved-hides-toast` proved unapproved deposits do not render the Perps toast.
- Potential concern checked: stale submitted Perps deposit transactions may keep the toast alive. Validation: recipe nodes `ac2-set-stale-submitted-current-confirmed` and `ac2-assert-current-confirmed-stale-submitted-hides-toast` proved the selector scopes to `lastDepositTransactionId`.
- Potential concern checked: token-funded deposits may still show Perps-owned toasts. Validation: recipe nodes `ac4-*` proved pending and completion states with a non-native payment token do not render `perps-deposit-toast`.
- Potential concern checked: native-funded deposits may lose Perps-specific completion toast. Validation: recipe nodes `ac3-*` proved native confirmed deposit result renders the success toast.
- No remaining speculative concerns are included in the review.
