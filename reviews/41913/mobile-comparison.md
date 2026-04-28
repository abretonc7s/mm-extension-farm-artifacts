# Mobile Comparison

- Mobile reference consulted:
  - `/Users/deeeed/dev/metamask/metamask-mobile-ref/app/components/UI/Perps/hooks/usePerpsDepositStatus.ts`
  - `/Users/deeeed/dev/metamask/metamask-mobile-ref/app/components/UI/Perps/hooks/usePerpsDepositProgress.ts`
  - `/Users/deeeed/dev/metamask/metamask-mobile-ref/app/components/UI/Perps/Views/PerpsOrderView/PerpsOrderView.tsx`
- Behavioral alignment:
  - Mobile shows a Perps deposit in-progress toast from `TransactionController:transactionStatusUpdated` after `perpsDeposit` reaches `approved`; extension now derives the same post-confirm ownership from transaction state.
  - Mobile's progress hook covers both `perpsDeposit` and `perpsDepositAndOrder`; extension covers both types.
  - Mobile keeps success tied to actual deposit completion/balance/result rather than pre-confirmation state; extension prefers `lastDepositResult` for native-funded completion toasts.
- Intentional divergence:
  - Extension includes `signed` and `submitted` in the pending window because it derives from persisted transaction state instead of event subscription state.
  - Extension suppresses Perps-owned toasts for non-native pay-token flows; mobile has a custom-token deposit/order path that calls deposit tracking before confirmation.
- Formatting divergence: no new `.toFixed(2)` or `{min:2,max:2}` formatting was added by this PR.
- Pattern drift: no mobile utility pattern was reimplemented in a conflicting way; the extension change stays scoped to selector/toast ownership.
