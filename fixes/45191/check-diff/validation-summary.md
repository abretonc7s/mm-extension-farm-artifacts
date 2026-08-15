# mm-harness check diff

Verdict: pass
Profile: fast
Fix: no
Base: origin/main (github-pr: main)
Changed files: 10

## Checks

- PASS policy-suppressions (/Volumes/FD/dev/metamask/metamask-extension-3/temp/tasks/fix/45191-0815-091925/artifacts/check-diff/policy-suppressions.log)
- PASS eslint (/Volumes/FD/dev/metamask/metamask-extension-3/temp/tasks/fix/45191-0815-091925/artifacts/check-diff/eslint.log)
- PASS oxfmt (/Volumes/FD/dev/metamask/metamask-extension-3/temp/tasks/fix/45191-0815-091925/artifacts/check-diff/oxfmt.log)
- PASS jest (/Volumes/FD/dev/metamask/metamask-extension-3/temp/tasks/fix/45191-0815-091925/artifacts/check-diff/jest.log)
- SKIP typecheck — profile=fast; run with --profile full for repo-wide typecheck

## Changed Files

- app/_locales/en/messages.json
- app/_locales/en_GB/messages.json
- ui/hooks/perps/coalesceBackgroundRequest.ts
- ui/pages/confirmations/hooks/alerts/constants.ts
- ui/pages/confirmations/hooks/alerts/transactions/usePerpsWithdrawInsufficientBalanceAlert.test.ts
- ui/pages/confirmations/hooks/alerts/transactions/usePerpsWithdrawInsufficientBalanceAlert.ts
- ui/pages/confirmations/hooks/transactions/useTransactionCustomAmountAlerts.test.ts
- ui/pages/confirmations/hooks/transactions/useTransactionCustomAmountAlerts.ts
- ui/pages/confirmations/hooks/useConfirmationAlertMetrics.test.ts
- ui/pages/confirmations/hooks/useConfirmationAlertMetrics.ts
