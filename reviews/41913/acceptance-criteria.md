# Acceptance Criteria

Source: PR body plus linked ticket description because the task's `## Acceptance Criteria` section is `_Not specified_`.

1. Pending Perps deposit toast is derived from the active `perpsDeposit` / `perpsDepositAndOrder` transaction lifecycle after user confirmation.
2. Pending Perps deposit toast appears only while the active deposit transaction is in `approved`, `signed`, or `submitted`; it does not appear for unapproved, rejected, confirmed, failed, dropped, unrelated, stale, or missing active transactions.
3. Native-token-funded Perps deposits remain owned by the Perps toast flow, including pending and completion/error deposit toasts.
4. Non-native pay-token-funded Perps deposits defer to Transaction/Confirmations-owned toast behavior and do not show Perps deposit toasts.
5. Perps order submission toasts are suppressed while an active Perps deposit is pending to avoid overlapping Perps toast flows.
6. Generic transaction toast eligibility excludes Perps deposit-related transaction types, including `perpsDeposit`, `perpsDepositAndOrder`, and `perpsRelayDeposit`, to avoid duplicate transaction confirmed toasts.
7. The change remains aligned with mobile Perps deposit toast behavior where extension has equivalent support.
