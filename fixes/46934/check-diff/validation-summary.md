# mm-harness check diff

Verdict: pass
Profile: fast
Fix: no
Base: origin/main (github-pr: main)
Changed files: 39

## Checks

- PASS policy-suppressions (/Volumes/FD/dev/metamask/metamask-extension-3/temp/tasks/fix/46934-1009-163330/artifacts/check-diff/policy-suppressions.log)
- PASS eslint (/Volumes/FD/dev/metamask/metamask-extension-3/temp/tasks/fix/46934-1009-163330/artifacts/check-diff/eslint.log)
- PASS oxfmt (/Volumes/FD/dev/metamask/metamask-extension-3/temp/tasks/fix/46934-1009-163330/artifacts/check-diff/oxfmt.log)
- PASS jest (/Volumes/FD/dev/metamask/metamask-extension-3/temp/tasks/fix/46934-1009-163330/artifacts/check-diff/jest.log)
- SKIP verify-locales — no app/_locales changes
- PASS circular-deps (/Volumes/FD/dev/metamask/metamask-extension-3/temp/tasks/fix/46934-1009-163330/artifacts/check-diff/circular-deps.log)
- SKIP typecheck — profile=fast; run with --profile full for repo-wide typecheck

## Changed Files

- lavamoat/webpack/mv2/beta/policy.json
- lavamoat/webpack/mv2/experimental/policy.json
- lavamoat/webpack/mv2/flask/policy.json
- lavamoat/webpack/mv2/main/policy.json
- lavamoat/webpack/mv3/beta/policy.json
- lavamoat/webpack/mv3/experimental/policy.json
- lavamoat/webpack/mv3/flask/policy.json
- lavamoat/webpack/mv3/main/policy.json
- package.json
- ui/components/app/perps/close-position/close-all-positions-modal.test.tsx
- ui/components/app/perps/close-position/close-all-positions-modal.tsx
- ui/components/app/perps/close-position/close-position-modal.test.tsx
- ui/components/app/perps/close-position/close-position-modal.tsx
- ui/components/app/perps/order-entry/components/auto-close-section/auto-close-section.test.tsx
- ui/components/app/perps/order-entry/components/auto-close-section/auto-close-section.tsx
- ui/components/app/perps/order-entry/order-entry.test.tsx
- ui/components/app/perps/order-entry/order-entry.tsx
- ui/components/app/perps/order-entry/order-entry.types.ts
- ui/components/app/perps/perps-fill-tag/perps-fill-tag.test.tsx
- ui/components/app/perps/reverse-position/reverse-position-modal.test.tsx
- ui/components/app/perps/reverse-position/reverse-position-modal.tsx
- ui/components/app/perps/transaction-card/transaction-card.tsx
- ui/components/app/perps/types/transactionHistory.ts
- ui/components/app/perps/update-tpsl/update-tpsl-modal-content.test.tsx
- ui/components/app/perps/update-tpsl/update-tpsl-modal-content.tsx
- ui/components/app/perps/utils/transactionTransforms.test.ts
- ui/components/app/perps/utils/transactionTransforms.ts
- ui/components/app/perps/utils/translate-perps-error.ts
- ui/hooks/perps/perps-fee-utils.test.ts
- ui/hooks/perps/perps-fee-utils.ts
- ui/hooks/perps/usePerpsOrderFees.test.ts
- ui/hooks/perps/usePerpsOrderFees.ts
- ui/hooks/perps/usePerpsOrderForm.test.ts
- ui/hooks/perps/usePerpsOrderForm.ts
- ui/pages/perps/perps-order-entry-page.test.tsx
- ui/pages/perps/perps-order-entry-page.tsx
- ui/pages/perps/perps-transaction-details-page.test.tsx
- ui/pages/perps/perps-transaction-details-page.tsx
- yarn.lock
